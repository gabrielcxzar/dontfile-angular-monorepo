import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

declare var QRCode: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  public isPixModalVisible: boolean = false;
  public isPrivacyNoticeVisible: boolean = false;
  private isQrCodeScriptLoaded: boolean = false; // Nova flag para controlar o script
  private qrCodeInstance: any; // Para guardar a instÃ¢ncia do QR Code
  private readonly privacyNoticeStorageKey = 'dontfile_privacy_notice_ack_v1';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.checkPrivacyNotice();
    this.setupRoomInput();
  }

  openPixModal(event: MouseEvent): void {
    event.preventDefault();
    this.isPixModalVisible = true;

    // Atraso para garantir que o modal esteja no DOM antes de gerar o QR Code
    setTimeout(() => {
      // Carrega o script do QR Code apenas uma vez
      if (!this.isQrCodeScriptLoaded) {
        this.loadQrCodeScript().then(() => {
          this.isQrCodeScriptLoaded = true;
          this.generateQRCodeAndSetupClipboard();
        });
      } else {
        // Se o script jÃ¡ foi carregado, apenas gera o QR Code
        this.generateQRCodeAndSetupClipboard();
      }
    }, 0);
  }

  closePixModal(): void {
    this.isPixModalVisible = false;
  }

  // Novo mÃ©todo para carregar o script dinamicamente
  private loadQrCodeScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('qrcode-script')) {
        resolve(); // JÃ¡ carregado
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

  // Novo mÃ©todo para gerar o QR Code e configurar o Copiar
  private generateQRCodeAndSetupClipboard(): void {
    const qrCodeContainer = document.getElementById('qrcodeCanvas');
    const pixInput = document.getElementById('pixKeyInput') as HTMLInputElement;

    if (qrCodeContainer && pixInput && typeof QRCode !== 'undefined') {
      const pixKey = pixInput.value;
      if (pixKey) {
        // Limpa o QR Code anterior se existir
        qrCodeContainer.innerHTML = '';
        this.qrCodeInstance = new QRCode(qrCodeContainer, {
          text: pixKey,
          width: 190,
          height: 190,
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    }
    this.setupClipboard(); // Garante que o botÃ£o de copiar seja configurado
  }

  setupClipboard(): void {
    const copyBtn = document.getElementById('copyPixBtn');
    const pixInput = document.getElementById('pixKeyInput') as HTMLInputElement;

    if (copyBtn && pixInput) {
      // Remove o listener anterior para evitar mÃºltiplos eventos
      const oldCopyBtn = copyBtn.cloneNode(true);
      copyBtn.parentNode?.replaceChild(oldCopyBtn, copyBtn);
      const newCopyBtn = document.getElementById('copyPixBtn') as HTMLButtonElement;

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

  // 7. LÃ³gica do Input da Sala (Vamos usar o "Jeito Angular" que sugerimos antes)
  setupRoomInput(): void {
    // Esta funÃ§Ã£o agora pode ficar vazia, pois vamos usar (click) no HTML
  }
  private checkPrivacyNotice(): void {
    try {
      this.isPrivacyNoticeVisible = localStorage.getItem(this.privacyNoticeStorageKey) !== 'accepted';
    } catch {
      this.isPrivacyNoticeVisible = true;
    }
  }

  acceptPrivacyNotice(): void {
    this.isPrivacyNoticeVisible = false;
    try {
      localStorage.setItem(this.privacyNoticeStorageKey, 'accepted');
    } catch {
      // Ignora falhas de armazenamento para nao travar a experiencia.
    }
  }

  goToRoom(roomValue: string): void {
    const newRoom = roomValue.trim();
    if (newRoom.length > 0) {
      const safeRoomName = newRoom
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');

      if (safeRoomName) {
        this.router.navigate([safeRoomName]);
      } else {
        alert("Por favor, digite um nome vÃ¡lido.");
      }
    } else {
      alert("Por favor, digite um nome para a sala.");
    }
  }
}
