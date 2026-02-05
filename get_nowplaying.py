#!/usr/bin/env python3.13
import asyncio
import sys
import json
from pyatv import connect, scan
from pyatv.const import DeviceState, MediaType

async def get_homepod_status(device_id):
    """Get status of a specific HomePod - MUSIC ONLY"""
    try:
        loop = asyncio.get_event_loop()
        devices = await scan(loop, identifier=device_id, timeout=3)
        
        if not devices:
            return {"state": "idle", "name": "Unknown"}
        
        device = devices[0]
        
        try:
            atv = await connect(device, loop)
            playing = await atv.metadata.playing()
            
            # Check if it's actually MUSIC (not podcast, audiobook, etc)
            is_music = playing.media_type == MediaType.Music
            is_playing = playing.device_state == DeviceState.Playing
            
            result = {
                "name": device.name,
                "state": "playing" if (is_playing and is_music) else "idle",
                "title": playing.title or "" if is_music else "",
                "artist": playing.artist or "" if is_music else "",
                "album": playing.album or "" if is_music else "",
                "position": playing.position or 0 if is_music else 0,
                "duration": playing.total_time or 0 if is_music else 0,
                "media_type": playing.media_type.name.lower() if playing.media_type else "unknown"
            }
            
            atv.close()
            return result
            
        except Exception as e:
            return {"state": "idle", "name": device.name, "error": str(e)}
            
    except Exception as e:
        return {"state": "idle", "error": str(e)}

if __name__ == "__main__":
    device_id = sys.argv[1] if len(sys.argv) > 1 else None
    result = asyncio.run(get_homepod_status(device_id))
    print(json.dumps(result))
