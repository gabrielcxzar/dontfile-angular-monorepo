# Registro de Decisões Arquiteturais (DECISIONS.md)

Este documento registra o histórico imutável de Decisões Arquiteturais (ADRs — Architecture Decision Records) tomadas no desenvolvimento do **DontFile**.

---

## ADR-001: Adição da Estrutura Monorepo (Node.js + Angular)

- **Data:** 2026-01-10 (**Inferência** baseada no histórico de criação do projeto)
- **Contexto:** Necessidade de construir um frontend rico e reativo junto a um backend simples para gestão de upload de arquivos.
- **Decisão:** Organizar o projeto como um monorepo contendo `/api` (Express.js) e `/web` (Angular 19 SPA).
- **Motivação:** Manter o backend e o frontend no mesmo repositório facilita o controle de versão e simplifica o pipeline de deploy em plataformas como o Render.
- **Alternativas Consideradas:**
  - Aplicação tradicional unificada com server-side rendering (EJS/Pug).
  - Repositórios Git separados para backend e frontend.
- **Impacto:** Simplificação no deploy; necessidade de scripts de cópia (`build:deploy`) para servimento integrado em produção.

---

## ADR-002: Servimento Estático Integrado via Express em Produção

- **Data:** 2026-01-12 (**Inferência**)
- **Contexto:** O plano gratuito do Render limita a quantidade de serviços web ativos simultaneamente.
- **Decisão:** Compilar a aplicação Angular e copiar os estáticos (`dist/dontfile-web/browser`) para `api/public`, permitindo que o servidor Express sirva tanto a API quanto a SPA estática.
- **Motivação:** Reduzir os custos de hospedagem rodando toda a aplicação sob uma única instância (Web Service) no Render.
- **Alternativas Consideradas:**
  - Deploy separado do frontend na Vercel/Netlify e backend no Render.
- **Impacto:** Dependência entre o build do Angular e a inicialização da API Node.js; roteamento coringa no Express (`app.get('/:room(*)', ...)`) para dar suporte à SPA.

---

## ADR-003: Armazenamento Efêmero sem Banco de Dados

- **Data:** 2026-01-15 (**Inferência**)
- **Contexto:** O projeto visa ser um serviço temporário, anônimo e sem atrito para compartilhamento rápido de arquivos.
- **Decisão:** Armazenar os arquivos diretamente no sistema de arquivos local (`api/uploads/<roomName>`) utilizando `fs` e `multer`, sem utilizar banco de dados relacional ou NoSQL.
- **Motivação:** Eliminar custos de banco de dados e manter a arquitetura extremamente simples e de baixo consumo de recursos.
- **Alternativas Consideradas:**
  - Armazenamento em nuvem (Amazon S3 / Supabase) com banco de dados PostgreSQL.
- **Impacto:** Todos os arquivos são efêmeros e apagados quando o servidor Render reinicia (após 15 minutos de inatividade ou em deploys). A aplicação precisa avisar explicitamente os usuários sobre o risco de perda de dados.

---

## ADR-004: Adoção de Standalone Components no Angular 19

- **Data:** 2026-02-01 (**Inferência**)
- **Contexto:** Modernização do frontend utilizando a versão mais recente do Angular.
- **Decisão:** Desenvolver todos os componentes do frontend (`AppComponent`, `HomeComponent`, `RoomComponent`) como Standalone Components.
- **Motivação:** Simplificar a estrutura de módulos do Angular, reduzindo boilerplate e facilitando a reutilização de código.
- **Alternativas Consideradas:**
  - Estrutura legada com `AppModule` e `SharedModule`.
- **Impacto:** Código mais limpo e modular; melhor integração com as APIs reativas modernas do Angular.

---

## Documentos Relacionados

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [SPEC.md](SPEC.md)
- [MEMORY.md](MEMORY.md)
- [README.md](../README.md)

---

## Confidence

### Alta
- Contexto, decisões e impactos confirmados diretamente pela estrutura do código e manifestos de implantação ([render.yaml](../render.yaml), [api/server.js](../api/server.js)).

### Média
- **Inferência:** Datas exatas de tomada de decisão estimados com base no histórico do projeto.

### Baixa
- Nenhuma.

---

## Validação Humana Necessária

- Confirmação das datas estimadas nas ADRs.
