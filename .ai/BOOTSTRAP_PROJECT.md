# Guia de Inicialização e Onboarding (BOOTSTRAP_PROJECT.md)

Este documento foi elaborado para fornecer uma orientação rápida, transparente, agnóstica de ferramentas (compatível com Antigravity, Claude, ChatGPT, Cursor, Windsurf, Codex ou desenvolvedores humanos), permitindo o onboarding imediato e a operação segura do projeto **DontFile**.

---

## Objetivo do Projeto

O **DontFile** é uma aplicação de transferência de arquivos simples, rápida, temporária e anônima (sem necessidade de cadastro ou autenticação), inspirada no DontPad. O usuário especifica uma sala dinâmica na URL (ex: `/minha-sala`), faz o upload de arquivos e compartilha o link com terceiros.

---

## Arquitetura Documental e Organização do Diretório

A documentação do projeto adota o padrão estrutural corporativo para desenvolvimento assistido por IA:

```
dontfile-angular-monorepo/
├── README.md                  # Ponto de entrada humano principal
├── CHANGELOG.md               # Histórico de versões do software para humanos
├── CHANGELOG_AI.md            # Log auditável de alterações realizadas por IAs
│
├── docs/                      # Documentação Técnica e Arquitetural
│   ├── ARCHITECTURE.md        # Arquitetura de sistema, monorepo e diagramas
│   ├── SPEC.md                # Especificação técnica e contratos de API HTTP
│   ├── ROADMAP.md             # Débitos técnicos e plano de melhorias
│   ├── DECISIONS.md           # Registro histórico de decisões (ADRs)
│   ├── PATTERNS.md            # Padrões de código, Angular e Express
│   └── EXAMPLES.md            # Exemplos cURL e snippets de código
│
├── .ai/                       # Governança e Operações de IA (System Prompt Layer)
│   ├── BOOTSTRAP_PROJECT.md   # Guia de Onboarding e inicialização (este arquivo)
│   ├── AGENTS.md              # Instruções para Agentes e Matriz de Compatibilidade
│   ├── AI_CONVENTIONS.md      # Manual operacional estrito para qualquer IA
│   ├── GOVERNANCE.md          # Políticas permanentes e regras do projeto
│   ├── CONTEXT.md             # Contexto funcional e estrutura do repositório
│   └── MEMORY.md              # Memória técnica permanente e limitações
│
└── .meta/                     # Artefatos Analíticos de Auditoria Automatizada
    ├── AUDIT.md               # Relatório de auditoria técnica inicial
    ├── INVENTORY.md           # Inventário de arquivos, ativos e componentes
    ├── FILE_INDEX.md          # Índice completo de caminhos e arquivos
    ├── DEPENDENCY_GRAPH.md    # Grafo de dependências backend/frontend
    ├── METRICS.md             # Métricas de código e linhas por módulo
    └── WORKSPACE_ANALYSIS.md  # Análise de acoplamento do monorepo
```

---

## Ordem Recomendada de Leitura para IAs e Desenvolvedores

Para obter uma compreensão completa e rápida do projeto, siga esta sequência estrita:

1. [README.md](../README.md) — Visão geral e execução local.
2. [BOOTSTRAP_PROJECT.md](BOOTSTRAP_PROJECT.md) — Este documento de onboarding e arquitetura documental.
3. [AGENTS.md](AGENTS.md) — Instruções operacionais e restrições para IAs.
4. [AI_CONVENTIONS.md](AI_CONVENTIONS.md) — Manual de convenções estritas de operação de IAs.
5. [GOVERNANCE.md](GOVERNANCE.md) — Políticas de governança e contribuição.
6. [CONTEXT.md](CONTEXT.md) — Visão funcional, regras de negócio e mapa de diretórios.
7. [MEMORY.md](MEMORY.md) — Memória técnica permanente (ex: efemeridade no Render).
8. [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) — Topologia monorepo, fluxos e diagramas.
9. [../docs/SPEC.md](../docs/SPEC.md) — Especificação técnica e contratos dos endpoints REST.
10. [../docs/PATTERNS.md](../docs/PATTERNS.md) — Padrões de componentes Angular e rotas Express.
11. [../docs/EXAMPLES.md](../docs/EXAMPLES.md) — Exemplos cURL e snippets TypeScript.
12. [../docs/DECISIONS.md](../docs/DECISIONS.md) — Registro de Decisões Arquiteturais (ADRs).
13. [../docs/ROADMAP.md](../docs/ROADMAP.md) — Débitos técnicos e roadmap.
14. [../.meta/AUDIT.md](../.meta/AUDIT.md) — Relatório de auditoria técnica inicial.

