import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-managerequests',
  templateUrl: './managerequests.component.html',
  styleUrls: ['./managerequests.component.css']
})
export class ManagerequestsComponent implements OnInit {
  postulaciones: any[]=[];
  chats: any[]=[];

  constructor(private firestore: AngularFirestore) { }

  ngOnInit(): void {
    this.getPostulaciones();
    this.getChats();
  }

  getPostulaciones(): void {
    this.firestore.collection('postulaciones', ref => ref.orderBy('cliente').orderBy('lastUpdate', 'desc')).valueChanges().subscribe((data: any[]) => {
      this.postulaciones = data;
      // console.log(this.postulaciones)
    });
  }

  getChats(): void {
    this.firestore.collection('chats', ref => ref.where('status', '==', 'E').orderBy('timestamp', 'desc')).valueChanges().subscribe((data: any[]) => {
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
