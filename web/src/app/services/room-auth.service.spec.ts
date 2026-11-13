import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RoomAuthService } from './room-auth.service';

describe('RoomAuthService', () => {
  let service: RoomAuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(RoomAuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('stores and clears normalized room tokens', () => {
    service.setToken('/minha-sala/', 'tok-123');
    expect(service.getToken('minha-sala')).toBe('tok-123');
    expect(service.getAuthHeaders('minha-sala').get('Authorization')).toBe('Bearer tok-123');

    service.clearToken('minha-sala');
    expect(service.getToken('minha-sala')).toBeNull();
    expect(service.getAuthHeaders('minha-sala').has('Authorization')).toBeFalse();
  });

  it('locks room and persists returned token', () => {
    service.lockRoom('sala-vazia', 'segredo').subscribe((res) => {
      expect(res.token).toBe('token-lock');
    });

    const req = httpMock.expectOne('/api/sala-vazia/lock');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ password: 'segredo' });
    req.flush({ success: true, token: 'token-lock', expiresAt: Date.now() + 10000 });

    expect(service.getToken('sala-vazia')).toBe('token-lock');
  });

  it('unlocks room and sends Bearer token when requesting download ticket', () => {
    service.unlockRoom('privada', '1234').subscribe();
    const unlockReq = httpMock.expectOne('/api/privada/unlock');
    unlockReq.flush({ success: true, token: 'token-unlock', expiresAt: Date.now() + 10000 });

    service.requestDownloadTicket('privada', 'relatorio final.pdf').subscribe((res) => {
      expect(res.ticket).toBe('dl-ticket');
    });

    const ticketReq = httpMock.expectOne('/api/privada/download-ticket/relatorio%20final.pdf');
    expect(ticketReq.request.method).toBe('POST');
    expect(ticketReq.request.headers.get('Authorization')).toBe('Bearer token-unlock');
    ticketReq.flush({ ticket: 'dl-ticket', expiresAt: Date.now() + 60000 });
  });
});
