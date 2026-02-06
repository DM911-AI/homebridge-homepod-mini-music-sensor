<div align="center">

<img src="https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/homepod-mini-select-white-202110_FV1?wid=940&hei=1112&fmt=png-alpha&.v=1633086025000" alt="HomePod mini" width="300">

# 🎵 homebridge-homepod-mini-music-sensor

### Transform your HomePod mini into a smart music sensor for HomeKit

[![npm version](https://img.shields.io/npm/v/homebridge-homepod-mini-music-sensor)](https://www.npmjs.com/package/homebridge-homepod-mini-music-sensor)
[![npm downloads](https://img.shields.io/npm/dt/homebridge-homepod-mini-music-sensor)](https://www.npmjs.com/package/homebridge-homepod-mini-music-sensor)
[![GitHub stars](https://img.shields.io/github/stars/DM911-AI/homebridge-homepod-mini-music-sensor?style=social)](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor)

[![HomePod](https://img.shields.io/badge/HomePod-Compatible-blue)](https://www.apple.com/homepod-mini/)
[![HomeKit](https://img.shields.io/badge/HomeKit-Compatible-orange)](https://www.apple.com/home-app/)
[![Homebridge](https://img.shields.io/badge/Homebridge-Plugin-purple)](https://homebridge.io)
[![License](https://img.shields.io/badge/License-MIT-green)](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor/blob/main/LICENSE)

**[📦 npm](https://www.npmjs.com/package/homebridge-homepod-mini-music-sensor)** • **[💻 GitHub](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor)** • **[🐛 Issues](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor/issues)** • **[👤 Author](https://github.com/DM911-AI)**

</div>

---

## ✨ Features

- 🎵 **Configurable Detection** - Choose: music, podcasts, movies, or all
- 📱 **Motion Sensor** - Appears as motion sensor in HomeKit
- 🏠 **Multi-HomePod** - Separate sensor per HomePod
- 🔄 **Customizable** - Update interval 1-60 seconds
- 🚫 **No Auth** - Works without pairing
- ⚡ **Smart Filtering** - Duration & artist filters

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
brew install python@3.13
pip3.13 install pyatv --break-system-packages
```

### 2. Install Plugin

**Via Homebridge UI (Easiest):**

Search **"HomePod Mini Music Sensor"** → Install

**Via Terminal:**
```bash
npm install -g homebridge-homepod-mini-music-sensor
```

---

## ⚙️ Configuration (Easy!)

### Via Homebridge UI (No coding!)

1. **Find HomePod IDs:**
```bash
   python3.13 -m pyatv.scripts.atvremote scan
```
   Copy identifiers without colons: `A2:94:FB:11:E0:39` → `A294FB11E039`

2. **Configure in UI:**
   - Plugins → HomePod Mini Music Sensor → ⚙️ Settings
   - Add HomePods (name + ID)
   - Optional: Customize detection settings
   - Save & Restart

Done! 🎉

<details>
<summary>📝 Manual config.json (click to expand)</summary>
```json
{
  "platforms": [
    {
      "platform": "HomePodMiniMusicSensor",
      "name": "HomePod Mini Music Sensor",
      "detectMusic": true,
      "detectPodcasts": false,
      "detectMovies": false,
      "maxDuration": 600,
      "updateInterval": 5,
      "homepods": [
        {"name": "Bedroom", "id": "A294FB11E039"}
      ]
    }
  ]
}
```

</details>

---

## 🎯 HomeKit Automations

Motion Detected = Playing | No Motion = Idle

### Examples

💡 **Mood Lighting:** Bedroom plays → dim lights  
🎵 **Multi-room:** Kitchen plays → pause Living Room  
🌙 **Sleep:** Bedroom stops → lights off

---

## 🎭 Detection

| Type | Default | Configurable |
|------|---------|--------------|
| 🎵 Music | ✅ | Yes |
| 🎙️ Podcasts | ❌ | Yes |
| 🎬 Movies | ❌ | Yes |

---

## 🔧 Troubleshooting

<details>
<summary>HomePods not appearing?</summary>

- Verify IDs correct
- Same network as Homebridge
- Restart Homebridge
</details>

<details>
<summary>Always "No Motion"?</summary>

- Check content is playing
- Verify detection settings
- Test: `python3.13 get_nowplaying.py YOUR_ID`
</details>

---

## 📱 Supported

✅ HomePod mini | ✅ HomePod (1st/2nd gen) | 🔜 Apple TV

---

## 🤝 Contributing

PRs welcome! Fork → Branch → Commit → Push → PR

---

<div align="center">

## 👤 Author

**Daniel Mazuz**

[![GitHub](https://img.shields.io/badge/GitHub-DM911--AI-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/DM911-AI)
[![npm](https://img.shields.io/badge/npm-dm911vz-CB3837?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/~dm911vz)

---

**[📦 npm](https://www.npmjs.com/package/homebridge-homepod-mini-music-sensor)** • **[💻 GitHub](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor)** • **[🐛 Issues](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor/issues)**

---

⭐ **Star on GitHub** if you find this useful!

[![GitHub stars](https://img.shields.io/github/stars/DM911-AI/homebridge-homepod-mini-music-sensor?style=social)](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor)

**Made with ❤️ for Homebridge**

Powered by [pyatv](https://pyatv.dev/) | MIT License

</div>
