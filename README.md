# homebridge-homepod-mini-music-sensor

🎵 **Monitor what's currently playing on your HomePod mini in HomeKit!**

[![npm version](https://badge.fury.io/js/homebridge-homepod-mini-music-sensor.svg)](https://www.npmjs.com/package/homebridge-homepod-mini-music-sensor)

Transform your HomePod mini into a smart music sensor that triggers HomeKit automations.

## ✨ Features

- 🎵 Music-only detection (filters out movies, podcasts)
- 📱 Motion sensor in HomeKit
- 🏠 Multi-HomePod support
- 🔄 Real-time updates (5 seconds)
- 🚫 No authentication needed

## 🚀 Quick Start

### Install
```bash
npm install -g homebridge-homepod-mini-music-sensor
```

### Requirements
- Python 3.13
- pyatv: `pip3.13 install pyatv --break-system-packages`

### Configuration
```json
{
  "platform": "HomePodMiniMusicSensor",
  "homepods": [
    {"name": "Bedroom", "id": "A294FB11E039"}
  ]
}
```

Find IDs: `python3.13 -m pyatv.scripts.atvremote scan`

## 📱 Usage

Appears as Motion Sensor:
- ✅ Motion = Music playing
- ❌ No Motion = Idle

## 👤 Author

Daniel Mazuz - [@DM911-AI](https://github.com/DM911-AI)

## 📜 License

MIT
