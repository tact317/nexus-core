from __future__ import annotations

import argparse
import ctypes
import json
import os
import platform
import shlex
import shutil
import subprocess
import sys
import threading
import urllib.parse
import webbrowser
import zipfile
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

APP_VERSION = "1.20.0"
STATIC_ROOT = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent))
PACKAGE_ROOT = Path(__file__).resolve().parent
BUNDLED_DATA_DIR = STATIC_ROOT / "data"

if os.name == "nt":
    user_base = Path(os.environ.get("LOCALAPPDATA", Path.home() / "AppData" / "Local"))
else:
    user_base = Path(os.environ.get("XDG_DATA_HOME", Path.home() / ".local" / "share"))
USER_ROOT = user_base / "NexusCoreStreetResearchHub"
DATA_DIR = USER_ROOT / "data"
LOG_DIR = USER_ROOT / "logs"
BACKUP_DIR = USER_ROOT / "backups"
USER_ASSET_DIR = USER_ROOT / "assets"
TOOLS_FILE = DATA_DIR / "tools.json"
PROJECTS_FILE = DATA_DIR / "projects.json"
NOTES_FILE = DATA_DIR / "notes.json"
HISTORY_FILE = DATA_DIR / "launch_history.json"
MAX_BODY = 2 * 1024 * 1024
DATA_LOCK = threading.RLock()
PROCESS_LOCK = threading.RLock()
RUNNING_PROCESSES: dict[str, dict[str, Any]] = {}
INSTANCE_MUTEX_HANDLE: int | None = None

DEFAULT_FILES: dict[str, Any] = {
    "tools.json": [],
    "projects.json": [],
    "notes.json": [],
    "launch_history.json": [],
}



def find_desktop_browser() -> Path | None:
    """Find Edge or Chrome for a dedicated app-mode window."""
    if os.name != "nt":
        return None
    candidates: list[Path] = []
    for base in (
        os.environ.get("PROGRAMFILES(X86)"),
        os.environ.get("PROGRAMFILES"),
        os.environ.get("LOCALAPPDATA"),
    ):
        if not base:
            continue
        root = Path(base)
        candidates.extend([
            root / "Microsoft" / "Edge" / "Application" / "msedge.exe",
            root / "Google" / "Chrome" / "Application" / "chrome.exe",
        ])
    for candidate in candidates:
        if candidate.exists():
            return candidate
    for command in ("msedge.exe", "chrome.exe"):
        resolved = shutil.which(command)
        if resolved:
            return Path(resolved)
    return None


def launch_browser_app_window(url: str) -> subprocess.Popen[Any] | None:
    """Open the UI in a standalone browser-app window using a dedicated profile."""
    browser = find_desktop_browser()
    if browser is None:
        return None
    profile_dir = USER_ROOT / "desktop-profile"
    profile_dir.mkdir(parents=True, exist_ok=True)
    command = [
        str(browser),
        f"--app={url}",
        f"--user-data-dir={profile_dir}",
        "--no-first-run",
        "--disable-extensions",
        "--disable-session-crashed-bubble",
        "--disable-features=msEdgeSidebarV2",
        "--start-maximized",
    ]
    creationflags = getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0) if os.name == "nt" else 0
    try:
        return subprocess.Popen(command, creationflags=creationflags, close_fds=os.name != "nt")
    except OSError:
        return None


def acquire_single_instance() -> bool:
    """Prevent two desktop instances from owning separate launch bridges."""
    global INSTANCE_MUTEX_HANDLE
    if os.name != "nt":
        return True
    try:
        kernel32 = ctypes.windll.kernel32
        handle = kernel32.CreateMutexW(None, False, "Local\\NexusCoreStreetResearchHub")
        if not handle:
            return True
        error_already_exists = 183
        if kernel32.GetLastError() == error_already_exists:
            kernel32.CloseHandle(handle)
            return False
        INSTANCE_MUTEX_HANDLE = int(handle)
        return True
    except Exception:
        return True


def show_existing_instance_notice() -> None:
    if os.name != "nt":
        print("NEXUS CORE is already running.")
        return
    try:
        ctypes.windll.user32.MessageBoxW(
            None,
            "NEXUS CORE is already running.\nClose the existing window before starting another instance.",
            "NEXUS CORE",
            0x00000040,
        )
    except Exception:
        pass


def set_windows_app_id() -> None:
    """Give the native window a stable Windows taskbar identity."""
    if os.name != "nt":
        return
    try:
        ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID("NexusCore.StreetResearchHub")
    except Exception:
        pass


def launch_native_window(url: str) -> bool:
    """Open NEXUS in a native pywebview window so the EXE icon owns the taskbar button."""
    try:
        import webview  # type: ignore
    except Exception:
        return False
    try:
        set_windows_app_id()
        webview.create_window(
            "NEXUS CORE",
            url,
            width=1600,
            height=1000,
            min_size=(1080, 680),
            resizable=True,
            background_color="#0a0a09",
            text_select=True,
        )
        webview.start(debug=False)
        return True
    except Exception as exc:
        print(f"Native shell unavailable: {exc}")
        return False


def close_log_handles() -> None:
    with PROCESS_LOCK:
        for entry in RUNNING_PROCESSES.values():
            handle = entry.get("logHandle")
            try:
                if handle:
                    handle.close()
            except Exception:
                pass

def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def ensure_runtime_files() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    USER_ASSET_DIR.mkdir(parents=True, exist_ok=True)
    for name, fallback in DEFAULT_FILES.items():
        destination = DATA_DIR / name
        if destination.exists():
            continue
        source = BUNDLED_DATA_DIR / name
        if source.exists():
            shutil.copy2(source, destination)
        else:
            write_json(destination, fallback)


