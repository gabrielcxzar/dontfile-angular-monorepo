# Implementation Plan: Salas Privadas Protegidas por Senha

**Branch**: `001-private-rooms` | **Date**: 2026-11-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-private-rooms/spec.md`

## Summary

Implementar salas privadas protegidas por uma senha única definida dentro da própria sala (apenas quando vazia), mantendo `HomeComponent` inalterado. No backend (`api/server.js`), adicionar sanitização estrita contra Path Traversal, armazenamento isolado de hash de senha (`scrypt` + salt) em `api/room-meta/`, tokens HMAC-SHA256 stateless por sala, rate limit no desbloqueio e download seguro via ticket temporário. No frontend (`web/src/app`), criar `RoomAuthService` e atualizar `RoomComponent` para oferecer o fluxo de trancar sala vazia, tela de bloqueio/desbloqueio por senha e envio de autorização nas chamadas HTTP.

## Technical Context

**Language/Version**: Node.js `>=18.0.0` (v22.18.0 local), TypeScript `~5.7.2`, Angular `^19.2.0`  
**Primary Dependencies**: Express `^4.18.2`, Multer `^1.4.5-lts.1`, Node built-in `node:crypto`/`node:fs`/`node:path`, Angular HttpClient/Router/Forms  
**Storage**: Sistema de arquivos efêmero local (`api/uploads/` para arquivos e `api/room-meta/` para metadados de bloqueio)  
**Testing**: Node built-in test runner (`node --test`) no backend; Karma + Jasmine (`ng test`) no frontend  
**Target Platform**: Web SPA + Node.js HTTP server (Render Free Tier)  
**Project Type**: Monorepo (`api/` + `web/`)  
**Performance Goals**: Streaming direto de downloads até 100MB sem buffering em memória no cliente; validação de senha rápida com `scrypt`  
**Constraints**: Sem banco de dados externo; sem novas dependências npm obrigatórias; `HomeComponent` inalterado; proteção contra Path Traversal obrigatória  
**Scale/Scope**: Rotas da API `/api/:room(*)/*` e `RoomComponent`

## Constitution Check

- `constitution.md` ainda usa o template padrão; respeitam-se as diretrizes de [AGENTS.md](../../AGENTS.md) e [.ai/AGENTS.md](../../.ai/AGENTS.md):
  - Especificação registrada antes da implementação (`specs/001-private-rooms/spec.md`).
  - Contratos sincronizados entre `api/server.js` e chamadas `HttpClient` em `web/`.
  - Testes automatizados sem exclusão de specs existentes (`*.spec.ts`).
  - Sem build artifacts injetados manualmente em `api/public` durante o desenvolvimento.

## Project Structure

### Documentation (this feature)

```text
specs/001-private-rooms/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── private-rooms-api.md
└── tasks.md
```

### Source Code (repository root)

```text
api/
├── .gitignore
├── package.json
├── server.js
└── test/
    └── server.test.js

web/
└── src/
    ├── styles.css
    └── app/
        ├── services/
        │   ├── room-auth.service.ts
        │   └── room-auth.service.spec.ts
        └── room/
            ├── room.component.ts
            ├── room.component.html
            ├── room.component.css
            └── room.component.spec.ts
```

**Structure Decision**: Manter a separação existente `api/` + `web/`, extraindo helpers/app exportável em `api/server.js` (para testar com `node --test` sem subir porta fixa) e isolando estado de autenticação em `RoomAuthService` no Angular.
