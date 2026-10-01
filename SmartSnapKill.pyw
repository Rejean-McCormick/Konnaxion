from __future__ import annotations

import ctypes
import json
import os
import shutil
import tempfile
import time
from pathlib import Path
from typing import Any


STATE_DIR_NAME = "SmartSnapClipboard"


def state_root() -> Path:
    return Path(tempfile.gettempdir()) / STATE_DIR_NAME


def _filetime_value(ft: Any) -> int:
    return (int(ft.dwHighDateTime) << 32) | int(ft.dwLowDateTime)


def cleanup_path(path: Path) -> bool:
    try:
        if path.is_dir():
            existed = path.exists()
            shutil.rmtree(path, ignore_errors=True)
            return existed
        existed = path.exists()
        path.unlink(missing_ok=True)
        return existed
    except OSError:
        return False


def safe_instance_dir(raw: object) -> Path | None:
    try:
        base = state_root().resolve()
        candidate = Path(str(raw)).resolve()
        candidate.relative_to(base)
        if candidate.parent != base or not candidate.name.startswith("snap_"):
            return None
        return candidate
    except (OSError, ValueError):
        return None


def open_matching_process(pid: int, creation_time: int) -> int | None:
    if os.name != "nt" or pid <= 0:
        return None

    class FILETIME(ctypes.Structure):
        _fields_ = [("dwLowDateTime", ctypes.c_uint32), ("dwHighDateTime", ctypes.c_uint32)]

    PROCESS_TERMINATE = 0x0001
    PROCESS_QUERY_LIMITED_INFORMATION = 0x1000
    SYNCHRONIZE = 0x00100000
    rights = PROCESS_TERMINATE | PROCESS_QUERY_LIMITED_INFORMATION | SYNCHRONIZE

    kernel32 = ctypes.windll.kernel32
    kernel32.OpenProcess.argtypes = [ctypes.c_uint32, ctypes.c_int, ctypes.c_uint32]
    kernel32.OpenProcess.restype = ctypes.c_void_p
    kernel32.GetProcessTimes.argtypes = [
        ctypes.c_void_p,
        ctypes.POINTER(FILETIME), ctypes.POINTER(FILETIME),
        ctypes.POINTER(FILETIME), ctypes.POINTER(FILETIME),
    ]
    kernel32.GetProcessTimes.restype = ctypes.c_int
    kernel32.CloseHandle.argtypes = [ctypes.c_void_p]

    handle = kernel32.OpenProcess(rights, False, pid)
    if not handle:
        return None

    created = FILETIME()
    exited = FILETIME()
    kernel = FILETIME()
    user = FILETIME()
    if not kernel32.GetProcessTimes(handle, ctypes.byref(created), ctypes.byref(exited), ctypes.byref(kernel), ctypes.byref(user)):
        kernel32.CloseHandle(handle)
        return None
    if _filetime_value(created) != creation_time:
        kernel32.CloseHandle(handle)
        return None
    return int(handle)


def clipboard_file_paths() -> list[Path]:
    if os.name != "nt":
        return []

    user32 = ctypes.windll.user32
    shell32 = ctypes.windll.shell32
    CF_HDROP = 15

    user32.OpenClipboard.argtypes = [ctypes.c_void_p]
    user32.OpenClipboard.restype = ctypes.c_int
    user32.CloseClipboard.restype = ctypes.c_int
    user32.IsClipboardFormatAvailable.argtypes = [ctypes.c_uint]
    user32.IsClipboardFormatAvailable.restype = ctypes.c_int
    user32.GetClipboardData.argtypes = [ctypes.c_uint]
    user32.GetClipboardData.restype = ctypes.c_void_p
    shell32.DragQueryFileW.argtypes = [ctypes.c_void_p, ctypes.c_uint, ctypes.c_wchar_p, ctypes.c_uint]
    shell32.DragQueryFileW.restype = ctypes.c_uint

    opened = False
    result: list[Path] = []
    try:
        for _ in range(20):
            if user32.OpenClipboard(None):
                opened = True
                break
            time.sleep(0.025)
        if not opened or not user32.IsClipboardFormatAvailable(CF_HDROP):
            return []
        hdrop = user32.GetClipboardData(CF_HDROP)
        if not hdrop:
            return []
        count = shell32.DragQueryFileW(hdrop, 0xFFFFFFFF, None, 0)
        for i in range(count):
            length = shell32.DragQueryFileW(hdrop, i, None, 0)
            buf = ctypes.create_unicode_buffer(length + 1)
            shell32.DragQueryFileW(hdrop, i, buf, length + 1)
            result.append(Path(buf.value))
        return result
    finally:
        if opened:
            user32.CloseClipboard()


