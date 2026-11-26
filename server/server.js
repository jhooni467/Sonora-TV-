'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {PassThrough,pipeline}=require('node:stream');const {WebSocketServer,WebSocket}=require('ws');
const PORT=Number(process.env.PORT||8787),PUBLIC_ORIGIN=(process.env.PUBLIC_ORIGIN||'').replace(/\/$/,''),UPLOAD_DIR=process.env.UPLOAD_DIR||path.join(__dirname,'uploads');
fs.mkdirSync(UPLOAD_DIR,{recursive:true});const rooms=new Map(),tokens=new Map(),streams=new Map(),uploads=new Map();
const json=(res,status,value)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*','cache-control':'no-store'});res.end(JSON.stringify(value))};
const readJson=req=>new Promise((resolve,reject)=>{let d='';req.on('data',c=>{d+=c;if(d.length>65536)req.destroy()});req.on('end',()=>{try{resolve(JSON.parse(d||'{}'))}catch(e){reject(e)}});req.on('error',reject)});
const makeCode=()=>String(crypto.randomInt(0,1000000)).padStart(6,'0');
function createRoom(){let code;do{code=makeCode()}while([...rooms.values()].some(r=>r.code===code));const room={id:crypto.randomUUID(),code,tvToken:crypto.randomBytes(32).toString('hex'),phoneToken:null,phoneName:null,tv:null,phone:null,createdAt:Date.now()};rooms.set(room.id,room);tokens.set(room.tvToken,{room,role:'tv'});return room}
function send(ws,p){if(ws&&ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(p))}
function emit(room,p,to='tv'){send(to==='tv'?room.tv:room.phone,p)}
function auth(req,url){const token=url.searchParams.get('token')||(req.headers.authorization||'').replace(/^Bearer\s+/i,'');return tokens.get(token)||null}
const server=http.createServer(async(req,res)=>{const url=new URL(req.url,'http://localhost');if(req.method==='OPTIONS'){res.writeHead(204,{'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization,x-file-name,x-track-title,x-track-artist'});return res.end()}
try{
if(req.method==='GET'&&url.pathname==='/health')return json(res,200,{ok:true,service:'sonora-tv-bridge',version:1});
if(req.method==='POST'&&url.pathname==='/api/tv/session'){const r=createRoom();return json(res,201,{roomId:r.id,code:r.code,token:r.tvToken,expiresIn:900,joinUrl:PUBLIC_ORIGIN?PUBLIC_ORIGIN+'/?pair='+r.code:null})}
if(req.method==='POST'&&url.pathname==='/api/pair/join'){
 const b=await readJson(req),code=String(b.code||'').replace(/\D/g,'').slice(0,6);
 const r=[...rooms.values()].find(x=>x.code===code&&Date.now()-x.createdAt<900000);
 if(!r)return json(res,404,{error:'Código no válido o vencido'});
 if(r.phoneToken)tokens.delete(r.phoneToken);
 r.phoneToken=crypto.randomBytes(32).toString('hex');
 r.phoneName=String(b.deviceName||'SONORA').slice(0,80);
 tokens.set(r.phoneToken,{room:r,role:'phone'});
 const response={roomId:r.id,token:r.phoneToken,role:'phone',tvOnline:!!(r.tv&&r.tv.readyState===WebSocket.OPEN)};
 emit(r,{type:'paired',deviceName:r.phoneName,at:Date.now(),tvOnline:response.tvOnline});
 return json(res,200,response);
}
if(req.method==='POST'&&url.pathname==='/api/upload'){const a=auth(req,url);if(!a||a.role!=='phone')return json(res,401,{error:'No autorizado'});const r=a.room,id=crypto.randomUUID(),name=path.basename(decodeURIComponent(req.headers['x-file-name']||'audio')).replace(/[^\p{L}\p{N}._ -]/gu,'_').slice(0,120),ext=path.extname(name).slice(0,10)||'.audio',file=path.join(UPLOAD_DIR,id+ext),out=fs.createWriteStream(file);let bytes=0;req.on('data',c=>bytes+=c.length);pipeline(req,out,err=>{if(err){fs.rm(file,{force:true},()=>{});if(!res.headersSent)json(res,500,{error:'No se pudo guardar el archivo'});return}uploads.set(id,{file,name,roomId:r.id,mime:req.headers['content-type']||'application/octet-stream',bytes});const mediaUrl='/api/media/'+id+'?token='+encodeURIComponent(r.tvToken);emit(r,{type:'media-ready',id,name,mime:req.headers['content-type']||'application/octet-stream',bytes,url:mediaUrl});json(res,201,{id,name,bytes,url:mediaUrl})});return}
if(req.method==='GET'&&url.pathname.startsWith('/api/media/')){const a=auth(req,url),id=url.pathname.split('/').pop(),item=uploads.get(id);if(!a||!item||a.room.id!==item.roomId)return json(res,404,{error:'Archivo no disponible'});res.writeHead(200,{'content-type':item.mime,'content-length':fs.statSync(item.file).size,'content-disposition':'inline; filename="'+item.name.replace(/["\\]/g,'')+'"','access-control-allow-origin':'*'});return fs.createReadStream(item.file).pipe(res)}
if(req.method==='POST'&&url.pathname==='/api/stream/session'){const a=auth(req,url);if(!a||a.role!=='phone')return json(res,401,{error:'No autorizado'});const r=a.room,id=crypto.randomUUID(),mime=String(req.headers['content-type']||'audio/mpeg'),stream=new PassThrough({highWaterMark:262144});streams.set(id,{roomId:r.id,stream,mime,startedAt:Date.now()});const playbackUrl='/api/stream/'+id+'?token='+encodeURIComponent(r.tvToken);emit(r,{type:'stream-start',id,mime,name:String(req.headers['x-track-title']||'Audio en directo').slice(0,160),artist:String(req.headers['x-track-artist']||'').slice(0,160),url:playbackUrl});return json(res,201,{id,uploadUrl:'/api/stream/upload/'+id+'?token='+encodeURIComponent(a.room.phoneToken),playbackUrl})}
if(req.method==='PUT'&&url.pathname.startsWith('/api/stream/upload/')){const a=auth(req,url),id=url.pathname.split('/').pop(),item=streams.get(id);if(!a||a.role!=='phone'||!item||a.room.id!==item.roomId)return json(res,404,{error:'Transmisión no disponible'});req.on('aborted',()=>item.stream.destroy());req.on('error',()=>item.stream.destroy());req.pipe(item.stream);req.on('end',()=>{item.stream.end();res.writeHead(204,{'access-control-allow-origin':'*'});res.end();setTimeout(()=>streams.delete(id),60000)});return}
if(req.method==='GET'&&url.pathname.startsWith('/api/stream/')){const a=auth(req,url),id=url.pathname.split('/').pop(),item=streams.get(id);if(!a||!item||a.room.id!==item.roomId)return json(res,404,{error:'Transmisión no disponible'});res.writeHead(200,{'content-type':item.mime,'cache-control':'no-store','access-control-allow-origin':'*','transfer-encoding':'chunked'});item.stream.pipe(res);return}
return json(res,404,{error:'Ruta no encontrada'})
}catch(e){console.error(e);return json(res,400,{error:'Solicitud incorrecta'})}});
const wss=new WebSocketServer({noServer:true,maxPayload:2*1024*1024});
server.on('upgrade',(req,socket,head)=>{const u=new URL(req.url,'http://localhost'),a=auth(req,u);if(u.pathname!=='/ws'||!a){socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');return socket.destroy()}wss.handleUpgrade(req,socket,head,ws=>{ws.identity=a;wss.emit('connection',ws,req)})});
wss.on('connection',ws=>{
 const {room,role}=ws.identity;
 if(role==='tv'){if(room.tv&&room.tv!==ws)room.tv.close(4001,'TV session replaced');room.tv=ws}
 else{if(room.phone&&room.phone!==ws)room.phone.close(4001,'Phone session replaced');room.phone=ws}
 // Notify both peers about the connection that just opened and the peer's current state.
 emit(room,{type:'peer-status',role,connected:true,deviceName:room.phoneName||'SONORA'},role==='tv'?'phone':'tv');
 const otherRole=role==='tv'?'phone':'tv';
 const otherSocket=role==='tv'?room.phone:room.tv;
 emit(room,{type:'peer-status',role:otherRole,connected:!!(otherSocket&&otherSocket.readyState===WebSocket.OPEN),deviceName:otherRole==='tv'?'SONORA TV':(room.phoneName||'SONORA')},role);
 ws.on('message',(data,binary)=>{
  const target=role==='tv'?room.phone:room.tv;
  if(binary){if(target&&target.readyState===WebSocket.OPEN&&data.length<=1048576)target.send(data,{binary:true});return}
  let msg;try{msg=JSON.parse(data.toString())}catch(_){return}
  const allowed=new Set(['play','pause','toggle','next','previous','seek','volume','metadata','lyrics','queue','stop','ping']);
  if(!allowed.has(msg.type))return;
  if(role==='phone')emit(room,{...msg,from:'phone'});
  else if(['play','pause','toggle','seek','volume','stop','ping'].includes(msg.type))emit(room,{...msg,from:'tv'},'phone');
 });
 ws.on('close',()=>{
  const wasCurrent=role==='tv'?room.tv===ws:room.phone===ws;
  if(!wasCurrent)return;
  if(role==='tv')room.tv=null;else room.phone=null;
  emit(room,{type:'peer-status',role,connected:false},role==='tv'?'phone':'tv');
 });
});
setInterval(()=>{
 const now=Date.now();
 for(const [id,room] of rooms){
  if(now-room.createdAt>24*60*60*1000){
   room.tv?.close(4002,'Room expired');room.phone?.close(4002,'Room expired');
   tokens.delete(room.tvToken);if(room.phoneToken)tokens.delete(room.phoneToken);
   rooms.delete(id);
  }
 }
 for(const [id,stream] of streams)if(now-stream.startedAt>60*60*1000){stream.stream.destroy();streams.delete(id)}
},60*1000).unref();
server.listen(PORT,'0.0.0.0',()=>console.log('SONORA TV bridge listening on '+PORT));
