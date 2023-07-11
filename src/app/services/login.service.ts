import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider, User, onAuthStateChanged } from '@angular/fire/auth';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { UserModel } from "src/app/models/user.model";

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  user$: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);  user: User | null = null; // Variable para almacenar los datos 
  constructor(private auth: Auth) { 
    onAuthStateChanged(this.auth, (user) => {
      this.user$.next(user);
    });
  }

  register({ email, password }: any) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login({ email, password }: any) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  logout() {
    return signOut(this.auth);
  }

  getCurrentUser(): UserModel | null {
     const user_string = localStorage.getItem("user");
     if (user_string) {
       const user: UserModel = JSON.parse(user_string);
       return user;
     } else {
      return null;
     }
  }

  getUserObservable(): Observable<User | null> {
    return this.user$.asObservable();
  }
 

  // getUserData() {
  //   return this.auth.currentUser; // Obtener los datos del usuario actual 
  // }

  getUserData(): Observable<User | null> {
    return of(this.auth.currentUser); // Envolver el objeto 'User' en un Observable
  }

} //end LoginService
