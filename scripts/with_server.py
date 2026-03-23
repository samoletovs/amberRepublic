"""Server lifecycle manager for webapp testing.

Usage:
    python scripts/with_server.py --server "npm run dev" --port 5173 -- python your_test.py

Starts the server(s), waits for the port(s) to be ready, runs the command,
then shuts everything down.
"""
import argparse
import subprocess
import sys
import time
import socket


def wait_for_port(port: int, host: str = "localhost", timeout: float = 30.0) -> bool:
    start = time.time()
    while time.time() - start < timeout:
        try:
            with socket.create_connection((host, port), timeout=1):
                return True
        except OSError:
            time.sleep(0.5)
    return False


def main():
    parser = argparse.ArgumentParser(description="Start servers and run a command")
    parser.add_argument("--server", action="append", required=True, help="Server command (can repeat)")
    parser.add_argument("--port", action="append", type=int, required=True, help="Port to wait for (can repeat)")
    parser.add_argument("--timeout", type=float, default=30, help="Seconds to wait for each port")
    parser.add_argument("command", nargs=argparse.REMAINDER, help="Command to run after servers are ready")

    args = parser.parse_args()

    # Strip leading '--' from command
    cmd = args.command
    if cmd and cmd[0] == "--":
        cmd = cmd[1:]

    if not cmd:
        parser.error("No command specified after --")

    processes = []
    try:
        # Start all servers
        for server_cmd in args.server:
            print(f"[with_server] Starting: {server_cmd}")
            proc = subprocess.Popen(
                server_cmd,
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            processes.append(proc)

        # Wait for all ports
        for port in args.port:
            print(f"[with_server] Waiting for port {port}...")
            if not wait_for_port(port, timeout=args.timeout):
                print(f"[with_server] ERROR: Port {port} not ready after {args.timeout}s")
                sys.exit(1)
            print(f"[with_server] Port {port} ready")

        # Run the command
        print(f"[with_server] Running: {' '.join(cmd)}")
        result = subprocess.run(cmd)
        sys.exit(result.returncode)

    finally:
        for proc in processes:
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()
        print("[with_server] All servers stopped")


if __name__ == "__main__":
    main()
