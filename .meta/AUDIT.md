# Relatório de Auditoria Técnica — DontFile (Monorepo)

**Data da Auditoria:** 21 de Julho de 2026  
**Escopo:** Leitura e análise integral da base de código do repositório `dontfile-angular-monorepo` (`/api`, `/web`, configurações e documentações).

---

## 1. Arquitetura

- **Estrutura de Repositório (Monorepo Simplificado):**
  - Repositório dividido em duas subpastas principais: `/api` (Backend Node.js/Express) e `/web` (Frontend Angular 19 SPA).
  - Não utiliza ferramentas dedicadas de orquestração de monorepo (como Nx, Turborepo ou Lerna). A integração é realizada via scripts NPM e no build de implantação.

- **Modelo de Implantação e Servimento Integrado (Coupled Deployment):**
  - No ambiente de produção (definido em [../render.yaml](../render.yaml)), a aplicação Angular é compilada via `npm run build:deploy` (`ng build`), limpando e copiando os arquivos de `web/dist/dontfile-web/browser` para `api/public`.
  - O servidor Express ([../api/server.js](../api/server.js)) serve tanto os arquivos estáticos compilados do frontend (via `express.static('public')` e fallback `app.get('/:room(*)', ...)`) quanto os endpoints de API RESTful sob o prefixo `/api/*`.

- **Armazenamento de Dados e Persistência:**
  - Armazenamento efêmero no sistema de arquivos local (`fs`) do servidor Node.js na pasta [../api/uploads](../api/uploads).
  - Ausência de banco de dados para metadados ou tabelas de salas. A listagem de salas e arquivos é efetuada dinamicamente varrendo diretórios via `fs.readdir` e lendo metadados via `fs.statSync`.

- **Roteamento:**
  - **Frontend:** Roteamento via Angular Router (`/` para `HomeComponent` e wildcard `/**` para `RoomComponent`).
  - **Backend:** Roteamento via Express com suporte a subdiretórios em salas através do wildcard `:room(*)`.

---

## 2. Módulos

### 2.1. Backend (`/api`)
- **`server.js`:** Módulo monolítico em arquivo único contendo:
  - Redirecionamento de domínio legado (`LEGACY_RENDER_DOMAIN` para `CANONICAL_DOMAIN`).
  - Configuração do `multer` (storage em disco e limite de tamanho de 100MB).
  - Rotas de API: `GET /api/:room(*)/files`, `POST /api/:room(*)/upload`, `GET /api/:room(*)/download/:filename`, `DELETE /api/:room(*)/delete/:filename`, `DELETE /api/:room(*)/delete-all`.
  - Middleware de tratamento global de erros (erros de tamanho de arquivo Multer e erro `ENOSPC` de disco cheio).

### 2.2. Frontend (`/web`)
- **`app.component`:** Componente raiz container (Shell) com suporte a `<router-outlet>`.
- **`app.routes.ts` & `app.config.ts`:** Configurações de roteamento e provimento de serviços globais (ex: `provideHttpClient()`).
- **`home` (`HomeComponent`):** Landing page responsável pela entrada/criação de salas, suporte por e-mail, aviso de privacidade (gravado no `localStorage`) e modal de doação via PIX (com geração de QR Code).
- **`room` (`RoomComponent`):** Painel da sala de arquivos responsável por:
  - Listagem reativa de arquivos com polling a cada 5 segundos.
  - Upload via Drag & Drop ou seleção de arquivos com suporte a acompanhamento de progresso (`HttpEventType.UploadProgress`).
  - Ações de download, exclusão individual e limpeza completa da sala.
  - Modal de doação PIX (duplicado).

---

## 3. Tecnologias

| Camada | Tecnologia / Ferramenta | Versão / Observação |
| :--- | :--- | :--- |
| **Backend Runtime** | Node.js | `>= 18.0.0` |
| **Backend Framework** | Express.js | `^4.18.2` |
| **Upload Handler** | Multer | `^1.4.5-lts.1` |
| **Frontend Framework** | Angular (Standalone) | `^19.2.0` |
| **Linguagem Frontend** | TypeScript | `~5.7.2` |
| **Reatividade Frontend** | RxJS | `~7.8.0` |
| **Estilização** | CSS3 Vanilla | Sem precessadores/Tailwind |
| **Ícones & Fontes** | FontAwesome 6.5.1 / Google Fonts (Poppins) | Carregados via CDN externa no `index.html` |
| **QR Code Generator** | QRCode.js (davidshimjs) | Injetado dinamicamente via script tag CDN |
| **Hospedagem / PaaS** | Render | Configurado via `render.yaml` (Free Tier) |

---

## 4. Dependências

### Backend (`/api/package.json`)
- `express`: ^4.18.2
- `multer`: ^1.4.5-lts.1

### Frontend (`/web/package.json`)
- **Produção:** `@angular/common`, `@angular/compiler`, `@angular/core`, `@angular/forms`, `@angular/platform-browser`, `@angular/platform-browser-dynamic`, `@angular/router` (todos em `^19.2.0`), `rxjs` (`~7.8.0`), `tslib` (`^2.3.0`), `zone.js` (`~0.15.0`).
- **Desenvolvimento:** `@angular-devkit/build-angular` (`^19.2.19`), `@angular/cli` (`^19.2.19`), `@angular/compiler-cli` (`^19.2.0`), `typescript` (`~5.7.2`), `rimraf` (`^6.1.0`), `ncp` (`^2.0.0`), ferramentas de teste (Karma, Jasmine).

