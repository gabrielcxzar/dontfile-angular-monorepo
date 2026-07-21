# Inventário Completo do Repositório (INVENTORY.md)

Este documento apresenta um inventário analítico dos componentes, módulos, bibliotecas e ativos do **DontFile**.

---

## 1. Módulos e Componentes

| Módulo / Componente | Caminho do Arquivo | Tipo | Descrição |
| :--- | :--- | :--- | :--- |
| **API Server** | [../api/server.js](../api/server.js) | Node.js / Express | Servidor RESTful, middlewares Multer e servimento de estáticos. |
| **App Root** | [../web/src/app/app.component.ts](../web/src/app/app.component.ts) | Angular Standalone | Componente raiz container (Shell) com `<router-outlet>`. |
| **App Config** | [../web/src/app/app.config.ts](../web/src/app/app.config.ts) | Angular Config | Configuração global de providers (`provideRouter`, `provideHttpClient`). |
| **App Routes** | [../web/src/app/app.routes.ts](../web/src/app/app.routes.ts) | Angular Router | Mapeamento de rotas (`''` -> Home, `'**'` -> Room). |
| **Home Component** | [../web/src/app/home/home.component.ts](../web/src/app/home/home.component.ts) | Angular Standalone | Componente da Landing Page, criação de sala, suporte e PIX. |
| **Room Component** | [../web/src/app/room/room.component.ts](../web/src/app/room/room.component.ts) | Angular Standalone | Componente da Sala de Transferência, upload, drag&drop, download, delete. |

---

## 2. Ativos e Estáticos (Assets)

| Ativo | Localização | Descrição |
| :--- | :--- | :--- |
| **Favicon SVG** | `web/public/favicon.svg` & `api/public/favicon.svg` | Logotipo e ícone do navegador. |
| **FontAwesome** | CDN (`all.min.css` 6.5.1) | Conjunto de ícones vetoriais. |
| **Poppins Font** | Google Fonts | Tipografia padrão da aplicação. |

---

## 3. Manifestos e Configurações

- **`render.yaml`:** Blueprint de infraestrutura como código para deploy no Render.
- **`web/angular.json`:** Configurações de compilação, assets, estilos e dev-server do Angular.
- **`web/proxy.conf.json`:** Configuração de proxy reverso local (`/api` -> `http://localhost:3000`).
- **`web/tsconfig.json`:** Configuração do compilador TypeScript.

---

## Documentos Relacionados

- [FILE_INDEX.md](FILE_INDEX.md)
- [DEPENDENCY_GRAPH.md](DEPENDENCY_GRAPH.md)
- [../.ai/CONTEXT.md](../.ai/CONTEXT.md)

---

## Confidence

### Alta
- Inventário mapeado diretamente do código-fonte e estrutura de arquivos do repositório.

### Média
- Nenhuma.

### Baixa
- Nenhuma.

---

## Validação Humana Necessária

- Nenhuma.
