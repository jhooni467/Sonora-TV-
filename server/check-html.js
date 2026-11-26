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
const assert=require('node:assert/strict');
const receiverHtml=fs.readFileSync(path.join(__dirname,'..','receiver.html'),'utf8');
const parserStart=receiverHtml.indexOf('function parseLrc(source){');
const parserEnd=receiverHtml.indexOf('function renderLyricsAt(',parserStart);
if(parserStart<0||parserEnd<0)throw new Error('Could not extract receiver LRC parser');
const parseLrc=new Function(receiverHtml.slice(parserStart,parserEnd)+'; return parseLrc;')();
const standard=parseLrc('[00:01.20]Qué Más\n[00:02.30]Pues?');
assert.deepEqual(standard.lines.map(line=>line.startMs),[1200,2300]);
assert.equal(standard.text,'Qué Más\nPues?');
const enhanced=parseLrc('[00:01.00]<00:01.00>Qué <00:01.50>Más Pues?');
assert.equal(enhanced.text,'Qué Más Pues?');
assert.deepEqual(enhanced.lines[0].words.map(word=>word.startMs),[1000,1500]);
console.log('LRC parser: standard line timestamps and Enhanced LRC word timestamps OK');
