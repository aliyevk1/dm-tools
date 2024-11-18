import { inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updateProfile,
  user
} from '@angular/fire/auth';
import { Observable, from, EMPTY } from 'rxjs';
import { addDoc, collection, doc, Firestore, setDoc } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})

export class AuthService {
  firebaseAuth = inject(Auth);
  firestore = inject(Firestore);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<User | null | undefined>(undefined);

  constructor() { }

  register(
    email:string, username: string, password: string
  ): Observable<void>
  {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password,
    )
    .then(async response => {
      updateProfile(response.user, {displayName: username});
      await this.createUserDocument(response.user.uid, username);
    })

    return from(promise);
  }

  login(
    email: string, password: string
  ): Observable<void>
  {
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(() => {}); // this is done to convety Observable<UserCredentials> to Observable<void>

    return from(promise);
  }

  logout(): Observable<void>{
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }

  updateEmail(newEmail: string):Observable<void>{
    if(this.firebaseAuth.currentUser){
      const promise = updateEmail(this.firebaseAuth.currentUser, newEmail);
      return from(promise);
    }
    return EMPTY;
  }

  sendEmailVerification(): Observable<void>{
    if(this.firebaseAuth.currentUser){
      const promise = sendEmailVerification(this.firebaseAuth.currentUser);
      return from(promise);
    }
    return EMPTY;
  }

  sendPasswordResetEmail(email:string): Observable<void>{
    const promise = sendPasswordResetEmail(this.firebaseAuth, email);
    return from(promise);
  }

  private async createUserDocument(uid: string, username: string): Promise<void> {
    try {
      const userData = {
        uid: uid, // Initialize with one default preset
      };

      const userDocRef = doc(this.firestore, `users/${uid}`);
      await setDoc(userDocRef, userData);

       // Create a collection for "presets" with a "Default Preset"
      const presetsCollectionRef = collection(this.firestore, `users/${uid}/presets`);
      const presetData = {
        name: 'Default',
      };
      await addDoc(presetsCollectionRef, presetData);

       // Create a collection for "effectsGroups" with a "Default Effects Group"
      const effectsGroupsCollectionRef = collection(this.firestore, `users/${uid}/effectsGroups`);
      const effectsGroupData = {
        name: 'Default Effects Group',
        effects: [] // Initially empty effects array
      };
      await addDoc(effectsGroupsCollectionRef, effectsGroupData);

    } catch (error) {
      console.error('Error creating user or preset:', error);
    }

  }
}
