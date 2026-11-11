// Gom các file của game vào thư mục www/ để Capacitor đóng gói (không copy tools, tài liệu, ảnh cửa hàng).
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), out = path.join(root, 'www');
fs.rmSync(out, {recursive: true, force: true}); fs.mkdirSync(out, {recursive: true});
for (const f of ['index.html', 'sw.js', 'manifest.webmanifest']) fs.copyFileSync(path.join(root, f), path.join(out, f));
for (const d of ['lib', 'icons']) fs.cpSync(path.join(root, d), path.join(out, d), {recursive: true});
console.log('www ready:', fs.readdirSync(out).join(', '));
