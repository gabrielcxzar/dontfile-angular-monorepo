# Guia de Operação para Agentes de IA (AGENTS.md)

Este documento fornece instruções técnicas, restrições e diretrizes operacionais para qualquer agente de Inteligência Artificial (ex: Antigravity, Claude, ChatGPT, Cursor, Windsurf, Copilot, Codex) atuando no repositório **DontFile**.

---

## 1. Responsabilidades

- **Qualidade do Código:** Escrever código limpo, seguro, modular e alinhado aos padrões estabelecidos em [../docs/PATTERNS.md](../docs/PATTERNS.md).
- **Rastreabilidade e Log:** Registrar obrigatoriamente toda e qualquer intervenção realizada no arquivo [../CHANGELOG_AI.md](../CHANGELOG_AI.md).
- **Manutenção de Links e Documentação:** Garantir que todas as referências cruzadas em Markdown permaneçam ativas e válidas após qualquer movimentação ou edição.

---

## 2. Restrições Estritas

- **Proibido Mascarar Sintomas:** Não engula exceções com `try/catch` vazios nem substitua erros de API por dados fictícios (dummy data).
- **Proibido Alterar Contratos sem Atualizar Chamadas:** Ao modificar assinaturas em rotas da API em [../api/server.js](../api/server.js), atualize obrigatoriamente todas as chamadas `HttpClient` correspondentes em [../web/src/app/room/room.component.ts](../web/src/app/room/room.component.ts).
- **Proibido Excluir Testes:** Não remova ou comente testes que falharem (`*.spec.ts`). Corrija a implementação subjacente.
- **Proibido Injetar Artefatos de Build no Git:** Não commite o conteúdo da pasta `web/dist` ou arquivos estáticos gerados manualmente em `api/public`.

---

## 3. Prioridades Técnicas

1. **Segurança e Sanitização:** Corrigir os riscos de Path Traversal e sanitização de nomes de salas e arquivos em [../api/server.js](../api/server.js).
2. **Refatoração Anti-DOM no Angular:** Substituir manipulações diretas do DOM (`document.getElementById`, `document.createElement`) por bindings reativos e `Renderer2` do Angular.
3. **Eliminação de Código Duplicado:** Reutilizar o componente de Modal PIX e QR Code entre a Home e a Room.

---

## 4. Boas Práticas Operacionais

- Consulte [AI_CONVENTIONS.md](AI_CONVENTIONS.md) para as regras de criação de arquivos, ediçoes e convenções de nomenclatura.
- Antes de diagnosticar um erro de execução ou build, leia os logs na íntegra.

---

## 5. Agent Compatibility

### Documentos a Serem Lidos Primeiro (Ordem de Prioridade):
1. `BOOTSTRAP_PROJECT.md` (Visão geral de onboarding e ordem de leitura)
2. `AGENTS.md` (Restrições e responsabilidades)
3. `AI_CONVENTIONS.md` (Manual de convenções operacionais de IAs)
4. `GOVERNANCE.md` (Políticas permanentes do repositório)
5. `CONTEXT.md` (Contexto funcional e organização de pastas)
6. `../docs/ARCHITECTURE.md` (Topologia e fluxos do sistema)
7. `../docs/SPEC.md` (Contratos formais de endpoints REST)

### Como Localizar Rápidamente Qualquer Informação:
- **Rotas e Enpoints:** [../docs/SPEC.md](../docs/SPEC.md) e [../docs/EXAMPLES.md](../docs/EXAMPLES.md).
- **Decisões Técnicas Antigas:** [../docs/DECISIONS.md](../docs/DECISIONS.md).
- **Limitações do Servidor Render:** [MEMORY.md](MEMORY.md).
- **Relatório de Vulnerabilidades:** [../.meta/AUDIT.md](../.meta/AUDIT.md).
- **Inventário Completo de Arquivos:** [../.meta/INVENTORY.md](../.meta/INVENTORY.md) e [../.meta/FILE_INDEX.md](../.meta/FILE_INDEX.md).

### Fluxo Recomendado para Novos Agentes:
1. Ler o prompt do usuário.
2. Inspecionar `.ai/AGENTS.md` e `.ai/AI_CONVENTIONS.md`.
3. Consultar a especificação técnica em `docs/SPEC.md` ou `docs/ARCHITECTURE.md`.
4. Executar as alterações necessárias respeitando as restrições.
5. Registrar a alteração em `CHANGELOG_AI.md`.
6. Validar a integridade do repositório e responder com o relatório.

---

## Documentos Relacionados

- [BOOTSTRAP_PROJECT.md](BOOTSTRAP_PROJECT.md)
- [AI_CONVENTIONS.md](AI_CONVENTIONS.md)
- [GOVERNANCE.md](GOVERNANCE.md)
- [../CHANGELOG_AI.md](../CHANGELOG_AI.md)

---

## Confidence

### Alta
- Restrições, matriz de compatibilidade e mapeamento de arquivos validados diretamente com a base de código.

### Média
- Nenhuma.

### Baixa
- Nenhuma.

---

## Validação Humana Necessária

- Nenhuma.
