# Memória Permanente do Projeto (MEMORY.md)

Este documento registra o conhecimento técnico permanente, decisões consolidadas, limitações de infraestrutura e fatos técnicos que devem persistir entre diferentes sessões de desenvolvimento.

---

## 1. Infraestrutura e Hospedagem (Render PaaS)

- **Plano Gratuito Render:** A API Node.js e a aplicação frontend estão hospedadas no plano gratuito do Render sob a definição em [../render.yaml](../render.yaml).
- **Efemeridade do Sistema de Arquivos:** O disco da VM no Render é totalmente efêmero. O reinício da instância (ocorrido a cada novo deploy ou após 15 minutos de inatividade sem requisições) deleta permanentemente todo o conteúdo da pasta [../api/uploads](../api/uploads).
- **Domínio Canônico e Redirecionamento:** O servidor redireciona requisições do subdomínio legado `dontfile.onrender.com` para o domínio oficial `dontfile.com.br` (configurado em [../api/server.js](../api/server.js)).

---

## 2. Estrutura de Armazenamento e Build

- **Pasta de Uploads:** O backend salva arquivos enviados no diretório [../api/uploads](../api/uploads). Este diretório é criado dinamicamente pelo `multer` ao receber uploads e está ignorado no `.gitignore`.
- **Servimento Estático de Produção:** No deploy, o Angular compila para `web/dist/dontfile-web/browser`, e o script `build:deploy` copia o resultado para `api/public`. O Express serve essa pasta como raiz pública.
- **Proxy de Desenvolvimento:** Durante o desenvolvimento local com `ng serve`, as chamadas iniciadas em `http://localhost:4200/api` são redirecionadas para `http://localhost:3000` através do arquivo [../web/proxy.conf.json](../web/proxy.conf.json).

---

## 3. Limitações de Design e Tecnologias

- **Tamanho Máximo de Upload:** O limite por arquivo é fixado em 100 Megabytes (100 * 1024 * 1024 bytes) tanto na validação do frontend ([../web/src/app/room/room.component.ts](../web/src/app/room/room.component.ts)) quanto no Multer do backend ([../api/server.js](../api/server.js)).
- **Sem Banco de Dados:** Não há banco de dados relacional ou NoSQL no projeto. As informações de arquivos (nome, tamanho, data de modificação) são extraídas diretamente do sistema de arquivos via `fs.statSync`.

---

## Documentos Relacionados

- [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- [../docs/DECISIONS.md](../docs/DECISIONS.md)
- [../.meta/AUDIT.md](../.meta/AUDIT.md)
- [../README.md](../README.md)

---

## Confidence

### Alta
- Fatos confirmados pelas configurações de infraestrutura em [../render.yaml](../render.yaml), [../api/server.js](../api/server.js) e [../web/package.json](../web/package.json).

### Média
- Nenhuma.

### Baixa
- Nenhuma.

---

## Validação Humana Necessária

- Nenhuma.
