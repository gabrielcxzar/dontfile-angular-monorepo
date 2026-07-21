# Grafo de Dependências do Sistema (DEPENDENCY_GRAPH.md)

Este documento representa o mapa de relacionamentos e dependências entre os módulos, bibliotecas e serviços do **DontFile**.

---

## 1. Grafo de Dependências de Runtime

```mermaid
graph TD
    Client[Navegador Web] -->|HTTP GET/POST/DELETE| Server[Express Server - api/server.js]
    
    subgraph Express Node.js Server
        Server -->|Middleware Multipart| Multer[Multer 1.4.5]
        Server -->|Static File Server| ExpressStatic[express.static('public')]
        Multer -->|Grava Arquivos| FS[Node.js fs / System Disk]
    end
    
    subgraph Angular 19 SPA (web/src)
        ExpressStatic -->|Entrega Bundle JS/CSS| AngularSPA[Angular Standalone Application]
        AngularSPA -->|HttpClient| Server
        AngularSPA -->|Routing| AngularRouter[@angular/router]
        AngularSPA -->|UI Component| HomeComponent[HomeComponent]
        AngularSPA -->|UI Component| RoomComponent[RoomComponent]
    end
    
    subgraph Dependências Externas (CDN)
        AngularSPA -.->|Carrega Ícones| FontAwesome[FontAwesome 6.5.1 CDN]
        AngularSPA -.->|Carrega Tipografia| GoogleFonts[Google Fonts Poppins]
        HomeComponent -.->|Carregamento Dinâmico| QrCodeCDN[Davidshimjs QRCode.js CDN]
        RoomComponent -.->|Carregamento Dinâmico| QrCodeCDN
    end
```

---

## 2. Dependências de Pacotes (NPM)

### 2.1. Backend (`api/package.json`)
```
express (v4.18.2)
  └── multer (v1.4.5-lts.1)
```

### 2.2. Frontend (`web/package.json`)
```
@angular/core (v19.2.0)
  ├── @angular/common (v19.2.0)
  ├── @angular/compiler (v19.2.0)
  ├── @angular/forms (v19.2.0)
  ├── @angular/platform-browser (v19.2.0)
  ├── @angular/platform-browser-dynamic (v19.2.0)
  ├── @angular/router (v19.2.0)
  ├── rxjs (v7.8.0)
  ├── zone.js (v0.15.0)
  └── tslib (v2.3.0)
```

---

## Documentos Relacionados

- [INVENTORY.md](INVENTORY.md)
- [METRICS.md](METRICS.md)
- [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)

---

## Confidence

### Alta
- Relações de dependência mapeadas a partir dos arquivos [../api/package.json](../api/package.json) e [../web/package.json](../web/package.json).

### Média
- Nenhuma.

### Baixa
- Nenhuma.

---

## Validação Humana Necessária

- Nenhuma.
