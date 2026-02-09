const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const PLUGIN_NAME = 'homebridge-homepod-mini-music-sensor';
const PLATFORM_NAME = 'HomePodMusicSensor';

module.exports = (api) => {
  api.registerPlatform(PLATFORM_NAME, HomePodMusicSensorPlatform);
};

class HomePodMusicSensorPlatform {
  constructor(log, config, api) {
    this.log = log;
    this.config = config || {};
    this.api = api;
    this.accessories = [];
    this.pollIntervals = new Map();
    this.scriptPath = path.join(__dirname, 'get_nowplaying.py');

    if (!config) {
      this.log.warn('No configuration found for HomePod Music Sensor platform');
      return;
    }

    this.api.on('didFinishLaunching', () => {
      this.log.debug('didFinishLaunching');
      this.checkPythonEnvironment();
      this.discoverDevices();
    });

    this.api.on('shutdown', () => {
      this.log.debug('Homebridge is shutting down, clearing all poll intervals');
      for (const [uuid, interval] of this.pollIntervals) {
        clearInterval(interval);
      }
      this.pollIntervals.clear();
    });
  }

  checkPythonEnvironment() {
    // Verify the Python script exists
    if (!fs.existsSync(this.scriptPath)) {
      this.log.error(`Python script not found at: ${this.scriptPath}`);
      return;
    }

    exec('python3 --version', { timeout: 5000 }, (error, stdout) => {
      if (error) {
        this.log.error('Python 3 is not installed or not in PATH.');
        this.log.error('Install Python 3 and pyatv: brew install python3 && pip3 install pyatv');
        return;
      }
      this.log.info(`Python detected: ${stdout.trim()}`);

      exec('python3 -c "import pyatv"', { timeout: 5000 }, (error) => {
        if (error) {
          this.log.error('pyatv library is not installed. Install it with: pip3 install pyatv');
        } else {
          this.log.debug('pyatv library detected');
        }
      });
    });
  }

