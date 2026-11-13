# Data Model: Salas Privadas

## 1. RoomLockMetadata (`api/room-meta/<sha256(normalizedRoom)>.json`)
- `room` (`string`): Nome normalizado da sala (ex.: `minha-sala` ou `equipe/projeto`).
- `salt` (`string`, hex 32 chars): Salt aleatório por sala.
- `passwordHash` (`string`, hex 128 chars): Derivação `scrypt` (64 bytes).
- `createdAt` (`string`, ISO-8601): Data de criação do bloqueio.

### Regras de Transição de Estado
1. **Pública Vazia → Privada Desbloqueada**: Permitido via `POST /api/:room/lock` apenas se não houver metadado prévio e `uploads/<room>` não existir ou estiver vazio.
2. **Pública com Arquivos → Privada**: Proibido (`409 Conflict`).
3. **Privada → Pública Vazia**: Ocorre ao executar `DELETE /api/:room/delete-all` com token válido (remove `uploads/<room>` e `room-meta/<hash>.json`).

## 2. RoomAccessToken (Payload HMAC-SHA256)
- `type`: `'room-access'`
- `room` (`string`): Sala autorizada (token é inválido para qualquer outra sala).
- `exp` (`number`): Timestamp de expiração em ms (ex.: 12 horas).

## 3. DownloadTicket (Payload HMAC-SHA256)
- `type`: `'download-ticket'`
- `room` (`string`): Sala autorizada.
- `filename` (`string`): Arquivo específico autorizado.
- `exp` (`number`): Timestamp de expiração em ms (60 segundos).
