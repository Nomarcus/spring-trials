const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const out = path.join(root, 'www');
fs.mkdirSync(out, {recursive:true});
fs.copyFileSync(path.join(root, 'game/index.html'), path.join(out, 'index.html'));
console.log('Packaged game/index.html for the iOS web view.');
