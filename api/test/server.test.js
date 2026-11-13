const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');

const { createApp, normalizeRoomName, normalizeFilename } = require('../server');

async function startTestServer(overrides = {}) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dontfile-test-'));
  const uploadRoot = path.join(tempRoot, 'uploads');
  const metaRoot = path.join(tempRoot, 'room-meta');
  const publicDir = path.join(tempRoot, 'public');
  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, 'index.html'), '<html><body>DontFile</body></html>');

  const app = createApp({
    uploadRoot,
    metaRoot,
    publicDir,
    authSecret: 'test-secret-key-123456',
    unlockMaxAttempts: 3,
    unlockWindowMs: 5000,
    ...overrides
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    baseUrl,
    uploadRoot,
    metaRoot,
    async close() {
      await new Promise((resolve) => server.close(resolve));
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  };
}

async function uploadSampleFile(baseUrl, room, filename, content, token = null) {
  const form = new FormData();
  form.append('file', new Blob([content], { type: 'text/plain' }), filename);
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return fetch(`${baseUrl}/api/${room}/upload`, {
    method: 'POST',
    headers,
    body: form
  });
}

test('normalizeRoomName and normalizeFilename reject path traversal', () => {
  assert.equal(normalizeRoomName('sala-ok'), 'sala-ok');
  assert.equal(normalizeRoomName('/equipe/projeto/'), 'equipe/projeto');
  assert.equal(normalizeRoomName('..'), null);
  assert.equal(normalizeRoomName('sala/../outra'), null);
  assert.equal(normalizeRoomName('%2e%2e/room-meta'), null);
  assert.equal(normalizeRoomName('sala\\outra'), null);
  assert.equal(normalizeRoomName(''), null);

  assert.equal(normalizeFilename('arquivo.txt'), 'arquivo.txt');
  assert.equal(normalizeFilename('..'), null);
  assert.equal(normalizeFilename('.'), null);
  assert.equal(normalizeFilename('a/b.txt'), null);
  assert.equal(normalizeFilename('a\\b.txt'), null);
});

test('public room supports upload, list, download, delete and delete-all', async (t) => {
  const srv = await startTestServer();
  t.after(() => srv.close());

  const accessRes = await fetch(`${srv.baseUrl}/api/sala-publica/access`);
  assert.equal(accessRes.status, 200);
  assert.deepEqual(await accessRes.json(), { isPrivate: false, unlocked: true });

  const uploadRes = await uploadSampleFile(srv.baseUrl, 'sala-publica', 'oi.txt', 'conteudo publico');
  assert.equal(uploadRes.status, 200);

  const listRes = await fetch(`${srv.baseUrl}/api/sala-publica/files`);
  assert.equal(listRes.status, 200);
  const files = await listRes.json();
  assert.equal(files.length, 1);
  assert.equal(files[0].name, 'oi.txt');

  const dlRes = await fetch(`${srv.baseUrl}/api/sala-publica/download/oi.txt`);
  assert.equal(dlRes.status, 200);
  assert.equal(await dlRes.text(), 'conteudo publico');

  const delRes = await fetch(`${srv.baseUrl}/api/sala-publica/delete/oi.txt`, { method: 'DELETE' });
  assert.equal(delRes.status, 200);

  const listAfter = await fetch(`${srv.baseUrl}/api/sala-publica/files`);
  assert.deepEqual(await listAfter.json(), []);
});

function rawHttpGet(baseUrl, rawPath) {
  const url = new URL(baseUrl);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: rawPath,
        method: 'GET'
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => resolve({ status: res.statusCode, body }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

test('path traversal on API routes returns 400', async (t) => {
  const srv = await startTestServer();
  t.after(() => srv.close());

  const badRoom = await rawHttpGet(srv.baseUrl, '/api/%2e%2e/files');
  assert.equal(badRoom.status, 400);

  const nestedTraversal = await rawHttpGet(srv.baseUrl, '/api/sala/%2e%2e/room-meta/files');
  assert.equal(nestedTraversal.status, 400);

  const badFile = await rawHttpGet(srv.baseUrl, '/api/sala-segura/download/%2e%2e');
  assert.equal(badFile.status, 400);
});

test('cannot lock a public room that already has files or invalid password', async (t) => {
  const srv = await startTestServer();
  t.after(() => srv.close());

  const shortPwd = await fetch(`${srv.baseUrl}/api/sala-vazia/lock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: '123' })
  });
  assert.equal(shortPwd.status, 400);

  await uploadSampleFile(srv.baseUrl, 'sala-ocupada', 'doc.txt', 'abc');

  const lockOccupied = await fetch(`${srv.baseUrl}/api/sala-ocupada/lock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'senha-segura' })
  });
  assert.equal(lockOccupied.status, 409);
});

