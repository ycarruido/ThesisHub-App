import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { UserModel } from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private dbPath = '/users';
  usersRef: AngularFirestoreCollection<UserModel>;
  lastId: number = 1; // Variable para almacenar el último ID asignado


  constructor(private db: AngularFirestore) {
    this.usersRef = db.collection(this.dbPath);
  }

  getAll(): AngularFirestoreCollection<UserModel> {
    return this.db.collection<UserModel>('users', ref => ref.orderBy('id', 'asc'));
  }

  //Consulta
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

  //Funcion asíncrona que crea un nuevo usuario en la base de datos. 
  async create(user: UserModel): Promise<any> {
    try {
      await this.getNextId(); //Obtener el proximo ID disponible
      const id = this.lastId.toString();
      user.id = id;
  
      const refer = this.db.collection('users').doc(); //Referencia a la colección "users"
      const nro = refer.ref.id; //ID Autogenerado del documento
      user.uid = nro;
  
      //creando objeto plano tipo JSOM, de user, para compatibilidad con ref.set
      //...user - sintaxis de propagación ( ...user ) para copiar todas las propiedades de  user  en  userData
      // de esta manera se evita copiar todos los parametros al crear el objeto userData
      const userData = {
        uid: user.uid,
        id: user.id,
        ...user, 
        profile_picture: user.profile_picture || null,
      };
  
      //se guarda el objeto  userData
      await refer.set(userData);
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      throw error;
    }
  }


  update(data: any): Promise<void> {
    return this.usersRef.doc(data.uid).update(data);
  }

  delete(id: string): Promise<void> {
    return this.usersRef.doc(id).delete();
  }

}
