# EXE and Future Tool Registration

The executable contains the UI and local API server only. User-created tool registrations are stored outside the executable in LocalAppData.

This means:

1. Build NEXUS once.
2. Create a new research application later.
3. Open Tools and select + TOOL.
4. Register the new EXE, Python entry point, PowerShell script, BAT file, URL, or folder.
5. Launch it without rebuilding NEXUS.

The current build script creates a browser-hosted EXE. A WebView desktop shell can be added after the functional workflow is frozen.
