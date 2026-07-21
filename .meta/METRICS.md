# Métricas de Código do Projeto (METRICS.md)

Este documento registra as estatísticas de volume de código, linhas, número de componentes e complexidade analítica do **DontFile**.

---

## 1. Métricas de Volume e Linhas de Código

| Componente / Arquivo | Linguagem / Tipo | Linhas de Código (Aproximadas) | Tamanho (Bytes) |
| :--- | :--- | :--- | :--- |
| **`api/server.js`** | JavaScript (Node.js) | ~180 linhas | 5.720 bytes |
| **`web/src/app/home/home.component.ts`** | TypeScript | ~159 linhas | 5.139 bytes |
| **`web/src/app/home/home.component.html`** | HTML | ~76 linhas | 3.433 bytes |
| **`web/src/app/home/home.component.css`** | CSS | ~513 linhas | 9.339 bytes |
| **`web/src/app/room/room.component.ts`** | TypeScript | ~354 linhas | 12.417 bytes |
| **`web/src/app/room/room.component.html`** | HTML | ~101 linhas | 4.188 bytes |
| **`web/src/app/room/room.component.css`** | CSS | ~407 linhas | 7.749 bytes |
| **`web/src/app/app.routes.ts`** | TypeScript | ~16 linhas | 518 bytes |
| **`web/src/app/app.config.ts`** | TypeScript | ~14 linhas | 360 bytes |
| **`web/src/styles.css`** | CSS | ~34 linhas | 711 bytes |

---

## 2. Métricas de Arquivos por Módulo

- **Total de Módulos Backend:** 1 arquivo principal (`server.js`).
- **Total de Componentes Angular Frontend:** 3 componentes (`AppComponent`, `HomeComponent`, `RoomComponent`).
- **Total de Arquivos de Teste (`*.spec.ts`):** 3 arquivos (`app.component.spec.ts`, `home.component.spec.ts`, `room.component.spec.ts`).
- **Total de Arquivos de Documentação:** 19 arquivos em `.ai/`, `docs/`, `.meta/` e na raiz.

---

## Documentos Relacionados

- [INVENTORY.md](INVENTORY.md)
- [WORKSPACE_ANALYSIS.md](WORKSPACE_ANALYSIS.md)
- [FILE_INDEX.md](FILE_INDEX.md)

---

## Confidence

### Alta
- Métricas aferidas por inspeção direta dos arquivos no ambiente de workspace.

### Média
- Nenhuma.

### Baixa
- Nenhuma.

---

## Validação Humana Necessária

- Nenhuma.
