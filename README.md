<div align="center">

<img src="https://raw.githubusercontent.com/DM911-AI/homebridge-homepod-mini-music-sensor/main/assets/HomePod_2.jpg" alt="HomePod & HomePod mini" width="600">

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

## 🎯 Overview

This Homebridge plugin turns your HomePod mini (or HomePod) into a **smart music sensor** for HomeKit. It appears as a motion sensor that detects when music is playing, enabling powerful home automations based on your listening habits.

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

**Python 3.13** is required for this plugin to work:
```bash
# Install Python 3.13 (macOS)
brew install python@3.13

# Verify installation
python3.13 --version
```

**pyatv library** is required to communicate with HomePods:
```bash
# Install pyatv
pip3.13 install pyatv --break-system-packages

# Verify installation
python3.13 -m pyatv --version
```

### Plugin Installation

#### Via Homebridge UI (Recommended)

1. Open Homebridge UI
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

**This is the easiest way to configure the plugin - no coding required!**

#### Step 1: Find Your HomePod IDs

Open Terminal and run:
```bash
python3.13 -m pyatv.scripts.atvremote scan
```

**Example output:**
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
4. Expand **"🏠 HomePods"** section
5. Click **"Add HomePod"**
6. Enter:
   - **Display Name**: `Bedroom` (or your HomePod's name)
   - **Device ID**: `A294FB11E039` (the ID from step 1)
7. Repeat for each HomePod
8. (Optional) Expand **"🎛️ Detection Settings"** to customize
9. Click **Save**
10. **Restart Homebridge**

That's it! Your HomePods will now appear as motion sensors in HomeKit.

---

### Advanced Configuration

#### Detection Settings Explained

<details>
<summary><strong>🎵 Detect Music</strong> (Default: ON)</summary>

When enabled, the sensor will trigger when music is playing from:
- Apple Music
- Spotify (via AirPlay)
- Any music streaming service
- Songs under 10 minutes (configurable)

**Use case:** Most common setting for music-based automations.
</details>

<details>
<summary><strong>🎙️ Detect Podcasts</strong> (Default: OFF)</summary>

When enabled, the sensor will trigger for long-form audio content:
- Podcasts
- Audiobooks
- Long recordings (over default 10 minutes)

**Use case:** If you want automations to trigger during podcast listening too.
</details>

<details>
<summary><strong>🎬 Detect Movies/TV</strong> (Default: OFF)</summary>

When enabled, the sensor will trigger for video content:
- Movies played via AirPlay
- TV shows
- YouTube videos
- Any video content

**Use case:** If you use HomePod for movie audio and want automations.

**Note:** Most movies don't have "artist" metadata, so you may need to disable "Require Artist Field".
</details>

<details>
<summary><strong>⏱️ Max Duration</strong> (Default: 600 seconds / 10 minutes)</summary>

Sets the maximum content length that will trigger the sensor.

**Examples:**
- `300` (5 min) - Only short songs
- `600` (10 min) - Most songs, filters podcasts
- `3600` (60 min) - Include podcasts and audiobooks

**Use case:** Fine-tune what content length you want to detect.
</details>

<details>
<summary><strong>🎤 Require Artist Field</strong> (Default: ON)</summary>

Only triggers if content has an artist field in its metadata.

**When ON:**
- ✅ Detects: Music from Apple Music, Spotify
- ❌ Filters: Movies, TV shows (usually no artist)

**When OFF:**
- ✅ Detects: Everything, including movies

**Use case:** Keep ON to filter out movies. Turn OFF if you want all content.
</details>

<details>
<summary><strong>🔄 Update Interval</strong> (Default: 5 seconds)</summary>

How often the plugin checks what's playing.

**Examples:**
- `1` second - Fastest, most responsive
- `5` seconds - Balanced (recommended)
- `10` seconds - Lower CPU usage

**Use case:** Lower for instant automations, higher to reduce system load.
</details>

---

### Manual Configuration (config.json)

<details>
<summary>Click to view manual configuration options</summary>

#### Basic Configuration
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

#### Full Configuration with All Options
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
      "requireArtist": true,
      "updateInterval": 5,
      "homepods": [
        {
          "name": "Bedroom",
          "id": "A294FB11E039"
        }
      ]
    }
  ]
}
```

#### Configuration Examples

**Music Only (Default):**
```json
{
  "detectMusic": true,
  "detectPodcasts": false,
  "detectMovies": false,
  "requireArtist": true
}
```

**Music + Podcasts:**
```json
{
  "detectMusic": true,
  "detectPodcasts": true,
  "detectMovies": false,
  "maxDuration": 3600,
  "requireArtist": true
}
```

**Everything (Music, Podcasts, Movies):**
```json
{
  "detectMusic": true,
  "detectPodcasts": true,
  "detectMovies": true,
  "requireArtist": false
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
```
When "Bedroom" detects motion (music starts)
→ Open bedroom blinds
→ Turn on coffee maker
→ Set living room lights to 100%
```

#### 💡 Mood Lighting
```
When "Living Room" detects motion
→ Dim living room lights to 30%
→ Set lights to warm white
→ Turn off TV
```

#### 🎵 Multi-Room Audio Control
```
When "Kitchen" detects motion
→ Pause "Living Room" HomePod
→ Lower "Bedroom" HomePod volume to 20%
```

#### 🌙 Sleep Mode
```
When "Bedroom" stops detecting motion (music stops)
→ Turn off all lights
→ Lock front door
→ Set thermostat to 68°F
→ Close blinds
```

#### 🏃 Workout Detection
```
When "Gym Room" detects motion
→ Turn on fan
→ Set lights to energizing blue
→ Lock gym room door
```

#### 🍳 Cooking Assistant
```
When "Kitchen" detects motion
→ Turn on under-cabinet lights
→ Display recipe on iPad
→ Pause other HomePods
```

---

## 🎭 Content Detection

### What Gets Detected?

| Content Type | Default Behavior | How It's Detected | Configurable? |
|-------------|-----------------|-------------------|---------------|
| 🎵 **Music** (Apple Music, Spotify) | ✅ **Detected** | Music type + has artist + short duration | Yes - disable if needed |
| 🎙️ **Podcasts** | ❌ **Not Detected** | Long duration (>10 min) | Yes - enable in settings |
| 📚 **Audiobooks** | ❌ **Not Detected** | Long duration (>10 min) | Yes - enable in settings |
| 🎬 **Movies/TV** (AirPlay) | ❌ **Not Detected** | No artist field | Yes - enable + disable "Require Artist" |
| 🗣️ **Siri Responses** | ❌ **Never Detected** | Not music type | No |

### Detection Logic

The plugin uses smart filtering to determine if content should trigger the sensor:

1. **Is anything playing?** → Check playback state
2. **What type of content?** → Check media type (music, video, etc.)
3. **Does it match settings?** → Check if enabled (music/podcasts/movies)
4. **How long is it?** → Check against max duration
5. **Has artist info?** → Check artist field (if required)

**Result:** Sensor triggers only when ALL conditions match your settings.

---

## 🔧 Troubleshooting

### Common Issues

<details>
<summary><strong>❌ HomePods not appearing in HomeKit</strong></summary>

**Symptoms:** After setup, HomePods don't show up in Home app

**Solutions:**
1. **Verify HomePod IDs are correct**
```bash
   python3.13 -m pyatv.scripts.atvremote scan
```
   Make sure IDs match exactly (no colons, no dashes)

2. **Check network connectivity**
   - HomePods must be on same network as Homebridge
   - Check router settings for device isolation
   - Try ping test: `ping 10.100.102.X` (replace X with HomePod IP)

3. **Restart Homebridge**
   - Go to Homebridge UI
   - Click restart button
   - Wait 30 seconds

4. **Check Homebridge logs**
   - Look for error messages in logs
   - Plugin should log: "HomePod Mini Music Sensor Platform finished launching"

5. **Reinstall plugin**
   - Uninstall plugin
   - Restart Homebridge
   - Reinstall plugin
   - Reconfigure
</details>

<details>
<summary><strong>❌ Sensor always shows "No Motion"</strong></summary>

**Symptoms:** Sensor never triggers even when music is playing

**Solutions:**
1. **Verify content is playing (not paused)**
   - Check HomePod is actually playing music
   - Verify volume is not muted

2. **Check detection settings**
   - Make sure "Detect Music" is enabled
   - For podcasts: Enable "Detect Podcasts"
   - For movies: Enable "Detect Movies" + disable "Require Artist"

3. **Test manually**
```bash
   cd ~/homebridge-homepod-mini-music-sensor
   python3.13 get_nowplaying.py YOUR_HOMEPOD_ID
```
   Should return JSON with state: "playing"

4. **Verify update interval**
   - Try setting update interval to 1 second temporarily
   - If it works, increase slowly

5. **Check Homebridge logs**
   - Should see: "Bedroom: Song Name - Artist Name"
   - If not, there's a connection issue
</details>

<details>
<summary><strong>❌ Sensor triggers for movies/videos</strong></summary>

**Symptoms:** Sensor activates when playing movies via AirPlay

**Solutions:**
1. **Keep "Require Artist Field" enabled** (default: ON)
   - Most movies don't have artist metadata
   - This will filter them out automatically

2. **Adjust max duration**
   - Movies are usually long (>90 min)
   - Keep max duration at 600 seconds (10 min)

3. **Disable "Detect Movies"** (should be off by default)
</details>

<details>
<summary><strong>❌ Python or pyatv errors</strong></summary>

**Symptoms:** Plugin fails to load or shows Python-related errors

**Solutions:**
1. **Verify Python 3.13 is installed**
```bash
   python3.13 --version
   # Should show: Python 3.13.x
```

2. **Verify pyatv is installed**
```bash
   python3.13 -m pyatv --version
   # Should show pyatv version
```

3. **Reinstall pyatv**
```bash
   pip3.13 install --upgrade pyatv --break-system-packages
```

4. **Check Python path**
```bash
   which python3.13
   # Should show: /usr/local/bin/python3.13 or similar
```

5. **Check Homebridge can find Python**
   - Make sure Python 3.13 is in PATH
   - May need to specify full path in plugin code
</details>

<details>
<summary><strong>❌ "Plugin alias could not be determined" error</strong></summary>

**Symptoms:** Error message in Homebridge UI

**Solutions:**
1. **Restart Homebridge** - Often fixes the issue
2. **Check plugin installation** - May not have installed correctly
3. **View plugin logs** - Look for specific error messages
4. **Reinstall plugin**
   - Uninstall completely
   - Restart Homebridge
   - Install again
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
     - Python version (`python3.13 --version`)
     - pyatv version
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
  - Vote for this feature if interested!

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
  - Expected: Version 1.3

- [ ] **Stereo Pair Detection**
  - Detect HomePod stereo pairs
  - Create single sensor for pair
  - Expected: Version 1.4

- [ ] **Custom Webhooks**
  - Trigger external services when music plays
  - IFTTT, Zapier integration
  - Expected: Version 1.5

- [ ] **Web Dashboard**
  - View all HomePods at a glance
  - See what's playing everywhere
  - Expected: Version 2.0

### Suggest a Feature

Have an idea? [Open a feature request](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor/issues/new) on GitHub!

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
- **[pyatv](https://pyatv.dev/)** - Amazing Python library for controlling Apple TV and HomePod devices
  - Created by: Pierre Ståhl (@postlund)
  - Without this library, this plugin wouldn't exist!

### Inspired By
- The Homebridge community's need for better HomePod integration
- Requests for music-based HomeKit automations

### Special Thanks
- **Homebridge team** - For creating the platform
- **Early testers** - For feedback and bug reports
- **600+ users** - For downloading and using this plugin! 🎉

---

<div align="center">

## 👤 Author

**Daniel Mazuz**

[![GitHub](https://img.shields.io/badge/GitHub-DM911--AI-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/DM911-AI)
[![npm](https://img.shields.io/badge/npm-dm911vz-CB3837?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/~dm911vz)

---

## 🔗 Quick Links

**[📦 npm Package](https://www.npmjs.com/package/homebridge-homepod-mini-music-sensor)** • **[💻 GitHub Repository](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor)** • **[🐛 Report Bug](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor/issues)** • **[💡 Request Feature](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor/issues/new)**

---

## ⭐ Support This Project

If you find this plugin useful, please consider:

⭐ **Star this repository on GitHub**  
🐛 **Report bugs and issues**  
💡 **Suggest new features**  
📢 **Share with friends and the community**  
☕ **Buy me a coffee** (coming soon!)

[![GitHub stars](https://img.shields.io/github/stars/DM911-AI/homebridge-homepod-mini-music-sensor?style=social)](https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor)

---

**Made with ❤️ for the Homebridge community**

</div>