---

## Estratégias Operacionais

### Estratégia para Compreender o Projeto
- **Fonte da Verdade:** O código fonte ([../api/server.js](../api/server.js) e componentes em `web/src/app/`) é sempre a fonte máxima da verdade.
- **Leitura da Camada `.ai/`:** Leia `BOOTSTRAP_PROJECT.md`, `AGENTS.md` e `CONTEXT.md` para entender as regras do projeto antes de propor mudanças.

### Estratégia para Validar Informações
- Confirme rotas inspecionando [../api/server.js](../api/server.js).
- Confirme contratos de API com [../docs/SPEC.md](../docs/SPEC.md).
- Toda informação não confirmada diretamente no código deve ser rotulada como **Inferência**.

### Estratégia para Atualizar Documentação
- Mantenha a separação entre `.ai/` (operações), `docs/` (técnico/arquitetural) e `.meta/` (analítico).
- Sempre verifique e atualize links relativos entre os documentos afetados.

### Estratégia para Preservar Conhecimento
- Nunca remova informações históricas de [../docs/DECISIONS.md](../docs/DECISIONS.md) ou [MEMORY.md](MEMORY.md).
- Documente novos aprendizados persistentes em `MEMORY.md`.

### Estratégia para Registrar Decisões
- Ao tomar uma decisão arquitetural significativa, adicione uma nova entrada em [../docs/DECISIONS.md](../docs/DECISIONS.md) contendo Data, Contexto, Decisão, Motivação, Alternativas Consideradas e Impacto.

### Estratégia para Atualizar Memória
- Registre fatos técnicos fixos (ex: comportamento da VM Render) em [MEMORY.md](MEMORY.md). Nunca inclua tarefas temporárias.

---

## Checklists Operacionais

### Checklist Inicial
- [ ] Ler [README.md](../README.md) e [BOOTSTRAP_PROJECT.md](BOOTSTRAP_PROJECT.md)
- [ ] Ler [AGENTS.md](AGENTS.md), [AI_CONVENTIONS.md](AI_CONVENTIONS.md) e [GOVERNANCE.md](GOVERNANCE.md)
- [ ] Consultar [CONTEXT.md](CONTEXT.md) e [MEMORY.md](MEMORY.md)
- [ ] Analisar [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) e [../docs/SPEC.md](../docs/SPEC.md)
- [ ] Consultar [../.meta/AUDIT.md](../.meta/AUDIT.md) para ciência das vulnerabilidades e débitos

### Checklist Antes de Finalizar
- [ ] Código compilando/testado sem regressões
- [ ] Registro de alterações por IA gravado em [../CHANGELOG_AI.md](../CHANGELOG_AI.md)
- [ ] Novas ADRs gravadas em [../docs/DECISIONS.md](../docs/DECISIONS.md) se aplicável
- [ ] Conhecimento permanente gravado em [MEMORY.md](MEMORY.md)
- [ ] Links navegáveis relativos testados e validados
- [ ] Nenhuma informação útil removida sem justificativa

---

## Confidence

### Alta
- Estrutura corporativa de documentação, regras de onboarding e caminhos de arquivos validados no repositório.

### Média
- Nenhuma.

### Baixa
- Nenhuma.

---

## Validação Humana Necessária

- Nenhuma.
