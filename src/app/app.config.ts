import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

const firebaseConfig = {

  apiKey: "AIzaSyAnM9e9DUiyXmFktpTeMPjq4QTaR0r3L5I",
  authDomain: "dm-tools-artagan.firebaseapp.com",
  projectId: "dm-tools-artagan",
  storageBucket: "dm-tools-artagan.firebasestorage.app",
  messagingSenderId: "146272158391",
  appId: "1:146272158391:web:00928900bfd401b22d0332"

};


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(()=> getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage())
  ]
};
