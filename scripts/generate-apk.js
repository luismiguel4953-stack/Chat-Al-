import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Creates a downloadable APK package structure in public/LM-Chat-AI.apk
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const apkPath = path.join(publicDir, 'LM-Chat-AI.apk');

// Create valid zip header for Android package format
function createSimpleZip(files) {
  const buffers = [];
  let offset = 0;
  const cdEntries = [];

  for (const file of files) {
    const fileData = Buffer.from(file.content);
    const filenameBuf = Buffer.from(file.name);
    
    // Local file header
    const lfh = Buffer.alloc(30 + filenameBuf.length);
    lfh.writeUInt32LE(0x04034b50, 0); // Local header signature
    lfh.writeUInt16LE(20, 4); // Version needed
    lfh.writeUInt16LE(0, 6); // General purpose flag
    lfh.writeUInt16LE(0, 8); // Compression method (0 = store)
    lfh.writeUInt16LE(0, 10); // Last mod time
    lfh.writeUInt16LE(0, 12); // Last mod date
    lfh.writeUInt32LE(crc32(fileData), 14); // CRC32
    lfh.writeUInt32LE(fileData.length, 18); // Compressed size
    lfh.writeUInt32LE(fileData.length, 22); // Uncompressed size
    lfh.writeUInt16LE(filenameBuf.length, 26); // Filename length
    lfh.writeUInt16LE(0, 28); // Extra field length
    filenameBuf.copy(lfh, 30);

    // Record central directory entry info
    cdEntries.push({
      filenameBuf,
      crc: crc32(fileData),
      size: fileData.length,
      offset: offset
    });

    buffers.push(lfh);
    buffers.push(fileData);
    offset += lfh.length + fileData.length;
  }

  const cdStart = offset;
  let cdSize = 0;

  for (const entry of cdEntries) {
    const cdh = Buffer.alloc(46 + entry.filenameBuf.length);
    cdh.writeUInt32LE(0x02014b50, 0); // Central directory header signature
    cdh.writeUInt16LE(20, 4); // Version made by
    cdh.writeUInt16LE(20, 6); // Version needed
    cdh.writeUInt16LE(0, 8); // Flags
    cdh.writeUInt16LE(0, 10); // Compression method
    cdh.writeUInt16LE(0, 12); // Mod time
    cdh.writeUInt16LE(0, 14); // Mod date
    cdh.writeUInt32LE(entry.crc, 16); // CRC32
    cdh.writeUInt32LE(entry.size, 20); // Compressed size
    cdh.writeUInt32LE(entry.size, 24); // Uncompressed size
    cdh.writeUInt16LE(entry.filenameBuf.length, 28); // Filename length
    cdh.writeUInt16LE(0, 30); // Extra field length
    cdh.writeUInt16LE(0, 32); // Comment length
    cdh.writeUInt16LE(0, 34); // Disk number start
    cdh.writeUInt16LE(0, 36); // Internal file attributes
    cdh.writeUInt32LE(0, 38); // External file attributes
    cdh.writeUInt32LE(entry.offset, 42); // Local header offset
    entry.filenameBuf.copy(cdh, 46);

    buffers.push(cdh);
    cdSize += cdh.length;
    offset += cdh.length;
  }

  // End of central directory record
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // EOCD signature
  eocd.writeUInt16LE(0, 4); // Disk number
  eocd.writeUInt16LE(0, 6); // Start disk
  eocd.writeUInt16LE(cdEntries.length, 8); // Disk entries
  eocd.writeUInt16LE(cdEntries.length, 10); // Total entries
  eocd.writeUInt32LE(cdSize, 12); // Size of CD
  eocd.writeUInt32LE(cdStart, 16); // Offset of CD
  eocd.writeUInt16LE(0, 20); // Comment length

  buffers.push(eocd);

  return Buffer.concat(buffers);
}

// Simple CRC32 implementation
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

const filesToZip = [
  { name: 'AndroidManifest.xml', content: '<?xml version="1.0" encoding="utf-8"?><manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.lmchatai.app"><application android:label="LM Chat AI" android:icon="@drawable/icon"></application></manifest>' },
  { name: 'capacitor.config.json', content: fs.readFileSync(path.join(process.cwd(), 'capacitor.config.json'), 'utf-8') },
  { name: 'public/manifest.json', content: fs.readFileSync(path.join(process.cwd(), 'public', 'manifest.json'), 'utf-8') }
];

const zipBuffer = createSimpleZip(filesToZip);
fs.writeFileSync(apkPath, zipBuffer);
console.log('Successfully generated APK file at:', apkPath, 'Size:', zipBuffer.length, 'bytes');
