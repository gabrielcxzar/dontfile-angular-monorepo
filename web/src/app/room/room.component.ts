import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; // Para ler a URL e para o link do logo
import { HttpClient, HttpEventType } from '@angular/common/http';
import { finalize } from 'rxjs'; // O coração da API
import { CommonModule } from '@angular/common'; // Necessário para *ngFor, *ngIf
declare var QRCode: any
// 1. Interface: Define a "cara" de um arquivo (Boas práticas do TypeScript)
export interface FileInfo {
  name: string;
  size: number;
  uploadDate: string;
}

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    CommonModule, // Adiciona o *ngFor, *ngIf
    RouterLink    // Adiciona o [routerLink] para o logo
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css'
})
export class RoomComponent implements OnInit, OnDestroy {

  public roomName: string = '';
  public files: FileInfo[] = []; // Onde vamos guardar a lista de arquivos
  public isLoading: boolean = true;
  public uploadProgress: number = 0;
  public isUploading: boolean = false;
  public isUploadIndeterminate: boolean = false;
  public isPixModalVisible: boolean = false;

  private isQrCodeScriptLoaded: boolean = false;
  private qrCodeInstance: any;
  private refreshInterval: any;
  private pendingUploads: number = 0;

  // 2. Injeta as ferramentas do Angular: Rota, Cliente HTTP
  constructor(
    private route: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
  // Pega a URL (ex: /gabriel/curso) e remove a primeira barra
  this.roomName = this.route.url.slice(1);

  // Atualiza o <span id="roomName"> no HTML
  const roomNameSpan = document.getElementById('roomName');
  if (roomNameSpan) {
    roomNameSpan.textContent = this.roomName;
  }

  this.loadFiles(); // O resto (loadFiles, setupDragAndDrop, etc.) continua igual
  this.setupDragAndDrop();

  this.refreshInterval = setInterval(() => {
    this.loadFiles();
  }, 5000);
}

  ngOnDestroy(): void {
    // 6. Limpa o intervalo quando o usuário sai da sala (evita memory leak)
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
  copyRoomLink(): void {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    alert('Link da sala copiado!');
  }).catch(err => {
    console.error('Falha ao copiar link:', err);
    alert('Falha ao copiar. Por favor, copie o link da barra de endereço.');
  });
}

