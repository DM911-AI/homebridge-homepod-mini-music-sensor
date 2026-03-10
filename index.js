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
    this.appletvScriptPath = path.join(__dirname, 'get_appletv_status.py');

    if (!config) {
      this.log.warn('No configuration found for HomePod Music Sensor platform');
      return;
    }

    this.api.on('didFinishLaunching', () => {
      this.log.debug('didFinishLaunching');
      this.checkPythonEnvironment();
      this.discoverDevices();
      this.discoverAppleTVDevices();
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
    if (!fs.existsSync(this.scriptPath)) {
      this.log.error(`Python script not found at: ${this.scriptPath}`);
      return;
    }

    const pythonCandidates = ['python3', 'python3.14', 'python3.13', 'python3.12', 'python3.11', 'python3.10', 'python3.9'];

    const tryPython = (index) => {
      if (index >= pythonCandidates.length) {
        this.log.error('No compatible Python 3 with pyatv found. Install with: brew install python3 && pip3 install pyatv');
        return;
      }

      const pythonCmd = pythonCandidates[index];
      exec(`${pythonCmd} -c "import pyatv; print('ok')"`, { timeout: 10000 }, (error, stdout) => {
        if (error || !stdout.includes('ok')) {
          tryPython(index + 1);
          return;
        }

        this.pythonPath = pythonCmd;
        this.log.info(`Python with pyatv detected: ${pythonCmd}`);

        exec(`${pythonCmd} --version`, { timeout: 5000 }, (err, ver) => {
          if (!err) this.log.info(`Python version: ${ver.trim()}`);
        });
      });
    };

    tryPython(0);
  }

  // ============================================================
  //  HomePod Device Discovery (existing functionality)
  // ============================================================

  discoverDevices() {
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
      this.log.info('No HomePod devices configured.');
      return;
    }

    const activeUUIDs = new Set();
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

    for (const [name, devicesWithSameName] of Object.entries(grouped)) {
      const stereoPairDevices = devicesWithSameName.filter(d => d.stereoPair === true);

      if (stereoPairDevices.length === 2) {
        this.log.info('Creating single sensor for stereo pair: %s (monitoring both HomePods)', name);
        const deviceIds = stereoPairDevices.map(d => d.deviceId);
        const uuid = this.api.hap.uuid.generate(`homepod-stereo-${deviceIds.join('-')}`);
        activeUUIDs.add(uuid);
        this.createAccessory(name, deviceIds, true);
      } else {
        if (stereoPairDevices.length > 2) {
          this.log.warn('More than 2 devices marked as stereo pair with name "%s" - creating individual sensors', name);
        }
        for (const device of devicesWithSameName) {
          const uuid = this.api.hap.uuid.generate(`homepod-${device.deviceId}`);
          activeUUIDs.add(uuid);
          this.createAccessory(device.name, [device.deviceId], false);
        }
      }
    }

    const staleAccessories = this.accessories.filter(acc =>
      !activeUUIDs.has(acc.UUID) &&
      acc.context.deviceType === 'homepod'
    );
    if (staleAccessories.length > 0) {
      this.log.info('Removing %d stale cached HomePod accessory(ies)', staleAccessories.length);
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, staleAccessories);
      this.accessories = this.accessories.filter(acc => !staleAccessories.includes(acc));
    }
  }

  createAccessory(name, deviceIds, isStereoPair) {
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
      accessory.context.deviceType = 'homepod';
      this.setupAccessory(accessory, name, deviceIds, isStereoPair);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      this.accessories.push(accessory);
    }
  }

  setupAccessory(accessory, name, deviceIds, isStereoPair) {
    accessory.context.deviceIds = deviceIds;
    accessory.context.name = name;
    accessory.context.isStereoPair = isStereoPair;
    accessory.context.deviceType = 'homepod';

    const infoService = accessory.getService(this.api.hap.Service.AccessoryInformation);
    if (infoService) {
      infoService
        .setCharacteristic(this.api.hap.Characteristic.Manufacturer, 'Apple Inc.')
        .setCharacteristic(this.api.hap.Characteristic.Model, isStereoPair ? 'HomePod Stereo Pair' : 'HomePod')
        .setCharacteristic(this.api.hap.Characteristic.SerialNumber, deviceIds.join('-'))
        .setCharacteristic(this.api.hap.Characteristic.FirmwareRevision, require('./package.json').version);
    }

    const motionService = accessory.getService(this.api.hap.Service.MotionSensor) ||
      accessory.addService(this.api.hap.Service.MotionSensor, name);

    if (this.pollIntervals.has(accessory.UUID)) {
      clearInterval(this.pollIntervals.get(accessory.UUID));
    }

    this.updateStatus(accessory, motionService);

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
      this.checkStereoPairStatus(deviceIds, name, motionService);
    } else {
      this.checkSingleDeviceStatus(deviceIds[0], name, motionService);
    }
  }

  checkStereoPairStatus(deviceIds, name, motionService) {
    let completed = 0;
    let isAnyPlaying = false;
    let playingInfo = null;

    deviceIds.forEach((deviceId, index) => {
      exec(`${this.pythonPath || 'python3'} "${this.scriptPath}" "${deviceId}"`, { timeout: 15000 }, (error, stdout) => {
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

        if (completed === deviceIds.length) {
          if (isAnyPlaying && playingInfo) {
            this.log.debug('%s (Stereo): Now playing - %s%s', name, playingInfo.title, playingInfo.artist ? ' - ' + playingInfo.artist : '');
          }
          motionService.updateCharacteristic(this.api.hap.Characteristic.MotionDetected, isAnyPlaying);
        }
      });
    });
  }

  checkSingleDeviceStatus(deviceId, name, motionService) {
    exec(`${this.pythonPath || 'python3'} "${this.scriptPath}" "${deviceId}"`, { timeout: 15000 }, (error, stdout, stderr) => {
      if (error) {
        if (error.killed) {
          this.log.warn('Timeout getting status for %s', name);
        } else {
          this.log.debug('Error getting status for %s: %s', name, error.message);
        }
        motionService.updateCharacteristic(this.api.hap.Characteristic.MotionDetected, false);
        return;
      }

      try {
        const data = JSON.parse(stdout.trim());

        if (data.error) {
          this.log.debug('%s: %s', name, data.error);
          motionService.updateCharacteristic(this.api.hap.Characteristic.MotionDetected, false);
          return;
        }

        const isPlaying = this.shouldDetect(data);

        if (isPlaying && data.title) {
          this.log.debug('%s: Now playing - %s%s', name, data.title, data.artist ? ' - ' + data.artist : '');
        }

        motionService.updateCharacteristic(this.api.hap.Characteristic.MotionDetected, isPlaying);
      } catch (e) {
        this.log.error('Error parsing response for %s: %s', name, e.message);
        motionService.updateCharacteristic(this.api.hap.Characteristic.MotionDetected, false);
      }
    });
  }

  shouldDetect(data) {
    if (!data || !data.state) return false;

    const state = data.state.toLowerCase();
    if (!state.includes('playing')) return false;

    const {
      detectMusic = true,
      detectPodcasts = false,
      detectMovies = false,
      maxDuration = 600,
      requireArtist = true,
    } = this.config;

    const mediaType = (data.media_type || '').toLowerCase();

    // Explicit media type matches
    // Note: maxDuration applies only to music, not to movies/podcasts
    if (mediaType.includes('music') && detectMusic) {
      if (data.total_time && data.total_time > maxDuration) return false;
      return !(requireArtist && !data.artist);
    }
    if (mediaType.includes('podcast') && detectPodcasts) return true;
    if (mediaType.includes('video') && detectMovies) return true;

    // Block known non-matching types
    if (mediaType.includes('video') || mediaType.includes('podcast')) return false;
    if (mediaType.includes('music')) return false;

    // Unknown media type - use best guess based on available metadata
    if (detectMovies && data.title && !data.artist) return true;
    if (detectMusic && data.artist) {
      if (data.total_time && data.total_time > maxDuration) return false;
      return !(requireArtist && !data.artist);
    }
    if (detectMovies && data.title) return true;

    return false;
  }

  // ============================================================
  //  Apple TV Device Discovery (NEW)
  // ============================================================

  discoverAppleTVDevices() {
    const appleTVs = this.config.appleTVs || [];

    if (!appleTVs.length) {
      this.log.debug('No Apple TV devices configured.');
      return;
    }

    if (!fs.existsSync(this.appletvScriptPath)) {
      this.log.error(`Apple TV script not found at: ${this.appletvScriptPath}`);
      return;
    }

    const activeUUIDs = new Set();

    for (const atv of appleTVs) {
      if (!atv.name || !atv.deviceId) {
        this.log.warn('Skipping Apple TV with missing name or deviceId: %s', JSON.stringify(atv));
        continue;
      }

      if (!atv.companionCredentials || !atv.airplayCredentials) {
        this.log.warn('Apple TV "%s" is missing credentials. Please complete the pairing process.', atv.name);
        continue;
      }

      this.log.info('Configuring Apple TV: %s', atv.name);

      if (atv.enablePowerSensor !== false) {
        const powerUUID = this.api.hap.uuid.generate(`appletv-power-${atv.deviceId}`);
        activeUUIDs.add(powerUUID);
        this.createAppleTVAccessory(atv, 'power', powerUUID);
      }

      if (atv.enablePlaybackSensor !== false) {
        const playbackUUID = this.api.hap.uuid.generate(`appletv-playback-${atv.deviceId}`);
        activeUUIDs.add(playbackUUID);
        this.createAppleTVAccessory(atv, 'playback', playbackUUID);
      }

      const apps = atv.apps || [];
      for (const app of apps) {
        if (!app.appId) {
          this.log.warn('Skipping app sensor with missing appId for Apple TV "%s"', atv.name);
          continue;
        }
        const appUUID = this.api.hap.uuid.generate(`appletv-app-${atv.deviceId}-${app.appId}`);
        activeUUIDs.add(appUUID);
        this.createAppleTVAppAccessory(atv, app, appUUID);
      }
    }

    const staleAccessories = this.accessories.filter(acc =>
      !activeUUIDs.has(acc.UUID) &&
      acc.context.deviceType === 'appletv'
    );
    if (staleAccessories.length > 0) {
      this.log.info('Removing %d stale cached Apple TV accessory(ies)', staleAccessories.length);
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, staleAccessories);
      this.accessories = this.accessories.filter(acc => !staleAccessories.includes(acc));
    }
  }

  createAppleTVAccessory(atv, sensorType, uuid) {
    const sensorName = sensorType === 'power'
      ? `${atv.name} Power`
      : `${atv.name} Playback`;

    const existingAccessory = this.accessories.find(acc => acc.UUID === uuid);

    if (existingAccessory) {
      this.log.info('Reusing cached Apple TV accessory: %s', sensorName);
      this.setupAppleTVAccessory(existingAccessory, atv, sensorType, sensorName);
    } else {
      this.log.info('Creating new Apple TV accessory: %s', sensorName);
      const accessory = new this.api.platformAccessory(sensorName, uuid);
      accessory.context.deviceType = 'appletv';
      this.setupAppleTVAccessory(accessory, atv, sensorType, sensorName);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      this.accessories.push(accessory);
    }
  }

  createAppleTVAppAccessory(atv, app, uuid) {
    const sensorName = `${atv.name} ${app.name || app.appId}`;
    const existingAccessory = this.accessories.find(acc => acc.UUID === uuid);

    if (existingAccessory) {
      this.log.info('Reusing cached Apple TV app accessory: %s', sensorName);
      this.setupAppleTVAppAccessory(existingAccessory, atv, app, sensorName);
    } else {
      this.log.info('Creating new Apple TV app accessory: %s', sensorName);
      const accessory = new this.api.platformAccessory(sensorName, uuid);
      accessory.context.deviceType = 'appletv';
      this.setupAppleTVAppAccessory(accessory, atv, app, sensorName);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      this.accessories.push(accessory);
    }
  }

  setupAppleTVAccessory(accessory, atv, sensorType, sensorName) {
    accessory.context.deviceType = 'appletv';
    accessory.context.sensorType = sensorType;
    accessory.context.atvConfig = {
      deviceId: atv.deviceId,
      companionCredentials: atv.companionCredentials,
      airplayCredentials: atv.airplayCredentials,
    };

    const infoService = accessory.getService(this.api.hap.Service.AccessoryInformation);
    if (infoService) {
      infoService
        .setCharacteristic(this.api.hap.Characteristic.Manufacturer, 'Apple Inc.')
        .setCharacteristic(this.api.hap.Characteristic.Model, 'Apple TV')
        .setCharacteristic(this.api.hap.Characteristic.SerialNumber, atv.deviceId)
        .setCharacteristic(this.api.hap.Characteristic.FirmwareRevision, require('./package.json').version);
    }

    let service;
    if (sensorType === 'power') {
      service = accessory.getService(this.api.hap.Service.OccupancySensor) ||
        accessory.addService(this.api.hap.Service.OccupancySensor, sensorName);
    } else {
      service = accessory.getService(this.api.hap.Service.MotionSensor) ||
        accessory.addService(this.api.hap.Service.MotionSensor, sensorName);
    }

    const pollKey = `atv-${sensorType}-${atv.deviceId}`;
    if (this.pollIntervals.has(pollKey)) {
      clearInterval(this.pollIntervals.get(pollKey));
    }

    this.updateAppleTVStatus(accessory, service, sensorType);

    const updateInterval = Math.max(1, this.config.updateInterval || 5) * 1000;
    this.pollIntervals.set(pollKey, setInterval(() => {
      this.updateAppleTVStatus(accessory, service, sensorType);
    }, updateInterval));
  }

  setupAppleTVAppAccessory(accessory, atv, app, sensorName) {
    accessory.context.deviceType = 'appletv';
    accessory.context.sensorType = 'app';
    accessory.context.appId = app.appId;
    accessory.context.appName = app.name || app.appId;
    accessory.context.detectPlayingOnly = app.detectPlayingOnly !== false;
    accessory.context.atvConfig = {
      deviceId: atv.deviceId,
      companionCredentials: atv.companionCredentials,
      airplayCredentials: atv.airplayCredentials,
    };

    const infoService = accessory.getService(this.api.hap.Service.AccessoryInformation);
    if (infoService) {
      infoService
        .setCharacteristic(this.api.hap.Characteristic.Manufacturer, 'Apple Inc.')
        .setCharacteristic(this.api.hap.Characteristic.Model, `Apple TV - ${app.name || app.appId}`)
        .setCharacteristic(this.api.hap.Characteristic.SerialNumber, `${atv.deviceId}-${app.appId}`)
        .setCharacteristic(this.api.hap.Characteristic.FirmwareRevision, require('./package.json').version);
    }

    const service = accessory.getService(this.api.hap.Service.MotionSensor) ||
      accessory.addService(this.api.hap.Service.MotionSensor, sensorName);

    const pollKey = `atv-app-${atv.deviceId}-${app.appId}`;
    if (this.pollIntervals.has(pollKey)) {
      clearInterval(this.pollIntervals.get(pollKey));
    }

    this.updateAppleTVStatus(accessory, service, 'app');

    const updateInterval = Math.max(1, this.config.updateInterval || 5) * 1000;
    this.pollIntervals.set(pollKey, setInterval(() => {
      this.updateAppleTVStatus(accessory, service, 'app');
    }, updateInterval));
  }

  updateAppleTVStatus(accessory, service, sensorType) {
    const config = accessory.context.atvConfig;
    if (!config) return;

    const cmd = `${this.pythonPath || 'python3'} "${this.appletvScriptPath}" "${config.deviceId}" "${config.companionCredentials}" "${config.airplayCredentials}"`;

    exec(cmd, { timeout: 15000 }, (error, stdout) => {
      if (error) {
        if (error.killed) {
          this.log.warn('Timeout getting Apple TV status for %s', accessory.displayName);
        } else {
          this.log.debug('Error getting Apple TV status for %s: %s', accessory.displayName, error.message);
        }
        this.setAppleTVSensorState(service, sensorType, false);
        return;
      }

      try {
        const data = JSON.parse(stdout.trim());

        if (data.error) {
          this.log.debug('Apple TV %s: %s', accessory.displayName, data.error);
          this.setAppleTVSensorState(service, sensorType, false);
          return;
        }

        let isActive = false;

        if (sensorType === 'power') {
          isActive = data.power === 'on';
          this.log.debug('Apple TV %s: Power = %s', accessory.displayName, data.power);
        } else if (sensorType === 'playback') {
          isActive = data.state === 'playing';
          if (isActive && data.title) {
            this.log.debug('Apple TV %s: Playing - %s%s', accessory.displayName, data.title, data.artist ? ' - ' + data.artist : '');
          }
        } else if (sensorType === 'app') {
          const targetAppId = accessory.context.appId;
          const detectPlayingOnly = accessory.context.detectPlayingOnly;
          const currentAppId = data.app_id;

          if (detectPlayingOnly) {
            isActive = currentAppId === targetAppId && data.state === 'playing';
          } else {
            isActive = currentAppId === targetAppId;
          }

          if (isActive) {
            this.log.debug('Apple TV %s: %s is active%s', accessory.displayName,
              data.app_name || targetAppId, data.title ? ' - ' + data.title : '');
          }
        }

        this.setAppleTVSensorState(service, sensorType, isActive);
      } catch (e) {
        this.log.error('Error parsing Apple TV response for %s: %s', accessory.displayName, e.message);
        this.setAppleTVSensorState(service, sensorType, false);
      }
    });
  }

  setAppleTVSensorState(service, sensorType, isActive) {
    if (sensorType === 'power') {
      service.updateCharacteristic(this.api.hap.Characteristic.OccupancyDetected, isActive ? 1 : 0);
    } else {
      service.updateCharacteristic(this.api.hap.Characteristic.MotionDetected, isActive);
    }
  }

  // ============================================================
  //  Accessory Cache
  // ============================================================

  configureAccessory(accessory) {
    this.log.debug('Loading accessory from cache: %s', accessory.displayName);
    this.accessories.push(accessory);
  }
}
