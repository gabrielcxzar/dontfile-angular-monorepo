import { Routes } from '@angular/router';

// 1. Importe seus novos componentes
import { HomeComponent } from './home/home.component';
import { RoomComponent } from './room/room.component';

export const routes: Routes = [
    // 2. Rota para a Homepage (ex: /)
    { path: '', component: HomeComponent },

    // 3. Rota para a Sala (ex: /sala-xyz)
    { path: '**', component: RoomComponent },

    // Opcional: Uma rota "catch-all" para páginas não encontradas
    { path: '**', redirectTo: '' }
];