def read_json(path: Path, default: Any) -> Any:
    try:
        with DATA_LOCK:
            return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return default


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(value, ensure_ascii=False, indent=2) + "\n"
    temp = path.with_suffix(path.suffix + ".tmp")
    with DATA_LOCK:
        temp.write_text(payload, encoding="utf-8")
        if path.exists():
            try:
                shutil.copy2(path, path.with_suffix(path.suffix + ".bak"))
            except OSError:
                pass
        temp.replace(path)


def expand_local_path(raw: str) -> Path:
    expanded = os.path.expandvars(os.path.expanduser(raw.strip()))
    path = Path(expanded)
    if not path.is_absolute():
        path = PACKAGE_ROOT / path
    return path.resolve(strict=False)


def split_args(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(item) for item in value]
    if isinstance(value, str) and value.strip():
        return shlex.split(value, posix=False)
    return []


def safe_filename(value: str) -> str:
    return "".join(char if char.isalnum() or char in "-_" else "_" for char in value)[:80]


def tool_by_id(tool_id: str) -> dict[str, Any] | None:
    tools = read_json(TOOLS_FILE, [])
    return next((tool for tool in tools if str(tool.get("id")) == tool_id), None)




def project_by_id(project_id: str) -> dict[str, Any] | None:
    projects = read_json(PROJECTS_FILE, [])
    return next((project for project in projects if str(project.get("id")) == project_id), None)


def resource_health(resource: dict[str, Any]) -> dict[str, Any]:
    raw = str(resource.get("path") or "").strip()
    exists = False
    if raw:
        parsed = urllib.parse.urlparse(raw)
        if parsed.scheme in {"http", "https", "file"}:
            exists = True
        else:
            try:
                exists = expand_local_path(raw).exists()
            except OSError:
                exists = False
    return {**resource, "exists": exists}


def workspace_projects() -> list[dict[str, Any]]:
    values = read_json(PROJECTS_FILE, [])
    return [
        {**project, "resources": [resource_health(item) for item in list(project.get("resources") or [])]}
        for project in values
    ]


def open_path_target(raw: str) -> dict[str, Any]:
    target = str(raw or "").strip()
    if not target:
        raise ValueError("開くパスまたはURLが指定されていません。")
    parsed = urllib.parse.urlparse(target)
    if parsed.scheme in {"http", "https", "file"}:
        opened = webbrowser.open(target, new=2)
        if not opened:
            raise RuntimeError("URLを開けませんでした。")
        return {"path": target, "type": "url"}
    path = expand_local_path(target)
    if not path.exists():
        raise FileNotFoundError(f"ファイルまたはフォルダーが見つかりません: {path}")
    if os.name == "nt":
        os.startfile(str(path))  # type: ignore[attr-defined]
    elif sys.platform == "darwin":
        subprocess.Popen(["open", str(path)])
    else:
        subprocess.Popen(["xdg-open", str(path)])
    return {"path": str(path), "type": "folder" if path.is_dir() else "file"}


def add_project_resource(project_id: str, raw_path: str, label: str = "", kind: str = "reference") -> tuple[dict[str, Any], list[dict[str, Any]]]:
    projects = read_json(PROJECTS_FILE, [])
    project = next((item for item in projects if str(item.get("id")) == project_id), None)
    if project is None:
        raise ValueError("プロジェクトが見つかりません。")
    target = str(raw_path or "").strip()
    if not target:
        raise ValueError("登録するファイルまたはフォルダーが指定されていません。")
    parsed = urllib.parse.urlparse(target)
    is_url = parsed.scheme in {"http", "https", "file"}
    if is_url:
        resource_type = "url"
        default_label = parsed.netloc or target
        normalized = target
    else:
        path = expand_local_path(target)
        if not path.exists():
            raise FileNotFoundError(f"登録対象が見つかりません: {path}")
        resource_type = "folder" if path.is_dir() else "file"
        default_label = path.name
        normalized = str(path)
    resources = list(project.get("resources") or [])
    existing = next((item for item in resources if str(item.get("path")) == normalized), None)
    if existing:
        existing["label"] = label.strip() or existing.get("label") or default_label
        existing["kind"] = kind or existing.get("kind") or "reference"
        existing["updatedAt"] = utc_now()
        resource = existing
    else:
        stamp = datetime.now().strftime("%Y%m%d%H%M%S%f")
        resource = {
            "id": f"resource-{stamp}",
            "label": label.strip() or default_label,
            "path": normalized,
            "type": resource_type,
            "kind": kind if kind in {"reference", "output", "data", "folder"} else "reference",
            "addedAt": utc_now(),
        }
        resources.append(resource)
    project["resources"] = resources
    project["updatedAt"] = utc_now()
    write_json(PROJECTS_FILE, projects)
    return resource_health(resource), workspace_projects()


def remove_project_resource(project_id: str, resource_id: str) -> list[dict[str, Any]]:
    projects = read_json(PROJECTS_FILE, [])
    project = next((item for item in projects if str(item.get("id")) == project_id), None)
    if project is None:
        raise ValueError("プロジェクトが見つかりません。")
    project["resources"] = [item for item in list(project.get("resources") or []) if str(item.get("id")) != resource_id]
    project["updatedAt"] = utc_now()
    write_json(PROJECTS_FILE, projects)
    return workspace_projects()

def record_history(entry: dict[str, Any]) -> None:
    history = read_json(HISTORY_FILE, [])
    history.insert(0, entry)
    write_json(HISTORY_FILE, history[:300])


