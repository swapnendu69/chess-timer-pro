// Generate PNG icons using Node.js zlib and fs
import fs from 'node:fs';
import zlib from 'node:zlib';

function createPNG(width, height, drawFn) {
  const bytesPerPixel = 4;
  const scanlineLength = width * bytesPerPixel;
  const rawData = Buffer.alloc(height * (1 + scanlineLength));

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + scanlineLength);
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const buffer = Buffer.alloc(8 + length + 4);
  buffer.writeUInt32BE(length, 0);
  buffer.write(type, 4, 4, 'ascii');
  data.copy(buffer, 8);
  const crc = crc32(buffer.subarray(4, 8 + length));
  buffer.writeUInt32BE(crc, 8 + length);
  return buffer;
}

// Simple CRC32 implementation
function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  table[i] = c;
}

// Drawing function for Chess Clock Icon
function drawChessIcon(x, y, w, h, isMaskable = false) {
  const nx = x / w;
  const ny = y / h;
  const cx = 0.5;
  const cy = 0.5;
  const dist = Math.hypot(nx - cx, ny - cy);

  if (isMaskable) {
    // Solid background with safe zone inner icon
    const bg = [241, 245, 249, 255]; // slate-100
    // Center card
    if (Math.abs(nx - 0.5) < 0.35 && Math.abs(ny - 0.5) < 0.35) {
      if (nx < 0.5) {
        return [255, 255, 255, 255]; // Left white side
      } else {
        return [37, 99, 235, 255]; // Right blue side
      }
    }
    return bg;
  }

  // Rounded icon with white card & split dual timer look
  const cornerRadius = 0.22;
  const dx = Math.max(0, Math.abs(nx - 0.5) - (0.5 - cornerRadius));
  const dy = Math.max(0, Math.abs(ny - 0.5) - (0.5 - cornerRadius));
  const cornerDist = Math.hypot(dx, dy);

  if (cornerDist > cornerRadius) {
    return [0, 0, 0, 0]; // transparent
  }

  // Border outline
  if (cornerDist > cornerRadius - 0.02 || Math.abs(nx - 0.5) > 0.47 || Math.abs(ny - 0.5) > 0.47) {
    return [203, 213, 225, 255]; // slate-300
  }

  // Dual side clock buttons top
  if (ny < 0.22) {
    if (nx > 0.18 && nx < 0.44 && ny > 0.12) return [148, 163, 184, 255]; // left plunger up
    if (nx > 0.56 && nx < 0.82 && ny > 0.08) return [37, 99, 235, 255]; // right plunger pressed
    return [248, 250, 252, 255];
  }

  // Clock faces
  const leftDist = Math.hypot(nx - 0.32, ny - 0.52);
  if (leftDist < 0.18) {
    if (leftDist > 0.16) return [148, 163, 184, 255];
    // Dial needle
    if (Math.abs(nx - 0.32) < 0.015 && ny < 0.52 && ny > 0.38) return [15, 23, 42, 255];
    return [255, 255, 255, 255];
  }

  const rightDist = Math.hypot(nx - 0.68, ny - 0.52);
  if (rightDist < 0.18) {
    if (rightDist > 0.16) return [37, 99, 235, 255];
    // Dial needle
    if (Math.abs(ny - 0.52) < 0.015 && nx > 0.68 && nx < 0.82) return [37, 99, 235, 255];
    return [239, 246, 255, 255];
  }

  // Bottom digital display area
  if (ny > 0.76 && ny < 0.88) {
    if (nx > 0.18 && nx < 0.46) return [226, 232, 240, 255];
    if (nx > 0.54 && nx < 0.82) return [219, 234, 254, 255];
  }

  return [255, 255, 255, 255];
}

fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192, (x, y, w, h) => drawChessIcon(x, y, w, h, false)));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512, (x, y, w, h) => drawChessIcon(x, y, w, h, false)));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180, (x, y, w, h) => drawChessIcon(x, y, w, h, false)));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, (x, y, w, h) => drawChessIcon(x, y, w, h, true)));

console.log('PWA PNG icons generated successfully!');
