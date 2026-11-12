"""Download standard-size (1280px) Commons thumbnails from upload.wikimedia.org, honoring Retry-After."""
import hashlib, urllib.parse, subprocess, re, sys, time, os
UA = "EnglishU-Reels/1.0 (educational use; https://github.com/improvewithenglishuni)"
out = sys.argv[1]
for pair in sys.argv[2:]:
    slug, name = pair.split("=", 1)
    name = name.replace(" ", "_")
    h = hashlib.md5(name.encode()).hexdigest()
    q = urllib.parse.quote(name)
    url = f"https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{q}/1280px-{q}"
    dest = os.path.join(out, slug + ".jpg")
    for attempt in range(30):
        hdr = subprocess.run(["curl", "-sS", "-m", "90", "-A", UA, "-D", "-", "-o", dest, url], capture_output=True, text=True).stdout
        code = (re.findall(r"^HTTP/\S+ (\d+)", hdr, re.M) or ["?"])[-1]
        if code == "200":
            print("ok", slug, os.path.getsize(dest), flush=True); break
        wait = int((re.findall(r"retry-after: (\d+)", hdr, re.I) or ["15"])[-1]) + 3
        print(f"{slug}: {code}, wait {wait}s", flush=True); time.sleep(wait)
    else:
        print("FAILED", slug, flush=True)
    time.sleep(8)