def focus_window_for_pid(pid: int) -> bool:
    if os.name != "nt" or not pid:
        return False
    try:
        user32 = ctypes.windll.user32
        found: list[int] = []
        enum_proc = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)

        def callback(hwnd: int, _lparam: int) -> bool:
            process_id = ctypes.c_ulong()
            user32.GetWindowThreadProcessId(hwnd, ctypes.byref(process_id))
            if process_id.value == pid and user32.IsWindowVisible(hwnd):
                found.append(hwnd)
                return False
            return True

        user32.EnumWindows(enum_proc(callback), 0)
        if not found:
            return False
        hwnd = found[0]
        SW_RESTORE = 9
        user32.ShowWindow(hwnd, SW_RESTORE)
        user32.SetForegroundWindow(hwnd)
        return True
    except Exception:
        return False


def prune_processes() -> None:
    with PROCESS_LOCK:
        stale: list[str] = []
        for tool_id, entry in RUNNING_PROCESSES.items():
            process: subprocess.Popen[Any] = entry["process"]
            code = process.poll()
            if code is not None:
                stale.append(tool_id)
        for tool_id in stale:
            entry = RUNNING_PROCESSES.pop(tool_id, None)
            handle = entry.get("logHandle") if entry else None
            try:
                if handle:
                    handle.close()
            except Exception:
                pass


def process_snapshot() -> list[dict[str, Any]]:
    prune_processes()
    with PROCESS_LOCK:
        return [
            {
                "toolId": tool_id,
                "toolName": entry["toolName"],
                "pid": entry["process"].pid,
                "startedAt": entry["startedAt"],
                "target": entry["target"],
                "log": entry.get("log", ""),
                "running": entry["process"].poll() is None,
            }
            for tool_id, entry in RUNNING_PROCESSES.items()
        ]


def stop_tracked_process(tool_id: str) -> dict[str, Any]:
    prune_processes()
    with PROCESS_LOCK:
        entry = RUNNING_PROCESSES.get(tool_id)
        if not entry:
            raise RuntimeError("NEXUSから起動した実行中プロセスが見つかりません。")
        process: subprocess.Popen[Any] = entry["process"]
        pid = process.pid
    if os.name == "nt":
        subprocess.run(["taskkill", "/PID", str(pid), "/T", "/F"], capture_output=True, timeout=15)
    else:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
    with PROCESS_LOCK:
        RUNNING_PROCESSES.pop(tool_id, None)
    return {"toolId": tool_id, "pid": pid, "message": "プロセスを停止しました。"}


