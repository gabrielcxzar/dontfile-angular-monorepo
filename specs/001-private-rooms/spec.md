# Feature Specification: Salas Privadas Protegidas por Senha

**Feature Branch**: `001-private-rooms`  
**Created**: 2026-11-13  
**Status**: Approved  
**Input**: User description: "Sala privada no Dontfile protegida por uma senha única por sala, definida já dentro da sala somente quando estiver vazia."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Definir Senha em Sala Vazia (Priority: P1)

Um usuário acessa uma sala pública vazia (pela Home ou digitando a URL diretamente) e decide torná-la privada clicando em **"Tornar privada"** no cabeçalho da sala e informando uma senha única.

**Why this priority**: É o ponto de entrada que transforma uma sala padrão em sala privada sem alterar a simplicidade da página inicial (`/`).

**Independent Test**: Acessar uma sala vazia, enviar requisição/ação para definir senha, confirmar que a sala passa a exibir estado privado e permanece acessível na mesma sessão.

**Acceptance Scenarios**:

1. **Given** uma sala pública que não existe no disco ou está sem arquivos, **When** o usuário aciona "Tornar privada" e informa uma senha válida (mínimo 4 caracteres), **Then** a sala passa a exigir senha para novos acessos e a sessão atual recebe token de acesso válido imediatamente.
2. **Given** uma sala pública que já contém pelo menos 1 arquivo, **When** alguém tenta defini-la como privada, **Then** a API recusa com `409 Conflict` e o frontend não exibe a opção como disponível.
3. **Given** uma sala que já é privada, **When** alguém tenta definir nova senha sem autorização via endpoint de lock, **Then** a API recusa com `409 Conflict`.

---

### User Story 2 - Bloqueio e Desbloqueio de Sala Privada (Priority: P1)

Um segundo usuário (ou outra aba/janela anônima) acessa a URL de uma sala privada. O sistema bloqueia a visualização de arquivos e uploads até que a senha correta seja informada.

**Why this priority**: Sem o bloqueio efetivo na API e na UI, a privacidade da sala não existe.

**Independent Test**: Abrir sala privada em sessão sem token, verificar `401` ao consultar arquivos e desbloquear após informar a senha correta.

**Acceptance Scenarios**:

1. **Given** uma sala privada e um cliente sem token válido, **When** o cliente acessa a sala, **Then** a API retorna `401 Unauthorized` para listagem/upload/download/exclusão, o polling é pausado e a UI exibe apenas o formulário de senha.
2. **Given** o formulário de senha de uma sala privada, **When** o usuário informa a senha correta, **Then** a API valida o hash com `timingSafeEqual`, retorna um token assinado da sala, e a UI passa a listar arquivos, permitir upload, download e exclusão.
3. **Given** o formulário de senha de uma sala privada, **When** o usuário informa senha incorreta, **Then** a API retorna `401 Unauthorized` e após tentativas excessivas aplica limitação (`429 Too Many Requests`).

---

### User Story 3 - Operações Autenticadas, Download Seguro e Limpeza Total (Priority: P2)

Dentro de uma sala privada desbloqueada, o usuário faz upload, baixa arquivos (até 100MB), exclui arquivos individuais ou limpa a sala inteira (`Limpar Sala`), removendo também os metadados de bloqueio ao limpar tudo.

**Why this priority**: Garante paridade completa com as funcionalidades existentes do DontFile e evita bloqueios órfãos após limpeza.

**Independent Test**: Com token válido, executar upload, gerar ticket e baixar arquivo, deletar arquivo e acionar `delete-all`, verificando que a sala volta a ser pública e vazia.

**Acceptance Scenarios**:

