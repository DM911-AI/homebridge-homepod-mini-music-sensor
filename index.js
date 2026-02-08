const { exec } = require('child_process');
const path = require('path');

module.exports = (api) => {
  api.registerPlatform('HomePodMusicSensor', HomePodMusicSensorPlatform);
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
      this.log.error('No configuration found for HomePod Music Sensor platform');
      return;
    }

    this.api.on('didFinishLaunching', () => {
      this.checkPythonEnvironment();
      this.discoverDevices();
    });
  }

  checkPythonEnvironment() {
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
        isStereoPair: hp.isStereoPair || false
      }));
      this.log.info('Using legacy config format (homepods). Consider updating to new format (devices with deviceId).');
    }

    if (!devices.length) {
      this.log.warn('No devices configured!');
      return;
    }

    // Track which UUIDs are still in the config, so we can remove stale cached accessories
    const activeUUIDs = new Set();

    // Group by name for stereo pair detection
    const grouped = {};

    devices.forEach(device => {
      if (!device.name || !device.deviceId) {
        this.log.warn('Skipping device with missing name or deviceId:', JSON.stringify(device));
        return;
      }
      const name = device.name;
      if (!grouped[name]) {
        grouped[name] = [];
      }
      grouped[name].push(device);
    });

    // Create accessories
    for (const [name, devicesWithSameName] of Object.entries(grouped)) {
      const stereoPairDevices = devicesWithSameName.filter(d => d.isStereoPair === true);

      if (stereoPairDevices.length === 2) {
        this.log.info(`Creating single sensor for stereo pair: ${name}`);
        const uuid = this.api.hap.uuid.generate(`homepod-${stereoPairDevices[0].deviceId}`);
        activeUUIDs.add(uuid);
        this.createAccessory(name, stereoPairDevices[0].deviceId);
      } else if (stereoPairDevices.length > 2) {
        this.log.warn(`More than 2 devices marked as stereo pair with name "${name}" - creating individual sensors`);
        devicesWithSameName.forEach(device => {
          const uuid = this.api.hap.uuid.generate(`homepod-${device.deviceId}`);
          activeUUIDs.add(uuid);
          this.createAccessory(device.name, device.deviceId);
        });
      } else {
        devicesWithSameName.forEach(device => {
          const uuid = this.api.hap.uuid.generate(`homepod-${device.deviceId}`);
          activeUUIDs.add(uuid);
          this.createAccessory(device.name, device.deviceId);
        });
      }
    }

    // Remove cached accessories that are no longer in the config
    const staleAccessories = this.accessories.filter(acc => !activeUUIDs.has(acc.UUID));
    if (staleAccessories.length > 0) {
      this.log.info(`Removing ${staleAccessories.length} stale cached accessory(ies)`);
      this.api.unregisterPlatformAccessories('homebridge-homepod-mini-music-sensor', 'HomePodMusicSensor', staleAccessories);
      this.accessories = this.accessories.filter(acc => activeUUIDs.has(acc.UUID));
    }
  }

  createAccessory(name, deviceId) {
    const uuid = this.api.hap.uuid.generate(`homepod-${deviceId}`);
    const existingAccessory = this.accessories.find(acc => acc.UUID === uuid);

    if (existingAccessory) {
      this.log.info(`Reusing cached accessory: ${name}`);
      this.setupAccessory(existingAccessory, name, deviceId);
    } else {
      this.log.info(`Creating new accessory: ${name}`);
      const accessory = new this.api.platformAccessory(name, uuid);
      this.setupAccessory(accessory, name, deviceId);
      this.api.registerPlatformAccessories('homebridge-homepod-mini-music-sensor', 'HomePodMusicSensor', [accessory]);
      this.accessories.push(accessory);
    }
  }

  setupAccessory(accessory, name, deviceId) {
    const motionService = accessory.getService(this.api.hap.Service.MotionSensor) ||
      accessory.addService(this.api.hap.Service.MotionSensor, name);

    accessory.context.deviceId = deviceId;
    accessory.context.name = name;

    // Clear any existing polling interval to prevent accumulation on re-setup
    if (this.pollIntervals.has(accessory.UUID)) {
      clearInterval(this.pollIntervals.get(accessory.UUID));
    }

    this.updateStatus(accessory, motionService);

    const updateInterval = (this.config.updateInterval || 5) * 1000;
    this.pollIntervals.set(accessory.UUID, setInterval(() => {
      this.updateStatus(accessory, motionService);
    }, updateInterval));
  }

  updateStatus(accessory, motionService) {
    const deviceId = accessory.context.deviceId;
    const name = accessory.context.name;

    exec(`python3 "${this.scriptPath}" "${deviceId}"`, { timeout: 15000 }, (error, stdout, stderr) => {
      if (error) {
        if (error.killed) {
          this.log.error(`Timeout getting status for ${name}`);
        } else {
          this.log.error(`Error getting status for ${name}: ${error.message}`);
        }
        if (stderr) {
          this.log.debug(`stderr for ${name}: ${stderr}`);
        }
        motionService.updateCharacteristic(
          this.api.hap.Characteristic.MotionDetected,
          false
        );
        return;
      }

      try {
        const data = JSON.parse(stdout);

        if (data.error) {
          this.log.debug(`${name}: ${data.error}`);
          motionService.updateCharacteristic(
            this.api.hap.Characteristic.MotionDetected,
            false
          );
          return;
        }

        const isPlaying = this.shouldDetect(data);

        if (isPlaying && data.title) {
          this.log.info(`${name}: ${data.title}${data.artist ? ' - ' + data.artist : ''}`);
        }

        motionService.updateCharacteristic(
          this.api.hap.Characteristic.MotionDetected,
          isPlaying
        );
      } catch (e) {
        this.log.error(`Error parsing response for ${name}: ${e.message}`);
        this.log.debug(`stdout was: ${stdout}`);
        motionService.updateCharacteristic(
          this.api.hap.Characteristic.MotionDetected,
          false
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
      requireArtist = true
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
    // (only for unknown/unrecognized media types)
    if (detectMusic && data.artist) {
      return true;
    }

    return false;
  }

  configureAccessory(accessory) {
    this.log.info(`Loading accessory from cache: ${accessory.displayName}`);
    this.accessories.push(accessory);
  }
}
