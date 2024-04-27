import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs';
import { LeadModel } from 'src/app/models/lead.model';
import { ProjectModel } from 'src/app/models/project.model';
import { AlertService } from 'src/app/services/alert.service';
import { LeadService } from 'src/app/services/lead.service';
import { LoginService } from 'src/app/services/login.service';
import { ProjectService } from 'src/app/services/project.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-managerequests',
  templateUrl: './managerequests.component.html',
  styleUrls: ['./managerequests.component.css']
})
export class ManagerequestsComponent implements OnInit {
  postulaciones: any[]=[];
  chats: any[]=[];
  //listar
  leads?: LeadModel[];
  projects?: ProjectModel[];
  project: ProjectModel = new ProjectModel();
  currentUserEmail: string | null = null;
  currentUserUid: string | null = null;
  currentDate: Date = new Date;

  constructor(private router: Router, private proyectServices: ProjectService, private alertService: AlertService,  private firestore: AngularFirestore, private leadServices: LeadService, private loginService: LoginService) { }

  displayframe:boolean = false;

  ngOnInit(): void {
    this.getPostulaciones();
    this.getChats();

    //Este código suscribe a un observable para obtener información del usuario y su tipo, actualizando las opciones del menú de manera instantánea cuando se cambia el perfil de un usuario.
    this.loginService.getUserObservable().subscribe((user) => {
      if (user) {
        this.loginService
          .getUserTypeObservable(user.uid)
          .subscribe((userType) => {
            this.displayframeOpt(userType);
          });
      }
    });
  }

  displayframeOpt(userType: string) {
    if (userType) {
      if (userType == "Admin" || userType == "Asistente") {
        this.displayframe=true;
      }else{
        this.router.navigate(['/main'])
      }
    }
  }

  async retrieveLeads(UIDL: string, postulanteName: string, postulanteId: string): Promise<void> {
    try {
        const data = await firstValueFrom(this.leadServices.getbyId(UIDL).snapshotChanges().pipe(
            map(changes =>
                changes.map(c =>
                    ({ id: c.payload.doc.id, ...c.payload.doc.data() })
                )
            )
        ));
        this.leads = data;

        //buscamos el usuario actual que debe teren rol de admin
        this.loginService.user$.subscribe(user => {
          this.currentUserEmail = user ? user.email : null;
        });

        //Crea un nuevo proyecto a partir de los datos postulados y el usuario al que se leasigna
        this.project.registration_date =  this.currentDate;
        this.project.lastUpdate =  this.currentDate;
        this.project.lastUpdateUser =  this.currentUserEmail != null ? this.currentUserEmail : '';        
        this.project.status =  true;
        this.project.state =  "Activo"; //Activo - Iniactivo - Bloqueado - Suspendido 
        this.project.client_name = this.leads[0].name;  
        this.project.client_lastname = this.leads[0].lastname;
        this.project.client_email = this.leads[0].email;
        this.project.tutor_name = postulanteName;
        this.project.tutor_id = postulanteId;
        this.project.client_whatsapp = this.leads[0].wapp;
        this.project.pais = this.leads[0].country;
        this.project.ciudad = this.leads[0].city;
        this.project.paisCode = this.leads[0].paisCode;
        this.project.universidad = this.leads[0].university;
        this.project.titulo = this.leads[0].titulo;
        this.project.bibliografia = this.leads[0].bibliografia;
        this.project.carrera = this.leads[0].carrera;
        this.project.especialidad = this.leads[0].especialidad;
        this.project.tema = this.leads[0].tema;
        this.project.tipofuente = this.leads[0].tipofuente;
        this.project.tamanofuente = this.leads[0].tamanofuente;
        this.project.interlineado = this.leads[0].interlineado;
        this.project.numero_paginas = this.leads[0].numero_paginas;
        this.project.entregas = this.leads[0].entregas;
        this.project.descripcion = this.leads[0].descripcion;
        this.project.fecha_inicio = this.leads[0].fecha_inicio;
        this.project.fecha_entrega1 = this.leads[0].fecha_entrega1;
        this.project.fecha_entrega2 = this.leads[0].fecha_entrega2;
        this.project.fecha_entrega3 = this.leads[0].fecha_entrega3;
        this.project.fecha_entrega4 = this.leads[0].fecha_entrega4;

        this.proyectServices.create(this.project, UIDL).then(() => {
          console.log('¡Proyecto asignado con éxito!');
          //llamada a la alerta
          //this.doSomething("create","Proyecto Asignado");

          
          //se actualiza el campo projectNro en los documentos aspciados al Leads, que ahora seran del proyecto creado
          this.firestore.collection('docs', ref => ref.where('projectId', '==', this.project.uid))
          .get()
          .subscribe(querySnapshot => {
              querySnapshot.forEach(doc => {
                  doc.ref.update({ projectNro: this.project.project_id });
              });
          });

        });

        this.updatePostulacionStatus(UIDL, "Asignada a " + postulanteName);
        if (this.leads && this.leads[0] && this.leads[0].uid) {
            this.updateLeadStatus(this.leads[0].uid, "Postulación Cerrada", false);
        } else {
            console.error('Advertencia: No se pudo acceder a this.leads[0].uid. La llamada a updateLeadStatus se omitió.');
        }

        // Resto del código que no depende de this.leads[0]
    } catch (error) {
        console.error('Error al recuperar los datos de leads:', error);
    }
}

