# Contexto Funcional e Estrutura do Projeto (CONTEXT.md)

Este documento descreve o contexto de negócio, arquitetura funcional, modelo de operação e a estrutura detalhada de diretórios do **DontFile**.

---

## 1. Visão de Produto e Regras de Negócio

O **DontFile** é um serviço web de compartilhamento efêmero e anônimo de arquivos, inspirado no *DontPad.com*. 

- **Sem Autenticação:** Não exige cadastro ou login. O nome da sala é definido diretamente na URL (ex: `/minha-sala`).
- **Armazenamento Efêmero:** Os arquivos são salvos na VM no Render (`api/uploads`). Quando o servidor reinicia (a cada deploy ou após 15 min de inatividade), todos os arquivos são permanentemente excluídos.
- **Doações voluntárias via PIX:** Apresentadas através de um modal de apoio ("Apoie este projeto").

---

## 2. Estrutura Detalhada do Projeto

A organização de diretórios do repositório é dividida nas seguintes áreas de responsabilidade:

```
dontfile-angular-monorepo/
├── docs/       # Documentação Técnica e Arquitetural
├── .ai/        # Operações de IA e Governança
├── .meta/      # Artefatos Analíticos de Auditoria
├── api/        # Backend Node.js / Express
└── web/        # Frontend Angular 19 SPA
```

### 2.1. Diretório `docs/`
- **Objetivo:** Armazenar a documentação técnica, especificação funcional e arquitetural do software.
- **Responsabilidade:** Servir como guia definitivo para o desenvolvimento, refatoração e contratos de API.
- **Conteúdo Esperado:** [ARCHITECTURE.md](../docs/ARCHITECTURE.md), [SPEC.md](../docs/SPEC.md), [ROADMAP.md](../docs/ROADMAP.md), [DECISIONS.md](../docs/DECISIONS.md), [PATTERNS.md](../docs/PATTERNS.md), [EXAMPLES.md](../docs/EXAMPLES.md).
- **Relacionamento:** É referenciado pelo `README.md` e consumido por desenvolvedores e IAs.

### 2.2. Diretório `.ai/`
- **Objetivo:** Centralizar os arquivos de orientação para Agentes de IA e governança operacional.
- **Responsabilidade:** Definir regras operacionais, ordem de leitura, manual de convenções e regras de repositório.
- **Conteúdo Esperado:** [BOOTSTRAP_PROJECT.md](BOOTSTRAP_PROJECT.md), [AGENTS.md](AGENTS.md), [AI_CONVENTIONS.md](AI_CONVENTIONS.md), [GOVERNANCE.md](GOVERNANCE.md), [CONTEXT.md](CONTEXT.md), [MEMORY.md](MEMORY.md).
- **Relacionamento:** Atua como o "System Prompt Layer" que orienta qualquer agente de IA ao interagir com o código.

### 2.3. Diretório `.meta/`
- **Objetivo:** Armazenar relatórios de auditorias automatizadas e artefatos analíticos.
- **Responsabilidade:** Manter o histórico de varreduras de código, dependências e métricas sem poluir os documentos permanentes.
- **Conteúdo Esperado:** [AUDIT.md](../.meta/AUDIT.md), [INVENTORY.md](../.meta/INVENTORY.md), [FILE_INDEX.md](../.meta/FILE_INDEX.md), [DEPENDENCY_GRAPH.md](../.meta/DEPENDENCY_GRAPH.md), [METRICS.md](../.meta/METRICS.md), [WORKSPACE_ANALYSIS.md](../.meta/WORKSPACE_ANALYSIS.md).
- **Relacionamento:** Gerado por processos analíticos e consultado durante refatorações.

### 2.4. Diretório `api/`
- **Objetivo:** Código-fonte da aplicação Backend.
- **Responsabilidade:** Fornecer os endpoints da API RESTful para upload, download, listagem e remoção de arquivos, além de servir os estáticos da SPA em produção.
- **Conteúdo Esperado:** `server.js`, `package.json`, diretório `uploads/` (efêmero) e `public/` (build do Angular).

### 2.5. Diretório `web/`
- **Objetivo:** Código-fonte da aplicação Frontend.
- **Responsabilidade:** Interface Single Page Application (SPA) reativa construída em Angular 19.
- **Conteúdo Esperado:** `angular.json`, `package.json`, `proxy.conf.json`, `src/app/home/` (Landing Page) e `src/app/room/` (Sala de Arquivos).

---

## 3. Visão Geral do Ciclo do Projeto

1. **Desenvolvimento Local:** O desenvolvedor executa a API em `localhost:3000` e o Angular CLI em `localhost:4200` (com proxy automático configurado em `web/proxy.conf.json`).
2. **Build de Produção:** O script `build:deploy` compila o Angular (`ng build`) e copia o resultado para `api/public`.
3. **Execução no Render:** O servidor Express serve a API REST em `/api/*` e entrega a SPA compilada em `/` ou `/:room(*)`.

---

## Documentos Relacionados

- [BOOTSTRAP_PROJECT.md](BOOTSTRAP_PROJECT.md)
- [AGENTS.md](AGENTS.md)
- [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- [../docs/SPEC.md](../docs/SPEC.md)

---

## Confidence

### Alta
- Contexto funcional, mapeamento de diretórios e fluxo do sistema validados no código do repositório.

### Média
- Nenhuma.

### Baixa
- Nenhuma.

---

## Validação Humana Necessária

- Nenhuma.
