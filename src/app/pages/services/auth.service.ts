import { Injectable } from '@angular/core';

import { AngularFireAuth } from "@angular/fire/compat/auth";
import { User } from 'src/app/shared/user.interface';
import { GoogleAuthProvider } from 'firebase/auth';
import {AngularFirestore, AngularFirestoreDocument } from "@angular/fire/compat/firestore";
import { Observable, of, switchMap, filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public user$: Observable<User>;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) { 
    this.user$ = this.afAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      }),
      filter((user): user is User => user !== undefined) // Filtra para eliminar valores undefined
    );
  }
  
  async resetPassword(email: string): Promise<void>{
    try {
      return this.afAuth.sendPasswordResetEmail(email);
    } catch (error) {
      console.log('Error->', error);
    }
  }

  async loginGoogle(): Promise<User | null>{
    try {
      const googleAuthProvider = new GoogleAuthProvider();

      const{ user } = await this.afAuth.signInWithPopup(googleAuthProvider);
      return user;
    } catch (error) {
      console.log('Error->', error);
      return null;
    }
  }

  async signup(email: string, password: string): Promise<User | null>{
    try {
      const{ user } = await this.afAuth.createUserWithEmailAndPassword(email, password);
      await this.sendVerificationEmail();
      return user;
    } catch (error) {
      console.log('Error->', error);
      return null;
    }
  }

  async login(email: string, password: string): Promise<User | null> {
    try {
      const{ user } = await this.afAuth.signInWithEmailAndPassword(email, password);
      this.updateUserData(user);
      return user ;
    } catch (error) {
      console.log('Error->', error);
      return null;
    }
  }

  async sendVerificationEmail(): Promise<void>{
    try {
      return (await this.afAuth.currentUser)?.sendEmailVerification();
    } catch (error) {
      console.log('Error->', error);
    }
  }

  async logout(): Promise<void>{
    try {
      await this.afAuth.signOut();
    } catch (error) {
      console.log('Error->', error);
    }
  }

  private updateUserData(user:User|null){
    
    if (user !== null) {
      const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
      const data: User = {
        uid: user.uid,
        email: user.email, 
        emailVerified: user.emailVerified, 
        displayName: user.displayName, 
      };
  
      return userRef.set(data, { merge: true });
    } else {
      console.log('No hay usuario autenticado');
      return null;
    }
  }  
}