def launch_tool(tool: dict[str, Any]) -> dict[str, Any]:
    launch = tool.get("launch") or {}
    launch_type = str(launch.get("type") or "").lower()
    target = str(launch.get("target") or "").strip()
    enabled = bool(launch.get("enabled"))
    tool_id = str(tool.get("id") or "unknown")
    tool_name = str(tool.get("name") or tool_id)

    if not enabled:
        raise ValueError("このツールはまだ起動設定が有効になっていません。")
    if not target:
        raise ValueError("起動先が設定されていません。")

    prune_processes()
    with PROCESS_LOCK:
        existing = RUNNING_PROCESSES.get(tool_id)
        if existing and existing["process"].poll() is None:
            focused = focus_window_for_pid(existing["process"].pid)
            return {
                "toolId": tool_id,
                "toolName": tool_name,
                "startedAt": existing["startedAt"],
                "success": True,
                "alreadyRunning": True,
                "focused": focused,
                "pid": existing["process"].pid,
                "message": "すでに起動中です。既存ウィンドウを前面へ移動しました。" if focused else "すでに起動中です。",
                "log": existing.get("log", ""),
            }

    started_at = utc_now()
    history_base = {
        "toolId": tool_id,
        "toolName": tool_name,
        "startedAt": started_at,
        "launchType": launch_type,
        "target": target,
    }

    if launch_type == "url":
        parsed = urllib.parse.urlparse(target)
        if parsed.scheme not in {"http", "https", "file"}:
            raise ValueError("URLは http / https / file のみ使用できます。")
        opened = webbrowser.open(target, new=2)
        result = {**history_base, "success": bool(opened), "pid": None, "message": "ブラウザで開きました。"}
        record_history(result)
        return result

    if launch_type == "folder":
        path = expand_local_path(target)
        if not path.exists() or not path.is_dir():
            raise FileNotFoundError(f"フォルダーが見つかりません: {path}")
        if os.name == "nt":
            os.startfile(str(path))  # type: ignore[attr-defined]
            pid = None
        elif sys.platform == "darwin":
            pid = subprocess.Popen(["open", str(path)]).pid
        else:
            pid = subprocess.Popen(["xdg-open", str(path)]).pid
        result = {**history_base, "success": True, "pid": pid, "message": "フォルダーを開きました。"}
        record_history(result)
        return result

    target_path = expand_local_path(target)
    if not target_path.exists():
        raise FileNotFoundError(f"起動ファイルが見つかりません: {target_path}")

    working_raw = str(launch.get("workingDirectory") or "").strip()
    working_dir = expand_local_path(working_raw) if working_raw else target_path.parent
    if not working_dir.exists() or not working_dir.is_dir():
        raise FileNotFoundError(f"作業フォルダーが見つかりません: {working_dir}")

    args = split_args(launch.get("args"))
    command: list[str]
    if launch_type == "exe":
        command = [str(target_path), *args]
    elif launch_type == "python":
        interpreter_raw = str(launch.get("interpreter") or "").strip()
        if not interpreter_raw:
            interpreter = sys.executable
        elif Path(os.path.expandvars(os.path.expanduser(interpreter_raw))).is_absolute() or any(sep in interpreter_raw for sep in ("/", "\\")):
            interpreter = str(expand_local_path(interpreter_raw))
            if not Path(interpreter).exists():
                raise FileNotFoundError(f"Pythonインタープリターが見つかりません: {interpreter}")
        else:
            interpreter = interpreter_raw
        command = [interpreter, str(target_path), *args]
    elif launch_type == "powershell":
        executable = "powershell.exe" if os.name == "nt" else "pwsh"
        command = [executable, "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(target_path), *args]
    elif launch_type == "bat":
        if os.name != "nt":
            raise RuntimeError("BAT/CMD起動はWindowsでのみ使用できます。")
        command = ["cmd.exe", "/d", "/c", str(target_path), *args]
    elif launch_type == "shortcut":
        if os.name != "nt":
            raise RuntimeError("WindowsショートカットはWindowsでのみ使用できます。")
        os.startfile(str(target_path))  # type: ignore[attr-defined]
        result = {**history_base, "success": True, "pid": None, "message": "ショートカットを開きました。"}
        record_history(result)
        return result
    else:
        raise ValueError(f"未対応の起動方式です: {launch_type}")

    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_name = f"{stamp}_{safe_filename(tool_id)}.log"
    log_path = LOG_DIR / log_name
    creationflags = 0
    if os.name == "nt":
        creationflags = getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0)

    log = log_path.open("a", encoding="utf-8")
    log.write(f"[{started_at}] Launch: {command!r}\n")
    log.flush()
    try:
        process = subprocess.Popen(
            command,
            cwd=str(working_dir),
            stdout=log,
            stderr=subprocess.STDOUT,
            stdin=subprocess.DEVNULL,
            creationflags=creationflags,
            close_fds=os.name != "nt",
        )
    except Exception:
        log.close()
        raise

    # Detect immediate crashes while allowing launcher-style executables to hand off cleanly.
    try:
        process.wait(timeout=1.5)
    except subprocess.TimeoutExpired:
        pass
    else:
        exit_code = process.returncode
        log.flush()
        if exit_code not in (0, None):
            log.close()
            tail = ""
            try:
                tail = log_path.read_text(encoding="utf-8", errors="replace")[-1600:]
            except OSError:
                pass
            raise RuntimeError(f"起動直後に終了しました (exit={exit_code})。\n{tail}")
        # A zero-exit launcher may have opened another process. Treat it as a successful handoff.
        log.close()
        result = {**history_base, "success": True, "pid": None, "message": "ランチャー処理が完了しました。", "log": str(log_path), "workingDirectory": str(working_dir)}
        record_history(result)
        return result

    relative_log = str(log_path)
    with PROCESS_LOCK:
        RUNNING_PROCESSES[tool_id] = {
            "process": process,
            "toolName": tool_name,
            "startedAt": started_at,
            "target": target,
            "log": relative_log,
            "logHandle": log,
        }

    result = {
        **history_base,
        "success": True,
        "pid": process.pid,
        "message": "アプリを起動しました。",
        "log": relative_log,
        "workingDirectory": str(working_dir),
    }
    record_history(result)
    return result


def select_path(mode: str) -> str:
    if os.name != "nt":
        raise RuntimeError("パス選択ダイアログはWindows版でのみ利用できます。")
    if mode == "folder":
        script = r"""
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
$dialog.Description = 'NEXUS CORE: フォルダーを選択'
if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { [Console]::OutputEncoding=[Text.Encoding]::UTF8; Write-Output $dialog.SelectedPath }
"""
    else:
        title = "NEXUS CORE: ファイルを選択"
        filter_value = "Applications and scripts|*.exe;*.py;*.ps1;*.bat;*.cmd;*.lnk|All files|*.*"
        if mode == "image":
            title = "NEXUS CORE: プレビュー画像を選択"
            filter_value = "Images|*.png;*.jpg;*.jpeg;*.webp;*.svg|All files|*.*"
        elif mode == "resource":
            title = "NEXUS CORE: プロジェクトへ登録するファイルを選択"
            filter_value = "Research files|*.pdf;*.pptx;*.docx;*.xlsx;*.csv;*.json;*.yaml;*.yml;*.md;*.txt;*.py;*.blend;*.step;*.stp;*.iges;*.igs;*.glb;*.gltf;*.h5;*.hdf5;*.mp4;*.png;*.jpg;*.jpeg|All files|*.*"
        elif mode == "backup":
            title = "NEXUS CORE: バックアップZIPを選択"
            filter_value = "NEXUS backups|*.zip|All files|*.*"
        script = f"""
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.OpenFileDialog
$dialog.Title = '{title}'
$dialog.Filter = '{filter_value}'
if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {{ [Console]::OutputEncoding=[Text.Encoding]::UTF8; Write-Output $dialog.FileName }}
"""
    completed = subprocess.run(
        ["powershell.exe", "-NoProfile", "-STA", "-Command", script],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=180,
    )
    if completed.returncode != 0:
        raise RuntimeError(completed.stderr.strip() or "パス選択に失敗しました。")
    return completed.stdout.strip()



