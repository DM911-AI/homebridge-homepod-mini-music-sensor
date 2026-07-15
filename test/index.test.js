const test = require('node:test');
const assert = require('node:assert/strict');

const plugin = require('../index');
const { HomePodMusicSensorPlatform } = plugin;

function createPlatform(config = {}) {
  const handlers = {};
  const log = {
    debug() {},
    error() {},
    info() {},
    warn() {},
  };
  const api = {
    on(event, handler) {
      handlers[event] = handler;
    },
  };

  return {
    handlers,
    platform: new HomePodMusicSensorPlatform(log, config, api),
  };
}

test('configured pythonPath is checked before automatic candidates', async () => {
  const { platform } = createPlatform({ pythonPath: '/custom/pyatv-python' });
  const checked = [];
  platform.canImportPyatv = async candidate => {
    checked.push(candidate);
    return candidate === '/custom/pyatv-python';
  };

  assert.equal(await platform.checkPythonEnvironment(), true);
  assert.equal(platform.pythonPath, '/custom/pyatv-python');
  assert.equal(checked[0], '/custom/pyatv-python');
});

test('device discovery waits for successful Python detection', async () => {
  const { handlers, platform } = createPlatform({});
  let homePodsDiscovered = false;
  let appleTVsDiscovered = false;
  platform.checkPythonEnvironment = async () => false;
  platform.discoverDevices = () => { homePodsDiscovered = true; };
  platform.discoverAppleTVDevices = () => { appleTVsDiscovered = true; };

  await handlers.didFinishLaunching();

  assert.equal(homePodsDiscovered, false);
  assert.equal(appleTVsDiscovered, false);
});

test('music detection still applies artist and duration filters', () => {
  const { platform } = createPlatform({ detectMusic: true, maxDuration: 600, requireArtist: true });

  assert.equal(platform.shouldDetect({ state: 'playing', media_type: 'music', artist: 'Artist', total_time: 180 }), true);
  assert.equal(platform.shouldDetect({ state: 'playing', media_type: 'music', artist: null, total_time: 180 }), false);
  assert.equal(platform.shouldDetect({ state: 'playing', media_type: 'music', artist: 'Artist', total_time: 900 }), false);
  assert.equal(platform.shouldDetect({ state: 'paused', media_type: 'music', artist: 'Artist', total_time: 180 }), false);
});

test('movie detection is independent from the music duration filter', () => {
  const { platform } = createPlatform({ detectMusic: false, detectMovies: true, maxDuration: 60 });

  assert.equal(platform.shouldDetect({ state: 'playing', media_type: 'video', total_time: 7200 }), true);
});

test('one Apple TV poll updates all sensors and blocks overlapping polls', () => {
  const { platform } = createPlatform({
    appleTVs: [{
      name: 'Living Room',
      deviceId: 'ATV1',
      companionCredentials: 'companion-secret',
      airplayCredentials: 'airplay-secret',
    }],
  });
  platform.api.hap = {
    Characteristic: {
      MotionDetected: 'motion',
      OccupancyDetected: 'occupancy',
    },
  };

  const powerUpdates = [];
  const playbackUpdates = [];
  platform.appleTVPollers.set('ATV1', {
    targets: new Map([
      ['power', {
        accessory: { displayName: 'Power', context: {} },
        service: { updateCharacteristic: (...args) => powerUpdates.push(args) },
        sensorType: 'power',
      }],
      ['playback', {
        accessory: { displayName: 'Playback', context: {} },
        service: { updateCharacteristic: (...args) => playbackUpdates.push(args) },
        sensorType: 'playback',
      }],
    ]),
  });

  let executions = 0;
  let complete;
  let executedArgs;
  let credentialsPayload;
  platform.execFile = (command, args, options, callback) => {
    executions++;
    executedArgs = args;
    complete = callback;
    return { stdin: { end(payload) { credentialsPayload = payload; } } };
  };

  platform.pollAppleTVDevice('ATV1');
  platform.pollAppleTVDevice('ATV1');
  assert.equal(executions, 1);
  assert.deepEqual(executedArgs, [platform.appletvScriptPath, 'ATV1']);
  assert.equal(executedArgs.includes('companion-secret'), false);
  assert.deepEqual(JSON.parse(credentialsPayload), {
    companionCredentials: 'companion-secret',
    airplayCredentials: 'airplay-secret',
  });

  complete(null, JSON.stringify({ power: 'on', state: 'playing' }));
  assert.deepEqual(powerUpdates, [['occupancy', 1]]);
  assert.deepEqual(playbackUpdates, [['motion', true]]);
  assert.equal(platform.pollInFlight.size, 0);
});

test('HomePod polling does not overlap', () => {
  const { platform } = createPlatform({});
  platform.api.hap = { Characteristic: { MotionDetected: 'motion' } };
  const accessory = {
    UUID: 'homepod-1',
    displayName: 'Kitchen',
    context: { deviceIds: ['HP1'], name: 'Kitchen', isStereoPair: false },
  };
  const service = { updateCharacteristic() {} };
  let executions = 0;
  let complete;
  platform.execFile = (command, args, options, callback) => {
    executions++;
    complete = callback;
    return {};
  };

  platform.updateStatus(accessory, service);
  platform.updateStatus(accessory, service);
  assert.equal(executions, 1);

  complete(null, JSON.stringify({ state: 'idle' }));
  platform.updateStatus(accessory, service);
  assert.equal(executions, 2);
});
