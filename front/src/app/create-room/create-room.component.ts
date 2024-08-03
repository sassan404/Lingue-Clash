import {CommonModule} from '@angular/common';
import {Component, Injectable} from '@angular/core';

import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { HTTPService, CreateRequest, JoinRoomResponse } from '../http.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import ISO6391 from 'iso-639-1';

@Component({
  selector: 'app-create-room',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule,MatInputModule ],
  templateUrl: './create-room.component.html',
  styleUrl: './create-room.component.css'
})

@Injectable({providedIn: 'root'})
export class CreateRoomComponent {

  createRoomForm = new FormGroup({
    username: new FormControl(''),
    language: new FormControl(''),
  });
  languages: string[] = [];
  filteredLanguages: string[] = [];
  languageControl = new FormControl();
 

  constructor(private httpService: HTTPService,private router: Router) {
    this.languages = ISO6391.getAllNames();
    this.filteredLanguages = this.languages;

        // Subscribe to value changes on the search field
        this.languageControl.valueChanges.subscribe(value => {
          this.filterLanguages(value);
        });
  }

  private filterLanguages(value: string): void {
    const filterValue = value.toLowerCase();
    this.filteredLanguages = this.languages.filter(language =>
      language.toLowerCase().includes(filterValue)
    );
  }

  clearSearchInput(inputElement: HTMLInputElement): void {
    inputElement.value = '';
  }
  

  createRoom() {
    const createRequest: CreateRequest = {
      username: this.createRoomForm.value.username || '',
      language: this.createRoomForm.value.language || ''
    };
    this.httpService.createRoom(createRequest).subscribe(
      reply => {
        const typedReply = reply as JoinRoomResponse;
        this.router.navigate(['/room'], { queryParams: { roomId: typedReply.roomId } });
      },
    );
  }
}
