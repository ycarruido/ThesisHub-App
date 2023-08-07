import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { ProjectModel } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private dbPath = '/projects';
  projectsRef: AngularFirestoreCollection<ProjectModel>;
  lastId: number = 1; // Variable para almacenar el último ID asignado


  constructor(private db: AngularFirestore) {
    this.projectsRef = db.collection(this.dbPath);
  }

  getAll(): AngularFirestoreCollection<ProjectModel> {
    //return this.db.collection<ProjectModel>('projects', ref => ref.orderBy('project_id', 'asc'));
    return this.db.collection<ProjectModel>('projects', ref => ref.where('state', '==', 'Activo').where('status', '==', true).orderBy('project_id', 'asc'));
  }

  //Consulta
  getNumberOfRecords(): Promise<number> {
    return this.db.collection('projects').ref.get().then(snapshot => {
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
  async create(project: ProjectModel): Promise<any> {
    try {
      await this.getNextId(); //Obtener el proximo ID disponible
      const id = this.lastId.toString();
      project.project_id = "THUBVE"+id;
  
      const refer = this.db.collection('projects').doc(); //Referencia a la colección "projects"
      const nro = refer.ref.id; //ID Autogenerado del documento
      project.uid = nro;
  
      //creando objeto plano tipo JSOM, de project, para compatibilidad con ref.set
      //...project - sintaxis de propagación ( ...project ) para copiar todas las propiedades de  project  en  projectData
      // de esta manera se evita copiar todos los parametros al crear el objeto projectData
      const projectData = {
        uid: project.uid,
        project_id: project.project_id,
        ...project, 
      };
  
      //se guarda el objeto  projectData
      await refer.set(projectData);
    } catch (error) {
      console.error('Error al crear el proyecto:', error);
      throw error;
    }
  }


  update(data: any): Promise<void> {
    return this.projectsRef.doc(data.uid).update(data);
  }

  delete(id: string, usr:string, fecha: Date): Promise<void> {
    //return this.projectsRef.doc(id).delete();
    return this.projectsRef.doc(id).update({ state: 'Eliminado', status: false, lastUpdate: fecha, lastUpdateUser: usr });
  }
}
