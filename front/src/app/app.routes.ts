import { Routes } from '@angular/router';
import { HomeComponent } from './Components/home/home.component';
import { RoomComponent } from './Components/room/room.component';
import { CreateRoomComponent } from './Components/create-room/create-room.component';
import { JoinRoomComponent } from './Components/join-room/join-room.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'create-room', component: CreateRoomComponent },
  { path: 'join-room', component: JoinRoomComponent },
  { path: 'room', component: RoomComponent },
];
