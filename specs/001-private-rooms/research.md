# Research: Salas Privadas no DontFile

## 1. Hashing de Senha sem Dependências Externas
- **Decision**: Usar `crypto.scryptSync` com salt aleatório de 16 bytes e comparação via `crypto.timingSafeEqual`.
- **Rationale**: Disponível nativamente no Node.js (`>=18`), resistente a ataques de força bruta por GPU/ASIC e evita adicionar dependências nativas (`bcrypt`) que podem falhar em builds do Render.
- **Alternatives considered**: `bcrypt` (requer compilação nativa ou `bcryptjs`), SHA-256 puro (fraco para senhas humanas).

## 2. Isolamento de Metadados e Proteção contra Path Traversal
- **Decision**: Guardar metadados em `api/room-meta/<sha256(room)>.json` (fora de `api/uploads/`) e validar `room` e `filename` com resolução canônica (`path.resolve`) checando prefixo do diretório raiz.
- **Rationale**: Impede que `GET /files` liste metadados ou que `GET /download/:filename` baixe o hash da sala; fecha a vulnerabilidade de Path Traversal documentada em `.meta/AUDIT.md`.
- **Alternatives considered**: Salvar `.dontfile-meta.json` dentro da pasta da sala (risco de vazamento caso algum filtro falhe).

## 3. Transporte de Autenticação e Download de Arquivos Grandes (até 100MB)
- **Decision**: Token HMAC-SHA256 stateless no header `Authorization: Bearer <token>` (armazenado no `sessionStorage` por sala no Angular) + endpoint `POST /api/:room(*)/download-ticket/:filename` que gera ticket de 60s para `GET /api/:room(*)/download/:filename?ticket=...`.
- **Rationale**: `window.location.href` não envia headers customizados, e baixar via `Blob` no Angular carregaria até 100MB na RAM do navegador. O ticket temporário assinado preserva o streaming nativo do navegador e evita problemas de CSRF de cookies.
- **Alternatives considered**: Cookie `HttpOnly` (exige proteção extra contra CSRF e limite de tamanho por múltiplos cookies) ou `Blob` via `HttpClient` (alto uso de RAM).

## 4. Ordem de Execução do Multer em Rotas Protegidas
- **Decision**: Executar o middleware `requireRoomAccess` **antes** do `upload.single('file')`.
- **Rationale**: Impede que requisições não autenticadas gravem arquivos em `api/uploads/` antes de serem bloqueadas.
