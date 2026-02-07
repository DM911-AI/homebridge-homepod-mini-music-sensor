# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2024-02-07

### Changed
- **BREAKING:** Changed from `python3.13` to `python3` for universal compatibility across all systems
- Updated Node.js requirement to `>=18.0.0` (LTS versions)
- Updated Homebridge requirement to `>=1.6.0`

### Added
- Configuration validation on startup - plugin won't start with invalid/missing config
- Automatic Python environment detection with helpful error messages
- pyatv library detection with installation instructions
- Python script existence check on startup
- 10-second timeout for HomePod queries to prevent hanging
- Enhanced error messages for missing dependencies
- Better debugging information in logs

### Improved
- Error handling throughout the codebase
- Logging consistency and clarity
- Documentation in README for Python installation
- User experience when dependencies are missing

### Fixed
- Compatibility issues with different Python versions
- Plugin not providing clear error messages when Python/pyatv missing
- Potential hanging when HomePod is unreachable

## [1.3.0] - 2024-01-15

### Added
- Configurable detection settings via Homebridge UI
- Support for detecting podcasts and audiobooks
- Support for detecting movies and TV shows via AirPlay
- Max duration filter for content
- Artist field requirement option
- Configurable update interval (1-60 seconds)

### Improved
- Config schema with better UI organization
- Detection logic with smart filtering
- Documentation with automation examples

## [1.2.0] - 2023-12-10

### Added
- Multi-HomePod support
- Individual sensors for each HomePod
- Config schema for Homebridge UI configuration

### Fixed
- Sensor state not updating correctly
- Memory leak in update interval

## [1.1.0] - 2023-11-20

### Added
- Basic music detection for HomePod mini
- Motion sensor accessory in HomeKit
- Python script for getting now playing info

### Changed
- Improved pyatv integration

## [1.0.0] - 2023-11-01

### Added
- Initial release
- Basic HomePod mini music detection
- Motion sensor in HomeKit
- Works with Apple Music and Spotify

---

[1.4.0]: https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/DM911-AI/homebridge-homepod-mini-music-sensor/releases/tag/v1.0.0
