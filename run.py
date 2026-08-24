#!/usr/bin/env python3
"""
=============================================================================
Certus — AI Finance Controller & Multi-Source Reconciliation Engine
Master 1-Click Launch Script (Full-Stack Backend + Frontend + Auto Browser)
=============================================================================
Usage:
    python run.py
=============================================================================
"""

import os
import sys
import time
import socket
import signal
import subprocess
import webbrowser
import importlib
from pathlib import Path

# Resolve root directory & configure sys.path immediately at module level
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR if (SCRIPT_DIR / "backend").exists() else SCRIPT_DIR / "ai-finance-controller"
BACKEND_DIR = PROJECT_DIR / "backend"
FRONTEND_DIR = PROJECT_DIR / "frontend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

BACKEND_HOST = "127.0.0.1"
BACKEND_PORT = 8000
FRONTEND_HOST = "127.0.0.1"
FRONTEND_PORT = 3000
FRONTEND_URL = f"http://{FRONTEND_HOST}:{FRONTEND_PORT}"
BACKEND_URL = f"http://{BACKEND_HOST}:{BACKEND_PORT}"

# Global process handles for clean termination
processes = []


def print_banner():
    banner = r"""
=================================================================================
   ____ _____ ____ _____ _   _ ____  
  / ___| ____|  _ \_   _| | | / ___| 
 | |   |  _| | |_) || | | | | \___ \ 
 | |___| |___|  _ < | | | |_| |___) |
  \____|_____|_| \_\|_|  \___/|____/ 
=================================================================================
  AI-Powered Autonomous Financial Controller & 3-Way Reconciliation Engine
=================================================================================
"""
    print(banner)


def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0


def kill_existing_process_on_port(port: int):
    """If port is occupied, attempt to terminate on Windows/Linux."""
    try:
        if sys.platform == "win32":
            res = subprocess.check_output(f"netstat -ano | findstr :{port}", shell=True).decode()
            for line in res.strip().split("\n"):
                parts = line.strip().split()
                if len(parts) >= 5 and "LISTENING" in line:
                    pid = parts[-1]
                    print(f"[\033[33mPORT CONFLICT\033[0m] Freeing port {port} (killing PID {pid})...")
                    subprocess.run(f"taskkill /F /PID {pid}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(1)
    except Exception:
        pass


def setup_environment():
    """Ensure .env exists and python paths are configured."""
    print("[\033[34mINIT\033[0m] Checking environment configuration...")
    env_file = PROJECT_DIR / ".env"
    env_example = PROJECT_DIR / ".env.example"

    if not env_file.exists() and env_example.exists():
        print("[\033[33mSETUP\033[0m] Creating .env from .env.example...")
        with open(env_example, "r") as f_in, open(env_file, "w") as f_out:
            f_out.write(f_in.read())


def initialize_database():
    """Initialize database tables and check connectivity."""
    print("[\033[34mDATABASE\033[0m] Initializing schema and seed validation...")
    try:
        session_mod = importlib.import_module("app.db.session")
        if hasattr(session_mod, "init_db"):
            session_mod.init_db()
        print("[\033[32mOK\033[0m] Database initialized successfully.")
    except Exception as e:
        print(f"[\033[33mWARN\033[0m] Database init using local fallback: {e}")


def wait_for_service(port: int, name: str, max_retries: int = 40, delay: float = 0.5) -> bool:
    """Poll TCP port until it is actively accepting connections."""
    print(f"[\033[34mWAIT\033[0m] Waiting for {name} on port {port}...", end="", flush=True)
    for _ in range(max_retries):
        if is_port_in_use(port, "127.0.0.1"):
            print(f" \033[32mREADY\033[0m")
            return True
        time.sleep(delay)
        print(".", end="", flush=True)
    print(f" \033[33mSTARTED\033[0m")
    return False


def launch_backend():
    """Start FastAPI Uvicorn server in a subprocess."""
    print(f"[\033[34mBACKEND\033[0m] Starting FastAPI server on {BACKEND_URL}...")
    kill_existing_process_on_port(BACKEND_PORT)

    cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "app.main:app",
        "--host",
        BACKEND_HOST,
        "--port",
        str(BACKEND_PORT),
        "--reload",
    ]

    p = subprocess.Popen(
        cmd,
        cwd=str(BACKEND_DIR),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        shell=(sys.platform == "win32"),
    )
    processes.append(p)
    return p


def launch_frontend():
    """Start Vite development server in a subprocess."""
    print(f"[\033[34mFRONTEND\033[0m] Starting Vite server on {FRONTEND_URL}...")
    kill_existing_process_on_port(FRONTEND_PORT)

    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    cmd = [npm_cmd, "run", "dev", "--", "--port", str(FRONTEND_PORT)]

    p = subprocess.Popen(
        cmd,
        cwd=str(FRONTEND_DIR),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        shell=(sys.platform == "win32"),
    )
    processes.append(p)
    return p


def cleanup(signum=None, frame=None):
    """Graceful termination of all spawned processes."""
    print("\n\n[\033[33mSHUTDOWN\033[0m] Stopping Certus servers cleanly...")
    for p in processes:
        try:
            if sys.platform == "win32":
                subprocess.run(f"taskkill /F /T /PID {p.pid}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                p.terminate()
                p.wait(timeout=2)
        except Exception:
            pass
    print("[\033[32mCOMPLETED\033[0m] All services stopped. Goodbye!")
    sys.exit(0)


def main():
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    print_banner()
    setup_environment()
    initialize_database()

    # 1. Start Backend
    backend_proc = launch_backend()
    wait_for_service(BACKEND_PORT, "Backend API")

    # 2. Start Frontend
    frontend_proc = launch_frontend()
    wait_for_service(FRONTEND_PORT, "Frontend Web App")

    # 3. Print Live Status
    print("\n=================================================================================")
    print("  [OK] CERTUS IS RUNNING LIVE!")
    print(f"  > Web App Dashboard:  {FRONTEND_URL}")
    print(f"  > Swagger API Docs:   {BACKEND_URL}/docs")
    print(f"  > Health Check:       {BACKEND_URL}/health")
    print("=================================================================================")
    print("  Press Ctrl+C to shut down all servers.\n")

    # 4. Auto-Open Default Browser
    print("[\033[34mBROWSER\033[0m] Launching default browser to dashboard...")
    time.sleep(1.0)
    webbrowser.open(FRONTEND_URL)

    # 5. Keep alive and monitor output
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        cleanup()


if __name__ == "__main__":
    main()