      //llamada al Alert
  doSomething(type:string,message:string){
    //carga de datos del observable, llamando al servicio alert.service
    this.alertService.ShowAlert(type, message, 3000);
  }

  asignrSol(leadUid:string,postulanteName:string,postulanteId:string){
    //console.log(leadUid)
    this.retrieveLeads(leadUid,postulanteName,postulanteId);
  }

  getPostulaciones(): void {
    this.firestore.collection('postulaciones', ref => ref.where('status', '==', 'Pendiente').orderBy('titulo').orderBy('lastUpdate', 'desc')).valueChanges().subscribe((data: any[]) => {
      this.postulaciones = data;      
    });
  }

  getChats(): void {
    this.firestore.collection('chats', ref => ref.where('status', '==', 'E').where('uidProject', '!=', 'AyudaAdmin').orderBy('uidProject', 'desc').orderBy('timestamp', 'desc')).valueChanges().subscribe((data: any[]) => {
      this.chats = data;
      // console.log(this.chats)
    });
  }

  updateChatStatus(uid: string, stts: string): void {
    this.firestore.collection('chats').doc(uid).update({ status: stts })
      .then(() => {
        console.log('Estado del chat actualizado exitosamente');
      })
      .catch((error) => {
        console.error('Error al actualizar el estado del chat:', error);
      });
  }

  updateLeadStatus(uid: any, state: string, sttu:boolean): void {
    this.firestore.collection('leads').doc(uid).update({ state: state, status: sttu })
      .then(() => {
        console.log('Lead actualizado exitosamente');
      })
      .catch((error) => {
        console.error('Error al actualizar lead: ', error);
      });
  }


  updatePostulacionStatus(uid: string, stts: string): void {
    this.firestore.collection('postulaciones', ref => ref.where('leadUID', '==', uid)).get()
      .subscribe({
        next: querySnapshot => {
          querySnapshot.forEach(doc => {
            doc.ref.update({ status: stts })
              .then(() => {
                console.log('Postulación actualizada exitosamente');
              })
              .catch((error) => {
                console.error('Error al actualizar postulación: ', error);
              });
          });
        },
        error: error => {
          console.error('Error al obtener postulaciones: ', error);
        }
      });
  }
 


  approveMessages(opc:boolean, idn:string){
    if (opc){
      this.updateChatStatus(idn, "Released");
    }else{
      this.updateChatStatus(idn, "Refused");
    }
  }

  formatFecha(dateObj: any): string {
    //si es  un objeto de fecha de Firebase Firestore 
    if (dateObj && typeof dateObj.toDate === 'function') {
      const date = dateObj.toDate();
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }else if (dateObj instanceof Date){ //si es una instancia de la clase "Date"
      let day = dateObj.getDate();
      let month = dateObj.getMonth()+1;
      let year = dateObj.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return ''; // o cualquier otro valor predeterminado que desees retornar en caso de que la conversión no sea posible
  }

  formatFechacts(dateObj: any): string {
    //si es  un objeto de fecha de Firebase Firestore 
    if (dateObj && typeof dateObj.toDate === 'function') {
      const date = dateObj.toDate();
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    } else if (dateObj instanceof Date) { // si es una instancia de la clase "Date"
      let day = dateObj.getDate();
      let month = dateObj.getMonth() + 1;
      let year = dateObj.getFullYear();
      let hours = dateObj.getHours();
      let minutes = dateObj.getMinutes();
      let seconds = dateObj.getSeconds();
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }
    return ''; // o cualquier otro valor predeterminado que desees retornar en caso de que la conversión no sea posible
  }

}
