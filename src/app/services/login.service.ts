import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider, User, onAuthStateChanged, setPersistence, browserLocalPersistence } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
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
  
  constructor(private auth: Auth, private usrservices: UserService, private db: AngularFirestore) { 
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

  register({ email, password, name, phone, address, country, city }: any) {
      return createUserWithEmailAndPassword(this.auth, email, password)
      .then(async(userCredential) => {
      // El usuario se ha registrado correctamente.

      // Ahora, crea un nuevo documento en la coleccion 'users' con el mismo UID.
      await this.getNextId(); //Obtener el proximo ID disponible
      const id = this.lastId.toString();

      // Iniciamos sesión nuevamente con las credenciales del administrador
      //await signInWithEmailAndPassword(this.auth, "yourEmail", "yourPassword");
      
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

  getUserObservable(): Observable<User | null> {
    return this.user$.asObservable();
  }

  getUserData(): Observable<User | null> {
    return of(this.auth.currentUser); // Envolver el objeto 'User' en un Observable
  }

  getUserName(userId: string): Observable<string | null> {
    return this.db.collection('users').doc(userId).get().pipe(
      map((doc: any) => doc.exists ? doc.data().name : null)
    );
  }

} //end LoginService
