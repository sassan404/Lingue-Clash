import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CreateRoomComponent } from './create-room/create-room.component';
import { JoinRoomComponent } from './join-room/join-room.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'create-room', component: CreateRoomComponent },
    { path: 'join-room', component: JoinRoomComponent }
  ];
  
  @NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }
