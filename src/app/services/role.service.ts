import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { RoleModel } from '../models/role.model';


import { CountryModel } from '../models/country.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private dbPath = '/roles';
  rolesRef: AngularFirestoreCollection<RoleModel>;
  lastId: number = 1; // Variable para almacenar el último ID asignado


  constructor(private db: AngularFirestore) {
    this.rolesRef = db.collection(this.dbPath);
  }

  getAllRole(): AngularFirestoreCollection<RoleModel> {
    return this.db.collection<RoleModel>('roles', ref => ref.where('status', '==', true).orderBy('roleId', 'asc'));
  }

  getAllRoleCode(country_id: string): AngularFirestoreCollection<RoleModel> {
    return this.db.collection<RoleModel>('roles', ref => ref.where('status', '==', true).where('countryCode', '==', country_id).orderBy('roleName', 'asc'));
  }

  //Consulta
  getNumberOfRecords(): Promise<number> {
      return this.db.collection('roles').ref.get().then(snapshot => {
        return snapshot.size;
      });
  }
  
  async getNextId() {
      try {
        const count = await this.getNumberOfRecords();
        this.lastId = count;
      } catch (error) {
        console.error('Error al obtener la cantidad de registros:', error);
      }
      this.lastId++;
  }

  async createRole(role: RoleModel): Promise<any> {
    try {

      await this.getNextId(); //Obtener el proximo ID disponible
      const id = this.lastId.toString();
      role.roleId = id;

      const refer = this.db.collection('roles').doc(); //Referencia a la colección "roles"
      const nro = refer.ref.id; //ID Autogenerado del documento
      role.uid = nro;

      const roleData = {
        uid: nro,
        roleId: role.roleId,
        ...role
      };
  
      //se guarda el objeto  roleData
      await refer.set(roleData);
    } catch (error) {
      console.error('Error al crear el ciudad:', error);
      throw error;
    }
  }

  update(data: any): Promise<void> {
    return this.rolesRef.doc(data.uid).update(data);
  }

  delete(id: string, usr:string, fecha: Date): Promise<void> {
    return this.rolesRef.doc(id).update({ status: false, lastUpdate: fecha, lastUpdateUser: usr });
  }

}