test('private room locks empty room, blocks unauthorized access, rate limits unlock and cleans metadata on delete-all', async (t) => {
  const srv = await startTestServer();
  t.after(() => srv.close());

  // 1. Lock empty room
  const lockRes = await fetch(`${srv.baseUrl}/api/minha-privada/lock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'segredo-123' })
  });
  assert.equal(lockRes.status, 201);
  const lockBody = await lockRes.json();
  assert.equal(lockBody.success, true);
  assert.ok(lockBody.token);

  // Cannot lock twice
  const secondLock = await fetch(`${srv.baseUrl}/api/minha-privada/lock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'outra-senha' })
  });
  assert.equal(secondLock.status, 409);

  // 2. Unauthenticated access checks
  const anonAccess = await fetch(`${srv.baseUrl}/api/minha-privada/access`);
  assert.deepEqual(await anonAccess.json(), { isPrivate: true, unlocked: false });

  const anonFiles = await fetch(`${srv.baseUrl}/api/minha-privada/files`);
  assert.equal(anonFiles.status, 401);

  const anonUpload = await uploadSampleFile(srv.baseUrl, 'minha-privada', 'intruso.txt', 'hack');
  assert.equal(anonUpload.status, 401);
  assert.equal(fs.existsSync(path.join(srv.uploadRoot, 'minha-privada', 'intruso.txt')), false);

  // 3. Cross-room token rejection
  const otherLock = await fetch(`${srv.baseUrl}/api/outra-privada/lock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'outra-senha' })
  });
  const otherToken = (await otherLock.json()).token;
  const crossRoomFiles = await fetch(`${srv.baseUrl}/api/minha-privada/files`, {
    headers: { Authorization: `Bearer ${otherToken}` }
  });
  assert.equal(crossRoomFiles.status, 401);

  // 4. Upload & download ticket with creator token
  const authUpload = await uploadSampleFile(
    srv.baseUrl,
    'minha-privada',
    'secreto.txt',
    'dados confidenciais',
    lockBody.token
  );
  assert.equal(authUpload.status, 200);

  // Direct download without token or ticket fails
  const anonDownload = await fetch(`${srv.baseUrl}/api/minha-privada/download/secreto.txt`);
  assert.equal(anonDownload.status, 401);

  // Issue ticket and download
  const ticketRes = await fetch(`${srv.baseUrl}/api/minha-privada/download-ticket/secreto.txt`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${lockBody.token}` }
  });
  assert.equal(ticketRes.status, 200);
  const { ticket } = await ticketRes.json();

  const ticketDl = await fetch(`${srv.baseUrl}/api/minha-privada/download/secreto.txt?ticket=${encodeURIComponent(ticket)}`);
  assert.equal(ticketDl.status, 200);
  assert.equal(await ticketDl.text(), 'dados confidenciais');

  // Ticket for secreto.txt must not authorize another filename
  await uploadSampleFile(srv.baseUrl, 'minha-privada', 'outro.txt', 'outro conteudo', lockBody.token);
  const wrongFileTicket = await fetch(
    `${srv.baseUrl}/api/minha-privada/download/outro.txt?ticket=${encodeURIComponent(ticket)}`
  );
  assert.equal(wrongFileTicket.status, 401);

  // 5. Wrong password & rate limit
  for (let i = 0; i < 3; i += 1) {
    const badUnlock = await fetch(`${srv.baseUrl}/api/minha-privada/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'errada' })
    });
    assert.equal(badUnlock.status, 401);
  }
  const rateLimited = await fetch(`${srv.baseUrl}/api/minha-privada/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'segredo-123' })
  });
  assert.equal(rateLimited.status, 429);

  // 6. Clean up room (delete-all) removes files and metadata
  const deleteAllRes = await fetch(`${srv.baseUrl}/api/minha-privada/delete-all`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${lockBody.token}` }
  });
  assert.equal(deleteAllRes.status, 200);

  const accessAfterDelete = await fetch(`${srv.baseUrl}/api/minha-privada/access`);
  assert.deepEqual(await accessAfterDelete.json(), { isPrivate: false, unlocked: true });
});

test('parent room delete-all preserves private sub-room', async (t) => {
  const srv = await startTestServer();
  t.after(() => srv.close());

  const subLock = await fetch(`${srv.baseUrl}/api/equipe/segredo/lock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'sub-password' })
  });
  const subToken = (await subLock.json()).token;

  await uploadSampleFile(srv.baseUrl, 'equipe/segredo', 'cofre.txt', 'intacto', subToken);
  await uploadSampleFile(srv.baseUrl, 'equipe', 'publico.txt', 'apagavel');

  const delParent = await fetch(`${srv.baseUrl}/api/equipe/delete-all`, { method: 'DELETE' });
  assert.equal(delParent.status, 200);

  const subFilesRes = await fetch(`${srv.baseUrl}/api/equipe/segredo/files`, {
    headers: { Authorization: `Bearer ${subToken}` }
  });
  assert.equal(subFilesRes.status, 200);
  const subFiles = await subFilesRes.json();
  assert.equal(subFiles.length, 1);
  assert.equal(subFiles[0].name, 'cofre.txt');
});
