# Padrões Adotados no Projeto (PATTERNS.md)

Este documento descreve os padrões arquiteturais, de design de software, de componentes e de estilo adotados no projeto **DontFile**.

---

## 1. Padrões de Arquitetura

### 1.1. Monorepo Desacoplado com Build Integrado
- **Separação Responsável:** Frontend em `web/` e Backend em `api/` possuem gerentes de pacotes e ciclos de desenvolvimento independentes.
- **Unificação no Deploy:** O backend atua como servidor estático da SPA em ambiente de produção, centralizando a porta e a infraestrutura.

### 1.2. API RESTful com Middleware para Multiparte
- Endpoints REST simples utilizando Express (`app.get`, `app.post`, `app.delete`).
- Uso do `multer.diskStorage` configurado dinamica e estritamente para gravar na pasta da sala.

---

## 2. Padrões de Frontend (Angular 19)

### 2.1. Standalone Components
- Eliminação total do uso de `NgModule`.
- Todos os componentes declaram suas dependências diretamente na propriedade `imports` do decorador `@Component`:
```typescript
@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css'
})
export class RoomComponent { ... }
```

### 2.2. Injeção de Dependência Moderna via Construtor
- Serviços nativos injetados diretamente no construtor da classe TypeScript:
```typescript
constructor(
  private route: Router,
  private http: HttpClient
) { }
```

---

## 3. Padrões de Estilização (CSS Vanilla)

- **Reset Global e Variáveis de Tema Escuro:** Definidos em [web/src/styles.css](../web/src/styles.css).
- **Esquema de Cores Predominante:**
  - Fundo principal: `#121212` (Dark)
  - Containers e Cards: `#1f1f1f`
  - Destaque/Ação Principal: `#00C8FF` (Azul Neon)
  - Texto principal: `#E0E0E0` / `#FFFFFF`
- **Scoping por Componente:** Estilos específicos ficam confinados em `home.component.css` e `room.component.css`.

---

## 4. Padrões de Tratamento de Erros no Backend

- Middleware de erro global registrado ao final de [api/server.js](../api/server.js):
```javascript
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande (Máx: 100MB)' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err && err.code === 'ENOSPC') {
    return res.status(507).json({ error: 'Sem armazenamento disponível. Contate o suporte: dontfile@gmail.com' });
  }
  res.status(500).json({ error: 'Ocorreu um erro interno no servidor' });
});
```

---

## Documentos Relacionados

- [GOVERNANCE.md](GOVERNANCE.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [SPEC.md](SPEC.md)
- [README.md](../README.md)

---

## Confidence

### Alta
- Padrões extraídos diretamente do código em [api/server.js](../api/server.js), [web/src/app/home/home.component.ts](../web/src/app/home/home.component.ts) e [web/src/styles.css](../web/src/styles.css).

### Média
- Nenhuma.

### Baixa
- Nenhuma.

---

## Validação Humana Necessária

- Nenhuma.