def resolve_shortcut(path: Path) -> dict[str, str]:
    """Resolve a Windows .lnk shortcut without requiring third-party modules."""
    if os.name != "nt" or path.suffix.lower() != ".lnk":
        return {}
    escaped = str(path).replace("'", "''")
    script = f"""
$ws = New-Object -ComObject WScript.Shell
$s = $ws.CreateShortcut('{escaped}')
[Console]::OutputEncoding=[Text.Encoding]::UTF8
[PSCustomObject]@{{TargetPath=$s.TargetPath;Arguments=$s.Arguments;WorkingDirectory=$s.WorkingDirectory;IconLocation=$s.IconLocation}} | ConvertTo-Json -Compress
"""
    completed = subprocess.run(
        ["powershell.exe", "-NoProfile", "-STA", "-Command", script],
        capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=30,
    )
    if completed.returncode != 0 or not completed.stdout.strip():
        return {}
    try:
        value = json.loads(completed.stdout.strip())
        return {str(k): str(v or "") for k, v in value.items()}
    except json.JSONDecodeError:
        return {}


def detect_launch_config(raw_target: str) -> dict[str, Any]:
    target = str(raw_target or "").strip()
    if not target:
        raise ValueError("起動ファイル、フォルダー、またはURLを指定してください。")
    parsed = urllib.parse.urlparse(target)
    if parsed.scheme in {"http", "https", "file"}:
        label = Path(parsed.path).stem or parsed.netloc or "Web Tool"
        return {
            "type": "url", "target": target, "workingDirectory": "", "name": label,
            "short": label, "category": "WEB / UTILITY", "categoryKey": "utility",
            "description": "Webブラウザーで開く研究ツール。", "enabled": True,
        }

    path = expand_local_path(target)
    if not path.exists():
        raise FileNotFoundError(f"指定した場所が見つかりません: {path}")
    if path.is_dir():
        label = path.name or "Research Folder"
        return {
            "type": "folder", "target": str(path), "workingDirectory": str(path), "name": label,
            "short": label, "category": "FOLDER", "categoryKey": "document",
            "description": "研究ファイルをまとめたフォルダー。", "enabled": True,
        }

    suffix = path.suffix.lower()
    launch_type = {".exe":"exe", ".py":"python", ".ps1":"powershell", ".bat":"bat", ".cmd":"bat", ".lnk":"shortcut"}.get(suffix)
    if not launch_type:
        raise ValueError(f"未対応のファイル形式です: {suffix or '(拡張子なし)'}")
    resolved = resolve_shortcut(path) if launch_type == "shortcut" else {}
    resolved_target = resolved.get("TargetPath", "")
    display_source = Path(resolved_target) if resolved_target else path
    label = display_source.stem.replace("_", " ").replace("-", " ").strip() or path.stem
    working = resolved.get("WorkingDirectory") or str(display_source.parent if resolved_target else path.parent)
    args = split_args(resolved.get("Arguments", "")) if resolved else []
    category_map = {
        "exe": ("DESKTOP APP", "utility"), "shortcut": ("DESKTOP APP", "utility"),
        "python": ("PYTHON TOOL", "analysis"), "powershell": ("AUTOMATION", "control"), "bat": ("AUTOMATION", "control"),
    }
    category, category_key = category_map[launch_type]
    return {
        "type": launch_type, "target": str(path), "workingDirectory": working, "name": label,
        "short": label, "category": category, "categoryKey": category_key,
        "description": f"{label}をNEXUS COREから起動する研究ツール。", "enabled": True,
        "args": args, "resolvedTarget": resolved_target,
    }


def tool_health(tool: dict[str, Any]) -> dict[str, Any]:
    launch = tool.get("launch") or {}
    enabled = bool(launch.get("enabled"))
    launch_type = str(launch.get("type") or "").lower()
    target = str(launch.get("target") or "").strip()
    if not enabled:
        return {"state":"disabled", "message":"起動設定は無効です。"}
    if not target:
        return {"state":"missing", "message":"起動先が未設定です。"}
    if launch_type == "url":
        ok = urllib.parse.urlparse(target).scheme in {"http","https","file"}
        return {"state":"ready" if ok else "invalid", "message":"URLを起動できます。" if ok else "URL形式が不正です。"}
    try:
        path = expand_local_path(target)
        if not path.exists():
            return {"state":"missing", "message":f"起動先が見つかりません: {path.name}"}
        working = str(launch.get("workingDirectory") or "").strip()
        if working and not expand_local_path(working).is_dir():
            return {"state":"warning", "message":"作業フォルダーが見つかりません。"}
        return {"state":"ready", "message":"起動準備完了。"}
    except OSError as exc:
        return {"state":"invalid", "message":str(exc)}


def workspace_tools() -> list[dict[str, Any]]:
    values = read_json(TOOLS_FILE, [])
    return [{**tool, "health": tool_health(tool)} for tool in values]


def import_user_asset(path: Path) -> str:
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(f"画像が見つかりません: {path}")
    if path.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp", ".svg"}:
        raise ValueError("PNG / JPG / WEBP / SVG画像を選択してください。")
    USER_ASSET_DIR.mkdir(parents=True, exist_ok=True)
    name = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{safe_filename(path.stem)}{path.suffix.lower()}"
    destination = USER_ASSET_DIR / name
    shutil.copy2(path, destination)
    return f"/user-assets/{urllib.parse.quote(name)}"


