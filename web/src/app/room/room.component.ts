import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { RoomAuthService } from '../services/room-auth.service';

declare var QRCode: any;

export interface FileInfo {
  name: string;
  size: number;
  uploadDate: string;
}

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css'
})
export class RoomComponent implements OnInit, OnDestroy {
  public roomName: string = '';
  public files: FileInfo[] = [];
  public isLoading: boolean = true;
  public uploadProgress: number = 0;
  public isUploading: boolean = false;
  public isUploadIndeterminate: boolean = false;
  public isDragging: boolean = false;
  public isPixModalVisible: boolean = false;

  // Estado de sala privada
  public isPrivateRoom: boolean = false;
  public isRoomLocked: boolean = false;
  public unlockPassword: string = '';
  public unlockError: string = '';
  public isUnlocking: boolean = false;

  // Modal de definir senha ("Tornar privada")
  public isLockModalVisible: boolean = false;
  public lockPassword: string = '';
  public lockPasswordConfirm: string = '';
  public lockError: string = '';
  public isLocking: boolean = false;

  private isQrCodeScriptLoaded: boolean = false;
  private qrCodeInstance: any;
  private refreshInterval: any;
  private pendingUploads: number = 0;

  constructor(
    private route: Router,
    private http: HttpClient,
    private roomAuth: RoomAuthService
  ) {}

