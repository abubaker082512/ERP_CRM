import requests
import re

def find_backend():
    url = "https://www.beraxis.online"
    res = requests.get(url)
    if res.status_code != 200:
        print("Failed to fetch homepage")
        return
        
    html = res.text
    # Find all JS script paths (e.g. /_next/static/chunks/...)
    js_paths = re.findall(r'src="(/_next/static/chunks/[^"]+\.js)"', html)
    print(f"Found {len(js_paths)} JS chunks on page.")
    
    for path in js_paths:
        js_url = f"{url}{path}"
        print(f"Scanning {js_url}...")
        js_res = requests.get(js_url)
        if js_res.status_code == 200:
            js_content = js_res.text
            # Search for api/v1 or onrender.com
            matches = re.findall(r'https?://[a-zA-Z0-9\.\-\/]+api/v1', js_content)
            if matches:
                print(f"🎉 FOUND API URL MATCHES: {matches}")
                return
            # Search for onrender.com
            matches2 = re.findall(r'https?://[a-zA-Z0-9\.\-]+onrender\.com', js_content)
            if matches2:
                print(f"🎉 FOUND RENDER MATCHES: {matches2}")
                return

if __name__ == "__main__":
    find_backend()
