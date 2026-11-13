import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface RoomAccessStatus {
  isPrivate: boolean;
  unlocked: boolean;
}

export interface RoomAuthResponse {
  success: boolean;
  token: string;
  expiresAt: number;
}

export interface DownloadTicketResponse {
  ticket: string;
  expiresAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class RoomAuthService {
  private readonly storagePrefix = 'dontfile_room_token_v1:';
  private readonly memoryTokens = new Map<string, string>();

  constructor(private http: HttpClient) {}

  private normalizeRoomKey(room: string): string {
    return room.replace(/^\/+|\/+$/g, '');
  }

  getToken(room: string): string | null {
    const key = this.normalizeRoomKey(room);
    if (!key) return null;

    try {
      const stored = sessionStorage.getItem(`${this.storagePrefix}${key}`);
      if (stored) {
        return stored;
      }
    } catch {
      // Fallback para memória caso sessionStorage esteja indisponível
    }
    return this.memoryTokens.get(key) ?? null;
  }

  setToken(room: string, token: string): void {
    const key = this.normalizeRoomKey(room);
    if (!key || !token) return;

    this.memoryTokens.set(key, token);
    try {
      sessionStorage.setItem(`${this.storagePrefix}${key}`, token);
    } catch {
      // Ignora erro de armazenamento em modo restrito
    }
  }

  clearToken(room: string): void {
    const key = this.normalizeRoomKey(room);
    if (!key) return;

    this.memoryTokens.delete(key);
    try {
      sessionStorage.removeItem(`${this.storagePrefix}${key}`);
    } catch {
      // Ignora erro de armazenamento
    }
  }

  getAuthHeaders(room: string): HttpHeaders {
    const token = this.getToken(room);
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAccessStatus(room: string): Observable<RoomAccessStatus> {
    const normalized = this.normalizeRoomKey(room);
    return this.http.get<RoomAccessStatus>(`/api/${normalized}/access`, {
      headers: this.getAuthHeaders(normalized)
    });
  }

  lockRoom(room: string, password: string): Observable<RoomAuthResponse> {
    const normalized = this.normalizeRoomKey(room);
    return this.http
      .post<RoomAuthResponse>(`/api/${normalized}/lock`, { password })
      .pipe(tap((res) => this.setToken(normalized, res.token)));
  }

  unlockRoom(room: string, password: string): Observable<RoomAuthResponse> {
    const normalized = this.normalizeRoomKey(room);
    return this.http
      .post<RoomAuthResponse>(`/api/${normalized}/unlock`, { password })
      .pipe(tap((res) => this.setToken(normalized, res.token)));
  }

  requestDownloadTicket(room: string, filename: string): Observable<DownloadTicketResponse> {
    const normalized = this.normalizeRoomKey(room);
    return this.http.post<DownloadTicketResponse>(
      `/api/${normalized}/download-ticket/${encodeURIComponent(filename)}`,
      {},
      { headers: this.getAuthHeaders(normalized) }
    );
  }
}
