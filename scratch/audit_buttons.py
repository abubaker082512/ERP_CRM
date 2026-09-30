import os
import re

def audit_components():
    print("=== AUDITING ALL TSX BUTTONS & INTERACTIVE ELEMENTS ===")
    tsx_files = []
    for root, dirs, files in os.walk("."):
        if any(ignored in root for ignored in ["node_modules", ".next", "venv", ".git"]):
            continue
        for file in files:
            if file.endswith(".tsx"):
                tsx_files.append(os.path.join(root, file))

    print(f"Total TSX Files Scanned: {len(tsx_files)}")

    dummy_clicks = []
    dummy_hrefs = []
    missing_submits = []

    for path in tsx_files:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
            for idx, line in enumerate(lines, 1):
                if "onClick={() => {}}" in line or "onClick={() => { }}" in line or "onClick={noop}" in line:
                    dummy_clicks.append((path, idx, line.strip()))
                if 'href="#"' in line or "href='#'" in line:
                    dummy_hrefs.append((path, idx, line.strip()))

    print(f"\n--- Dummy Clicks Found: {len(dummy_clicks)} ---")
    for item in dummy_clicks:
        print(f"{item[0]}:{item[1]} -> {item[2]}")

    print(f"\n--- Dummy Hrefs Found: {len(dummy_hrefs)} ---")
    for item in dummy_hrefs:
        print(f"{item[0]}:{item[1]} -> {item[2]}")

if __name__ == "__main__":
    audit_components()