  ngOnInit(): void {
    this.roomName = this.route.url.slice(1).replace(/^\/+|\/+$/g, '');
    this.initializeRoomAccess();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private startPolling(): void {
    this.stopPolling();
    this.refreshInterval = setInterval(() => {
      if (!this.isRoomLocked) {
        this.loadFiles();
      }
    }, 5000);
  }

  private stopPolling(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
  }

  initializeRoomAccess(): void {
    if (!this.roomName) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.roomAuth.getAccessStatus(this.roomName).subscribe({
      next: (status) => {
        this.isPrivateRoom = status.isPrivate;
        if (status.isPrivate && !status.unlocked) {
          this.roomAuth.clearToken(this.roomName);
          this.isRoomLocked = true;
          this.isLoading = false;
          this.stopPolling();
          return;
        }

        this.isRoomLocked = false;
        this.loadFiles();
        this.startPolling();
      },
      error: (err) => {
        console.error('Erro ao verificar acesso da sala:', err);
        this.isLoading = false;
      }
    });
  }

  private handleUnauthorizedError(message = 'Sessão expirada ou sala protegida. Informe a senha.'): void {
    this.roomAuth.clearToken(this.roomName);
    this.isPrivateRoom = true;
    this.isRoomLocked = true;
    this.isLockModalVisible = false;
    this.files = [];
    this.isLoading = false;
    this.unlockError = message;
    this.stopPolling();
  }

  openLockModal(): void {
    if (this.isPrivateRoom || this.files.length > 0) {
      return;
    }
    this.lockPassword = '';
    this.lockPasswordConfirm = '';
    this.lockError = '';
    this.isLockModalVisible = true;
  }

  closeLockModal(): void {
    if (this.isLocking) return;
    this.isLockModalVisible = false;
    this.lockError = '';
  }

  submitLockRoom(): void {
    if (this.isLocking) return;

    const trimmed = this.lockPassword.trim();
    if (trimmed.length < 4) {
      this.lockError = 'A senha deve ter pelo menos 4 caracteres.';
      return;
    }
    if (this.lockPassword !== this.lockPasswordConfirm) {
      this.lockError = 'As senhas não coincidem.';
      return;
    }

    this.isLocking = true;
    this.lockError = '';
    this.roomAuth
      .lockRoom(this.roomName, this.lockPassword)
      .pipe(
        finalize(() => {
          this.isLocking = false;
        })
      )
      .subscribe({
        next: () => {
          this.isPrivateRoom = true;
          this.isRoomLocked = false;
          this.isLockModalVisible = false;
          this.lockPassword = '';
          this.lockPasswordConfirm = '';
          this.startPolling();
        },
        error: (err) => {
          this.lockError = err?.error?.error || 'Não foi possível tornar a sala privada.';
          if (err?.status === 409) {
            this.loadFiles();
          }
        }
      });
  }

  submitUnlockRoom(): void {
    if (this.isUnlocking) return;

    if (!this.unlockPassword) {
      this.unlockError = 'Digite a senha da sala.';
      return;
    }

    this.isUnlocking = true;
    this.unlockError = '';
    this.roomAuth
      .unlockRoom(this.roomName, this.unlockPassword)
      .pipe(
        finalize(() => {
          this.isUnlocking = false;
        })
      )
      .subscribe({
        next: () => {
          this.isRoomLocked = false;
          this.unlockPassword = '';
          this.unlockError = '';
          this.isLoading = true;
          this.loadFiles();
          this.startPolling();
        },
        error: (err) => {
          this.unlockError = err?.error?.error || 'Senha incorreta.';
        }
      });
  }

  lockCurrentTab(): void {
    if (!this.isPrivateRoom) return;
    this.roomAuth.clearToken(this.roomName);
    this.isRoomLocked = true;
    this.files = [];
    this.unlockPassword = '';
    this.unlockError = '';
    this.stopPolling();
  }

  copyRoomLink(): void {
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert('Link da sala copiado!');
      })
      .catch((err) => {
        console.error('Falha ao copiar link:', err);
        alert('Falha ao copiar. Por favor, copie o link da barra de endereço.');
      });
  }

  clearRoom(): void {
    const confirmMessage = this.isPrivateRoom
      ? 'Tem certeza que deseja apagar TODOS os arquivos desta sala? A proteção por senha também será removida.'
      : 'Tem certeza que deseja apagar TODOS os arquivos desta sala? Esta ação é irreversível.';

    if (!confirm(confirmMessage)) {
      return;
    }

    this.http
      .delete(`/api/${this.roomName}/delete-all`, {
        headers: this.roomAuth.getAuthHeaders(this.roomName)
      })
      .subscribe({
        next: () => {
          this.roomAuth.clearToken(this.roomName);
          this.isPrivateRoom = false;
          this.isRoomLocked = false;
          this.loadFiles();
        },
        error: (err) => {
          if (err?.status === 401) {
            this.handleUnauthorizedError();
            return;
          }
          alert('❌ Erro ao limpar a sala.');
          console.error(err);
        }
      });
  }

  loadFiles(): void {
    if (!this.roomName || this.isRoomLocked) return;

    this.http
      .get<FileInfo[]>(`/api/${this.roomName}/files`, {
        headers: this.roomAuth.getAuthHeaders(this.roomName)
      })
      .subscribe({
        next: (data) => {
          this.files = data.sort(
            (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
          );
          this.isLoading = false;
        },
        error: (err) => {
          if (err?.status === 401) {
            this.handleUnauthorizedError();
            return;
          }
          console.error('Erro ao carregar arquivos:', err);
          this.isLoading = false;
        }
      });
  }

  onFileSelected(event: Event, fileInput: HTMLInputElement): void {
    const input = event.target as HTMLInputElement;
    this.handleFiles(input.files);
    fileInput.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(): void {
    this.isDragging = false;
  }

  onDrop(event: DragEvent, fileInput: HTMLInputElement): void {
    event.preventDefault();
    this.isDragging = false;
    this.handleFiles(event.dataTransfer?.files || null);
    fileInput.value = '';
  }

  handleFiles(files: FileList | null): void {
    if (!files || files.length === 0 || this.isRoomLocked) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > 100 * 1024 * 1024) {
        alert(`❌ Arquivo "${file.name}" é muito grande (máx: 100MB)`);
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);

      this.pendingUploads += 1;
      this.isUploading = true;
      this.isUploadIndeterminate = false;
      this.uploadProgress = 0;

      this.http
        .post(`/api/${this.roomName}/upload`, formData, {
          headers: this.roomAuth.getAuthHeaders(this.roomName),
          reportProgress: true,
          observe: 'events'
        })
        .pipe(
          finalize(() => {
            this.pendingUploads = Math.max(0, this.pendingUploads - 1);
            if (this.pendingUploads === 0) {
              this.isUploading = false;
              this.isUploadIndeterminate = false;
              this.uploadProgress = 0;
            }
          })
        )
        .subscribe({
          next: (event) => {
            if (event.type === HttpEventType.UploadProgress) {
              if (event.total) {
                const percent = Math.round((100 * event.loaded) / event.total);
                this.uploadProgress = percent;
                this.isUploadIndeterminate = false;
              } else {
                this.isUploadIndeterminate = true;
              }
            } else if (event.type === HttpEventType.Response) {
              this.loadFiles();
              this.isUploadIndeterminate = false;
              this.uploadProgress = 100;
            }
          },
          error: (err) => {
            if (err?.status === 401) {
              this.handleUnauthorizedError();
              return;
            }
            alert('❌ Erro no upload: ' + file.name);
            console.error(err);
          }
        });
    }
  }

  downloadFile(filename: string): void {
    if (!this.isPrivateRoom) {
      window.location.href = `/api/${this.roomName}/download/${encodeURIComponent(filename)}`;
      return;
    }

    this.roomAuth.requestDownloadTicket(this.roomName, filename).subscribe({
      next: (res) => {
        window.location.href = `/api/${this.roomName}/download/${encodeURIComponent(filename)}?ticket=${encodeURIComponent(res.ticket)}`;
      },
      error: (err) => {
        if (err?.status === 401) {
          this.handleUnauthorizedError();
          return;
        }
        alert('❌ Erro ao iniciar download do arquivo.');
        console.error(err);
      }
    });
  }

  deleteFile(filename: string): void {
    if (!confirm(`Tem certeza que deseja deletar "${filename}"?`)) return;

    this.http
      .delete(`/api/${this.roomName}/delete/${encodeURIComponent(filename)}`, {
        headers: this.roomAuth.getAuthHeaders(this.roomName)
      })
      .subscribe({
        next: () => {
          this.loadFiles();
        },
        error: (err) => {
          if (err?.status === 401) {
            this.handleUnauthorizedError();
            return;
          }
          alert('❌ Erro ao deletar arquivo');
          console.error(err);
        }
      });
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFileIconHTML(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    let iconClass = 'fa-solid fa-file';
    switch (extension) {
      case 'pdf':
        iconClass = 'fa-solid fa-file-pdf';
        break;
      case 'py':
        iconClass = 'fa-brands fa-python';
        break;
      case 'js':
        iconClass = 'fa-brands fa-js';
        break;
      case 'html':
      case 'htm':
        iconClass = 'fa-brands fa-html5';
        break;
      case 'css':
        iconClass = 'fa-brands fa-css3-alt';
        break;
      case 'txt':
      case 'md':
        iconClass = 'fa-solid fa-file-lines';
        break;
      case 'doc':
      case 'docx':
        iconClass = 'fa-solid fa-file-word';
        break;
      case 'xls':
      case 'xlsx':
        iconClass = 'fa-solid fa-file-excel';
        break;
      case 'ppt':
      case 'pptx':
        iconClass = 'fa-solid fa-file-powerpoint';
        break;
      case 'zip':
      case 'rar':
      case '7z':
        iconClass = 'fa-solid fa-file-zipper';
        break;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'webp':
        iconClass = 'fa-solid fa-file-image';
        break;
      case 'mp3':
      case 'wav':
        iconClass = 'fa-solid fa-file-audio';
        break;
      case 'mp4':
      case 'mov':
      case 'avi':
        iconClass = 'fa-solid fa-file-video';
        break;
      case 'sql':
        iconClass = 'fa-solid fa-database';
        break;
    }
    return `<i class="file-icon ${iconClass}"></i>`;
  }

  openPixModal(event: MouseEvent): void {
    event.preventDefault();
    this.isPixModalVisible = true;

    setTimeout(() => {
      if (!this.isQrCodeScriptLoaded && typeof QRCode !== 'undefined') {
        this.generateQRCodeAndSetupClipboard();
        this.isQrCodeScriptLoaded = true;
      } else if (typeof QRCode === 'undefined') {
        this.loadQrCodeScript().then(() => {
          this.isQrCodeScriptLoaded = true;
          this.generateQRCodeAndSetupClipboard();
        });
      }
    }, 0);
  }

  closePixModal(): void {
    this.isPixModalVisible = false;
  }

  private loadQrCodeScript(): Promise<void> {
    return new Promise((resolve, reject) => {
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
    const qrCodeContainer = document.getElementById('qrcodeCanvasRoom');
    const pixInput = document.getElementById('pixKeyInputRoom') as HTMLInputElement;

    if (qrCodeContainer && pixInput && typeof QRCode !== 'undefined') {
      const pixKey = pixInput.value;
      if (pixKey) {
        qrCodeContainer.innerHTML = '';
        this.qrCodeInstance = new QRCode(qrCodeContainer, {
          text: pixKey,
          width: 190,
          height: 190,
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    }
    this.setupClipboard();
  }

  setupClipboard(): void {
    const copyBtn = document.getElementById('copyPixBtnRoom');
    const pixInput = document.getElementById('pixKeyInputRoom') as HTMLInputElement;

    if (copyBtn && pixInput) {
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