1. **Given** uma sala privada desbloqueada, **When** o usuário baixa um arquivo, **Then** o navegador realiza download direto com ticket temporário assinado (sem expor arquivos sem autenticação nem carregar arquivos grandes inteiramente em memória no frontend).
2. **Given** uma sala privada desbloqueada, **When** o usuário executa `Limpar Sala` (`delete-all`), **Then** todos os arquivos e o registro de senha da sala são removidos e o token local é invalidado.
3. **Given** qualquer requisição com segmentos `..` ou tentativa de Path Traversal no nome da sala ou do arquivo, **When** a API processa a rota, **Then** a API rejeita com `400 Bad Request`.

---

### Edge Cases

- Tentativa de definir senha vazia, só com espaços ou menor que 4 caracteres (`400 Bad Request`).
- Tentativa de baixar ou listar diretamente via `/api/:room/...` sem token ou com token assinado para **outra** sala (`401 Unauthorized`).
- Tentativa de `POST /api/:room/upload` com `room` privado e sem token deve ser rejeitada **antes** do Multer gravar o arquivo em disco.
- Arquivo de metadados nunca pode ficar dentro da listagem visível de `uploads/<room>/` nem ser baixável como arquivo da sala.
- Ao reiniciar o container efêmero no Render, disco e metadados são limpos em conjunto (sem bloqueios órfãos sem arquivos ou vice-versa).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A página inicial (`HomeComponent`) MUST permanecer inalterada quanto ao fluxo de criação/entrada em salas.
- **FR-002**: O sistema MUST permitir definir uma senha única por sala via endpoint dedicado apenas quando a sala ainda for pública e estiver vazia.
- **FR-003**: O sistema MUST armazenar apenas hash derivado com `scrypt` e salt aleatório por sala em diretório isolado (`api/room-meta/`), nunca em texto plano e nunca dentro de `api/uploads/`.
- **FR-004**: O sistema MUST exigir token válido da sala em todas as operações protegidas (`files`, `upload`, `download`, `delete`, `delete-all`) quando a sala for privada.
- **FR-005**: O sistema MUST suportar download nativo via navegador em salas privadas usando ticket temporário assinado de curta duração emitido apenas para portadores de token válido da sala.
- **FR-006**: O sistema MUST aplicar sanitização estrita contra Path Traversal em `room` e `filename` em todas as rotas da API.
- **FR-007**: O sistema MUST aplicar rate limiting nas tentativas de desbloqueio (`unlock`) por IP e sala.
- **FR-008**: O frontend MUST pausar o polling automático enquanto a sala estiver bloqueada e retomá-lo automaticamente após desbloqueio bem-sucedido.
- **FR-009**: A ação `delete-all` MUST remover tanto os arquivos quanto os metadados de privacidade da sala.

### Key Entities

- **RoomLockMetadata**: Metadado persistido em disco (`api/room-meta/<sha256(room)>.json`) contendo `room`, `salt`, `passwordHash`, `createdAt`.
- **RoomAccessToken**: Token HMAC-SHA256 stateless assinado pelo servidor para acesso a uma sala específica (`room`, `exp`).
- **DownloadTicket**: Token HMAC-SHA256 de curta duração vinculado a `(room, filename, exp)` para autorizar `GET /api/:room/download/:filename`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Nenhuma rota de API permite acesso a arquivos ou metadados de sala privada sem token válido ou via Path Traversal (100% coberto por testes automatizados no backend).
- **SC-002**: Fluxo completo de trancar sala vazia, bloquear novo acesso, desbloquear com senha, enviar/baixar/deletar arquivo e limpar sala funciona sem erros no build e testes de `api/` e `web/`.
- **SC-003**: A página inicial (`/`) mantém exatamente o mesmo fluxo e elementos para salas públicas sem adicionar fricção.

## Assumptions

- O armazenamento continua local e efêmero no servidor Express (sem banco de dados externo), coerente com `.ai/MEMORY.md`.
- Salas privadas suportam o mesmo formato de rota `:room(*)` sanitizado (normalizando barras e bloqueando `.`, `..` e segmentos vazios).
- O segredo de assinatura HMAC usa `process.env.ROOM_AUTH_SECRET` quando definido ou um segredo aleatório gerado na inicialização do processo.
