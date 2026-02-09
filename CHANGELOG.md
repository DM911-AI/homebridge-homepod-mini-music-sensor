# Changelog

All notable changes to this project will be documented in this file.

## [1.4.6] - 2026-02-09

### 🎉 Added
- **Stereo Pair Support** - Create a single sensor for HomePod stereo pairs
  - Detects music on either HomePod in the pair
  - Cleaner HomeKit interface with fewer sensors
  - Configure by giving both HomePods the same name and setting `stereoPair: true`

### 🐛 Fixed
- Fixed device discovery using incorrect device ID format (identifiers should not contain colons)
- Fixed duplicate plugin configuration causing UI issues
- Improved reliability of device scanning and identification

### 🔧 Changed
- Updated device ID handling to use correct format without colons
- Improved logging for stereo pair detection and creation
- Better error handling for device discovery

---

## [1.4.5] - 2026-02-08

### 🐛 Fixed
- Critical bug fixes preventing plugin from working
- Improved error handling

---

## [1.4.0] - 2026-02-07

### 🎉 Added
- Enhanced UI configuration
- Better device management

---

## [1.3.0] - 2026-02-06

### 🎉 Added
- Improved detection logic

---

## [1.2.0] - 2026-02-05

### 🎉 Added
- Configurable filters and update interval

---

## [1.1.0] - 2026-02-04

### 🎉 Added
- Initial release
