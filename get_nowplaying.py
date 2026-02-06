#!/usr/bin/env python3.13
import asyncio
import sys
import json
from pyatv import connect, scan
from pyatv.const import DeviceState, MediaType

async def get_homepod_status(device_id, config=None):
    """Get status of a specific HomePod with configurable filtering"""
    
    # Default config
    if config is None:
        config = {
            "detectMusic": True,
            "detectPodcasts": False,
            "detectMovies": False,
            "maxDuration": 600,
            "requireArtist": True
        }
    
    try:
        loop = asyncio.get_event_loop()
        devices = await scan(loop, identifier=device_id, timeout=3)
        
        if not devices:
            return {"state": "idle", "name": "Unknown"}
        
        device = devices[0]
        
        try:
            atv = await connect(device, loop)
            playing = await atv.metadata.playing()
            
            is_playing = playing.device_state == DeviceState.Playing
            is_music_type = playing.media_type == MediaType.Music
            
            duration = playing.total_time or 0
            title = playing.title or ""
            artist = playing.artist or ""
            
            # Determine content type
            is_long_content = duration > config["maxDuration"]
            has_artist = len(artist) > 0
            
            # Apply filters based on config
            should_trigger = False
            
            if is_playing and is_music_type:
                # Music (short content with artist)
                if config["detectMusic"] and has_artist and not is_long_content:
                    should_trigger = True
                
                # Podcasts (long content)
                if config["detectPodcasts"] and is_long_content:
                    should_trigger = True
                
                # Movies/TV (no artist field or explicitly enabled)
                if config["detectMovies"] and not has_artist:
                    should_trigger = True
                
                # Override: if requireArtist is False, don't filter by artist
                if not config["requireArtist"] and config["detectMovies"]:
                    should_trigger = True
            
            result = {
                "name": device.name,
                "state": "playing" if should_trigger else "idle",
                "title": title if should_trigger else "",
                "artist": artist if should_trigger else "",
                "album": playing.album or "" if should_trigger else "",
                "position": playing.position or 0 if should_trigger else 0,
                "duration": duration if should_trigger else 0,
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
    config_json = sys.argv[2] if len(sys.argv) > 2 else None
    
    config = None
    if config_json:
        try:
            config = json.loads(config_json)
        except:
            pass
    
    result = asyncio.run(get_homepod_status(device_id, config))
    print(json.dumps(result))
