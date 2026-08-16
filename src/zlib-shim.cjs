const { ungzip } = require("pako");

function Gunzip(bytes) {
  this.bytes = bytes;
}

Gunzip.prototype.decompress = function decompress() {
  const bytes = this.bytes;
  // Vite/browsers often already decode Content-Encoding: gzip on .dat.gz
  if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) {
    return ungzip(bytes);
  }
  return bytes;
};

module.exports = { Zlib: { Gunzip } };
