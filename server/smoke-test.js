'use strict';
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const net=require('node:net');
const path=require('node:path');
const {WebSocket}=require('ws');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function freePort(){const s=net.createServer();await new Promise((resolve,reject)=>s.once('error',reject).listen(0,'127.0.0.1',resolve));const p=s.address().port;await new Promise(r=>s.close(r));return p}
async function waitMessage(ws,predicate,timeout=5000){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{ws.off('message',handler);reject(new Error('WebSocket message timeout'))},timeout);function handler(data,binary){if(binary)return;let msg;try{msg=JSON.parse(data.toString())}catch(_){return}if(!predicate(msg))return;clearTimeout(timer);ws.off('message',handler);resolve(msg)}ws.on('message',handler)})}
async function openSocket(url){return new Promise((resolve,reject)=>{const ws=new WebSocket(url);ws.once('open',()=>resolve(ws));ws.once('error',reject)})}
(async()=>{
 const port=await freePort(),base='http://127.0.0.1:'+port;
 const child=spawn(process.execPath,[path.join(__dirname,'server.js')],{env:{...process.env,PORT:String(port),UPLOAD_DIR:path.join(__dirname,'.test-uploads')},stdio:['ignore','pipe','pipe']});
 let tv,phone;
 try{
  let ready=false;for(let i=0;i<60;i++){try{const r=await fetch(base+'/health');if(r.ok){ready=true;break}}catch(_){}await wait(100)}
  assert.equal(ready,true,'Bridge health endpoint');
  const sessionResponse=await fetch(base+'/api/tv/session',{method:'POST'});assert.equal(sessionResponse.status,201);
  const session=await sessionResponse.json();assert.match(session.code,/^\d{6}$/);assert.ok(session.token);
  tv=await openSocket('ws://127.0.0.1:'+port+'/ws?token='+encodeURIComponent(session.token));
  const invalid=await fetch(base+'/api/pair/join',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code:'999999'})});assert.equal(invalid.status,404);
  const phoneNotice=waitMessage(tv,m=>m.type==='peer-status'&&m.role==='phone'&&m.connected);
  const response=await fetch(base+'/api/pair/join',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code:session.code,deviceName:'SONORA test'})});assert.equal(response.status,200);
  const paired=await response.json();assert.equal(paired.tvOnline,true);
  phone=await openSocket('ws://127.0.0.1:'+port+'/ws?token='+encodeURIComponent(paired.token));
  const tvNotice=waitMessage(phone,m=>m.type==='peer-status'&&m.role==='tv'&&m.connected);
  await Promise.all([phoneNotice,tvNotice]);
  const metadataNotice=waitMessage(tv,m=>m.type==='metadata'&&m.title==='Connection test');phone.send(JSON.stringify({type:'metadata',title:'Connection test',artist:'SONORA'}));
  assert.equal((await metadataNotice).from,'phone');

  const preferencesNotice=waitMessage(tv,m=>m.type==='preferences'&&m.theme==='aurora'&&m.lyricsAnimation==='fluida');
  phone.send(JSON.stringify({type:'preferences',theme:'aurora',lyricsAnimation:'fluida'}));
  assert.equal((await preferencesNotice).from,'phone','Phone personalization must reach the TV');

  const lyricsNotice=waitMessage(tv,m=>m.type==='lyrics'&&m.format==='lrc');
  phone.send(JSON.stringify({type:'lyrics',format:'lrc',text:'Primera línea\\nSegunda línea',lines:[{startMs:1200,text:'Primera línea',words:[{startMs:1200,text:'Primera '},{startMs:1600,text:'línea'}]},{startMs:2450,text:'Segunda línea'}]}));
  const receivedLyrics=await lyricsNotice;
  assert.equal(receivedLyrics.lines.length,2,'TV should receive timed LRC lines');
  assert.equal(receivedLyrics.lines[1].startMs,2450,'LRC timestamps must be preserved');
  assert.equal(receivedLyrics.lines[0].words[1].startMs,1600,'Enhanced LRC word timestamps must be preserved');

  const streamNotice=waitMessage(tv,m=>m.type==='stream-start'&&m.name==='Qué Más Pues?'&&m.artist==='J Balvin');
  const streamResponse=await fetch(base+'/api/stream/session',{
   method:'POST',
   headers:{
    'authorization':'Bearer '+paired.token,
    'content-type':'audio/mpeg',
    'x-track-title-b64':Buffer.from('Qué Más Pues?','utf8').toString('base64'),
    'x-track-artist-b64':Buffer.from('J Balvin','utf8').toString('base64')
   },
   body:'{}'
  });
  assert.equal(streamResponse.status,201,'Unicode track title must not break stream-session request');
  await streamResponse.json();
  const streamMessage=await streamNotice;
  assert.equal(streamMessage.name,'Qué Más Pues?','Bridge must decode the UTF-8 title header');
  assert.equal(streamMessage.artist,'J Balvin','Bridge must decode the UTF-8 artist header');

  const volumeNotice=waitMessage(tv,m=>m.type==='volume'&&m.value===0.35);
  phone.send(JSON.stringify({type:'volume',value:0.35}));
  await volumeNotice;

  const controlNotice=waitMessage(phone,m=>m.type==='play'&&m.from==='tv');tv.send(JSON.stringify({type:'play'}));await controlNotice;
  const playbackNotice=waitMessage(phone,m=>m.type==='playback-state'&&m.title==='Bridge song');
  tv.send(JSON.stringify({type:'playback-state',title:'Bridge song',artist:'SONORA',playing:true,positionMs:2500,durationMs:180000,volume:0.35}));
  const playback=await playbackNotice;
  assert.equal(playback.positionMs,2500,'TV playback position should reach Android');

  const skipNotice=waitMessage(phone,m=>m.type==='next'&&m.from==='tv');
  tv.send(JSON.stringify({type:'next'}));
  await skipNotice;

  const phoneCommandNotice=waitMessage(phone,m=>m.type==='phone-command'&&m.action==='next'&&m.from==='tv');
  tv.send(JSON.stringify({type:'phone-command',action:'next'}));
  await phoneCommandNotice;
  const tvDown=waitMessage(phone,m=>m.type==='peer-status'&&m.role==='tv'&&!m.connected);tv.close();await tvDown;
  tv=await openSocket('ws://127.0.0.1:'+port+'/ws?token='+encodeURIComponent(session.token));
  const phoneOnTv=waitMessage(tv,m=>m.type==='peer-status'&&m.role==='phone'&&m.connected);
  const tvOnPhone=waitMessage(phone,m=>m.type==='peer-status'&&m.role==='tv'&&m.connected);
  await Promise.all([phoneOnTv,tvOnPhone]);
  const phoneDown=waitMessage(tv,m=>m.type==='peer-status'&&m.role==='phone'&&!m.connected);phone.close();await phoneDown;
  console.log('SONORA Bridge connectivity smoke test: PASS');
  console.log('- TV-generated six-digit code and session token');
  console.log('- Invalid code rejection');
  console.log('- Phone joins with TV code');
  console.log('- Two-way peer presence');
  console.log('- Metadata, volume and playback-state relay');
  console.log('- Timed LRC and Enhanced LRC word timestamps relay');
  console.log('- UTF-8 accented track title and artist headers');
  console.log('- Previous/next and phone media-session command relay');
  console.log('- TV reconnect and phone disconnect notifications');
 }finally{try{phone?.close()}catch(_){}try{tv?.close()}catch(_){}child.kill('SIGTERM');await wait(250)}
})().catch(error=>{console.error(error);process.exitCode=1});
