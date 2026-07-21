# Convenções Operacionais para Agentes de IA (AI_CONVENTIONS.md)

Este documento define o comportamento operacional padrão de qualquer Inteligência Artificial atuando no projeto **DontFile**. Funciona como um manual estrito de boas práticas e políticas de edição/manutenção.

---

## 1. Convenções de Documentação

- **Formato:** Todo documento deve ser escrito em Markdown estrito (`.md`).
- **Idioma:** Documentos de governança e explicações técnicas em Português do Brasil (pt-BR). Identificadores no código em Inglês.
- **Seção de Encerramento Obrigatória:** Todo arquivo `.md` no repositório DEVE obrigatoriamente finalizar com as seções `## Confidence` (com subclassificações Alta, Média e Baixa) e `## Validação Humana Necessária`.

---

## 2. Convenções de Nomenclatura

- **Subpastas de Documentação:** Nomes de pastas em minúsculo com hífen ou ponto prefixado (ex: `.ai/`, `docs/`, `.meta/`).
- **Documentos de Governança e Arquitetura:** Nomes em maiúsculo (ex: `BOOTSTRAP_PROJECT.md`, `SPEC.md`, `ARCHITECTURE.md`).
- **Arquivos Backend Node.js:** camelCase (ex: `server.js`).
- **Arquivos Frontend Angular:** kebab-case com sufixo do tipo (ex: `home.component.ts`, `room.component.css`).

---

## 3. Convenções para Criação e Edição de Arquivos

- **Criação de Novos Arquivos de Documentação:**
  - **Documentos Analíticos de Auditoria/Métricas:** Salvar obrigatoriamente em `.meta/`.
  - **Documentos de Especificação Técnica/Arquitetural:** Salvar obrigatoriamente em `docs/`.
  - **Documentos de Governança/Regras de IA:** Salvar obrigatoriamente em `.ai/`.
- **Edição de Arquivos Existentes:**
  - Preferir edições pontuais direcionadas em vez de sobrescrever arquivos inteiros.
  - Preservar todo o conhecimento e histórico prévio.

---

## 4. Gatilhos de Atualização (Quando Atualizar O Que)

### Quando Atualizar `MEMORY.md` (`.ai/MEMORY.md`):
- Sempre que for descoberto ou alterado um fato técnico permanente sobre a infraestrutura (ex: comportamento da VM Render, caminhos do `multer`, proxies de desenvolvimento local).
- **Quando NÃO atualizar:** Para registrar afazeres temporários ou logs de depuração momentâneos.

### Quando Atualizar `DECISIONS.md` (`docs/DECISIONS.md`):
- Sempre que for tomada uma nova Decisão Arquitetural (ADR) relevante que altere a estrutura, banco de dados, bibliotecas principais ou estratégias de deploy.
- **Regra Imutável:** Nunca apagar ADRs passadas.

### Quando Atualizar `CHANGELOG_AI.md` (`/CHANGELOG_AI.md`):
- **OBRIGATÓRIO:** Toda e qualquer sessão ou intervenção de IA que modifique, crie, mova ou exclua arquivos no repositório DEVE registrar uma nova entrada em `CHANGELOG_AI.md` contendo Data, Agente, Modelo, Objetivo, Arquivos Modificados, Resumo Técnico, Motivação, Impacto, Riscos e Necessidade de Validação Humana.

### Quando Criar Novos Documentos:
- Somente quando surgir um novo domínio técnico amplo que não se enquadre na estrutura corporativa estabelecida (`docs/`, `.ai/`, `.meta/`).

### Quando NÃO Criar Novos Documentos:
- Não crie novos documentos para responder a perguntas investigatórias de uso único. Responda diretamente no chat.
- Não crie documentos duplicados contendo informações que já pertencem a `SPEC.md`, `ARCHITECTURE.md` ou `GOVERNANCE.md`.

---

## 5. Políticas de Qualidade e Manutenção

- **Política para Evitar Duplicações:** Nunca copie e cole trechos longos de código nos documentos. Use snippets pontuais em `docs/EXAMPLES.md` e referencie os caminhos dos arquivos de código.
- **Política para Informações Inferidas:** Qualquer informação que não possa ser confirmada diretamente inspecionando o código deve ser explicitamente marcada como **Inferência**.
- **Política de Rastreabilidade:** Sempre cite o caminho relativo exato de arquivos, métodos ou linhas de código (ex: `api/server.js`, `web/src/app/home/home.component.ts`).
- **Política de Referências entre Documentos:** Mantenha a rede de links navegáveis sempre atualizada. Ao mover qualquer documento, auditores de IA devem verificar e corrigir todos os links relativos do repositório.
- **Política para Reorganização Futura:** Reorganizações estruturais só são permitidas se trouxerem ganho técnico claro, devendo ser aprovadas e refletidas imediatamente em `BOOTSTRAP_PROJECT.md` e `AGENTS.md`.

---

## Documentos Relacionados

- [AGENTS.md](AGENTS.md)
- [GOVERNANCE.md](GOVERNANCE.md)
- [BOOTSTRAP_PROJECT.md](BOOTSTRAP_PROJECT.md)
- [../CHANGELOG_AI.md](../CHANGELOG_AI.md)

---

## Confidence

### Alta
- Regras operacionais, convenções e políticas de governança validadas diretamente para a base de código do DontFile.

### Média
- Nenhuma.

### Baixa
- Nenhuma.

---

## Validação Humana Necessária

- Nenhuma.
