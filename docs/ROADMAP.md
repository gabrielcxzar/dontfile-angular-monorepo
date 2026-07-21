# Roadmap Técnico e Débitos Técnicos (ROADMAP.md)

Este documento consolida o planejamento de melhorias, correção de débitos técnicos e plano de evolução do **DontFile**, estruturado a partir das evidências registradas no [AUDIT.md](AUDIT.md).

---

## 1. Débitos Técnicos Prioritários (Curto Prazo)

### 1.1. Remoção de Artefatos de Build do Git
- **Problema:** A pasta `api/public/` contém arquivos compilados JS/CSS/HTML (`main-7T3GXEUI.js`, etc.) versionados no repositório.
- **Ação:** Adicionar `api/public/*` ao `.gitignore` (preservando apenas `.gitkeep`) e remover os arquivos compilados do rastreamento Git.

### 1.2. Refatoração da Manipulação Direta do DOM no Angular
- **Problema:** Uso de `document.getElementById()`, `document.createElement('script')` e substituição de nós DOM no `HomeComponent` e `RoomComponent`.
- **Ação:** Refatorar os componentes para utilizar o ciclo de vida do Angular, Data Binding, ViewChild e `Renderer2`.

### 1.3. Eliminação de Duplicação de Código (Modal PIX)
- **Problema:** O código TypeScript, template HTML e CSS do modal PIX estão totalmente duplicados entre `HomeComponent` e `RoomComponent`.
- **Ação:** Criar um componente standalone reutilizável `PixModalComponent` em `web/src/app/shared/components/pix-modal`.

### 1.4. Substituição de CDN Descontinuado (RawGit)
- **Problema:** O script de QR Code é injetado via `https://cdn.rawgit.com/...`, serviço encerrado que gera riscos de disponibilidade.
- **Ação:** Migrar para a biblioteca `qrcode` via NPM ou utilizar CDN estável (`cdnjs` ou `unpkg`).

### 1.5. Correção de Rota Curinga Duplicada
- **Problema:** Em `web/src/app/app.routes.ts`, existem duas definições para o caminho `'**'` (linhas 12 e 15).
- **Ação:** Remover a segunda declaração inalcançável.

### 1.6. Correção de Encoding de Caracteres (UTF-8)
- **Problema:** Textos acentuados corrompidos em arquivos `.ts` (ex: `instÃ¢ncia`, `alert('? Erro...')`).
- **Ação:** Converter a codificação dos arquivos afetados estritamente para UTF-8.

---

## 2. Segurança e Robustez (Médio Prazo)

- **Sanitização de Nomes de Sala e Path Traversal:** Implementar middleware no backend ([api/server.js](../api/server.js)) para higienizar `req.params.room` e `req.params.filename`, prevenindo vulnerabilidades de navegação de diretório (`..`).
- **Proteção contra DoS e Limitação de Taxa (Rate Limiting):** Adicionar `express-rate-limit` para controlar o número de uploads por IP.
- **Substituição de Polling por WebSockets / Server-Sent Events (SSE):** Substituir a requisição `GET` a cada 5 segundos por atualização em tempo real via WebSockets ou SSE.

---

## 3. Evolução de Produto e Arquitetura (Longo Prazo)

- **Limpeza Automática por Tempo de Vida (TTL):** Implementar rotina de expiração automática para excluir salas e arquivos inativos após *X* horas/dias.
- **Provedor de Armazenamento Pluggable (S3 / Cloudflare R2):** Abstrair a camada de armazenamento em disco (`fs`) permitindo alternar para armazenamento em nuvem via variáveis de ambiente.

---

## Documentos Relacionados

- [AUDIT.md](AUDIT.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [DECISIONS.md](DECISIONS.md)
- [README.md](../README.md)

---

## Confidence

### Alta
- Todos os débitos técnicos foram confirmados e mapeados durante a auditoria no código em [AUDIT.md](AUDIT.md).

### Média
- **Inferência:** Prazos e priorização sugeridos com base no impacto na estabilidade e segurança.

### Baixa
- Nenhuma.

---

## Validação Humana Necessária

- Aprovação do desenvolvedor/mantenedor sobre a priorização dos itens do Roadmap.
