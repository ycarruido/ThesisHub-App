import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider, User, onAuthStateChanged, setPersistence, browserLocalPersistence } from '@angular/fire/auth';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable, filter, map, of } from 'rxjs';
import { UserModel } from "src/app/models/user.model";
import { UserService } from 'src/app/services/user.service';


@Injectable({
  providedIn: 'root'
})

export class LoginService {

  userMod: UserModel = new UserModel();
  currentDate: Date = new Date;
  lastId: number = 1; // Variable para almacenar el último ID asignado
  user$: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);  user: User | null = null; // Variable para almacenar los datos 
  structUser?: UserModel[];


  constructor(public afAuth: AngularFireAuth, private auth: Auth, private usrservices: UserService, private db: AngularFirestore) { 
    onAuthStateChanged(this.auth, (user) => {
      this.user$.next(user);
    });
  }



  getNumberOfRecords(): Promise<number> {
    return this.db.collection('users').ref.get().then(snapshot => {
      return snapshot.size;
    });
  }

  async getNextId() {
    try {
      const count = await this.getNumberOfRecords();
      this.lastId = count;
      // Aquí puedes utilizar el valor de count
    } catch (error) {
      console.error('Error al obtener la cantidad de registros:', error);
    }
    this.lastId++;
  }

  async resetPassword(email: string): Promise<void> {
    try {
      return this.afAuth.sendPasswordResetEmail(email);
    } catch (error) {
      console.log(error);
    }
  }
  
  register({ email, password, name, phone, address, country, city }: any) {
    return createUserWithEmailAndPassword(this.auth, email, password)
    .then(async(userCredential) => {
    // El usuario se ha registrado correctamente.

    // Ahora, crea un nuevo documento en la coleccion 'users' con el mismo UID.
    await this.getNextId(); //Obtener el proximo ID disponible
    const id = this.lastId.toString();
  
    //await signInWithCurrentUser(this.auth);
    //this.afAuth.signInWithCustomToken(currentUserToken);
    
    return this.db.collection('users').doc(userCredential.user.uid).set({ 
      registration_date:  this.currentDate,
      lastUpdate_date:  this.currentDate,
      lastUpdate:  this.currentDate,
      status:  true,
      state:  "Activo",
      email: email,
      password: password,
      name: name,
      tlf: phone,
      wapp: phone,
      address: address,
      country: country,
      city: city,
      uid: userCredential.user.uid,
      profile_picture: '',
      id: id
    });
  });
}



  
  login({ email, password }: any) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  logout() {
    this.user$.next(null);
    return signOut(this.auth);
  }
  
  //Devuelve un Observable que emite el objeto del usuario actualmente autenticado.
  getUserObservable(): Observable<User | null> {
    return this.user$.asObservable();
  }

  getUserTypeObservable(uid: string): Observable<string> {
    return this.db.doc<UserModel>(`users/${uid}`).valueChanges()
      .pipe(
        map(user => user?.user_type || 'Cliente') // Emite el tipo de usuario o 'Cliente' por defecto
      );
  }

  getUserData(): Observable<User | null> {
    return of(this.auth.currentUser); // Envolver el objeto 'User' en un Observable
  }

  //retorna el objeto de tipo UserModel
  getUserName2(userId: string): Observable<UserModel> {
    return this.db.collection('users').doc(userId).get().pipe(
      map((doc: any) => doc.exists ? doc.data() : null)
    );
  }

  getUserName(userId: string): Observable<UserModel> {
    return this.db.collection('users').doc(userId).get().pipe(
      map((doc: any) => {
        this.structUser = doc.exists ? doc.data() : null;
        return this.structUser ? doc.data() : null;
      })
    );
  }


  getUserFullName(userId: string): Observable<string | null> {
    return this.db.collection('users').doc(userId).get().pipe(
      map((doc: any) => {
        if (doc.exists) {
          const name = doc.data().name;
          const lastname = doc.data().lastname;
          return name + ' ' + lastname;
        } else {
          return null;
        }
      })
    );
  }

} //end LoginService
