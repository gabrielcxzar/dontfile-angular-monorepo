# DontFile

Um serviço de transferência de arquivos simples, rápido, efêmero e anônimo, inspirado no DontPad. Crie uma sala, arraste seus arquivos e compartilhe o link.

**Link do projeto ao vivo:** [https://dontfile.com.br/](https://dontfile.com.br/)

---

## Sobre o Projeto

O objetivo do **DontFile** é oferecer uma ferramenta de transferência de arquivos sem atrito: sem login, sem cadastro e sem anúncios. O usuário acessa o site, digita o nome de uma sala (que pode ser um subdiretório como `/projeto/cliente-final`) e pode começar a fazer uploads imediatamente.

> [!WARNING]
> **Aviso de Armazenamento Efêmero:**
> Este projeto foi desenvolvido para transferência temporária e está hospedado no plano gratuito do Render. O sistema de arquivos da VM é **efêmero**. Todos os arquivos enviados são excluídos quando o serviço reinicia (a cada novo deploy ou após 15 minutos de inatividade do servidor).

---

## Organização do Projeto

O repositório segue o Padrão Corporativo de Desenvolvimento Assistido por Inteligência Artificial, estruturado em três camadas bem definidas:

- **`docs/` (Documentação Técnica e Arquitetural):** Contém as especificações formais de endpoints REST, diagramas de arquitetura, decisões técnicas (ADRs), padrões de código, snippets e o roadmap.
- **`.ai/` (Governança e Operações de IA):** Atua como a camada "System Prompt Layer" do repositório, contendo os guias de onboarding agnósticos, instruções para agentes de IA, convenções operacionais, governança e conhecimento permanente do projeto.
- **`.meta/` (Artefatos Analíticos de Auditoria):** Concentra os relatórios de auditorias automatizadas, inventário de ativos, índice completo de arquivos, grafos de dependência e métricas do workspace.

---

## Dependências e Tecnologias

- **Backend:** Node.js (>= 18.0.0), Express.js (v4.18.2), Multer (v1.4.5-lts.1).
- **Frontend:** Angular 19 (v19.2.0), TypeScript (v5.7.2), RxJS (v7.8.0), FontAwesome 6.5.1, Google Fonts (Poppins).
- **Build / Deploy:** Angular CLI 19, `rimraf`, `ncp`, Render PaaS (`render.yaml`).

---

## Como Rodar Localmente

Para rodar o ambiente de desenvolvimento local, você precisará de dois terminais:

### 1. Iniciar o Backend (API)
```bash
cd api
npm install
npm run dev
# A API estará rodando em http://localhost:3000
```

### 2. Iniciar o Frontend (Angular)
```bash
cd web
npm install
npm start
# O app Angular abrirá em http://localhost:4200 e fará proxy das chamadas /api para o localhost:3000
```

---

## Documentação

Toda a base de conhecimento do projeto está estruturada em links navegáveis e interconectados:

### Entradas Principais e logs (`/`)
- [README.md](README.md) — Apresentação principal para humanos (este arquivo).
- [CHANGELOG.md](CHANGELOG.md) — Histórico de versões do software.
- [CHANGELOG_AI.md](CHANGELOG_AI.md) — Log auditável de alterações realizadas por IAs.

### Governança e Operações de IA (`.ai/`)
- [Guia de Inicialização e Onboarding](.ai/BOOTSTRAP_PROJECT.md)
- [Diretrizes para Agentes de IA](.ai/AGENTS.md)
- [Manual de Convenções Operacionais de IAs](.ai/AI_CONVENTIONS.md)
- [Políticas de Governança do Repositório](.ai/GOVERNANCE.md)
- [Contexto Funcional e Mapa do Repositório](.ai/CONTEXT.md)
- [Memória Técnica Permanente](.ai/MEMORY.md)

### Arquitetura e Especificações Técnicas (`docs/`)
- [Arquitetura do Sistema e Diagramas](docs/ARCHITECTURE.md)
- [Especificação Técnica e Contratos de API](docs/SPEC.md)
- [Roadmap e Débitos Técnicos](docs/ROADMAP.md)
- [Registro de Decisões Arquiteturais (ADRs)](docs/DECISIONS.md)
- [Padrões de Código e Design](docs/PATTERNS.md)
- [Exemplos de Chamadas cURL e Snippets](docs/EXAMPLES.md)

### Artefatos Analíticos e Auditorias (`.meta/`)
- [Relatório de Auditoria Técnica Inicial](.meta/AUDIT.md)
- [Inventário Completo de Módulos e Componentes](.meta/INVENTORY.md)
- [Índice Geral de Arquivos do Repositório](.meta/FILE_INDEX.md)
- [Grafo de Dependências de Runtime e Pacotes](.meta/DEPENDENCY_GRAPH.md)
- [Métricas de Código e Linhas por Módulo](.meta/METRICS.md)
- [Análise de Acoplamento do Monorepo](.meta/WORKSPACE_ANALYSIS.md)

---

## Confidence

### Alta
- Comandos de instalação, estrutura corporativa e especificações validadas no código-fonte e diretórios do monorepo.

### Média
- Nenhuma.

### Baixa
- Nenhuma.

---

## Validação Humana Necessária

- Nenhuma.
