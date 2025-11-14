# DontFile

Um serviço de transferência de arquivos simples, rápido e anônimo, inspirado no DontPad. Crie uma sala, arraste seus arquivos e compartilhe o link.

**Link do projeto ao vivo (Hospedado no Render):** [**https://dontfile.onrender.com/**](https://dontfile.onrender.com/)



---

## Sobre o Projeto

O objetivo deste projeto era criar uma ferramenta de transferência de arquivos sem atrito: sem login, sem cadastro, sem anúncios. O usuário simplesmente acessa o site, digita o nome de uma sala (que pode ser um subdiretório como `/projeto/cliente-final`) e pode começar a fazer uploads.

### ⚠️ Aviso de Armazenamento Efêmero

Este projeto foi desenvolvido para ser uma solução de **transferência temporária** e está hospedado no plano gratuito do Render. O sistema de arquivos da VM é **efêmero**.

Isso significa que **todos os arquivos enviados são permanentemente excluídos** sempre que o serviço reinicia (o que acontece em cada novo deploy ou após 15 minutos de inatividade do servidor).

---

## Arquitetura Técnica (Monorepo)

Este repositório é um **monorepo** que contém duas aplicações separadas: o backend da API e o frontend em Angular.

### `/api` (O Backend)

* **Tecnologia:** Node.js, Express.js
* **Função:** Serve a API RESTful e os arquivos estáticos.
* **Rotas Principais:**
    * `POST /api/:room(*)/upload`: Recebe os arquivos via `multer`.
    * `GET /api/:room(*)/files`: Lista os arquivos de uma sala.
    * `GET /api/:room(*)/download/:filename`: Faz o download de um arquivo.
    * `DELETE /api/:room(*)/delete/:filename`: Deleta um arquivo.
    * `DELETE /api/:room(*)/delete-all`: Limpa uma sala inteira.
* **Armazenamento:** Os arquivos são salvos diretamente no sistema de arquivos do servidor (`/uploads`) usando o módulo `fs` do Node.

### `/web` (O Frontend)

* **Tecnologia:** Angular 17+ (Standalone)
* **Função:** É a SPA (Single Page Application) que o usuário vê.
* **Roteamento:**
    * `/` (Homepage): Renderiza o `HomeComponent` (landing page, criação de sala, modal do PIX).
    * `/**` (Catch-all): Renderiza o `RoomComponent`, que lê a URL para identificar o nome da sala (ex: `/minha/sala/secreta`).
* **Comunicação:** Usa o `HttpClient` do Angular para consumir a API REST do backend (Node.js).

---

## Dependências e Tecnologias

### Backend (`/api/package.json`)
* **`express`**: O framework do servidor web para criar as rotas da API.
* **`multer`**: Middleware para lidar com o upload de arquivos (`multipart/form-data`).

### Frontend (`/web/package.json`)
* **`@angular/core`**: O núcleo do framework Angular.
* **`@angular/common`**: Fornece diretivas como `*ngIf` e `*ngFor` (usadas para listar os arquivos e mostrar/esconder o modal).
* **`@angular/common/http` (`HttpClient`)**: O módulo usado para fazer requisições `GET`, `POST`, e `DELETE` para o backend.
* **`@angular/router`**: Gerencia o roteamento do lado do cliente (entre a Homepage e a Sala).

### Build (Desenvolvimento)
* **`@angular/cli`**: Ferramenta de linha de comando para rodar (`ng serve`) e compilar (`ng build`) a aplicação Angular.
* **`rimraf`** & **`ncp`**: Scripts de utilidade (adicionados ao `package.json` do frontend) para automatizar o processo de build, limpando a pasta `api/public` e copiando os arquivos compilados do Angular para lá.

---

## Como Rodar Localmente

Para rodar o ambiente de desenvolvimento, você precisará de **dois terminais** abertos.

**1. Iniciar o Backend (API):**
```bash
# Terminal 1
cd api
npm install
npm run dev
# A API estará rodando em http://localhost:3000
# Terminal 2
cd web
npm install
ng serve --open
# O app Angular abrirá em http://localhost:4200 e consumirá a API do localhost:3000
npm install
npm run dev
# A API estará rodando em http://localhost:3000
