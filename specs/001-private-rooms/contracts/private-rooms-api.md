# API Contract: Private Rooms (`/api/:room(*)/*`)

## Novos Endpoints

### `GET /api/:room(*)/access`
- **200 OK**: `{ "isPrivate": boolean, "unlocked": boolean }`
- **400 Bad Request**: `{ "error": "Nome de sala inválido" }`

### `POST /api/:room(*)/lock`
- **Body**: `{ "password": string }` (mínimo 4 caracteres após `trim`, máximo 128)
- **201 Created**: `{ "success": true, "token": string, "expiresAt": number }`
- **400 Bad Request**: Senha ausente/inválida ou nome de sala inválido.
- **409 Conflict**: Sala já é privada ou já possui arquivos públicos.

### `POST /api/:room(*)/unlock`
- **Body**: `{ "password": string }`
- **200 OK**: `{ "success": true, "token": string, "expiresAt": number }`
- **400 Bad Request**: Sala não é privada ou senha ausente.
- **401 Unauthorized**: `{ "error": "Senha incorreta" }`
- **429 Too Many Requests**: `{ "error": "Muitas tentativas. Tente novamente em instantes." }`

### `POST /api/:room(*)/download-ticket/:filename`
- **Headers**: `Authorization: Bearer <token>` (obrigatório se sala privada)
- **200 OK**: `{ "ticket": string, "expiresAt": number }`
- **401 Unauthorized**: Token ausente/inválido para sala privada.
- **404 Not Found**: Arquivo não encontrado.

## Endpoints Existentes Atualizados

- `GET /api/:room(*)/files` → exige `Authorization: Bearer <token>` se sala privada (`401 { error, locked: true }`).
- `POST /api/:room(*)/upload` → valida acesso **antes** do Multer gravar em disco (`401 { error, locked: true }`).
- `GET /api/:room(*)/download/:filename` → aceita `Authorization: Bearer <token>` ou `?ticket=<downloadTicket>` quando sala privada (`401 { error, locked: true }`).
- `DELETE /api/:room(*)/delete/:filename` → exige `Authorization: Bearer <token>` se sala privada.
- `DELETE /api/:room(*)/delete-all` → exige `Authorization: Bearer <token>` se sala privada; remove arquivos **e** arquivo de metadados em `api/room-meta/`.
