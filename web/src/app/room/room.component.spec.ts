import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { RoomComponent } from './room.component';

describe('RoomComponent', () => {
  let component: RoomComponent;
  let fixture: ComponentFixture<RoomComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [RoomComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/sala-teste');
    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(RoomComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    component.ngOnDestroy();
    httpMock.verify();
    sessionStorage.clear();
  });

  it('loads files when room is public and allows opening lock modal when empty', () => {
    fixture.detectChanges();

    const accessReq = httpMock.expectOne('/api/sala-teste/access');
    accessReq.flush({ isPrivate: false, unlocked: true });

    const filesReq = httpMock.expectOne('/api/sala-teste/files');
    filesReq.flush([]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.btn-private')?.textContent).toContain('Tornar privada');
    expect(compiled.querySelector('.lock-gate')).toBeNull();
  });

  it('shows lock gate and does not request files when private room is locked', () => {
    fixture.detectChanges();

    const accessReq = httpMock.expectOne('/api/sala-teste/access');
    accessReq.flush({ isPrivate: true, unlocked: false });
    fixture.detectChanges();

    expect(component.isRoomLocked).toBeTrue();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.lock-gate')).not.toBeNull();
    expect(compiled.querySelector('#uploadArea')).toBeNull();
    httpMock.expectNone('/api/sala-teste/files');
  });

  it('locks an empty public room when valid passwords are submitted', () => {
    fixture.detectChanges();
    httpMock.expectOne('/api/sala-teste/access').flush({ isPrivate: false, unlocked: true });
    httpMock.expectOne('/api/sala-teste/files').flush([]);
    fixture.detectChanges();

    component.openLockModal();
    component.lockPassword = 'senha-forte';
    component.lockPasswordConfirm = 'senha-forte';
    component.submitLockRoom();

    const lockReq = httpMock.expectOne('/api/sala-teste/lock');
    expect(lockReq.request.body).toEqual({ password: 'senha-forte' });
    lockReq.flush({ success: true, token: 'tok-private', expiresAt: Date.now() + 10000 });

    expect(component.isPrivateRoom).toBeTrue();
    expect(component.isRoomLocked).toBeFalse();
    expect(component.isLockModalVisible).toBeFalse();
  });

  it('unlocks a locked room on valid password and loads files with token', () => {
    fixture.detectChanges();
    httpMock.expectOne('/api/sala-teste/access').flush({ isPrivate: true, unlocked: false });
    fixture.detectChanges();

    component.unlockPassword = 'segredo-123';
    component.submitUnlockRoom();

    const unlockReq = httpMock.expectOne('/api/sala-teste/unlock');
    unlockReq.flush({ success: true, token: 'tok-unlocked', expiresAt: Date.now() + 10000 });

    const filesReq = httpMock.expectOne('/api/sala-teste/files');
    expect(filesReq.request.headers.get('Authorization')).toBe('Bearer tok-unlocked');
    filesReq.flush([{ name: 'doc.pdf', size: 100, uploadDate: '2026-11-13T10:00:00.000Z' }]);

    expect(component.isRoomLocked).toBeFalse();
    expect(component.files.length).toBe(1);
  });
});
