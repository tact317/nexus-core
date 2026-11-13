# QA Report v1.18.0

## Automated checks

- JavaScript syntax: PASS
- Python syntax: PASS
- HTML parse: PASS
- JSON parse: PASS
- Local HTTP server: PASS
- `/api/status` version: 1.18.0
- Asset reference check: PASS
- Opening video: H.264 / 1920x1080 / 30 fps / 8.07 s
- Opening poster: true first frame, black start
- End-gate poster: final frame from the v3 video

## Functional changes verified in source

- Completed-poster preload removed
- Video remains hidden until playback begins
- FULL / QUICK / OFF logic retained
- Safe fallback to Home retained
- Existing Home / Tools / Atlas / Notes code unchanged except version labels
- Build and install scripts updated to v1.18

## Windows checks still required

- No completed image appears before playback
- FULL and QUICK both begin without poster flash
- Gate transition uses the final video frame correctly
- Native EXE build and install
- Existing user data remains after update
- Registered tools still launch
