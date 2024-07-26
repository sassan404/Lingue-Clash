import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CreateRoomComponent } from './create-room/create-room.component';
import { JoinRoomComponent } from './join-room/join-room.component';
import { RoomComponent } from './room/room.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'create-room', component: CreateRoomComponent },
    { path: 'join-room', component: JoinRoomComponent },
    { path: 'room', component: RoomComponent }
];
