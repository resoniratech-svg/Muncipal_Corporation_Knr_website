"""Creates the test photos used by photo-workflow.mjs (a normal photo, a >5 MB photo, a non-image)."""
import os, random, struct, zlib

d = os.path.join(os.path.dirname(__file__), 'fixtures')
os.makedirs(d, exist_ok=True)

def chunk(t, data):
    return struct.pack('>I', len(data)) + t + data + struct.pack('>I', zlib.crc32(t + data) & 0xffffffff)

def png(path, w, h, rows, level):
    header = chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0))
    open(path, 'wb').write(b'\x89PNG\r\n\x1a\n' + header + chunk(b'IDAT', zlib.compress(rows, level)) + chunk(b'IEND', b''))

def image(w, h, pixel):
    return b''.join(b'\x00' + b''.join(pixel(x, y) for x in range(w)) for y in range(h))

png(f'{d}/drain.png', 900, 600, image(900, 600, lambda x, y: bytes([min(255, 80 + x // 6), min(255, 90 + y // 5), 140])), 6)
png(f'{d}/after.png', 900, 600, image(900, 600, lambda x, y: bytes([60, min(255, 120 + y // 6), 70])), 6)
rnd = random.Random(1)
w = h = 1400  # random noise does not compress: ~5.9 MB, over the 5 MB limit
png(f'{d}/huge.png', w, h, b''.join(b'\x00' + bytes(rnd.getrandbits(8) for _ in range(w * 3)) for _ in range(h)), 0)
open(f'{d}/notes.txt', 'w').write('not a photo')
print('fixtures written to', d)
