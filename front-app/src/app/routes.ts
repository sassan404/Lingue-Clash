import {Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import { JoinRoomComponent } from './join-room/join-room.component';
import { CreateRoomComponent } from './create-room/create-room.component';
const routeConfig: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home page',
  },
  {
    path: 'join-room',
    component: JoinRoomComponent,
    title: "Join a room",
  },
  {
    path: 'create-room',
    component: CreateRoomComponent,
    title: "Create a room",
  },
];
export default routeConfig;