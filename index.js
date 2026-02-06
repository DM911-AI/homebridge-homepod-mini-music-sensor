const { exec } = require('child_process');
const path = require('path');

let Service, Characteristic;

module.exports = (homebridge) => {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerPlatform('homebridge-homepod-mini-music-sensor', 'HomePodMiniMusicSensor', HomePodPlatform);
};

class HomePodPlatform {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;
    this.accessories = [];

    // Default config values
    this.detectMusic = config.detectMusic !== false; // default true
    this.detectPodcasts = config.detectPodcasts || false;
    this.detectMovies = config.detectMovies || false;
    this.maxDuration = config.maxDuration || 600;
    this.requireArtist = config.requireArtist !== false; // default true
    this.updateInterval = (config.updateInterval || 5) * 1000; // convert to ms

    if (api) {
      this.api.on('didFinishLaunching', () => {
        this.log('HomePod Mini Music Sensor Platform finished launching');
        this.log(`Detection: Music=${this.detectMusic}, Podcasts=${this.detectPodcasts}, Movies=${this.detectMovies}`);
        this.discoverDevices();
      });
    }
  }

  configureAccessory(accessory) {
    this.accessories.push(accessory);
  }

  discoverDevices() {
    const homepods = this.config.homepods || [];
    
    homepods.forEach((homepod) => {
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
    const scriptPath = path.join(__dirname, 'get_nowplaying.py');
    
    // Pass config to Python script
    const filterConfig = JSON.stringify({
      detectMusic: this.platform.detectMusic,
      detectPodcasts: this.platform.detectPodcasts,
      detectMovies: this.platform.detectMovies,
      maxDuration: this.platform.maxDuration,
      requireArtist: this.platform.requireArtist
    });
    
    const command = `python3.13 ${scriptPath} ${this.config.id} '${filterConfig}'`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        this.log.error(`Error getting status for ${this.config.name}:`, error.message);
        this.motionService.getCharacteristic(Characteristic.MotionDetected).updateValue(false);
        return;
      }

      try {
        const data = JSON.parse(stdout);
        const isPlaying = data.state === 'playing';
        
        this.motionService.getCharacteristic(Characteristic.MotionDetected).updateValue(isPlaying);
        
        if (isPlaying) {
          this.log(`${this.config.name}: ${data.title} - ${data.artist}`);
        }
      } catch (e) {
        this.log.error(`Error parsing data for ${this.config.name}:`, e.message);
        this.motionService.getCharacteristic(Characteristic.MotionDetected).updateValue(false);
      }
    });
  }
}
