# Análise do Workspace e Acoplamento (WORKSPACE_ANALYSIS.md)

Este documento apresenta a análise de acoplamento, riscos de coesão e arquitetura de monorepo do **DontFile**.

---

## 1. Análise de Acoplamento (Backend x Frontend)

### 1.1. Acoplamento de Build
- **Mecanismo:** O script `build:deploy` em [../web/package.json](../web/package.json) executa:
  `ng build && rimraf ../api/public && ncp dist/dontfile-web/browser ../api/public`.
- **Avaliação:** **Acoplamento Médio-Alto no Deploy**. O frontend precisa ser compilado e movido fisicamente para a subpasta `public` do backend para funcionar na hospedagem Render.

### 1.2. Acoplamento de Endpoints da API
- **Mecanismo:** O `RoomComponent` faz chamadas diretas aos caminhos `/api/${roomName}/files`, `/api/${roomName}/upload`, etc.
- **Avaliação:** **Acoplamento Adequado (REST padrão)**. A comunicação é realizada por protocolo HTTP desacoplado através de JSON e Multipart Data.

---

## 2. Coesão e Duplicações no Workspace

- **Duplicação de Código UI:** O código do modal PIX e geração de QR Code está duplicado em `HomeComponent` e `RoomComponent`.
- **Recomendações:** Extrair o componente para `web/src/app/shared/components/pix-modal/pix-modal.component.ts`.

---

## Documentos Relacionados

- [AUDIT.md](AUDIT.md)
- [METRICS.md](METRICS.md)
- [../docs/ROADMAP.md](../docs/ROADMAP.md)

---

## Confidence

### Alta
- Análise baseada estritamente nas dependências e scripts em [../web/package.json](../web/package.json) e [../render.yaml](../render.yaml).

### Média
- Nenhuma.

### Baixa
- Nenhuma.

---

## Validação Humana Necessária

- Nenhuma.
