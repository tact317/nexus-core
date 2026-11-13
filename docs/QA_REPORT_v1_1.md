# QA REPORT — v1.1.0

## Static checks

- JavaScript: `node --check app.js`
- Python: `python3 -m py_compile server.py`
- CSS brace balance: 0
- HTML template IDs: unique
- Local HTTP response: checked
- ZIP integrity: checked

## Browser checks still required

- Windows Chrome / Edge actual rendering
- Drag reorder under real pointer input
- Atlas pan and wheel zoom
- Settings persistence after reload
- 1920x1080 and 2560x1440 layout