---

## 5. Padrões Identificados

- **Arquitetura Standalone no Angular:** Uso moderno de Standalone Components sem declaração de `NgModule`.
- **Anti-Padrão de Manipulação Direta do DOM no Angular:**
  - Em `HomeComponent` e `RoomComponent`, há chamadas diretas a `document.getElementById()`, `document.createElement('script')`, `element.cloneNode()` e `replaceChild()`. Isso ignora o ciclo de vida do Angular e pode falhar em SSR ou causar vazamentos/comportamentos inesperados.
- **Nomenclatura e Idioma:**
  - Código fonte (variáveis, métodos, interfaces) em inglês (`roomName`, `isPixModalVisible`, `FileInfo`).
  - Interface com usuário, comentários de código e mensagens de erro em português.
- **Polamento Ativo (Polling):**
  - Atualização da lista de arquivos em `RoomComponent` via `setInterval` a cada 5000ms.

---

## 6. Documentos Existentes

1. **`README.md` (Raiz):** Documentação principal do projeto contendo visão geral, arquitetura, lista de rotas da API, dependências e comandos de execução.
2. **`web/README.md`:** Arquivo padrão gerado pelo Angular CLI.
3. **`render.yaml`:** Blueprint de infraestrutura como código para deploy no Render.
4. **`.gitignore` (Raiz, `/api`, `/web`):** Regras para ignorar `node_modules`, builds e logs.
5. **`web/.editorconfig`:** Configurações de formatação de código.

---

## 7. Documentos Ausentes

- **`LICENSE`:** Embora o `package.json` do backend indique licença MIT, não há arquivo físico de licença na raiz.
- **`CONTRIBUTING.md`:** Ausência de guia de contribuição e convenções de código.
- **`CHANGELOG.md`:** Ausência de histórico de alterações e controle de versão de lançamentos.
- **`api/README.md`:** A subpasta `/api` não possui um README próprio com orientações específicas do backend.
- **`.env.example`:** Falta de um arquivo de exemplo para variáveis de ambiente (`PORT`, `CANONICAL_DOMAIN`, `LEGACY_RENDER_DOMAIN`).
- **Especificação de API (OpenAPI / Swagger):** Não há especificação formal das rotas HTTP REST.

---

## 8. Duplicações

1. **Lógica e Template do Modal PIX:**
   - O modal de doação PIX, juntamente com o script de geração de QR Code, manipulação de clipboard e exibição da chave Copia-e-Cola, está 100% duplicado entre `HomeComponent` (`home.component.ts`/`html`) e `RoomComponent` (`room.component.ts`/`html`).
2. **Estilos CSS Repetidos:**
   - As regras de estilo para footer (`.site-footer`), modal (`.modal-backdrop`, `.modal`), suporte (`.support-container`) e PIX (`.pix-key-container`) estão duplicadas em `home.component.css` e `room.component.css`.
3. **Imagens de Ativos (Assets):**
   - O arquivo `favicon.svg` está duplicado fisicamente em `web/public/favicon.svg` e `api/public/favicon.svg`.
4. **Definição de Rotas no Angular Router (`web/src/app/app.routes.ts`):**
   - Linha 12: `{ path: '**', component: RoomComponent }`
   - Linha 15: `{ path: '**', redirectTo: '' }` (Esta segunda rota wildcard nunca é atingida devido à regra da linha 12).

---

## 9. Inconsistências e Riscos

1. **Artefatos de Build Commitados no Git:**
   - A pasta `api/public/` contém arquivos compilados de build (`main-7T3GXEUI.js`, `polyfills-B6TNHZQ6.js`, `styles-YAJ3CQRE.css`, `index.html`) versionados no Git. Isso gera conflitos desnecessários no controle de versão a cada novo build.
2. **Uso de CDN Descontinuado (RawGit):**
   - `loadQrCodeScript()` consome `https://cdn.rawgit.com/...`. O serviço RawGit foi encerrado oficialmente e o uso dessa URL traz risco de indisponibilidade ou falhas de carregamento em produção.
3. **Problemas de Encoding / Caracteres Corrompidos no Código Fonte:**
   - Ocorrem caracteres de codificação corrompidos em arquivos TypeScript:
     - Em `home.component.ts`: comentários com acentuação danificada (`instÃ¢ncia`, `mÃ©todo`, `botÃ£o`, `LÃ³gica`).
     - Em `room.component.ts`: mensagem de erro ao usuário com caractere inválido (`alert('? Erro no upload: ' + file.name);`).
4. **Divergência de Versão do Framework na Documentação:**
   - `README.md` (raiz) menciona "Angular 17+".
   - `web/package.json` declara dependências do Angular em `^19.2.0`.
   - `web/README.md` indica geração com Angular CLI `19.2.19`.
5. **Riscos de Segurança e Sanitização de Caminhos no Backend:**
   - `api/server.js` concatena parâmetros de rota diretamente com caminhos de arquivos: `path.join(__dirname, 'uploads', roomName, filename)`. Não há higienização contra ataques de Path Traversal (`..`), nem validação restrita de nomes de salas/arquivos no backend.
   - Nenhuma taxa limite de requisições (rate limiting) está configurada, permitindo uploads ilimitados e potencial negação de serviço (DoS) por esgotamento de espaço em disco.
6. **Uso de `[innerHTML]` sem Sanitização Customizada:**
   - `RoomComponent` utiliza `[innerHTML]="getFileIconHTML(file.name)"`, injetando trechos de HTML gerados dinamicamente por métodos do componente.
