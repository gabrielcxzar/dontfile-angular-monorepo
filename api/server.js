const crypto = require('crypto');
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const DEFAULT_PORT = process.env.PORT || 3000;
const CANONICAL_DOMAIN = process.env.CANONICAL_DOMAIN || 'dontfile.com.br';
const LEGACY_RENDER_DOMAIN = process.env.LEGACY_RENDER_DOMAIN || 'dontfile.onrender.com';
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB
const MIN_PASSWORD_LENGTH = 4;
const MAX_PASSWORD_LENGTH = 128;
const DEFAULT_TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12h
const DEFAULT_TICKET_TTL_MS = 60 * 1000; // 60s
const DEFAULT_UNLOCK_MAX_ATTEMPTS = 5;
const DEFAULT_UNLOCK_WINDOW_MS = 60 * 1000; // 1 min

function toBase64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function fromBase64Url(input) {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (padded.length % 4)) % 4;
  return Buffer.from(padded + '='.repeat(padLength), 'base64').toString('utf8');
}

function normalizeRoomName(rawRoom) {
  if (typeof rawRoom !== 'string') {
    return null;
  }

  let decoded = rawRoom;
  try {
    decoded = decodeURIComponent(rawRoom);
  } catch {
    return null;
  }

  if (decoded.includes('\\') || /[\x00-\x1f]/.test(decoded)) {
    return null;
  }

  const trimmed = decoded.replace(/^\/+|\/+$/g, '');
  if (!trimmed) {
    return null;
  }

  const segments = trimmed.split('/');
  for (const segment of segments) {
    if (!segment || segment === '.' || segment === '..') {
      return null;
    }
  }

  return segments.join('/');
}

function normalizeFilename(rawFilename) {
  if (typeof rawFilename !== 'string') {
    return null;
  }

  let decoded = rawFilename;
  try {
    decoded = decodeURIComponent(rawFilename);
  } catch {
    return null;
  }

  if (
    !decoded ||
    decoded === '.' ||
    decoded === '..' ||
    decoded.includes('/') ||
    decoded.includes('\\') ||
    /[\x00-\x1f]/.test(decoded)
  ) {
    return null;
  }

  return decoded;
}

function isPathInsideBase(baseDir, targetPath) {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(targetPath);
  return resolvedTarget.startsWith(resolvedBase + path.sep);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, passwordHash };
}

function verifyPassword(password, storedMeta) {
  if (!storedMeta || typeof storedMeta.salt !== 'string' || typeof storedMeta.passwordHash !== 'string') {
    return false;
  }

  const expected = Buffer.from(storedMeta.passwordHash, 'hex');
  const actual = crypto.scryptSync(password, storedMeta.salt, 64);
  if (expected.length !== actual.length) {
    return false;
  }
  return crypto.timingSafeEqual(expected, actual);
}

