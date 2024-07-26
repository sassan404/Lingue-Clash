import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getFunctions, provideFunctions } from '@angular/fire/functions';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(), 
    provideHttpClient(withFetch()), 
    provideFirebaseApp(() => 
      initializeApp({
        "projectId":"word-clash-2aa96",
        "appId":"1:986535699243:web:0087737f5280f980001b6e",
        "databaseURL":"https://word-clash-2aa96-default-rtdb.europe-west1.firebasedatabase.app",
        "storageBucket":"word-clash-2aa96.appspot.com",
        "apiKey":"AIzaSyAzKquPglvVG3zbRXkW82tB8Kf2aqZGdV4",
        "authDomain":"word-clash-2aa96.firebaseapp.com",
        "messagingSenderId":"986535699243",
        "measurementId":
        "G-1ZXKW0MZRM"})), 
        provideFirestore(() => getFirestore()), 
        provideDatabase(() => getDatabase()), 
        provideFunctions(() => getFunctions())]
};

// private apiUrl = 'http://127.0.0.1:5001/word-clash-2aa96/us-central1/';