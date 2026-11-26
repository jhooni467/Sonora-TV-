# SONORA ↔ SONORA TV pairing protocol v1

## Shared configuration
- Both clients read the bridge origin from https://jhooni467.github.io/Sonora-TV-/bridge-config.json.
- The Android app does not ask the user for a server address. It fetches the same shared config before pairing.
- Configure bridgeUrl once in bridge-config.json after deploying the Node service. Keep the value HTTPS.

## Roles and pairing
- TV browser creates the session with POST /api/tv/session. The response contains a six-digit code and private TV token.
- TV displays the six digits and a QR with JSON { "type":"sonora-tv-pair", "version":1, "code":"123456" }.
- Android user types the six-digit TV code, or scans the QR as an alternative.
- Android joins with POST /api/pair/join and receives a private phone token.
- TV and phone connect to /ws?token=... . The bridge relays authenticated controls and metadata.
- Codes expire after 15 minutes. A new TV session creates a new code.

## Messages
Supported types: play, pause, toggle, next, previous, seek, volume, metadata, lyrics, queue, stop, ping, preferences, paired, peer-status, media-ready, media-saved and stream-start.
- preferences: selected theme and lyricsAnimation from the paired Android phone. The TV applies these only while the phone is connected and returns to its default appearance when the phone disconnects.
- metadata: title, artist, album, durationMs, artworkDataUrl or artworkUrl
- lyrics: text and optional timed lines [{startMs,text}]
- seek: positionMs
- volume: value in [0,1]
- queue: items with stable id, title, artist, durationMs

## Audio transport
- Complete file: phone POSTs raw bytes to /api/upload with bearer token and X-File-Name. Bridge stores it and notifies the TV with media-ready. TV reads the file using its TV token.
- Live stream: phone POSTs /api/stream/session with bearer token and X-Track-Title / X-Track-Artist. Bridge returns uploadUrl and playbackUrl and notifies TV with stream-start. Phone then PUTs audio to uploadUrl while TV GETs playbackUrl. The bridge captures a temporary copy alongside the live stream and emits media-saved when the upload finishes, allowing TV to import the audio into its IndexedDB library without interrupting playback.
- WebSocket binary frames can be relayed between paired clients (max 1 MiB per frame).

## Deployment
- GitHub Pages hosts the static UI only; it cannot run the Node/WebSocket service.
- Deploy the Blueprint in render.yaml from the Render Dashboard. After Render gives the service URL, set bridgeUrl in bridge-config.json to that HTTPS origin.
- Pairing rooms are in memory and restart with the service. The free service filesystem is ephemeral; do not rely on uploaded files being retained after restarts.

## Connectivity recovery
- TV retries its WebSocket using the same TV token.
- Android retries its WebSocket using the same phone token.
- The bridge sends peer-status events so both screens can show actual connection state.
- A new phone replaces and revokes the previous phone token for that room.

## Security
Use HTTPS/WSS. Never share room tokens. This bridge relays audio through the server; it is not end-to-end encrypted. Device/browser codec support controls which audio formats can play.


## Personalization
- Android saves the selected theme and lyric animation locally.
- While paired, Android sends a `preferences` message with `theme` and `lyricsAnimation` to the TV.
- The TV restores its default theme and the default lyric animation when the phone disconnects. Reconnection reapplies the saved Android preferences.
- The TV library is stored in the browser's IndexedDB on that TV/browser. Complete-file uploads and completed live streams are imported into that library, so they remain after leaving the connection screen and reconnecting. The bridge's temporary upload copy can disappear when its service restarts; the TV's IndexedDB copy is the persistent library record.
