'use strict';
const fs=require('node:fs');
const path=require('node:path');
for(const file of ['index.html','receiver.html']){
 const html=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
 const scripts=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)];
 for(const match of scripts)if(!/\bsrc\s*=/.test(match[1]))new Function(match[2]);
 if(!scripts.length)throw new Error(file+': no script blocks found');
 console.log(file+': inline JavaScript syntax OK');
}
