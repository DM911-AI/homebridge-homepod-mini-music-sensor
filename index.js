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

    if (api) {
      this.api.on('didFinishLaunching', () => {
        this.log('HomePod Mini Music Sensor Platform finished launching');
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
    }, 5000);

    this.updateStatus();
  }

  updateStatus() {
    const scriptPath = path.join(__dirname, 'get_nowplaying.py');
    const command = `python3.13 ${scriptPath} ${this.config.id}`;

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