def restore_backup(backup_path: Path) -> dict[str, Any]:
    if not backup_path.exists() or backup_path.suffix.lower() != ".zip":
        raise ValueError("NEXUS COREのZIPバックアップを選択してください。")
    safety = create_backup()
    with zipfile.ZipFile(backup_path, "r") as archive:
        names = set(archive.namelist())
        required = {f"data/{name}" for name in DEFAULT_FILES}
        if not required.issubset(names):
            raise ValueError("必要なデータファイルを含まないため復元できません。")
        restored: dict[str, Any] = {}
        for name in DEFAULT_FILES:
            raw = archive.read(f"data/{name}").decode("utf-8")
            value = json.loads(raw)
            if not isinstance(value, list):
                raise ValueError(f"{name}の形式が不正です。")
            restored[name] = value
        for name, value in restored.items():
            write_json(DATA_DIR / name, value)
        USER_ASSET_DIR.mkdir(parents=True, exist_ok=True)
        for member in archive.infolist():
            if not member.filename.startswith("assets/") or member.is_dir():
                continue
            safe_name = Path(member.filename).name
            if safe_name:
                (USER_ASSET_DIR / safe_name).write_bytes(archive.read(member))
    return {"restoredFrom": str(backup_path), "safetyBackup": str(safety)}


def repair_tool_target(tool_id: str, search_root: Path | None = None) -> dict[str, Any]:
    tool = tool_by_id(tool_id)
    if not tool:
        raise ValueError("ツールが見つかりません。")
    launch = tool.get("launch") or {}
    old_target = str(launch.get("target") or "").strip()
    if not old_target:
        raise ValueError("再検索する元のファイル名がありません。")
    expected = Path(old_target).name.lower()
    if not expected:
        raise ValueError("起動ファイル名を判定できません。")
    root = search_root or Path(select_path("folder"))
    if not root.exists() or not root.is_dir():
        raise ValueError("検索フォルダーが見つかりません。")
    matches: list[Path] = []
    for current, dirs, files in os.walk(root):
        # Avoid huge or irrelevant dependency trees.
        dirs[:] = [d for d in dirs if d.lower() not in {"node_modules", ".git", "__pycache__", "$recycle.bin"}]
        for filename in files:
            if filename.lower() == expected:
                matches.append(Path(current) / filename)
                if len(matches) >= 20:
                    break
        if len(matches) >= 20:
            break
    if not matches:
        raise FileNotFoundError(f"{expected}は選択フォルダー内で見つかりませんでした。")
    best = sorted(matches, key=lambda item: ("programs" not in str(item).lower(), len(str(item))))[0]
    launch["target"] = str(best)
    launch["workingDirectory"] = str(best.parent)
    tool["launch"] = launch
    _, values = save_entity(TOOLS_FILE, tool, ("id", "name"))
    return {"tool": {**tool, "health": tool_health(tool)}, "tools": [{**item, "health": tool_health(item)} for item in values], "matches": [str(item) for item in matches]}


def save_entity(path: Path, entity: dict[str, Any], required: tuple[str, ...]) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    for key in required:
        if not str(entity.get(key) or "").strip():
            raise ValueError(f"{key}は必須です。")
    values = read_json(path, [])
    entity_id = str(entity["id"])
    index = next((i for i, item in enumerate(values) if str(item.get("id")) == entity_id), None)
    if index is None:
        values.append(entity)
    else:
        values[index] = entity
    write_json(path, values)
    return entity, values


