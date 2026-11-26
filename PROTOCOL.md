# SONORA ↔ SONORA TV protocol v1

## Roles
- TV browser creates a session with POST /api/tv/session and owns the TV token.
- Android phone joins with POST /api/pair/join using the six-digit code; QR payload carries the same code and bridge URL.
- Both roles connect to /ws?token=... . The bridge relays authenticated JSON controls and binary frames.

## Pairing
1. TV requests a session. The bridge returns a six-digit code, private TV token and 15-minute pairing lifetime.
2. Phone scans the TV QR or enters the six digits and joins.
3. Bridge returns a phone token and notifies TV with type=paired.
4. Tokens are random and scoped to one room. Never display or log tokens.

## Messages
Supported types: play, pause, toggle, next, previous, seek, volume, metadata, lyrics, queue, stop, ping, paired, peer-status, media-ready and stream-start.
- metadata: title, artist, album, durationMs, artworkDataUrl or artworkUrl
- lyrics: text and optional timed lines [{startMs,text}]
- seek: positionMs
- volume: value in [0,1]
- queue: items with stable id, title, artist, durationMs

## Audio
- Complete file: phone POSTs raw bytes to /api/upload with bearer token and X-File-Name. Bridge stores it and notifies TV with media-ready. TV downloads the returned URL using its TV token.
- Live stream: phone POSTs a chunked audio body to /api/stream/start with bearer token and X-Track-Title / X-Track-Artist. Bridge exposes a chunked HTTP audio response and notifies TV with stream-start. TV assigns the stream URL to HTMLAudioElement.
- WebSocket binary frames are relayed between paired peers (maximum 1 MiB per frame) for future transports.

## Deployment
This repository is a static GitHub Pages frontend plus a Node bridge. Deploy bridge using render.yaml (root directory server). Set PUBLIC_ORIGIN to the published SONORA TV site origin. Configure the frontend and Android app with the deployed HTTPS origin; use WSS for sockets.
Pairing rooms and upload registry are in memory and reset on service restart. Files on free hosting may be ephemeral. Persistent storage is needed for durable file retention.

## Security and compatibility
Use HTTPS/WSS in production. Pairing codes expire after 15 minutes. The prototype relays media through the bridge; it is not end-to-end encrypted. Audio codec support depends on the TV browser.