def clear_clipboard_if_smartsnap() -> bool:
    if os.name != "nt":
        return False

    base = state_root().resolve()
    paths = clipboard_file_paths()
    owns_clipboard = False
    for path in paths:
        try:
            path.resolve().relative_to(base)
            owns_clipboard = True
            break
        except (OSError, ValueError):
            continue
    if not owns_clipboard:
        return False

    user32 = ctypes.windll.user32
    opened = False
    try:
        for _ in range(20):
            if user32.OpenClipboard(None):
                opened = True
                break
            time.sleep(0.025)
        if not opened:
            return False
        return bool(user32.EmptyClipboard())
    finally:
        if opened:
            user32.CloseClipboard()


def kill_smartsnap_instances() -> tuple[int, int]:
    base = state_root()
    if not base.exists():
        return 0, 0

    kernel32 = ctypes.windll.kernel32
    kernel32.TerminateProcess.argtypes = [ctypes.c_void_p, ctypes.c_uint]
    kernel32.TerminateProcess.restype = ctypes.c_int
    kernel32.WaitForSingleObject.argtypes = [ctypes.c_void_p, ctypes.c_uint32]
    kernel32.WaitForSingleObject.restype = ctypes.c_uint32
    kernel32.CloseHandle.argtypes = [ctypes.c_void_p]

    killed = 0
    cleaned = 0
    records: list[tuple[Path, Path | None, int, int]] = []

    for marker in base.glob("instance_*.json"):
        try:
            data = json.loads(marker.read_text(encoding="utf-8"))
            records.append((
                marker,
                safe_instance_dir(data.get("instance_dir", "")),
                int(data.get("pid", 0)),
                int(data.get("creation_time", 0)),
            ))
        except Exception:
            if cleanup_path(marker):
                cleaned += 1

    # Terminate matching SmartSnap processes first, as requested.
    for marker, instance_dir, pid, creation_time in records:
        handle = open_matching_process(pid, creation_time)
        if handle:
            try:
                # It may already be exiting because the clipboard was cleared.
                WAIT_TIMEOUT = 0x00000102
                if kernel32.WaitForSingleObject(handle, 0) == WAIT_TIMEOUT:
                    if kernel32.TerminateProcess(handle, 0):
                        killed += 1
                        kernel32.WaitForSingleObject(handle, 1000)
            finally:
                kernel32.CloseHandle(handle)

        if instance_dir is not None and cleanup_path(instance_dir):
            cleaned += 1
        if cleanup_path(marker):
            cleaned += 1

    # The clipboard would otherwise keep a dead CF_HDROP reference.
    if clear_clipboard_if_smartsnap():
        cleaned += 1

    # Sweep orphan SmartSnap temp directories too.
    for child in base.glob("snap_*"):
        if child.is_dir() and cleanup_path(child):
            cleaned += 1

    try:
        if base.exists() and not any(base.iterdir()):
            base.rmdir()
    except OSError:
        pass

    return killed, cleaned


def flash_status(text: str) -> None:
    try:
        import tkinter as tk

        root = tk.Tk()
        root.withdraw()
        win = tk.Toplevel(root)
        win.title("SmartSnapKill")
        win.resizable(False, False)
        win.attributes("-topmost", True)
        try:
            win.overrideredirect(True)
        except tk.TclError:
            pass

        width = 560
        height = 240
        bg = "#1e6864"
        win.configure(bg=bg)
        label = tk.Label(
            win,
            text=text,
            font=("Segoe UI", 46, "bold"),
            fg="white",
            bg=bg,
        )
        label.pack(fill="both", expand=True)

        x = max(0, (win.winfo_screenwidth() - width) // 2)
        y = max(0, (win.winfo_screenheight() - height) // 2)
        win.geometry(f"{width}x{height}+{x}+{y}")
        win.deiconify()
        win.lift()
        win.after(500, root.destroy)
        root.mainloop()
    except Exception:
        pass


def main() -> None:
    status = "FAIL"
    try:
        if os.name != "nt":
            raise OSError("SmartSnapKill is Windows-only")
        killed, cleaned = kill_smartsnap_instances()
        # OK means SmartSnap was stopped and/or its temp/clipboard state was cleaned.
        status = "OK" if (killed > 0 or cleaned > 0) else "FAIL"
    except Exception:
        status = "FAIL"
    flash_status(status)


if __name__ == "__main__":
    main()
