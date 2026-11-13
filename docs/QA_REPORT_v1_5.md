# QA Report v1.5

## Static validation

- `node --check app.js`: PASS
- `python3 -m py_compile server.py`: PASS
- HTML parsing: PASS
- Duplicate HTML IDs: none
- Referenced local assets: all present
- CSS brace balance: PASS
- PowerShell and batch startup scripts: version updated to v1.5

## Hybrid asset validation

- Japanese hero title is a non-interactive image asset
- Left and right stencil figures are non-interactive image assets
- The right figure image includes the cyan spray decoration
- `EXPLORE`, `CONNECT`, `CREATE` are real button elements
- The central `MAKE / TEST / LEARN` mark is rendered from live text and CSS
- No transparent image hotspot is present in the Home template
- Tool cards, Atlas nodes and Notes content remain real DOM elements
- The Tools drag sticker is contained inside the Tools panel stacking context

## Runtime limitation

The container Chromium process did not complete headless screenshot output in this environment. Final visual placement must therefore be confirmed in the user's Windows browser. The application itself is served successfully by the bundled Python server.
