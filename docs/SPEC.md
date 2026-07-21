# Especificação Técnica e Contrato de API (SPEC.md)

Este documento contém os requisitos funcionais, não funcionais e a especificação detalhada dos endpoints de API do **DontFile**, baseando-se estritamente na implementação em [api/server.js](../api/server.js) e componentes do frontend em Angular.

---

## 1. Requisitos Funcionais (RF)

- **RF-01 (Navegação Dinâmica por Sala):** O sistema deve permitir o acesso a qualquer sala digitando o nome diretamente na URL (ex: `/minha-sala`).
- **RF-02 (Listagem de Arquivos):** O sistema deve listar todos os arquivos pertencentes a uma sala específica, informando nome, tamanho em bytes e data do upload.
- **RF-03 (Upload de Arquivo):** O sistema deve permitir o envio de arquivos (através de upload único por requisição via Multer) e salvá-los no diretório da sala correspondente.
- **RF-04 (Download de Arquivo):** O sistema deve permitir o download de qualquer arquivo existente na sala através de um link direto.
- **RF-05 (Exclusão Individual):** O sistema deve permitir a exclusão de um arquivo específico de uma sala.
- **RF-06 (Limpeza de Sala):** O sistema deve permitir a remoção de todos os arquivos e do diretório da sala em uma única ação (`delete-all`).
- **RF-07 (Redirecionamento de Domínio Legado):** O backend deve redirecionar via HTTP 301 qualquer requisição vinda do domínio legado `LEGACY_RENDER_DOMAIN` para `CANONICAL_DOMAIN`.
- **RF-08 (Modal PIX & Apoio):** O frontend deve exibir um modal com chave PIX e QR Code para apoio voluntário ao projeto.
- **RF-09 (Aviso de Privacidade):** O frontend deve exibir um banner de aviso de privacidade na primeira visita e armazenar o aceite no `localStorage` sob a chave `dontfile_privacy_notice_ack_v1`.

---

## 2. Requisitos Não Funcionais (RNF)

- **RNF-01 (Limite de Tamanho de Arquivo):** O tamanho máximo por arquivo é estritamente limitado a 100 Megabytes (100MB).
- **RNF-02 (Armazenamento Efêmero):** Os arquivos são salvos diretamente no sistema de arquivos da VM (`/uploads`) sem garantia de retenção permanente.
- **RNF-03 (Responsividade):** A interface deve ser adaptável para dispositivos móveis e desktops.
- **RNF-04 (Atualização sem Reload):** A listagem de arquivos da sala deve ser atualizada periodicamente a cada 5 segundos via polling e imediatamente após uploads ou exclusões.

---

## 3. Especificação dos Endpoints REST da API

### 3.1. Listar Arquivos da Sala
- **Rota:** `GET /api/:room(*)/files`
- **Descrição:** Retorna a lista de arquivos presentes na sala.
- **Respostas:**
  - `200 OK`: Array JSON com os detalhes dos arquivos.
    ```json
    [
      {
        "name": "documento.pdf",
        "size": 1048576,
        "uploadDate": "2026-07-21T09:00:00.000Z"
      }
    ]
    ```
  - `200 OK` (Se a sala não existir no disco): Retorna array vazio `[]`.
  - `500 Internal Server Error`: Erro ao ler diretório.
    ```json
    { "error": "Erro ao listar arquivos" }
    ```

---

### 3.2. Fazer Upload de Arquivo
- **Rota:** `POST /api/:room(*)/upload`
- **Content-Type:** `multipart/form-data`
- **Corpo da Requisição:** Campo `file` contendo o arquivo.
- **Respostas:**
  - `200 OK`: Upload realizado com sucesso.
    ```json
    {
      "success": true,
      "filename": "exemplo.png",
      "size": 204857
    }
    ```
  - `400 Bad Request` (Nenhum arquivo enviado):
    ```json
    { "error": "Nenhum arquivo enviado" }
    ```
  - `400 Bad Request` (Arquivo excede 100MB):
    ```json
    { "error": "Arquivo muito grande (Máx: 100MB)" }
    ```
  - `507 Insufficient Storage` (Disco cheio na VM / erro `ENOSPC`):
    ```json
    { "error": "Sem armazenamento disponível. Contate o suporte: dontfile@gmail.com" }
    ```

---

### 3.3. Baixar Arquivo
- **Rota:** `GET /api/:room(*)/download/:filename`
- **Descrição:** Realiza o download do arquivo especificado.
- **Respostas:**
  - `200 OK`: Binary Stream do arquivo (com cabeçalho `Content-Disposition: attachment`).
  - `404 Not Found`: Arquivo não encontrado.
    ```json
    { "error": "Arquivo não encontrado" }
    ```

---

### 3.4. Deletar Arquivo Individual
- **Rota:** `DELETE /api/:room(*)/delete/:filename`
- **Descrição:** Exclui um arquivo individual da sala.
- **Respostas:**
  - `200 OK`:
    ```json
    { "success": true, "message": "Arquivo deletado com sucesso" }
    ```
  - `404 Not Found`:
    ```json
    { "error": "Arquivo não encontrado" }
    ```
  - `500 Internal Server Error`: Erro ao deletar.

---

### 3.5. Limpar Sala Inteira
- **Rota:** `DELETE /api/:room(*)/delete-all`
- **Descrição:** Remove recursivamente a pasta da sala e todos os seus arquivos.
- **Respostas:**
  - `200 OK`:
    ```json
    { "success": true, "message": "Sala limpa com sucesso" }
    ```
  - `404 Not Found`:
    ```json
    { "error": "Sala não encontrada" }
    ```

---

## Documentos Relacionados

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [EXAMPLES.md](EXAMPLES.md)
- [CONTEXT.md](CONTEXT.md)
- [README.md](../README.md)

---

## Confidence

### Alta
- Todos os endpoints, códigos de status HTTP e mensagens de erro foram extraídos diretamente do arquivo [api/server.js](../api/server.js).

### Média
- Nenhuma.

### Baixa
- Nenhuma.

---

## Validação Humana Necessária

- Nenhuma.
