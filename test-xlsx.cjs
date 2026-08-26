const XLSX = require('xlsx');
const fs = require('fs');

const wsData = [
  ['Student ID', 'Name'],
  ['1001', 'John Doe']
];
const ws = XLSX.utils.aoa_to_sheet(wsData);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Sample');
XLSX.writeFile(wb, 'test.xlsx');

const buffer = fs.readFileSync('test.xlsx');
// buffer is a Buffer (which is a Uint8Array)
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

try {
  XLSX.read(arrayBuffer, { type: 'array' });
  console.log("ArrayBuffer works directly");
} catch (e) {
  console.error("ArrayBuffer fails directly:", e);
}

try {
  XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
  console.log("Uint8Array works directly");
} catch (e) {
  console.error("Uint8Array fails directly:", e);
}

