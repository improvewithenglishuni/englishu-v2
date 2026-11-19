"""Rebuild a courier image: python chk2.py name [name...]  (reads b64/<name>.txt)
Each line is `NNN <base64 chunk> <checksum>`; NNN must run 001,002,... with no gaps, and the
checksum is sum(chunk bytes) % 256 in 2 hex digits. Prints every bad / missing line."""
import base64, sys
for n in sys.argv[1:]:
    ok, data, want = True, '', 1
    for raw in open('b64/%s.txt' % n).read().split('\n'):
        if not raw.strip():
            continue
        idx, d, c = raw.rsplit(' ', 2) if raw.count(' ') >= 2 else (None, None, None)
        if idx is None or int(idx) != want:
            print(n, 'EXPECTED line', want, 'got', idx); ok = False; want = int(idx) + 1 if idx and idx.isdigit() else want + 1; continue
        if '%02x' % (sum(d.encode()) % 256) != c:
            print(n, 'BAD checksum line', idx); ok = False
        data += d; want += 1
    if ok:
        open('%s.jpg' % n, 'wb').write(base64.b64decode(data)); print(n, 'OK', len(data))