def create_backup() -> Path:
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = BACKUP_DIR / f"NexusCore_Data_{stamp}.zip"
    with zipfile.ZipFile(backup_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in DATA_DIR.glob("*.json"):
            archive.write(path, arcname=f"data/{path.name}")
        for path in USER_ASSET_DIR.glob("*"):
            if path.is_file():
                archive.write(path, arcname=f"assets/{path.name}")
        manifest = {
            "version": APP_VERSION,
            "createdAt": utc_now(),
            "dataDirectory": str(DATA_DIR),
        }
        archive.writestr("manifest.json", json.dumps(manifest, ensure_ascii=False, indent=2))
    return backup_path


def open_folder(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)
    if os.name == "nt":
        os.startfile(str(path))  # type: ignore[attr-defined]
    elif sys.platform == "darwin":
        subprocess.Popen(["open", str(path)])
    else:
        subprocess.Popen(["xdg-open", str(path)])


class NexusHandler(SimpleHTTPRequestHandler):
    server_version = f"NexusCore/{APP_VERSION}"

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def log_message(self, fmt: str, *args: Any) -> None:
        print(f"[{self.log_date_time_string()}] {fmt % args}")

    def send_json(self, payload: Any, status: int = 200) -> None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def read_body_json(self) -> dict[str, Any]:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError as exc:
            raise ValueError("Content-Lengthが不正です。") from exc
        if length <= 0 or length > MAX_BODY:
            raise ValueError("リクエストサイズが不正です。")
        try:
            value = json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ValueError("JSONを読み取れませんでした。") from exc
        if not isinstance(value, dict):
            raise ValueError("JSONオブジェクトが必要です。")
        return value

    def do_GET(self) -> None:  # noqa: N802
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path == "/api/status":
            self.send_json({
                "ok": True,
                "version": APP_VERSION,
                "platform": platform.platform(),
                "python": sys.version.split()[0],
                "time": utc_now(),
                "root": str(STATIC_ROOT),
                "dataRoot": str(USER_ROOT),
                "packaged": bool(getattr(sys, "frozen", False)),
            })
            return
        if path == "/api/workspace":
            self.send_json({
                "ok": True,
                "version": APP_VERSION,
                "tools": workspace_tools(),
                "projects": workspace_projects(),
                "notes": read_json(NOTES_FILE, []),
                "history": read_json(HISTORY_FILE, [])[:100],
                "processes": process_snapshot(),
                "dataRoot": str(USER_ROOT),
            })
            return
        if path == "/api/tools":
            self.send_json({"ok": True, "tools": workspace_tools()})
            return
        if path == "/api/projects":
            self.send_json({"ok": True, "projects": workspace_projects()})
            return
        if path == "/api/notes":
            self.send_json({"ok": True, "notes": read_json(NOTES_FILE, [])})
            return
        if path == "/api/processes":
            self.send_json({"ok": True, "processes": process_snapshot()})
            return
        if path.startswith("/user-assets/"):
            name = Path(urllib.parse.unquote(path.removeprefix("/user-assets/"))).name
            asset = USER_ASSET_DIR / name
            if not asset.exists() or not asset.is_file():
                self.send_error(HTTPStatus.NOT_FOUND, "Asset not found")
                return
            content_types = {".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".webp":"image/webp", ".svg":"image/svg+xml"}
            payload = asset.read_bytes()
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", content_types.get(asset.suffix.lower(), "application/octet-stream"))
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        if path == "/api/history":
            query = urllib.parse.parse_qs(parsed.query)
            try:
                limit = min(300, max(1, int(query.get("limit", [50])[0])))
            except ValueError:
                limit = 50
            self.send_json({"ok": True, "history": read_json(HISTORY_FILE, [])[:limit]})
            return
        super().do_GET()

    def do_POST(self) -> None:  # noqa: N802
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        try:
            body = self.read_body_json()
            if path == "/api/launch":
                tool_id = str(body.get("toolId") or "")
                tool = tool_by_id(tool_id)
                if not tool:
                    self.send_json({"ok": False, "error": "ツールが見つかりません。"}, HTTPStatus.NOT_FOUND)
                    return
                self.send_json({"ok": True, "result": launch_tool(tool), "processes": process_snapshot()})
                return

            if path == "/api/process/focus":
                tool_id = str(body.get("toolId") or "")
                prune_processes()
                with PROCESS_LOCK:
                    entry = RUNNING_PROCESSES.get(tool_id)
                if not entry:
                    raise RuntimeError("実行中プロセスが見つかりません。")
                focused = focus_window_for_pid(entry["process"].pid)
                self.send_json({"ok": True, "focused": focused, "pid": entry["process"].pid})
                return

            if path == "/api/process/stop":
                self.send_json({"ok": True, "result": stop_tracked_process(str(body.get("toolId") or "")), "processes": process_snapshot()})
                return

            if path == "/api/tool/detect":
                self.send_json({"ok": True, "detected": detect_launch_config(str(body.get("target") or ""))})
                return

            if path == "/api/tool/import-image":
                selected = str(body.get("path") or "").strip() or select_path("image")
                if not selected:
                    raise ValueError("画像が選択されませんでした。")
                self.send_json({"ok": True, "url": import_user_asset(expand_local_path(selected))})
                return

            if path == "/api/tool/repair":
                root_raw = str(body.get("root") or "").strip()
                root = expand_local_path(root_raw) if root_raw else None
                self.send_json({"ok": True, **repair_tool_target(str(body.get("toolId") or ""), root)})
                return

            if path == "/api/tools/save":
                incoming = body.get("tool")
                if not isinstance(incoming, dict):
                    raise ValueError("toolオブジェクトが必要です。")
                entity, values = save_entity(TOOLS_FILE, incoming, ("id", "name"))
                self.send_json({"ok": True, "tool": {**entity, "health": tool_health(entity)}, "tools": [{**item, "health": tool_health(item)} for item in values]})
                return

            if path == "/api/projects/save":
                incoming = body.get("project")
                if not isinstance(incoming, dict):
                    raise ValueError("projectオブジェクトが必要です。")
                existing = project_by_id(str(incoming.get("id") or "")) or {}
                if "resources" not in incoming:
                    incoming["resources"] = list(existing.get("resources") or [])
                incoming["createdAt"] = existing.get("createdAt") or incoming.get("createdAt") or utc_now()
                incoming["updatedAt"] = utc_now()
                entity, _values = save_entity(PROJECTS_FILE, incoming, ("id", "name"))
                self.send_json({"ok": True, "project": {**entity, "resources": [resource_health(item) for item in list(entity.get("resources") or [])]}, "projects": workspace_projects()})
                return

            if path == "/api/notes/save":
                incoming = body.get("note")
                if not isinstance(incoming, dict):
                    raise ValueError("noteオブジェクトが必要です。")
                incoming["updatedAt"] = utc_now()
                incoming.setdefault("time", "今")
                entity, values = save_entity(NOTES_FILE, incoming, ("id", "title"))
                self.send_json({"ok": True, "note": entity, "notes": values})
                return

            if path == "/api/notes/delete":
                note_id = str(body.get("noteId") or "")
                notes = [item for item in read_json(NOTES_FILE, []) if str(item.get("id")) != note_id]
                write_json(NOTES_FILE, notes)
                self.send_json({"ok": True, "notes": notes})
                return

            if path == "/api/select-path":
                self.send_json({"ok": True, "path": select_path(str(body.get("mode") or "file"))})
                return

            if path == "/api/project-tools":
                project_id = str(body.get("projectId") or "")
                tool_id = str(body.get("toolId") or "")
                action = str(body.get("action") or "add")
                projects = read_json(PROJECTS_FILE, [])
                project = next((item for item in projects if str(item.get("id")) == project_id), None)
                if project is None:
                    self.send_json({"ok": False, "error": "プロジェクトが見つかりません。"}, HTTPStatus.NOT_FOUND)
                    return
                tool_ids = list(project.get("toolIds") or [])
                if action == "remove":
                    tool_ids = [item for item in tool_ids if item != tool_id]
                elif tool_id and tool_id not in tool_ids:
                    tool_ids.append(tool_id)
                project["toolIds"] = tool_ids
                write_json(PROJECTS_FILE, projects)
                self.send_json({"ok": True, "project": {**project, "resources": [resource_health(item) for item in list(project.get("resources") or [])]}, "projects": workspace_projects()})
                return

            if path == "/api/project-resource/add":
                project_id = str(body.get("projectId") or "")
                mode = str(body.get("mode") or "file")
                selected = str(body.get("path") or "").strip()
                if not selected:
                    selected = select_path("folder" if mode == "folder" else "resource")
                if not selected:
                    raise ValueError("登録対象が選択されませんでした。")
                resource, values = add_project_resource(project_id, selected, str(body.get("label") or ""), str(body.get("kind") or "reference"))
                self.send_json({"ok": True, "resource": resource, "projects": values})
                return

            if path == "/api/project-resource/remove":
                values = remove_project_resource(str(body.get("projectId") or ""), str(body.get("resourceId") or ""))
                self.send_json({"ok": True, "projects": values})
                return

            if path == "/api/open-path":
                self.send_json({"ok": True, "result": open_path_target(str(body.get("path") or ""))})
                return

            if path == "/api/backup":
                backup = create_backup()
                self.send_json({"ok": True, "path": str(backup), "message": "バックアップを作成しました。"})
                return

            if path == "/api/restore":
                selected = str(body.get("path") or "").strip() or select_path("backup")
                if not selected:
                    raise ValueError("バックアップが選択されませんでした。")
                result = restore_backup(expand_local_path(selected))
                self.send_json({"ok": True, **result, "workspace": {"tools": workspace_tools(), "projects": workspace_projects(), "notes": read_json(NOTES_FILE, []), "history": read_json(HISTORY_FILE, [])[:100]}})
                return

            if path == "/api/open-data-folder":
                open_folder(DATA_DIR)
                self.send_json({"ok": True})
                return

            if path == "/api/open-backup-folder":
                open_folder(BACKUP_DIR)
                self.send_json({"ok": True})
                return

            self.send_json({"ok": False, "error": "APIが見つかりません。"}, HTTPStatus.NOT_FOUND)
        except (ValueError, FileNotFoundError, RuntimeError, subprocess.SubprocessError, OSError) as exc:
            if path == "/api/launch":
                tool_id = str(locals().get("body", {}).get("toolId") or "unknown")
                tool = tool_by_id(tool_id)
                record_history({
                    "toolId": tool_id,
                    "toolName": (tool or {}).get("name", tool_id),
                    "startedAt": utc_now(),
                    "success": False,
                    "message": str(exc),
                })
            self.send_json({"ok": False, "error": str(exc)}, HTTPStatus.BAD_REQUEST)
        except Exception as exc:
            self.send_json({"ok": False, "error": f"予期しないエラー: {exc}"}, HTTPStatus.INTERNAL_SERVER_ERROR)



def create_http_server(host: str, preferred_port: int) -> tuple[ThreadingHTTPServer, int]:
    """Bind the preferred port or the next available local port."""
    last_error: OSError | None = None
    for port in range(preferred_port, preferred_port + 20):
        try:
            server = ThreadingHTTPServer((host, port), lambda *a, **kw: NexusHandler(*a, directory=str(STATIC_ROOT), **kw))
            return server, port
        except OSError as exc:
            last_error = exc
    raise RuntimeError(f"ローカルポートを確保できませんでした: {last_error}")

def main() -> None:
    parser = argparse.ArgumentParser(description="Serve NEXUS CORE locally with launch bridge.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=4173, type=int)
    parser.add_argument("--no-browser", action="store_true", help="Start only the local server.")
    parser.add_argument("--browser", action="store_true", help="Open in the normal default browser instead of app mode.")
    parser.add_argument("--desktop", action="store_true", help="Open as a dedicated desktop-style window.")
    args = parser.parse_args()

    if not acquire_single_instance():
        show_existing_instance_notice()
        return

    ensure_runtime_files()
    server, actual_port = create_http_server(args.host, args.port)
    url = f"http://{args.host}:{actual_port}"

    print(f"NEXUS CORE - Street Research Hub v{APP_VERSION}")
    print("Launch Bridge: ENABLED (localhost only)")
    print(f"User data: {USER_ROOT}")
    print(f"Open: {url}")

    use_desktop = args.desktop or (os.name == "nt" and not args.browser and not args.no_browser)
    desktop_process: subprocess.Popen[Any] | None = None

    if use_desktop:
        server_thread = threading.Thread(target=server.serve_forever, name="NexusHTTP", daemon=True)
        server_thread.start()
        if launch_native_window(url):
            print("Desktop shell: NATIVE")
            server.shutdown()
            server.server_close()
            close_log_handles()
            return
        desktop_process = launch_browser_app_window(url)
        if desktop_process is not None:
            print("Desktop shell: BROWSER FALLBACK")
            try:
                desktop_process.wait()
            except KeyboardInterrupt:
                print("\nStopping NEXUS CORE...")
            finally:
                server.shutdown()
                server.server_close()
                close_log_handles()
            return
        print("Desktop shell was not available. Falling back to the default browser.")
        threading.Timer(0.25, lambda: webbrowser.open(url)).start()
        try:
            while server_thread.is_alive():
                server_thread.join(timeout=0.5)
        except KeyboardInterrupt:
            server.shutdown()
        finally:
            server.server_close()
            close_log_handles()
        return

    if not args.no_browser:
        threading.Timer(0.45, lambda: webbrowser.open(url)).start()

    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping NEXUS CORE...")
    finally:
        close_log_handles()
        server.server_close()


if __name__ == "__main__":
    main()
