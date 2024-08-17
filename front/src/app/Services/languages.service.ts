
import { Injectable } from '@angular/core';
import ISO6391 from 'iso-639-1';

@Injectable({ providedIn: 'root' })
export class LanguagesService {

    constructor() { }
    
  languages: string[] = [];
}