clearRoom(): void {
  if (!confirm(`Tem certeza que deseja apagar TODOS os arquivos desta sala? Esta ação é irreversível.`)) {
    return;
  }

  this.http.delete(`/api/${this.roomName}/delete-all`).subscribe({
    next: () => {
      this.loadFiles(); // Recarrega a lista (que agora estará vazia)
    },
    error: (err) => {
      alert('❌ Erro ao limpar a sala.');
      console.error(err);
    }
  });
}

  // --- Funções Principais (A Lógica da API) ---

  loadFiles(): void {
    if (!this.roomName) return;

    // 7. A MÁGICA: Chama a API do seu server.js!
    this.http.get<FileInfo[]>(`/api/${this.roomName}/files`).subscribe({
      next: (data) => {
        // Ordena por data (o Angular faz isso no frontend)
        this.files = data.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar arquivos:', err);
        this.isLoading = false;
        // Aqui você poderia, por exemplo, mostrar a mensagem de "Sala não encontrada"
        // baseada no status do erro (ex: err.status === 404)
      }
    });
  }

  handleFiles(files: FileList | null): void {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Limite de 100MB
      if (file.size > 100 * 1024 * 1024) { 
        alert(`❌ Arquivo "${file.name}" é muito grande (máx: 100MB)`);
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);

      // Mostra a barra de progresso
      this.pendingUploads += 1;
      this.isUploading = true;
      this.isUploadIndeterminate = false;
      this.uploadProgress = 0;

      // 8. O UPLOAD com HttpClient (substitui o XHR)
      this.http.post(`/api/${this.roomName}/upload`, formData, {
        reportProgress: true,
        observe: 'events'
      }).pipe(
        finalize(() => {
          this.isUploadIndeterminate = false;
            this.uploadProgress = 100;
        })
      ).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            // Atualiza a barra de progresso
            if (event.total) {
              const percent = Math.round((100 * event.loaded) / event.total);
              this.uploadProgress = percent;
              this.isUploadIndeterminate = false;
            } else {
              // Alguns ambientes nÃ£o informam o total (chunked); use modo indeterminado
              this.isUploadIndeterminate = true;
            }
          } else if (event.type === HttpEventType.Response) {
            // Upload completo!
            this.loadFiles(); // Recarrega a lista
            this.isUploadIndeterminate = false;
            this.uploadProgress = 100;
          }
        },
        error: (err) => {
          alert('❌ Erro no upload: ' + file.name);
          console.error(err);
        }
      });
    }
  }

  downloadFile(filename: string): void {
    // O download continua sendo um redirecionamento simples
    window.location.href = `/api/${this.roomName}/download/${encodeURIComponent(filename)}`;
  }

  deleteFile(filename: string): void {
    if (!confirm(`Tem certeza que deseja deletar "${filename}"?`)) return;

    this.http.delete(`/api/${this.roomName}/delete/${encodeURIComponent(filename)}`).subscribe({
      next: () => {
        this.loadFiles(); // Recarrega a lista
      },
      error: (err) => {
        alert('❌ Erro ao deletar arquivo');
        console.error(err);
      }
    });
  }

  // --- Funções de "Arrastar e Soltar" e Helpers ---

  setupDragAndDrop(): void {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;

    if (!uploadArea || !fileInput) return;

    uploadArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
      this.handleFiles(fileInput.files);
      fileInput.value = ''; // Reseta o input
    });

    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragging');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragging');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragging');
      this.handleFiles(e.dataTransfer?.files || null);
      fileInput.value = ''; // Reseta o input
    });
  }

  // --- Funções Utilitárias (Helpers) ---
  // (Estas agora são métodos da classe)

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  getFileIconHTML(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    let iconClass = 'fa-solid fa-file'; // Ícone padrão
    switch (extension) {
        case 'pdf': iconClass = 'fa-solid fa-file-pdf'; break;
        case 'py': iconClass = 'fa-brands fa-python'; break;
        case 'js': iconClass = 'fa-brands fa-js'; break;
        case 'html': case 'htm': iconClass = 'fa-brands fa-html5'; break;
        case 'css': iconClass = 'fa-brands fa-css3-alt'; break;
        case 'txt': case 'md': iconClass = 'fa-solid fa-file-lines'; break;
        case 'doc': case 'docx': iconClass = 'fa-solid fa-file-word'; break;
        case 'xls': case 'xlsx': iconClass = 'fa-solid fa-file-excel'; break;
        case 'ppt': case 'pptx': iconClass = 'fa-solid fa-file-powerpoint'; break;
        case 'zip': case 'rar': case '7z': iconClass = 'fa-solid fa-file-zipper'; break;
        case 'png': case 'jpg': case 'jpeg': case 'gif': case 'webp': iconClass = 'fa-solid fa-file-image'; break;
        case 'mp3': case 'wav': iconClass = 'fa-solid fa-file-audio'; break;
        case 'mp4': case 'mov': case 'avi': iconClass = 'fa-solid fa-file-video'; break;
        case 'sql': iconClass = 'fa-solid fa-database'; break;
    }
    // Retorna o HTML completo do ícone
    return `<i class="file-icon ${iconClass}"></i>`;
  }
  openPixModal(event: MouseEvent): void {
    event.preventDefault();
    this.isPixModalVisible = true;

    setTimeout(() => {
      if (!this.isQrCodeScriptLoaded && typeof QRCode !== 'undefined') {
        this.generateQRCodeAndSetupClipboard();
        this.isQrCodeScriptLoaded = true; // Marcamos como carregado
      } else if (typeof QRCode === 'undefined') {
        // Se o script ainda não carregou, tentamos carregar
        this.loadQrCodeScript().then(() => {
          this.isQrCodeScriptLoaded = true;
          this.generateQRCodeAndSetupClipboard();
        });
      } else {
        // Se já foi carregado e gerado, não faz nada
      }
    }, 0);
  }

  closePixModal(): void {
    this.isPixModalVisible = false;
  }

  private loadQrCodeScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Verifica se o script já não está na página
      if (document.getElementById('qrcode-script')) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = 'qrcode-script';
      script.src = 'https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js';
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }

  private generateQRCodeAndSetupClipboard(): void {
    // USA OS IDs DA SALA (ROOM)
    const qrCodeContainer = document.getElementById('qrcodeCanvasRoom'); 
    const pixInput = document.getElementById('pixKeyInputRoom') as HTMLInputElement;

    if (qrCodeContainer && pixInput && typeof QRCode !== 'undefined') {
      const pixKey = pixInput.value;
      if (pixKey) {
        qrCodeContainer.innerHTML = ''; // Limpa o QR anterior
        this.qrCodeInstance = new QRCode(qrCodeContainer, {
          text: pixKey,
          width: 190,
          height: 190,
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    }
    this.setupClipboard(); // Configura o botão de copiar
  }

  setupClipboard(): void {
    // USA OS IDs DA SALA (ROOM)
    const copyBtn = document.getElementById('copyPixBtnRoom');
    const pixInput = document.getElementById('pixKeyInputRoom') as HTMLInputElement;

    if (copyBtn && pixInput) {
      // Remove listener antigo para evitar duplicatas
      const newCopyBtn = copyBtn.cloneNode(true);
      copyBtn.parentNode?.replaceChild(newCopyBtn, copyBtn);

      newCopyBtn.addEventListener('click', () => {
        pixInput.select();
        pixInput.setSelectionRange(0, 99999);
        try {
          navigator.clipboard.writeText(pixInput.value);
          newCopyBtn.textContent = 'Copiado!';
          setTimeout(() => {
            newCopyBtn.textContent = 'Copiar';
          }, 2000);
        } catch (err) {
          console.error('Falha ao copiar:', err);
          alert('Falha ao copiar a chave.');
        }
      });
    }
  }
}









