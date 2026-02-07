# 🎵 homebridge-homepod-mini-music-sensor

**Transform your HomePod mini into a smart music sensor for HomeKit**

[![npm version](https://badge.fury.io/js/homebridge-homepod-mini-music-sensor.svg)](https://www.npmjs.com/package/homebridge-homepod-mini-music-sensor)
[![npm downloads](https://img.shields.io/npm/dt/homebridge-homepod-mini-music-sensor.svg)](https://www.npmjs.com/package/homebridge-homepod-mini-music-sensor)
[![GitHub stars](https://img.shields.io/github/stars/DM911-AI/homebridge-homepod-mini-music-sensor.svg)](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor)

[![HomePod](https://img.shields.io/badge/HomePod-mini-purple.svg)](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor)
[![HomeKit](https://img.shields.io/badge/HomeKit-Compatible-blue.svg)](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor)
[![Homebridge](https://img.shields.io/badge/Homebridge-Plugin-orange.svg)](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[📦 npm](https://www.npmjs.com/package/homebridge-homepod-mini-music-sensor) • [💻 GitHub](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor) • [🐛 Issues](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor/issues) • [👤 Author](https://github.com/DM911-AI)

---

## 🎯 Overview

This Homebridge plugin turns your HomePod mini (or HomePod) into a smart music sensor for HomeKit. It appears as a **motion sensor** that detects when music is playing, enabling powerful home automations based on your listening habits.

**Why use this plugin?**

- 🎵 Create mood lighting that responds to music
- 🏠 Build multi-room audio automations
- 🌙 Trigger scenes when music stops
- 📱 No complicated setup - works out of the box
- 🎛️ Fully customizable detection settings

---

## ✨ Features

### Core Features

- 🎵 **Smart Music Detection** - Detects when music is actively playing
- 📱 **HomeKit Motion Sensor** - Appears as a standard motion sensor in Home app
- 🏠 **Multi-HomePod Support** - Create separate sensors for each HomePod
- 🚫 **No Authentication Required** - Works with HomePod mini without pairing
- ⚡ **Fast Updates** - Configurable update interval (1-60 seconds)

### Advanced Features

- 🎛️ **Configurable Detection** - Choose what to detect: music, podcasts, movies, or all
- 🎬 **Smart Filtering** - Automatically filters out movies and long-form content
- ⏱️ **Duration-Based Filtering** - Set max duration for content detection
- 🎤 **Artist Field Detection** - Filter content by presence of artist metadata
- 🔄 **Real-time Updates** - Always knows what's playing, when it's playing

---

## 🚀 Installation

### Prerequisites

**Python 3** is required for this plugin to work:
```bash
# Install Python 3 (macOS)
brew install python3

# Verify installation
python3 --version
```

**pyatv library** is required to communicate with HomePods:
```bash
# Install pyatv
pip3 install pyatv

# Verify installation
python3 -m pyatv --version
```

### Plugin Installation

#### Via Homebridge UI (Recommended)

1. Open **Homebridge UI**
2. Go to **Plugins** tab
3. Search for **"HomePod Mini Music Sensor"**
4. Click **Install**
5. Wait for installation to complete
6. **Restart Homebridge**

#### Via Terminal
```bash
npm install -g homebridge-homepod-mini-music-sensor
```

---

## ⚙️ Configuration

### Easy Configuration via Homebridge UI

This is the easiest way to configure the plugin - no coding required!

#### Step 1: Find Your HomePod IDs

Open Terminal and run:
```bash
python3 -m pyatv.scripts.atvremote scan
```

Example output:
```
Name: Bedroom
Model/SW: HomePod Mini, tvOS 26.2
Address: 10.100.102.9
Identifiers:
 - A2:94:FB:11:E0:39
 - A294FB11E039
```

**Copy the identifier WITHOUT colons:** `A294FB11E039`

#### Step 2: Configure in Homebridge UI

1. Go to **Plugins** → Find **"HomePod Mini Music Sensor"**
2. Click **⚙️ Settings**
3. You'll see the configuration form with the HomePod hero image
4. Expand **"🏠 Your HomePods"** section
5. Click **"➕ Add HomePod"**
6. Enter:
   - **Display Name:** `Bedroom` (or your HomePod's name)
   - **Device ID:** `A294FB11E039` (the ID from step 1)
7. Repeat for each HomePod
8. (Optional) Expand **"🎛️ Detection Settings"** to customize
9. Click **Save**
10. **Restart Homebridge**

**That's it!** Your HomePods will now appear as motion sensors in HomeKit.

### Advanced Configuration

#### Detection Settings Explained

- 🎵 **Detect Music** (Default: ON)
- 🎙️ **Detect Podcasts** (Default: OFF)
- 🎬 **Detect Movies/TV** (Default: OFF)
- ⏱️ **Max Duration** (Default: 600 seconds / 10 minutes)
- 🎤 **Require Artist Field** (Default: ON)
- 🔄 **Update Interval** (Default: 5 seconds)

#### Manual Configuration (config.json)

<details>
<summary>Click to view manual configuration options</summary>
```json
{
  "platform": "HomePodMiniMusicSensor",
  "name": "HomePod Music Sensor",
  "detectMusic": true,
  "detectPodcasts": false,
  "detectMovies": false,
  "maxDuration": 600,
  "requireArtist": true,
  "updateInterval": 5,
  "homepods": [
    {
      "name": "Bedroom",
      "id": "A294FB11E039"
    },
    {
      "name": "Living Room",
      "id": "F2E8AA6E8D9C"
    }
  ]
}
```

</details>

---

## 🎯 HomeKit Automations

Once configured, each HomePod appears as a **Motion Sensor** in the Home app:

- ✅ **Motion Detected** = Content is currently playing (based on your settings)
- ❌ **No Motion Detected** = Nothing is playing or paused

### Automation Ideas

#### 🌅 Morning Routine

**When** "Bedroom" detects motion (music starts)  
→ Open bedroom blinds  
→ Turn on coffee maker  
→ Set living room lights to 100%

#### 💡 Mood Lighting

**When** "Living Room" detects motion  
→ Dim living room lights to 30%  
→ Set lights to warm white  
→ Turn off TV

#### 🎵 Multi-Room Audio Control

**When** "Kitchen" detects motion  
→ Pause "Living Room" HomePod  
→ Lower "Bedroom" HomePod volume to 20%

#### 🌙 Sleep Mode

**When** "Bedroom" stops detecting motion (music stops)  
→ Turn off all lights  
→ Lock front door  
→ Set thermostat to 68°F  
→ Close blinds

#### 🏃 Workout Detection

**When** "Gym Room" detects motion  
→ Turn on fan  
→ Set lights to energizing blue  
→ Lock gym room door

#### 🍳 Cooking Assistant

**When** "Kitchen" detects motion  
→ Turn on under-cabinet lights  
→ Display recipe on iPad  
→ Pause other HomePods

---

## 🎭 Content Detection

### What Gets Detected?

| Content Type | Default Behavior | How It's Detected | Configurable? |
|-------------|------------------|-------------------|---------------|
| 🎵 **Music** (Apple Music, Spotify) | ✅ Detected | Music type + has artist + short duration | Yes - disable if needed |
| 🎙️ **Podcasts** | ❌ Not Detected | Long duration (>10 min) | Yes - enable in settings |
| 📚 **Audiobooks** | ❌ Not Detected | Long duration (>10 min) | Yes - enable in settings |
| 🎬 **Movies/TV** (AirPlay) | ❌ Not Detected | No artist field | Yes - enable + disable "Require Artist" |
| 🗣️ **Siri Responses** | ❌ Never Detected | Not music type | No |

### Detection Logic

The plugin uses smart filtering to determine if content should trigger the sensor:

1. **Is anything playing?** → Check playback state
2. **What type of content?** → Check media type (music, video, etc.)
3. **Does it match settings?** → Check if enabled (music/podcasts/movies)
4. **How long is it?** → Check against max duration
5. **Has artist info?** → Check artist field (if required)

**Result:** Sensor triggers only when **ALL** conditions match your settings.

---

## 🔧 Troubleshooting

### Common Issues

<details>
<summary>❌ HomePods not appearing in HomeKit</summary>

**Solutions:**
- Verify IDs: `python3 -m pyatv.scripts.atvremote scan`
- Check HomePods are on same network as Homebridge
- Restart Homebridge
- Check Homebridge logs for errors

</details>

<details>
<summary>❌ Sensor always shows "No Motion"</summary>

**Solutions:**
- Ensure music is actually playing (not paused)
- Test manually: `python3 get_nowplaying.py YOUR_ID`
- Check detection settings (maybe podcasts/movies are disabled)
- Review Homebridge logs
- Verify pyatv is working: `python3 -m pyatv.scripts.atvremote --id YOUR_ID playing`

</details>

<details>
<summary>❌ Sensor triggers for movies/videos</summary>

**Solutions:**
- Enable "Require Artist Field" in settings (default: ON)
- Disable "Detect Movies/TV" in settings (default: OFF)
- Lower "Max Duration" to filter longer content

</details>

<details>
<summary>❌ Python or pyatv errors</summary>

**Solutions:**
```bash
# Verify Python
python3 --version

# Reinstall pyatv
pip3 install --upgrade pyatv

# Test pyatv
python3 -m pyatv scan
```

</details>

<details>
<summary>❌ "Plugin alias could not be determined" error</summary>

**Solutions:**
- This usually means the plugin wasn't installed correctly
- Try reinstalling: `npm uninstall -g homebridge-homepod-mini-music-sensor && npm install -g homebridge-homepod-mini-music-sensor`
- Clear npm cache: `npm cache clean --force`
- Restart Homebridge

</details>

### Getting More Help

If you're still experiencing issues:

1. **Check the logs**
   - Homebridge UI → Logs tab
   - Look for lines containing "HomePod" or "Music Sensor"

2. **Enable debug logging**
   - Check Homebridge debug logs for more details

3. **Report an issue**
   - Go to: https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor/issues
   - Include:
     - Homebridge version
     - Plugin version
     - Node.js version (`node --version`)
     - Python version (`python3 --version`)
     - pyatv version (`python3 -m pyatv --version`)
     - Relevant log output
     - What you've already tried

---

## 📱 Supported Devices

### Fully Supported

- ✅ **HomePod mini** (all colors)
- ✅ **HomePod** (1st generation - discontinued)
- ✅ **HomePod** (2nd generation - 2023)

### Requirements

- **Network:** HomePods must be on same local network as Homebridge
- **tvOS:** Any version supported by pyatv
- **No authentication required** - Works without pairing

### Not Supported (Yet)

- ❌ **Apple TV** - Requires authentication/pairing
  - Coming in future update
  - More complex setup needed
  - [Vote for this feature](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor/issues) if interested!

---

## 🗺️ Roadmap

### Planned Features

- [ ] **Apple TV Support**
  - Add authentication/pairing support
  - Enable same features for Apple TV
  - Expected: Version 2.0

- [ ] **Song Metadata Display**
  - Show current song in Eve app
  - Display artist, album, artwork
  - Expected: Version 1.5

- [ ] **Stereo Pair Detection**
  - Detect HomePod stereo pairs
  - Create single sensor for pair
  - Expected: Version 1.6

- [ ] **Custom Webhooks**
  - Trigger external services when music plays
  - IFTTT, Zapier integration
  - Expected: Version 1.7

- [ ] **Web Dashboard**
  - View all HomePods at a glance
  - See what's playing everywhere
  - Expected: Version 2.0

### Suggest a Feature

Have an idea? [Open a feature request on GitHub!](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor/issues/new?labels=enhancement)

---

## 🤝 Contributing

Contributions are welcome and appreciated!

### How to Contribute

1. **Fork the repository**
```bash
   git clone https://github.com/YOUR_USERNAME/homebridge-homepod-mini-music-sensor.git
```

2. **Create a feature branch**
```bash
   git checkout -b feature/AmazingFeature
```

3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Test thoroughly

4. **Commit your changes**
```bash
   git commit -m 'Add some AmazingFeature'
```

5. **Push to your fork**
```bash
   git push origin feature/AmazingFeature
```

6. **Open a Pull Request**
   - Describe your changes
   - Link any related issues

### Development Setup
```bash
# Clone the repo
git clone https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor.git
cd homebridge-homepod-mini-music-sensor

# Install dependencies
npm install

# Link for local testing
npm link

# Make changes and test
```

---

## 📜 License

This project is licensed under the **MIT License**.

**What this means:**

- ✅ Free to use
- ✅ Free to modify
- ✅ Free to distribute
- ✅ Can use commercially

See the [LICENSE](LICENSE) file for full details.

---

## 👏 Credits & Acknowledgments

### Built With

- [**pyatv**](https://github.com/postlund/pyatv) - Amazing Python library for controlling Apple TV and HomePod devices
  - Created by: [Pierre Ståhl (@postlund)](https://github.com/postlund)
  - Without this library, this plugin wouldn't exist!

### Inspired By

- The Homebridge community's need for better HomePod integration
- Requests for music-based HomeKit automations

### Special Thanks

- **Homebridge team** - For creating the platform
- **Early testers** - For feedback and bug reports
- **600+ users** - For downloading and using this plugin! 🎉

---

## 👤 Author

**Daniel Mazuz**

[![GitHub](https://img.shields.io/badge/GitHub-DM911--AI-black?logo=github)](https://github.com/DM911-AI)
[![npm](https://img.shields.io/badge/npm-dm911vz-red?logo=npm)](https://www.npmjs.com/~dm911vz)

---

## 🔗 Quick Links

[📦 npm Package](https://www.npmjs.com/package/homebridge-homepod-mini-music-sensor) • [💻 GitHub Repository](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor) • [🐛 Report Bug](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor/issues) • [💡 Request Feature](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor/issues/new?labels=enhancement)

---

## ⭐ Support This Project

If you find this plugin useful, please consider:

- ⭐ **Star this repository** on GitHub
- 🐛 **Report bugs** and issues
- 💡 **Suggest new features**
- 📢 **Share** with friends and the community
- ☕ **Buy me a coffee** (coming soon!)

[![GitHub stars](https://img.shields.io/github/stars/DM911-AI/homebridge-homepod-mini-music-sensor.svg?style=social)](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor)

---

**💙 Enjoying this plugin? Star it on GitHub and share with the community!**
