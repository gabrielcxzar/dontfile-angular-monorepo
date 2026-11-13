# Tasks: Salas Privadas Protegidas por Senha

## Phase 1: Backend Security & Private Room API (`api/`)
- [x] T001 Atualizar `api/.gitignore` para ignorar `room-meta/` e `uploads/`
- [x] T002 Refatorar `api/server.js` com sanitização contra Path Traversal (`resolveSafeRoom`, `resolveSafeFile`) e `express.json()`
- [x] T003 Implementar persistência de hash `scrypt` em `api/room-meta/` e tokens/tickets HMAC-SHA256 em `api/server.js`
- [x] T004 Implementar rotas `/access`, `/lock`, `/unlock` (com rate limit), `/download-ticket/:filename` e middleware `requireRoomAccess` antes do Multer e nas rotas protegidas; atualizar `delete-all` para remover metadados
- [x] T005 Adicionar script `"test": "node --test"` em `api/package.json` e criar suíte completa em `api/test/server.test.js`

## Phase 2: Frontend Auth & Room UI (`web/`)
- [x] T006 Criar `web/src/app/services/room-auth.service.ts` para gerenciar tokens no `sessionStorage` e chamadas de `/access`, `/lock`, `/unlock`, `/download-ticket`
- [x] T007 Atualizar `web/src/app/room/room.component.ts`, `room.component.html`, `room.component.css` e `web/src/styles.css` para fluxo de "Tornar privada" (somente sala vazia), tela de desbloqueio por senha, pausa/retomada de polling e download via ticket em salas privadas
- [x] T008 Criar/atualizar testes unitários em `web/src/app/services/room-auth.service.spec.ts` e `web/src/app/room/room.component.spec.ts`

## Phase 3: Documentation & Verification
- [x] T009 Atualizar `docs/SPEC.md`, `docs/ARCHITECTURE.md` e `CHANGELOG_AI.md`
- [x] T010 Executar testes do backend (`cd api && npm test`), testes do frontend (`cd web && npm test -- --watch=false`) e build (`cd web && npm run build`) e revisar diff