function extractBearerToken(req) {
  const header = req.headers.authorization;
  if (typeof header !== 'string') {
    return null;
  }
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

function createApp(options = {}) {
  const uploadRoot = path.resolve(options.uploadRoot || path.join(__dirname, 'uploads'));
  const metaRoot = path.resolve(options.metaRoot || path.join(__dirname, 'room-meta'));
  const publicDir = path.resolve(options.publicDir || path.join(__dirname, 'public'));
  const authSecret = options.authSecret || process.env.ROOM_AUTH_SECRET || crypto.randomBytes(32).toString('hex');
  const tokenTtlMs = options.tokenTtlMs ?? DEFAULT_TOKEN_TTL_MS;
  const ticketTtlMs = options.ticketTtlMs ?? DEFAULT_TICKET_TTL_MS;
  const unlockMaxAttempts = options.unlockMaxAttempts ?? DEFAULT_UNLOCK_MAX_ATTEMPTS;
  const unlockWindowMs = options.unlockWindowMs ?? DEFAULT_UNLOCK_WINDOW_MS;

  const unlockAttempts = new Map();
  const app = express();

  function signPayload(payload) {
    const encodedPayload = toBase64Url(JSON.stringify(payload));
    const signature = toBase64Url(
      crypto.createHmac('sha256', authSecret).update(encodedPayload).digest()
    );
    return `${encodedPayload}.${signature}`;
  }

  function verifySignedPayload(token) {
    if (typeof token !== 'string' || !token.includes('.')) {
      return null;
    }
    const parts = token.split('.');
    if (parts.length !== 2) {
      return null;
    }
    const [encodedPayload, providedSig] = parts;
    if (!encodedPayload || !providedSig) {
      return null;
    }

    const expectedSig = toBase64Url(
      crypto.createHmac('sha256', authSecret).update(encodedPayload).digest()
    );

    const providedBuf = Buffer.from(providedSig, 'utf8');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');
    if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
      return null;
    }

    try {
      const payload = JSON.parse(fromBase64Url(encodedPayload));
      if (!payload || typeof payload.exp !== 'number' || Date.now() > payload.exp) {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }

  function signRoomToken(room) {
    const expiresAt = Date.now() + tokenTtlMs;
    const token = signPayload({ type: 'room-access', room, exp: expiresAt });
    return { token, expiresAt };
  }

  function verifyRoomToken(token, room) {
    const payload = verifySignedPayload(token);
    return Boolean(payload && payload.type === 'room-access' && payload.room === room);
  }

  function signDownloadTicket(room, filename) {
    const expiresAt = Date.now() + ticketTtlMs;
    const ticket = signPayload({ type: 'download-ticket', room, filename, exp: expiresAt });
    return { ticket, expiresAt };
  }

  function verifyDownloadTicket(ticket, room, filename) {
    const payload = verifySignedPayload(ticket);
    return Boolean(
      payload &&
        payload.type === 'download-ticket' &&
        payload.room === room &&
        payload.filename === filename
    );
  }

  function resolveSafeRoom(rawRoom) {
    const normalizedRoom = normalizeRoomName(rawRoom);
    if (!normalizedRoom) {
      return null;
    }
    const roomDir = path.resolve(uploadRoot, normalizedRoom);
    if (!isPathInsideBase(uploadRoot, roomDir)) {
      return null;
    }
    return { normalizedRoom, roomDir };
  }

  function resolveSafeFile(rawRoom, rawFilename) {
    const safeRoom = resolveSafeRoom(rawRoom);
    if (!safeRoom) {
      return null;
    }
    const filename = normalizeFilename(rawFilename);
    if (!filename) {
      return null;
    }
    const filePath = path.resolve(safeRoom.roomDir, filename);
    if (!isPathInsideBase(safeRoom.roomDir, filePath)) {
      return null;
    }
    return { ...safeRoom, filename, filePath };
  }

  function getMetaPath(normalizedRoom) {
    const hash = crypto.createHash('sha256').update(normalizedRoom).digest('hex');
    return path.join(metaRoot, `${hash}.json`);
  }

  function readRoomMeta(normalizedRoom) {
    const metaPath = getMetaPath(normalizedRoom);
    if (!fs.existsSync(metaPath)) {
      return null;
    }
    try {
      return JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    } catch {
      return null;
    }
  }

  function isRoomEmpty(roomDir) {
    if (!fs.existsSync(roomDir)) {
      return true;
    }
    return fs.readdirSync(roomDir).length === 0;
  }

  function getUnlockKey(req, normalizedRoom) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    return `${ip}::${normalizedRoom}`;
  }

  function checkUnlockRateLimit(key) {
    const now = Date.now();
    const record = unlockAttempts.get(key);
    if (!record || now >= record.resetAt) {
      if (record) {
        unlockAttempts.delete(key);
      }
      return { allowed: true };
    }
    if (record.count >= unlockMaxAttempts) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000))
      };
    }
    return { allowed: true };
  }

  function recordFailedUnlock(key) {
    const now = Date.now();
    const record = unlockAttempts.get(key);
    if (!record || now >= record.resetAt) {
      unlockAttempts.set(key, { count: 1, resetAt: now + unlockWindowMs });
      return;
    }
    record.count += 1;
  }

  function clearUnlockRateLimit(key) {
    unlockAttempts.delete(key);
  }

  function requireValidRoom(req, res, next) {
    const safeRoom = resolveSafeRoom(req.params.room);
    if (!safeRoom) {
      return res.status(400).json({ error: 'Nome de sala inválido' });
    }
    req.safeRoom = safeRoom;
    next();
  }

  function requireRoomAccess(req, res, next) {
    const safeRoom = req.safeRoom || resolveSafeRoom(req.params.room);
    if (!safeRoom) {
      return res.status(400).json({ error: 'Nome de sala inválido' });
    }
    req.safeRoom = safeRoom;

    const meta = readRoomMeta(safeRoom.normalizedRoom);
    if (!meta) {
      req.isPrivateRoom = false;
      return next();
    }

    req.isPrivateRoom = true;
    const token = extractBearerToken(req);
    if (token && verifyRoomToken(token, safeRoom.normalizedRoom)) {
      return next();
    }

    return res.status(401).json({
      error: 'Esta sala é privada. Informe a senha para acessar.',
      locked: true
    });
  }

  // Redireciona o subdomínio legado do Render para o domínio oficial.
  app.use((req, res, next) => {
    const host = (req.headers.host || '').split(':')[0].toLowerCase();
    if (host === LEGACY_RENDER_DOMAIN) {
      return res.redirect(301, `https://${CANONICAL_DOMAIN}${req.originalUrl}`);
    }
    next();
  });

  app.use(express.json());
  app.use(express.static(publicDir));

  // Configuração do Multer com destino validado
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const safeRoom = req.safeRoom || resolveSafeRoom(req.params.room);
      if (!safeRoom) {
        return cb(new Error('Nome de sala inválido'));
      }
      if (!fs.existsSync(safeRoom.roomDir)) {
        fs.mkdirSync(safeRoom.roomDir, { recursive: true });
      }
      cb(null, safeRoom.roomDir);
    },
    filename: (req, file, cb) => {
      const safeName = normalizeFilename(path.basename(file.originalname || ''));
      if (!safeName) {
        const invalidErr = new Error('Nome de arquivo inválido');
        invalidErr.statusCode = 400;
        return cb(invalidErr);
      }
      cb(null, safeName);
    }
  });

  const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE_BYTES }
  });

  app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  // API: Consultar se a sala é privada e se o token atual é válido
  app.get('/api/:room(*)/access', requireValidRoom, (req, res) => {
    res.set('Cache-Control', 'no-store');
    const meta = readRoomMeta(req.safeRoom.normalizedRoom);
    if (!meta) {
      return res.json({ isPrivate: false, unlocked: true });
    }

    const token = extractBearerToken(req);
    const unlocked = Boolean(token && verifyRoomToken(token, req.safeRoom.normalizedRoom));
    return res.json({ isPrivate: true, unlocked });
  });

  // API: Tornar uma sala vazia privada com senha única
  app.post('/api/:room(*)/lock', requireValidRoom, (req, res) => {
    res.set('Cache-Control', 'no-store');
    const { normalizedRoom, roomDir } = req.safeRoom;
    const password = req.body?.password;

    if (typeof password !== 'string' || password.trim().length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
      return res.status(400).json({
        error: `A senha deve ter entre ${MIN_PASSWORD_LENGTH} e ${MAX_PASSWORD_LENGTH} caracteres.`
      });
    }

    if (readRoomMeta(normalizedRoom)) {
      return res.status(409).json({ error: 'Esta sala já é privada.' });
    }

    if (!isRoomEmpty(roomDir)) {
      return res.status(409).json({
        error: 'Apenas salas vazias podem ser tornadas privadas.'
      });
    }

    fs.mkdirSync(metaRoot, { recursive: true });
    const metaPath = getMetaPath(normalizedRoom);
    const { salt, passwordHash } = hashPassword(password);
    const metadata = {
      room: normalizedRoom,
      salt,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    try {
      fs.writeFileSync(metaPath, JSON.stringify(metadata), { flag: 'wx' });
    } catch (err) {
      if (err && err.code === 'EEXIST') {
        return res.status(409).json({ error: 'Esta sala já é privada.' });
      }
      throw err;
    }

    const { token, expiresAt } = signRoomToken(normalizedRoom);
    return res.status(201).json({ success: true, token, expiresAt });
  });

  // API: Desbloquear uma sala privada com a senha
  app.post('/api/:room(*)/unlock', requireValidRoom, (req, res) => {
    res.set('Cache-Control', 'no-store');
    const { normalizedRoom } = req.safeRoom;
    const meta = readRoomMeta(normalizedRoom);
    if (!meta) {
      return res.status(400).json({ error: 'Esta sala não é privada.' });
    }

    const rateKey = getUnlockKey(req, normalizedRoom);
    const rateCheck = checkUnlockRateLimit(rateKey);
    if (!rateCheck.allowed) {
      res.set('Retry-After', String(rateCheck.retryAfterSeconds));
      return res.status(429).json({
        error: `Muitas tentativas incorretas. Aguarde ${rateCheck.retryAfterSeconds}s e tente novamente.`
      });
    }

    const password = req.body?.password;
    if (typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ error: 'Informe a senha da sala.' });
    }

    if (!verifyPassword(password, meta)) {
      recordFailedUnlock(rateKey);
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    clearUnlockRateLimit(rateKey);
    const { token, expiresAt } = signRoomToken(normalizedRoom);
    return res.json({ success: true, token, expiresAt });
  });

  // API: Listar arquivos da sala
  app.get('/api/:room(*)/files', requireRoomAccess, (req, res) => {
    if (req.isPrivateRoom) {
      res.set('Cache-Control', 'no-store');
    }
    const { roomDir } = req.safeRoom;

    if (!fs.existsSync(roomDir)) {
      return res.json([]);
    }

    fs.readdir(roomDir, (err, files) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao listar arquivos' });
      }

      const fileDetails = [];
      for (const filename of files) {
        const filePath = path.join(roomDir, filename);
        const stats = fs.statSync(filePath);
        if (!stats.isFile()) {
          continue;
        }
        fileDetails.push({
          name: filename,
          size: stats.size,
          uploadDate: stats.mtime
        });
      }

      res.json(fileDetails);
    });
  });

  // API: Upload de arquivo (autenticado antes do Multer gravar em disco)
  app.post('/api/:room(*)/upload', requireRoomAccess, (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return next(err);
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      res.json({
        success: true,
        filename: req.file.filename,
        size: req.file.size
      });
    });
  });

  // API: Emitir ticket de curta duração para download nativo via navegador em sala privada
  app.post('/api/:room(*)/download-ticket/:filename', requireRoomAccess, (req, res) => {
    res.set('Cache-Control', 'no-store');
    const safeFile = resolveSafeFile(req.params.room, req.params.filename);
    if (!safeFile) {
      return res.status(400).json({ error: 'Nome de sala ou arquivo inválido' });
    }

    if (!fs.existsSync(safeFile.filePath) || !fs.statSync(safeFile.filePath).isFile()) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    const { ticket, expiresAt } = signDownloadTicket(safeFile.normalizedRoom, safeFile.filename);
    return res.json({ ticket, expiresAt });
  });

  // API: Download de arquivo (aceita Bearer token ou ?ticket= em salas privadas)
  app.get('/api/:room(*)/download/:filename', requireValidRoom, (req, res) => {
    const safeFile = resolveSafeFile(req.params.room, req.params.filename);
    if (!safeFile) {
      return res.status(400).json({ error: 'Nome de sala ou arquivo inválido' });
    }

    const meta = readRoomMeta(safeFile.normalizedRoom);
    if (meta) {
      res.set('Cache-Control', 'no-store');
      const bearer = extractBearerToken(req);
      const ticket = typeof req.query.ticket === 'string' ? req.query.ticket : null;
      const authorizedByToken = Boolean(bearer && verifyRoomToken(bearer, safeFile.normalizedRoom));
      const authorizedByTicket = Boolean(
        ticket && verifyDownloadTicket(ticket, safeFile.normalizedRoom, safeFile.filename)
      );

      if (!authorizedByToken && !authorizedByTicket) {
        return res.status(401).json({
          error: 'Esta sala é privada. Informe a senha para baixar.',
          locked: true
        });
      }
    }

    if (!fs.existsSync(safeFile.filePath) || !fs.statSync(safeFile.filePath).isFile()) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    res.download(safeFile.filePath, safeFile.filename);
  });

  // API: Deletar arquivo individual
  app.delete('/api/:room(*)/delete/:filename', requireRoomAccess, (req, res) => {
    const safeFile = resolveSafeFile(req.params.room, req.params.filename);
    if (!safeFile) {
      return res.status(400).json({ error: 'Nome de sala ou arquivo inválido' });
    }

    if (!fs.existsSync(safeFile.filePath) || !fs.statSync(safeFile.filePath).isFile()) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    fs.unlink(safeFile.filePath, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao deletar arquivo' });
      }

      res.json({ success: true, message: 'Arquivo deletado com sucesso' });
    });
  });

  // API: Limpar sala inteira (arquivos e eventual bloqueio privado)
  app.delete('/api/:room(*)/delete-all', requireRoomAccess, (req, res) => {
    const { normalizedRoom, roomDir } = req.safeRoom;
    const metaPath = getMetaPath(normalizedRoom);
    const hasRoomDir = fs.existsSync(roomDir);
    const hasMeta = fs.existsSync(metaPath);

    if (!hasRoomDir && !hasMeta) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    const cleanupMeta = () => {
      if (hasMeta) {
        fs.rmSync(metaPath, { force: true });
      }
      return res.json({ success: true, message: 'Sala limpa com sucesso' });
    };

    if (!hasRoomDir) {
      return cleanupMeta();
    }

    try {
      const entries = fs.readdirSync(roomDir, { withFileTypes: true });
      const hasSubdirs = entries.some((entry) => entry.isDirectory());

      if (hasSubdirs) {
        // Preserva sub-salas (incluindo eventuais sub-salas privadas), removendo apenas arquivos da sala atual
        for (const entry of entries) {
          if (!entry.isDirectory()) {
            fs.unlinkSync(path.join(roomDir, entry.name));
          }
        }
        return cleanupMeta();
      }

      fs.rm(roomDir, { recursive: true, force: true }, (err) => {
        if (err) {
          console.error('Erro ao limpar a sala:', err);
          return res.status(500).json({ error: 'Erro ao limpar a sala' });
        }
        return cleanupMeta();
      });
    } catch (err) {
      console.error('Erro ao limpar a sala:', err);
      return res.status(500).json({ error: 'Erro ao limpar a sala' });
    }
  });

  // Evita que rotas desconhecidas em /api caiam no fallback da SPA
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Endpoint da API não encontrado' });
  });

  // Rota dinâmica para cada "sala" (SPA fallback)
  app.get('/:room(*)', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  // Middleware global de tratamento de erros
  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Arquivo muito grande (Máx: 100MB)' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err && err.statusCode === 400) {
      return res.status(400).json({ error: err.message });
    }
    if (err && err.code === 'ENOSPC') {
      console.error('ALERTA: Armazenamento da VM está cheio!');
      return res.status(507).json({ error: 'Sem armazenamento disponível. Contate o suporte: dontfile@gmail.com' });
    }

    console.error(err?.stack || err);
    res.status(500).json({ error: 'Ocorreu um erro interno no servidor' });
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  app.listen(DEFAULT_PORT, () => {
    console.log(`🚀 DontFile rodando em http://localhost:${DEFAULT_PORT}`);
    console.log(`📁 Arquivos salvos em: ${path.join(__dirname, 'uploads')}`);
  });
}

module.exports = {
  createApp,
  normalizeRoomName,
  normalizeFilename
};
