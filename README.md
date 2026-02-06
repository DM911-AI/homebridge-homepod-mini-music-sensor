<div align="center">

<img src="file:///Users/danielmazuz/Downloads/HomePod-2-and-Mini-feature-1.jpg" alt="HomePod & HomePod mini" width="600">

# 🎵 homebridge-homepod-mini-music-sensor

### Transform your HomePod mini into a smart music sensor for HomeKit

[![npm version](https://img.shields.io/npm/v/homebridge-homepod-mini-music-sensor)](https://www.npmjs.com/package/homebridge-homepod-mini-music-sensor)
[![npm downloads](https://img.shields.io/npm/dt/homebridge-homepod-mini-music-sensor)](https://www.npmjs.com/package/homebridge-homepod-mini-music-sensor)
[![GitHub stars](https://img.shields.io/github/stars/DM911-AI/homebridge-homepod-mini-music-sensor?style=social)](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor)

[![HomePod](https://img.shields.io/badge/HomePod-Compatible-blue)](https://www.apple.com/homepod-mini/)
[![HomeKit](https://img.shields.io/badge/HomeKit-Compatible-orange)](https://www.apple.com/home-app/)
[![Homebridge](https://img.shields.io/badge/Homebridge-Plugin-purple)](https://homebridge.io)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**[📦 npm](https://www.npmjs.com/package/homebridge-homepod-mini-music-sensor)** • **[💻 GitHub](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor)** • **[🐛 Issues](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor/issues)** • **[👤 Author](https://github.com/DM911-AI)**

</div>

---

## ✨ Features

- 🎵 **Configurable Detection** - Choose: music, podcasts, movies
- 📱 **Motion Sensor** - HomeKit motion sensor
- 🏠 **Multi-HomePod** - Separate sensor per device
- 🔄 **Customizable** - Update interval 1-60s
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

---

## ⚙️ Easy Configuration

### Via Homebridge UI (No coding!)

1. Find HomePod IDs: `python3.13 -m pyatv.scripts.atvremote scan`
2. Plugins → HomePod Mini Music Sensor → ⚙️ Settings
3. Add HomePods (name + ID)
4. Save & Restart

Done! 🎉

---

## 🎯 HomeKit Automations

**Motion Detected** = Playing | **No Motion** = Idle

💡 Bedroom plays → dim lights  
🎵 Kitchen plays → pause Living Room  
🌙 Bedroom stops → lights off

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

- Content is playing (not paused)
- Check detection settings
- Test: `python3.13 get_nowplaying.py YOUR_ID`
</details>

---

## 📱 Supported

✅ HomePod mini | ✅ HomePod (1st/2nd gen) | 🔜 Apple TV

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
