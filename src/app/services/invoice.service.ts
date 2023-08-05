import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { InvoiceModel } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private dbPath = '/invoices';
  invoicesRef: AngularFirestoreCollection<InvoiceModel>;
  lastId: number = 1; // Variable para almacenar el último ID asignado


  constructor(private db: AngularFirestore) {
    this.invoicesRef = db.collection(this.dbPath);
  }

  getAll(): AngularFirestoreCollection<InvoiceModel> {
    //return this.db.collection<InvoiceModel>('invoices', ref => ref.where('status', '==', "Pendiente").orderBy('invoice_id', 'asc'));
    return this.db.collection<InvoiceModel>('invoices', ref => ref.where('status', 'in', ['Pendiente', 'Aprobada', 'Pagada', 'Anulada']).orderBy('invoice_id', 'asc'));
    //return this.db.collection<InvoiceModel>('invoices', ref => ref.where('status', '==', "Pendiente").where('status', '==', "Aprobada").where('status', '==', "Pagada").where('status', '==', "Anulada").orderBy('invoice_id', 'asc'));
  }

  //Consulta
  getNumberOfRecords(): Promise<number> {
    return this.db.collection('invoices').ref.get().then(snapshot => {
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

  //Funcion asíncrona que crea un nuevo proyecto en la base de datos. 
  async create(invoice: InvoiceModel): Promise<any> {
    try {
      await this.getNextId(); //Obtener el proximo ID disponible
      const id = this.lastId.toString();
      invoice.invoice_id = id;
  
      const refer = this.db.collection('invoices').doc(); //Referencia a la colección "invoices"
      const nro = refer.ref.id; //ID Autogenerado del documento
      invoice.uid = nro;
  
      //creando objeto plano tipo JSOM, de invoice, para compatibilidad con ref.set
      //...invoice - sintaxis de propagación ( ...invoice ) para copiar todas las propiedades de  invoice  en  invoiceData
      // de esta manera se evita copiar todos los parametros al crear el objeto invoiceData
      const invoiceData = {
        uid: invoice.uid,
        invoice_id: invoice.invoice_id,
        ...invoice, 
      };
  
      //se guarda el objeto  invoiceData
      await refer.set(invoiceData);
    } catch (error) {
      console.error('Error al crear el proyecto:', error);
      throw error;
    }
  }


  update(data: any): Promise<void> {
    return this.invoicesRef.doc(data.uid).update(data);
  }

  delete(id: string, usr:string, fecha: Date): Promise<void> {
    return this.invoicesRef.doc(id).update({ status: "Eliminada", lastUpdate: fecha, lastUpdateUser: usr });
  }

}
