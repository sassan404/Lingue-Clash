import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: 'AIzaSyCcuhumCj7KtvwUINzW2zgFqae18NDnafo',
        authDomain: 'word-clash-2aa96.firebaseapp.com',
        databaseURL:
          'https://word-clash-2aa96-default-rtdb.europe-west1.firebasedatabase.app',
        projectId: 'word-clash-2aa96',
        storageBucket: 'word-clash-2aa96.appspot.com',
        messagingSenderId: '986535699243',
        appId: '1:986535699243:web:9b7a571e46ac6d72001b6e',
        measurementId: 'G-9NKY2T87SK',
      }),
    ),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideFunctions(() => getFunctions()),
    provideAnimationsAsync(),
  ],
};
