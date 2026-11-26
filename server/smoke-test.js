'use strict';
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');
const { WebSocket } = require('ws');

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function freePort() {
  const probe = net.createServer();
  await new Promise((resolve, reject) => probe.once('error', reject).listen(0, '127.0.0.1', resolve));
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  return port;
}
async function waitForMessage(ws, predicate, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { ws.off('message', handler); reject(new Error('Timed out waiting for WebSocket message')); }, timeout);
    function handler(data, binary) {
      if (binary) return;
      let message;
      try { message = JSON.parse(data.toString()); } catch { return; }
      if (!predicate(message)) return;
      clearTimeout(timer);
      ws.off('message', handler);
      resolve(message);
    }
    ws.on('message', handler);
  });
}
async function openSocket(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.once('open', () => resolve(ws));
    ws.once('error', reject);
  });
}
(async () => {
  const port = await freePort();
  const base = 'http://127.0.0.1:' + port;
  const child = spawn(process.execPath, [path.join(__dirname, 'server.js')], {
    env: { ...process.env, PORT: String(port), UPLOAD_DIR: path.join(__dirname, '.test-uploads') },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let tvSocket, phoneSocket;
  try {
    let healthy = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      try {
        const response = await fetch(base + '/health');
        if (response.ok) { healthy = true; break; }
      } catch {}
      await wait(100);
    }
    assert.equal(healthy, true, 'Bridge should start and answer /health');

    const sessionResponse = await fetch(base + '/api/tv/session', { method: 'POST' });
    assert.equal(sessionResponse.status, 201, 'TV session should be created');
    const session = await sessionResponse.json();
    assert.match(session.code, /^\d{6}$/, 'Pairing code must have six digits');
    assert.ok(session.token, 'TV token must be returned');

    tvSocket = await openSocket('ws://127.0.0.1:' + port + '/ws?token=' + encodeURIComponent(session.token));

    const invalidJoin = await fetch(base + '/api/pair/join', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: '999999' })
    });
    assert.equal(invalidJoin.status, 404, 'Invalid pairing code must be rejected');

    const phoneJoinPromise = waitForMessage(tvSocket, m => m.type === 'peer-status' && m.role === 'phone' && m.connected);
    const phoneResponse = await fetch(base + '/api/pair/join', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: session.code, deviceName: 'SONORA test device' })
    });
    assert.equal(phoneResponse.status, 200, 'Phone should pair with the TV code');
    const phone = await phoneResponse.json();
    assert.equal(phone.tvOnline, true, 'Pair response should indicate the TV socket is online');
    phoneSocket = await openSocket('ws://127.0.0.1:' + port + '/ws?token=' + encodeURIComponent(phone.token));

    const tvStatusPromise = waitForMessage(phoneSocket, m => m.type === 'peer-status' && m.role === 'tv' && m.connected);
    await phoneJoinPromise;
    await tvStatusPromise;

    const metadataPromise = waitForMessage(tvSocket, m => m.type === 'metadata' && m.title === 'Connection test');
    phoneSocket.send(JSON.stringify({ type: 'metadata', title: 'Connection test', artist: 'SONORA' }));
    const metadata = await metadataPromise;
    assert.equal(metadata.from, 'phone', 'TV should receive phone metadata');

    const controlPromise = waitForMessage(phoneSocket, m => m.type === 'play' && m.from === 'tv');
    tvSocket.send(JSON.stringify({ type: 'play' }));
    await controlPromise;

    const tvDisconnected = waitForMessage(phoneSocket, m => m.type === 'peer-status' && m.role === 'tv' && !m.connected);
    tvSocket.close();
    await tvDisconnected;

    tvSocket = await openSocket('ws://127.0.0.1:' + port + '/ws?token=' + encodeURIComponent(session.token));
    const phonePresenceOnTv = waitForMessage(tvSocket, m => m.type === 'peer-status' && m.role === 'phone' && m.connected);
    const tvPresenceOnPhone = waitForMessage(phoneSocket, m => m.type === 'peer-status' && m.role === 'tv' && m.connected);
    await Promise.all([phonePresenceOnTv, tvPresenceOnPhone]);

    const phoneDisconnected = waitForMessage(tvSocket, m => m.type === 'peer-status' && m.role === 'phone' && !m.connected);
    phoneSocket.close();
    await phoneDisconnected;

    console.log('SONORA Bridge connectivity smoke test: PASS');
    console.log('- TV session and six-digit code');
    console.log('- Invalid code rejection');
    console.log('- Phone pairing and two-way presence notifications');
    console.log('- Phone metadata relay to TV');
    console.log('- TV control relay to phone');
    console.log('- TV disconnect and reconnect without re-pairing');
    console.log('- Phone disconnect notification');
  } finally {
    try { phoneSocket?.close(); } catch {}
    try { tvSocket?.close(); } catch {}
    child.kill('SIGTERM');
    await wait(250);
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
