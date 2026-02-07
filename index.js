const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

let Service, Characteristic;

module.exports = (homebridge) => {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerPlatform('homebridge-homepod-mini-music-sensor', 'HomePodMiniMusicSensor', HomePodPlatform, true);
};

class HomePodPlatform {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;
    this.accessories = [];

    // Validate configuration
    if (!config) {
      this.log.error('No configuration found for HomePod Music Sensor platform');
      return;
    }

    if (!config.homepods || config.homepods.length === 0) {
      this.log.error('No HomePods configured. Please add HomePods in the plugin settings.');
      return;
    }

    // Default config values
    this.detectMusic = config.detectMusic !== false;
    this.detectPodcasts = config.detectPodcasts || false;
    this.detectMovies = config.detectMovies || false;
    this.maxDuration = config.maxDuration || 600;
    this.requireArtist = config.requireArtist !== false;
    this.updateInterval = (config.updateInterval || 5) * 1000;

    // Validate Python script exists
    this.pythonScript = path.join(__dirname, 'get_nowplaying.py');
    if (!fs.existsSync(this.pythonScript)) {
      this.log.error(`Python script not found at: ${this.pythonScript}`);
      this.log.error('Plugin installation may be corrupted. Please reinstall.');
      return;
    }

    if (api) {
      this.api.on('didFinishLaunching', () => {
        this.log('HomePod Mini Music Sensor Platform finished launching');
        this.log(`Detection settings: Music=${this.detectMusic}, Podcasts=${this.detectPodcasts}, Movies=${this.detectMovies}`);
        this.checkPythonEnvironment();
        this.discoverDevices();
      });
    }
  }

  checkPythonEnvironment() {
    exec('python3 --version', (error, stdout, stderr) => {
      if (error) {
        this.log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        this.log.error('⚠️  Python 3 is not installed or not in PATH');
        this.log.error('Please install Python 3 and pyatv:');
        this.log.error('  brew install python3');
        this.log.error('  pip3 install pyatv');
        this.log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return;
      }
      this.log(`Python detected: ${stdout.trim()}`);
      
      // Check if pyatv is installed
      exec('python3 -c "import pyatv"', (error) => {
        if (error) {
          this.log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          this.log.error('⚠️  pyatv library is not installed');
          this.log.error('Please install it with:');
          this.log.error('  pip3 install pyatv');
          this.log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        } else {
          this.log('✅ pyatv library detected');
        }
      });
    });
  }

  configureAccessory(accessory) {
    this.accessories.push(accessory);
  }

  discoverDevices() {
    const homepods = this.config.homepods || [];
    
    if (homepods.length === 0) {
      this.log.warn('No HomePods configured in settings');
      return;
    }

    homepods.forEach((homepod) => {
      if (!homepod.name || !homepod.id) {
        this.log.warn('Skipping HomePod with missing name or id:', homepod);
        return;
      }

      const uuid = this.api.hap.uuid.generate(homepod.id);
      const existingAccessory = this.accessories.find(acc => acc.UUID === uuid);

      if (existingAccessory) {
        this.log(`Restoring HomePod: ${homepod.name}`);
        new HomePodAccessory(this, existingAccessory, homepod);
      } else {
        this.log(`Adding new HomePod: ${homepod.name}`);
        const accessory = new this.api.platformAccessory(homepod.name, uuid);
        new HomePodAccessory(this, accessory, homepod);
        this.api.registerPlatformAccessories('homebridge-homepod-mini-music-sensor', 'HomePodMiniMusicSensor', [accessory]);
      }
    });
  }
}

class HomePodAccessory {
  constructor(platform, accessory, config) {
    this.platform = platform;
    this.accessory = accessory;
    this.config = config;
    this.log = platform.log;

    this.accessory.getService(Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, 'Apple')
      .setCharacteristic(Characteristic.Model, 'HomePod mini')
      .setCharacteristic(Characteristic.SerialNumber, config.id);

    this.motionService = this.accessory.getService(Service.MotionSensor) 
      || this.accessory.addService(Service.MotionSensor, config.name);

    this.updateInterval = setInterval(() => {
      this.updateStatus();
    }, platform.updateInterval);

    this.updateStatus();
  }

  updateStatus() {
    const filterConfig = JSON.stringify({
      detectMusic: this.platform.detectMusic,
      detectPodcasts: this.platform.detectPodcasts,
      detectMovies: this.platform.detectMovies,
      maxDuration: this.platform.maxDuration,
      requireArtist: this.platform.requireArtist
    });
    
    const command = `python3 "${this.platform.pythonScript}" ${this.config.id} '${filterConfig}'`;

    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        if (error.killed) {
          this.log.error(`Timeout getting status for ${this.config.name}`);
        } else {
          this.log.error(`Error getting status for ${this.config.name}: ${error.message}`);
        }
        this.motionService.getCharacteristic(Characteristic.MotionDetected).updateValue(false);
        return;
      }

      if (stderr) {
        this.log.debug(`Python stderr for ${this.config.name}:`, stderr);
      }

      try {
        const data = JSON.parse(stdout);
        const isPlaying = data.state === 'playing';
        
        this.motionService.getCharacteristic(Characteristic.MotionDetected).updateValue(isPlaying);
        
        if (isPlaying) {
          this.log(`${this.config.name}: ${data.title} - ${data.artist}`);
        }
      } catch (e) {
        this.log.error(`Error parsing data for ${this.config.name}: ${e.message}`);
        this.log.debug('Raw output:', stdout);
        this.motionService.getCharacteristic(Characteristic.MotionDetected).updateValue(false);
      }
    });
  }
}
