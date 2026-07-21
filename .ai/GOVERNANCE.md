# Governança e Regras Permanentes (GOVERNANCE.md)

Este documento estabelece as políticas corporativas, responsabilidades e regras de governança para a manutenção contínua do repositório **DontFile**.

---

## 1. Política Documental

- **Organização por Camadas:**
  - `/` (Raiz): Apenas arquivos de entrada e acompanhamento humano/IA (`README.md`, `CHANGELOG.md`, `CHANGELOG_AI.md`).
  - `.ai/`: Documentação de governança, contexto, convenções e operações de IA.
  - `docs/`: Documentação técnica, arquitetura, especificações e roadmap.
  - `.meta/`: Artefatos analíticos de auditorias automatizadas.
- **Transparência:** Todo documento deve incluir a classificação de `Confidence` e registrar eventuais validações humanas necessárias.

---

## 2. Política Arquitetural

- **Código como Fonte da Verdade:** O comportamento definido no código-fonte ([../api/server.js](../api/server.js) e `web/src/`) tem precedência sobre qualquer documento.
- **Desacoplamento no Desenvolvimento, Integração no Build:** O backend Node.js e o frontend Angular devem ser mantidos como projetos independentes dentro do monorepo, unificados apenas pelo script `build:deploy`.

---

## 3. Política de Organização e Novos Diretórios

- Proibida a criação aleatória de diretórios de documentação fora das três camadas oficiais (`.ai/`, `docs/`, `.meta/`).
- Novos diretórios no código-fonte (ex: em `web/src/app/shared`) devem seguir estritamente o padrão kebab-case e ser registrados em [CONTEXT.md](CONTEXT.md).

---

## 4. Política de Memória

- Apenas conhecimentos permanentes e limitações técnicas estruturais (registrados em [MEMORY.md](MEMORY.md)) devem ser preservados entre sessões.
- Tarefas temporárias devem ser mantidas em ferramentas de acompanhamento e nunca em `MEMORY.md`.

---

## 5. Responsabilidades Humanas vs. Responsabilidades das IAs

### Responsabilidades Humanas:
- Validar e aprovar mudanças em regras de negócio e infraestrutura de produção.
- Revisar o arquivo [../CHANGELOG_AI.md](../CHANGELOG_AI.md) após alterações realizadas por IAs.
- Garantir a atualização do [../CHANGELOG.md](../CHANGELOG.md) ao lançar novas versões do software.

### Responsabilidades das IAs:
- Respeitar estritamente as diretrizes contidas em [AGENTS.md](AGENTS.md) e [AI_CONVENTIONS.md](AI_CONVENTIONS.md).
- Registrar obrigatoriamente toda alteração efetuada em `CHANGELOG_AI.md`.
- Manter a integridade de todos os links relativos entre documentos em Markdown.

---

## 6. Critérios para Reorganização e Auditorias Futuras

- **Reorganizações Estruturais:** Somente permitidas se demonstrado ganho objetivo em organização, legibilidade ou desempenho, devendo atualizar todos os links cruzados e ser registradas em `CHANGELOG_AI.md`.
- **Auditorias Automatizadas:** Devem gerar novos relatórios na pasta `.meta/` (ex: `.meta/AUDIT.md`, `.meta/METRICS.md`), sem sobrescrever os documentos da camada `docs/` sem justificativa.

---

## Documentos Relacionados

- [BOOTSTRAP_PROJECT.md](BOOTSTRAP_PROJECT.md)
- [AGENTS.md](AGENTS.md)
- [AI_CONVENTIONS.md](AI_CONVENTIONS.md)
- [../CHANGELOG_AI.md](../CHANGELOG_AI.md)

---

## Confidence

### Alta
- Políticas permanentes e responsabilidades validadas no repositório.

### Média
- Nenhuma.

### Baixa
- Nenhuma.

---

## Validação Humana Necessária

- Nenhuma.
