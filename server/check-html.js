'use strict';
const fs = require('node:fs');
const path = require('node:path');
for (const file of ['index.html', 'receiver.html']) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const scripts = [...source.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)];
  for (const match of scripts) {
    if (/\bsrc\s*=/.test(match[1])) continue;
    new Function(match[2]);
  }
  if (!scripts.length) throw new Error(file + ': no script blocks found');
  console.log(file + ': inline JavaScript syntax OK');
}
