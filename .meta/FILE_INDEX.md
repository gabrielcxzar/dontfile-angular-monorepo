# Índice de Arquivos do Repositório (FILE_INDEX.md)

Este documento lista a localização e a finalidade de cada arquivo do repositório **DontFile**.

---

## 1. Diretório Raiz (`/`)

- [../README.md](../README.md) — Portal de apresentação humana do projeto.
- [../CHANGELOG.md](../CHANGELOG.md) — Histórico de versões do software.
- [../CHANGELOG_AI.md](../CHANGELOG_AI.md) — Log auditável de alterações por IAs.
- [../render.yaml](../render.yaml) — Manifesto de deploy do Render.
- [../.gitignore](../.gitignore) — Regras de descarte do Git.

---

## 2. Camada `.ai/` (Governança & IAs)

- [../.ai/BOOTSTRAP_PROJECT.md](../.ai/BOOTSTRAP_PROJECT.md) — Guia de onboarding e inicialização.
- [../.ai/AGENTS.md](../.ai/AGENTS.md) — Diretrizes para Agentes de IA e matriz de compatibilidade.
- [../.ai/AI_CONVENTIONS.md](../.ai/AI_CONVENTIONS.md) — Manual operacional estrito de convenções para IAs.
- [../.ai/GOVERNANCE.md](../.ai/GOVERNANCE.md) — Políticas de governança e repositório.
- [../.ai/CONTEXT.md](../.ai/CONTEXT.md) — Contexto funcional e mapa detalhado de diretórios.
- [../.ai/MEMORY.md](../.ai/MEMORY.md) — Memória técnica permanente.

---

## 3. Camada `docs/` (Técnica & Arquitetura)

- [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) — Visão geral da arquitetura e diagramas.
- [../docs/SPEC.md](../docs/SPEC.md) — Especificação técnica e contratos de API HTTP.
- [../docs/ROADMAP.md](../docs/ROADMAP.md) — Débitos técnicos e plano de evolução.
- [../docs/DECISIONS.md](../docs/DECISIONS.md) — Registro de Decisões Arquiteturais (ADRs).
- [../docs/PATTERNS.md](../docs/PATTERNS.md) — Padrões de código e convenções Angular/Express.
- [../docs/EXAMPLES.md](../docs/EXAMPLES.md) — Snippets e exemplos de chamadas cURL.

---

## 4. Camada `.meta/` (Artefatos Analíticos)

- [AUDIT.md](AUDIT.md) — Relatório de auditoria técnica inicial.
- [INVENTORY.md](INVENTORY.md) — Inventário de módulos, componentes e ativos.
- [FILE_INDEX.md](FILE_INDEX.md) — Este documento de índice completo de caminhos.
- [DEPENDENCY_GRAPH.md](DEPENDENCY_GRAPH.md) — Grafo de dependências.
- [METRICS.md](METRICS.md) — Métricas de volume e complexidade de código.
- [WORKSPACE_ANALYSIS.md](WORKSPACE_ANALYSIS.md) — Análise de acoplamento do monorepo.

---

## 5. Subprojeto API (`/api`)

- [../api/server.js](../api/server.js) — Ponto de entrada do backend Node.js/Express.
- [../api/package.json](../api/package.json) — Dependências do backend.
- `api/uploads/` — Diretório efêmero de arquivos enviados.
- `api/public/` — Arquivos estáticos compilados da SPA Angular.

---

## 6. Subprojeto Web (`/web`)

- [../web/package.json](../web/package.json) — Dependências do frontend.
- [../web/angular.json](../web/angular.json) — Configurações do Angular CLI.
- [../web/proxy.conf.json](../web/proxy.conf.json) — Proxy local dev-server.
- [../web/src/app/app.component.ts](../web/src/app/app.component.ts) — Componente raiz Angular.
- [../web/src/app/home/home.component.ts](../web/src/app/home/home.component.ts) — Componente Home.
- [../web/src/app/room/room.component.ts](../web/src/app/room/room.component.ts) — Componente Room.

---

## Confidence

### Alta
- Índice validado diretamente com a árvore de diretórios do repositório.

### Média
- Nenhuma.

### Baixa
- Nenhuma.

---

## Validação Humana Necessária

- Nenhuma.
