# homebridge-homepod-mini-music-sensor

[![npm version](https://badge.fury.io/js/homebridge-homepod-mini-music-sensor.svg)](https://www.npmjs.com/package/homebridge-homepod-mini-music-sensor)
[![npm downloads](https://img.shields.io/npm/dt/homebridge-homepod-mini-music-sensor.svg)](https://www.npmjs.com/package/homebridge-homepod-mini-music-sensor)

🎵 Monitor what's currently playing on your HomePod mini devices in HomeKit!

Transform your HomePod mini into a smart music sensor that triggers HomeKit automations.

## ✨ Features

- 🎵 **Music-only detection** - Only triggers for music (filters out movies, podcasts, audiobooks)
- 📱 **Motion sensor** - Appears as a motion sensor in HomeKit
- 🏠 **Multi-HomePod support** - Separate sensor for each HomePod
- 🔄 **Real-time updates** - Status updates every 5 seconds
- 🚫 **No authentication** - Works with HomePod mini without pairing
- ⚡ **Smart filtering** - Automatically excludes content longer than 10 minutes

## 📋 Requirements

- Homebridge v1.3.0 or higher
- Node.js v14.0.0 or higher
- Python 3.13
- pyatv library

## 🚀 Quick Start

### 1. Install Python 3.13
```bash
brew install python@3.13
```

### 2. Install pyatv
```bash
pip3.13 install pyatv --break-system-packages
```

### 3. Install Plugin

**Via Homebridge UI (Recommended):**
Search for **"HomePod Mini Music Sensor"** in the Plugins tab

**Via Terminal:**
```bash
npm install -g homebridge-homepod-mini-music-sensor
```

## ⚙️ Configuration

### Finding Your HomePod IDs
```bash
python3.13 -m pyatv.scripts.atvremote scan
```

Look for `Identifiers` and use the format without colons:
- Example: `A2:94:FB:11:E0:39` → `A294FB11E039`

### Config Example
```json
{
  "platforms": [
    {
      "platform": "HomePodMiniMusicSensor",
      "name": "HomePod Mini Music Sensor",
      "homepods": [
        {
          "name": "Bedroom",
          "id": "A294FB11E039"
        },
        {
          "name": "Living Room",
          "id": "222670F59044"
        },
        {
          "name": "Kitchen",
          "id": "F2E8AA6E8D9C"
        }
      ]
    }
  ]
}
```

## 🎯 HomeKit Automations

Each HomePod appears as a **Motion Sensor**:
- ✅ Motion = Music playing
- ❌ No Motion = Idle

### Example Automations

**Mood Lighting:**
```
When "Bedroom" detects motion
→ Set bedroom lights to 30%, warm white
```

**Multi-room Audio:**
```
When "Kitchen" detects motion
→ Pause "Living Room" HomePod
```

**Sleep Mode:**
```
When "Bedroom" stops detecting motion (no music)
→ Turn off all lights, lock doors
```

## 🎭 What Gets Detected?

| Content Type | Detected? | Reason |
|-------------|-----------|---------|
| 🎵 Music (Apple Music, Spotify) | ✅ Yes | Music type |
| 🎙️ Podcasts | ❌ No | Filtered (>10 min) |
| 📚 Audiobooks | ❌ No | Filtered (>10 min) |
| 🎬 Movies/TV | ❌ No | Not music type |
| 🗣️ Siri responses | ❌ No | Not music type |

## 🔧 Troubleshooting

### HomePods not appearing?
1. Verify IDs: `python3.13 -m pyatv.scripts.atvremote scan`
2. Check same network as Homebridge
3. Restart Homebridge

### Always showing "No Motion"?
1. Ensure music is **playing** (not paused)
2. Test manually: `python3.13 get_nowplaying.py YOUR_ID`
3. Check logs: `journalctl -u homebridge -f`

### Python/pyatv errors?
```bash
# Verify Python
python3.13 --version

# Reinstall pyatv
pip3.13 install --upgrade pyatv --break-system-packages
```

## 📱 Supported Devices

- ✅ HomePod mini
- ✅ HomePod (1st gen)
- ✅ HomePod (2nd gen)
- ❌ Apple TV (future update)

## 🗺️ Roadmap

- [ ] Apple TV support (requires pairing)
- [ ] Configurable update interval
- [ ] Custom duration filter
- [ ] Song metadata display (Eve app)
- [ ] Stereo pair support

## 📜 License

MIT

## 👏 Credits

Powered by [pyatv](https://pyatv.dev/)

## 👤 Author

**Daniel Mazuz**
- npm: [@dm911vz](https://www.npmjs.com/~dm911vz)

---

💙 Enjoying this plugin? Star it on GitHub and share with friends!
