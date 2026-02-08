#!/usr/bin/env python3
import asyncio
import sys
import json
from pyatv import scan, connect
from pyatv.const import DeviceState

async def get_now_playing(device_id, timeout=3):
    """Get current playback status for a specific device"""
    try:
        loop = asyncio.get_running_loop()

        # Scan for devices
        configs = await scan(loop, timeout=timeout, identifier=device_id)

        if not configs:
            return {'state': 'idle', 'error': 'device_not_found'}

        config = configs[0]

        # Connect to device
        atv = await connect(config, loop)

        try:
            playing = await atv.metadata.playing()
            device_state = playing.device_state

            result = {
                'state': str(device_state),
                'title': playing.title,
                'artist': playing.artist,
                'album': playing.album,
                'genre': playing.genre,
                'total_time': playing.total_time,
                'position': playing.position,
                'media_type': str(playing.media_type) if playing.media_type else None
            }

            return result
        finally:
            atv.close()

    except asyncio.TimeoutError:
        return {'state': 'idle', 'error': 'timeout'}
    except Exception as e:
        return {'state': 'idle', 'error': str(e)}

async def main():
    if len(sys.argv) < 2:
        print(json.dumps({'state': 'idle', 'error': 'no_device_id'}))
        sys.exit(1)

    device_id = sys.argv[1]
    result = await get_now_playing(device_id)

    print(json.dumps(result))

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print(json.dumps({'state': 'idle', 'error': 'interrupted'}))
        sys.exit(0)
