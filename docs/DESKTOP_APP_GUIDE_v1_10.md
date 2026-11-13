# Desktop App Guide v1.10

## Development run

`run_all.ps1` launches NEXUS in Edge or Chrome app mode. This removes normal browser chrome while keeping the existing local Launch Bridge.

## Browser fallback

Use `run_browser.ps1` if you need developer tools or if app mode does not work correctly.

## Build

Run `build_exe.ps1` on Windows. PyInstaller creates a windowed one-file executable at `dist\NexusCoreHub.exe`.

## Install

Run `install_desktop.ps1` after building. It copies the EXE to LocalAppData and creates Start Menu and Desktop shortcuts.

## Future tool additions

Tools are stored in `%LOCALAPPDATA%\NexusCoreStreetResearchHub\data\tools.json`. Adding or editing tools does not require rebuilding the EXE.

## Browser engine

The desktop shell uses installed Microsoft Edge first, then Google Chrome. It uses a dedicated profile under the NEXUS user-data folder, so it does not affect the user's normal browser profile.
