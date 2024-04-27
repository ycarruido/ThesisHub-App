import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { LeadModel } from '../models/lead.model';
import { QuerySnapshot } from 'firebase/firestore';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private dbPath = '/leads';
  leadsRef: AngularFirestoreCollection<LeadModel>;
  lastId: number = 1; // Variable para almacenar el último ID asignado


  constructor(private db: AngularFirestore) {
    this.leadsRef = db.collection(this.dbPath);
  }

  getAll(): AngularFirestoreCollection<LeadModel> {
    return this.db.collection<LeadModel>('leads', ref => ref.where('state', '==', 'Activo').where('status', '==', true).orderBy('id', 'asc'));
  }

  getbyId(Ide: string): AngularFirestoreCollection<LeadModel> {
    return this.db.collection<LeadModel>('leads', ref => ref.where('state', '==', 'Activo').where('status', '==', true).where('uid', '==', Ide));
  }

  getusrbyEmail(email: string): AngularFirestoreCollection<LeadModel> {
    return this.db.collection<LeadModel>('leads', ref => ref.where('state', '==', 'Activo').where('status', '==', true).where('email', '==', email));
  }

  getperType(leadType: any): AngularFirestoreCollection<LeadModel> {
    return this.db.collection<LeadModel>('leads', ref => ref.where('state', '==', 'Activo').where('status', '==', true).where('lead_type', '==', leadType).orderBy('id', 'asc'));
  }

  //Consulta
  getNumberOfRecords(): Promise<number> {
    return this.db.collection('leads').ref.get().then(snapshot => {
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
  async create(lead: LeadModel): Promise<any> {
    try {
      await this.getNextId(); //Obtener el proximo ID disponible
      const id = this.lastId.toString();
      lead.id = id;
  
      const refer = this.db.collection('leads').doc(); //Referencia a la colección "leads"
      const nro = refer.ref.id; //ID Autogenerado del documento
      lead.uid = nro;
  
      //creando objeto plano tipo JSOM, de lead, para compatibilidad con ref.set
      //...lead - sintaxis de propagación ( ...lead ) para copiar todas las propiedades de  lead  en  leadData
      // de esta manera se evita copiar todos los parametros al crear el objeto leadData
      const leadData = {
        uid: lead.uid,
        id: lead.id,
        ...lead, 
        profile_picture: lead.profile_picture || null,
      };
  
      //se guarda el objeto  leadData
      await refer.set(leadData);
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      throw error;
    }
  }


  update(data: any): Promise<void> {
    return this.leadsRef.doc(data.uid).update(data);
  }

  delete(id: string, usr:string, fecha: Date): Promise<void> {
    return this.leadsRef.doc(id).update({ state: 'Inactivo', status: false, lastUpdate: fecha, lastUpdateLead: usr });
  }

  savepostulation(post: {id:string, titulo?:string, nombreCliente?:string, emailCliente?:string, currentUser:string, currentUserEmail:string, status:string, lastUpdate:Date}) {
    // Guardar la postulación en la colección de Firestore
    this.db.collection('postulaciones').add(post).then(() => {
        // La postulación se ha guardado correctamente
        console.log('Se envio la postulación');
    })
    .catch((error) => {
      // Ocurrió un error al guardar la postulación
      console.error('Error al guardar la postulación:', error);
    });
  }

  async getPostulation(uid?:string,emailc?: string, emailcu?: string): Promise<Observable<any[]>> {
    return this.db.collection('postulaciones', ref => ref.where('id', '==', uid).where('emailCliente', '==', emailc).where('currentUserEmail', '==', emailcu)).valueChanges();
  }

}

