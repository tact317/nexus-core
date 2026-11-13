# QA Report v1.5

## Automated checks

- `node --check app.js`: PASS
- `python3 -m py_compile server.py`: PASS
- HTML parser: PASS
- CSS opening and closing brace count: PASS
- Browser render with inlined local assets: PASS
- Browser page errors: none

## 1920×1080 rendered checks

- Home hero action buttons found: 3
- Home tool cards found: 4
- Drag sticker and tool card strip overlap: none
- Notes status row appears before note list: PASS
- Note list appears before notes footer: PASS
- Tool card right edge contained by the tool panel: PASS within visual shadow tolerance
- Tools route horizontal overflow: none
- Project Atlas route horizontal overflow: none
- Research Notes route horizontal overflow: none

## Manual Windows checks requested

- Windows display scale 100%, 125% and 150%
- Pointer alignment on all three Home sticky-note actions
- Tool card drag at display scale 125%
- Atlas drag and zoom
- Research Notes at 1366×768 and 2560×1440
