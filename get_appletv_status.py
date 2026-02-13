#!/usr/bin/env python3
import asyncio
import json
import sys

try:
    import pyatv
except ImportError:
    print(json.dumps({"error": "pyatv not installed. Run: pip3 install pyatv"}))
    sys.exit(0)

async def get_status(device_id, companion_creds, airplay_creds):
    try:
        loop = asyncio.get_running_loop()
        devices = await pyatv.scan(loop, timeout=5)
        target = None
        device_id_clean = device_id.replace(":", "").replace("-", "").upper()
        for device in devices:
            for identifier in device.all_identifiers:
                id_clean = str(identifier).replace(":", "").replace("-", "").upper()
                if id_clean == device_id_clean:
                    target = device
                    break
            if target:
                break
        if not target:
            return {"error": f"Apple TV not found: {device_id}"}
        if companion_creds:
            target.set_credentials(pyatv.const.Protocol.Companion, companion_creds)
        if airplay_creds:
            target.set_credentials(pyatv.const.Protocol.AirPlay, airplay_creds)
        client = await pyatv.connect(target, loop)
        result = {"device_id": device_id, "power": "unknown", "state": "idle", "title": None, "artist": None, "album": None, "media_type": "unknown", "app_name": None, "app_id": None}
        try:
            power = client.power.power_state
            result["power"] = str(power).split(".")[-1].lower()
        except Exception:
            pass
        try:
            playing = await client.metadata.playing()
            result["state"] = str(playing.device_state).split(".")[-1].lower()
            result["title"] = playing.title
            result["artist"] = playing.artist
            result["album"] = playing.album
            result["media_type"] = str(playing.media_type).split(".")[-1].lower()
            if playing.total_time is not None:
                result["total_time"] = playing.total_time
        except Exception:
            pass
        try:
            app = client.metadata.app
            if app:
                result["app_name"] = app.name
                result["app_id"] = app.identifier
        except Exception:
            pass
        client.close()
        return result
    except Exception as e:
        return {"error": str(e), "device_id": device_id}

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: get_appletv_status.py <device_id> [companion_creds] [airplay_creds]"}))
        sys.exit(0)
    device_id = sys.argv[1]
    companion_creds = sys.argv[2] if len(sys.argv) > 2 else None
    airplay_creds = sys.argv[3] if len(sys.argv) > 3 else None
    result = asyncio.run(get_status(device_id, companion_creds, airplay_creds))
    print(json.dumps(result))

if __name__ == "__main__":
    main()
