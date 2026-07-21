# Exemplos de Utilização e Snippets (EXAMPLES.md)

Este documento fornece exemplos práticos de uso dos endpoints da API (via cURL) e trechos de código do frontend Angular do **DontFile**.

---

## 1. Exemplos de Chamadas de API (cURL)

### 1.1. Listar Arquivos de uma Sala (`GET /api/:room/files`)
```bash
curl -X GET http://localhost:3000/api/projeto-teste/files
```
**Exemplo de Resposta:**
```json
[
  {
    "name": "diagrama.png",
    "size": 524288,
    "uploadDate": "2026-07-21T09:15:30.000Z"
  }
]
```

---

### 1.2. Upload de Arquivo (`POST /api/:room/upload`)
```bash
curl -X POST http://localhost:3000/api/projeto-teste/upload \
  -F "file=@/caminho/local/para/meu-arquivo.pdf"
```
**Exemplo de Resposta:**
```json
{
  "success": true,
  "filename": "meu-arquivo.pdf",
  "size": 1048576
}
```

---

### 1.3. Download de Arquivo (`GET /api/:room/download/:filename`)
```bash
curl -O http://localhost:3000/api/projeto-teste/download/meu-arquivo.pdf
```

---

### 1.4. Deletar Arquivo Individual (`DELETE /api/:room/delete/:filename`)
```bash
curl -X DELETE http://localhost:3000/api/projeto-teste/delete/meu-arquivo.pdf
```

---

### 1.5. Limpar Sala Inteira (`DELETE /api/:room/delete-all`)
```bash
curl -X DELETE http://localhost:3000/api/projeto-teste/delete-all
```

---

## 2. Snippets do Frontend Angular

### 2.1. Upload de Arquivos com Acompanhamento de Progresso (`HttpClient` & `RxJS`)

Extracted from [web/src/app/room/room.component.ts](../web/src/app/room/room.component.ts):

```typescript
const formData = new FormData();
formData.append('file', file);

this.http.post(`/api/${this.roomName}/upload`, formData, {
  reportProgress: true,
  observe: 'events'
}).pipe(
  finalize(() => {
    this.pendingUploads = Math.max(0, this.pendingUploads - 1);
    if (this.pendingUploads === 0) {
      this.isUploading = false;
    }
  })
).subscribe({
  next: (event) => {
    if (event.type === HttpEventType.UploadProgress && event.total) {
      this.uploadProgress = Math.round((100 * event.loaded) / event.total);
    } else if (event.type === HttpEventType.Response) {
      this.loadFiles();
    }
  },
  error: (err) => {
    alert('Erro no upload: ' + file.name);
  }
});
```

---

### 2.2. Polling de Atualização da Sala

```typescript
ngOnInit(): void {
  this.loadFiles();
  this.refreshInterval = setInterval(() => {
    this.loadFiles();
  }, 5000);
}

ngOnDestroy(): void {
  if (this.refreshInterval) {
    clearInterval(this.refreshInterval);
  }
}
```

---

## Documentos Relacionados

- [SPEC.md](SPEC.md)
- [PATTERNS.md](PATTERNS.md)
- [CONTEXT.md](CONTEXT.md)
- [README.md](../README.md)

---

## Confidence

### Alta
- Exemplos de requisições e trechos de código TypeScript validados diretamente em [api/server.js](../api/server.js) e [web/src/app/room/room.component.ts](../web/src/app/room/room.component.ts).

### Média
- Nenhuma.

### Baixa
- Nenhuma.

---

## Validação Humana Necessária

- Nenhuma.