  discoverDevices() {
    // Support both config formats: "devices" (new) and "homepods" (legacy)
    let devices = this.config.devices || [];

    if (!devices.length && this.config.homepods) {
      devices = this.config.homepods.map(hp => ({
        name: hp.name,
        deviceId: hp.id,
        stereoPair: hp.isStereoPair || hp.stereoPair || false,
      }));
      this.log.warn('Using legacy config format (homepods). Please update to new format (devices with deviceId).');
    }

    if (!devices.length) {
      this.log.warn('No devices configured. Add HomePod devices in the plugin settings.');
      return;
    }

    // Track which UUIDs are still in the config, so we can remove stale cached accessories
    const activeUUIDs = new Set();

    // Group by name for stereo pair detection
    const grouped = {};

    for (const device of devices) {
      if (!device.name || !device.deviceId) {
        this.log.warn('Skipping device with missing name or deviceId: %s', JSON.stringify(device));
        continue;
      }
      const name = device.name.trim();
      if (!grouped[name]) {
        grouped[name] = [];
      }
      grouped[name].push(device);
    }

    // Create accessories
    for (const [name, devicesWithSameName] of Object.entries(grouped)) {
      const stereoPairDevices = devicesWithSameName.filter(d => d.stereoPair === true);

      if (stereoPairDevices.length === 2) {
        // Valid stereo pair: create a single sensor monitoring BOTH devices
        this.log.info('Creating single sensor for stereo pair: %s (monitoring both HomePods)', name);
        const deviceIds = stereoPairDevices.map(d => d.deviceId);
        const uuid = this.api.hap.uuid.generate(`homepod-stereo-${deviceIds.join('-')}`);
        activeUUIDs.add(uuid);
        this.createAccessory(name, deviceIds, true);
      } else {
        if (stereoPairDevices.length > 2) {
          this.log.warn('More than 2 devices marked as stereo pair with name "%s" — creating individual sensors', name);
        }
        for (const device of devicesWithSameName) {
          const uuid = this.api.hap.uuid.generate(`homepod-${device.deviceId}`);
          activeUUIDs.add(uuid);
          this.createAccessory(device.name, [device.deviceId], false);
        }
      }
    }

    // Remove cached accessories that are no longer in the config
    const staleAccessories = this.accessories.filter(acc => !activeUUIDs.has(acc.UUID));
    if (staleAccessories.length > 0) {
      this.log.info('Removing %d stale cached accessory(ies)', staleAccessories.length);
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, staleAccessories);
      this.accessories = this.accessories.filter(acc => activeUUIDs.has(acc.UUID));
    }
  }

  createAccessory(name, deviceIds, isStereoPair) {
    // deviceIds is now always an array
    const uuid = isStereoPair 
      ? this.api.hap.uuid.generate(`homepod-stereo-${deviceIds.join('-')}`)
      : this.api.hap.uuid.generate(`homepod-${deviceIds[0]}`);
    
    const existingAccessory = this.accessories.find(acc => acc.UUID === uuid);

    if (existingAccessory) {
      this.log.info('Reusing cached accessory: %s', name);
      this.setupAccessory(existingAccessory, name, deviceIds, isStereoPair);
    } else {
      this.log.info('Creating new accessory: %s', name);
      const accessory = new this.api.platformAccessory(name, uuid);
      this.setupAccessory(accessory, name, deviceIds, isStereoPair);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      this.accessories.push(accessory);
    }
  }

  setupAccessory(accessory, name, deviceIds, isStereoPair) {
    // Store device IDs as an array
    accessory.context.deviceIds = deviceIds;
    accessory.context.name = name;
    accessory.context.isStereoPair = isStereoPair;

    // Set up AccessoryInformation service
    const infoService = accessory.getService(this.api.hap.Service.AccessoryInformation);
    if (infoService) {
      infoService
        .setCharacteristic(this.api.hap.Characteristic.Manufacturer, 'Apple Inc.')
        .setCharacteristic(this.api.hap.Characteristic.Model, isStereoPair ? 'HomePod Stereo Pair' : 'HomePod')
        .setCharacteristic(this.api.hap.Characteristic.SerialNumber, deviceIds.join('-'))
        .setCharacteristic(this.api.hap.Characteristic.FirmwareRevision, require('./package.json').version);
    }

    // Set up MotionSensor service
    const motionService = accessory.getService(this.api.hap.Service.MotionSensor) ||
      accessory.addService(this.api.hap.Service.MotionSensor, name);

    // Clear any existing polling interval to prevent accumulation on re-setup
    if (this.pollIntervals.has(accessory.UUID)) {
      clearInterval(this.pollIntervals.get(accessory.UUID));
    }

    // Initial status check
    this.updateStatus(accessory, motionService);

    // Set up polling
    const updateInterval = Math.max(1, this.config.updateInterval || 5) * 1000;
    this.pollIntervals.set(accessory.UUID, setInterval(() => {
      this.updateStatus(accessory, motionService);
    }, updateInterval));
  }

  updateStatus(accessory, motionService) {
    const deviceIds = accessory.context.deviceIds;
    const name = accessory.context.name;
    const isStereoPair = accessory.context.isStereoPair;

    if (isStereoPair) {
      // Check both HomePods in the stereo pair
      this.checkStereoPairStatus(deviceIds, name, motionService);
    } else {
      // Single HomePod
      this.checkSingleDeviceStatus(deviceIds[0], name, motionService);
    }
  }

  checkStereoPairStatus(deviceIds, name, motionService) {
    let completed = 0;
    let isAnyPlaying = false;
    let playingInfo = null;

    deviceIds.forEach((deviceId, index) => {
      exec(`python3 "${this.scriptPath}" "${deviceId}"`, { timeout: 15000 }, (error, stdout, stderr) => {
        completed++;

        if (!error) {
          try {
            const data = JSON.parse(stdout.trim());
            if (!data.error && this.shouldDetect(data)) {
              isAnyPlaying = true;
              if (!playingInfo && data.title) {
                playingInfo = { title: data.title, artist: data.artist };
              }
            }
          } catch (e) {
            this.log.debug('Error parsing response for %s (device %d): %s', name, index + 1, e.message);
          }
        }

        // When both devices have been checked
        if (completed === deviceIds.length) {
          if (isAnyPlaying && playingInfo) {
            this.log.debug('%s (Stereo): Now playing — %s%s', name, playingInfo.title, playingInfo.artist ? ' - ' + playingInfo.artist : '');
          }
          
          motionService.updateCharacteristic(
            this.api.hap.Characteristic.MotionDetected,
            isAnyPlaying,
          );
        }
      });
    });
  }

  checkSingleDeviceStatus(deviceId, name, motionService) {
    exec(`python3 "${this.scriptPath}" "${deviceId}"`, { timeout: 15000 }, (error, stdout, stderr) => {
      if (error) {
        if (error.killed) {
          this.log.warn('Timeout getting status for %s', name);
        } else {
          this.log.debug('Error getting status for %s: %s', name, error.message);
        }
        if (stderr) {
          this.log.debug('stderr for %s: %s', name, stderr);
        }
        motionService.updateCharacteristic(
          this.api.hap.Characteristic.MotionDetected,
          false,
        );
        return;
      }

      try {
        const data = JSON.parse(stdout.trim());

        if (data.error) {
          this.log.debug('%s: %s', name, data.error);
          motionService.updateCharacteristic(
            this.api.hap.Characteristic.MotionDetected,
            false,
          );
          return;
        }

        const isPlaying = this.shouldDetect(data);

        if (isPlaying && data.title) {
          this.log.debug('%s: Now playing — %s%s', name, data.title, data.artist ? ' - ' + data.artist : '');
        }

        motionService.updateCharacteristic(
          this.api.hap.Characteristic.MotionDetected,
          isPlaying,
        );
      } catch (e) {
        this.log.error('Error parsing response for %s: %s', name, e.message);
        this.log.debug('Raw stdout for %s: %s', name, stdout);
        motionService.updateCharacteristic(
          this.api.hap.Characteristic.MotionDetected,
          false,
        );
      }
    });
  }

  shouldDetect(data) {
    if (!data || !data.state) {
      return false;
    }

    const state = data.state.toLowerCase();
    if (!state.includes('playing')) {
      return false;
    }

    const {
      detectMusic = true,
      detectPodcasts = false,
      detectMovies = false,
      maxDuration = 600,
      requireArtist = true,
    } = this.config;

    if (requireArtist && !data.artist) {
      return false;
    }

    if (data.total_time && data.total_time > maxDuration) {
      return false;
    }

    const mediaType = (data.media_type || '').toLowerCase();

    if (mediaType.includes('music') && detectMusic) {
      return true;
    }

    if (mediaType.includes('podcast') && detectPodcasts) {
      return true;
    }

    if (mediaType.includes('video') && detectMovies) {
      return true;
    }

    // If the media type is explicitly something we checked above, don't fall through
    if (mediaType.includes('video') || mediaType.includes('podcast')) {
      return false;
    }

    // Fallback: if detectMusic is enabled and there's an artist, assume it's music
    // (handles unknown/unrecognized media types from pyatv)
    if (detectMusic && data.artist) {
      return true;
    }

    return false;
  }

  configureAccessory(accessory) {
    this.log.debug('Loading accessory from cache: %s', accessory.displayName);
    this.accessories.push(accessory);
  }
}
