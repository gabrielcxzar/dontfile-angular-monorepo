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
  private isQrCodeScriptLoaded: boolean = false; // Nova flag para controlar o script
  private qrCodeInstance: any; // Para guardar a instância do QR Code

  constructor(private router: Router) { }

  ngOnInit(): void {
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
        // Se o script já foi carregado, apenas gera o QR Code
        this.generateQRCodeAndSetupClipboard();
      }
    }, 0);
  }

  closePixModal(): void {
    this.isPixModalVisible = false;
  }

  // Novo método para carregar o script dinamicamente
  private loadQrCodeScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('qrcode-script')) {
        resolve(); // Já carregado
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

  // Novo método para gerar o QR Code e configurar o Copiar
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
    this.setupClipboard(); // Garante que o botão de copiar seja configurado
  }

  setupClipboard(): void {
    const copyBtn = document.getElementById('copyPixBtn');
    const pixInput = document.getElementById('pixKeyInput') as HTMLInputElement;

    if (copyBtn && pixInput) {
      // Remove o listener anterior para evitar múltiplos eventos
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

  // 7. Lógica do Input da Sala (Vamos usar o "Jeito Angular" que sugerimos antes)
  setupRoomInput(): void {
    // Esta função agora pode ficar vazia, pois vamos usar (click) no HTML
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
        alert("Por favor, digite um nome válido.");
      }
    } else {
      alert("Por favor, digite um nome para a sala.");
    }
  }
}