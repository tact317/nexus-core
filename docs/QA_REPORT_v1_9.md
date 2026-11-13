# QA Report v1.9.0

## Passed

- JavaScript syntax: `node --check app.js`
- Python syntax: `python -m py_compile server.py`
- HTML duplicate ID inspection
- CSS brace balance
- `/api/status`
- `/api/workspace`
- Note save API
- Project save API
- Backup creation API
- Dummy Python tool launch
- Duplicate launch detection
- Running process list
- Tracked process stop
- External user-data initialization
- ZIP integrity

## Environment limitation

The managed Chromium environment blocks localhost and file URLs with `ERR_BLOCKED_BY_ADMINISTRATOR`. Final browser layout and Windows foreground activation must be confirmed on the user's Windows PC.
