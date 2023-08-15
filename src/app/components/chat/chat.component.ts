import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

import { UserModel } from 'src/app/models/user.model';
import { LoginService } from 'src/app/services/login.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit, AfterViewInit {
  @ViewChild('chatBody') chatBody!: ElementRef;
  
  sendingMessage: boolean = false;
  user: UserModel = new UserModel();
  currentUserEmail: any = '';
  currentUserUid: string;
  receiveUserUid: string;
  sendersName:string = 'Usuario';
  uidProy: string ="";
  id: string ="";
  chatMessages: any[] = [];
  newMessage: string = '';
  tituloPrd: string = '';

  constructor(private route: ActivatedRoute, private firestore: AngularFirestore, private loginService: LoginService, private userService: UserService) {
    // Obtener los UIDs de los usuarios desde la lista de proyectos o cualquier otra fuente
    this.currentUserUid = 'uid_del_usuario_actual';
    this.receiveUserUid = 'uid_del_otro_usuario';
  }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      this.currentUserUid = params['uidCurrentUser'];
      this.receiveUserUid = params['uidReceiveUser'];
      this.uidProy = params['uidProject'];
      this.id = params['id'];
      this.tituloPrd = params['title'];
    });

    this.firestore.collection('chats', ref => ref
      .where('senderUid', 'in', [this.currentUserUid, this.receiveUserUid])
      .where('receiverUid', 'in', [this.currentUserUid, this.receiveUserUid])
      .where('uidProject', '==', this.uidProy)
      //.where('status', 'in', ['Released', 'Refused'])
      .orderBy('timestamp')
    ).valueChanges().subscribe((messages: any[]) => {
      this.chatMessages = messages.map(message => {
        const timestamp = message.timestamp?.toDate();
        const formattedTimestamp = timestamp?.toLocaleString('es-VE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        return { ...message, formattedTimestamp };
      });
      this.scrollToBottom();
    });
  }//end ngOnInit

  ngAfterViewInit() {
    this.scrollToBottom();
  }


  sendMessage() {
    this.sendingMessage = true;
    this.loginService.user$.subscribe(user => {
      this.currentUserEmail = user ? user.email : null;
      if (this.currentUserEmail != null) {
        // Buscamos los datos del usuario por el email del currentUser
        this.userService.getusrbyEmail(this.currentUserEmail.toString()).valueChanges().subscribe(data => {
          if (data[0]) {
            this.user = data[0];
  
            if (this.user.name) {
              this.sendersName = this.user.name + ' ' + this.user.lastname;
            }
  
            if (this.newMessage) {
              const docRef = this.firestore.collection('chats').doc(); // Obtener una referencia a un nuevo documento sin ID
              const newId = docRef.ref.id; // Obtener el ID autogenerado por Firebase
  
              docRef.set({
                senderUid: this.currentUserUid,
                receiverUid: this.receiveUserUid,
                message: this.newMessage,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                uidProject: this.uidProy,
                sendersName: this.sendersName,
                status: 'E', // Enviado
                id: newId // Asignar el ID autogenerado al campo "id" del documento
              }).then(() => {
                this.newMessage = '';
                this.sendingMessage = false;
              }).catch((error) => {
                console.error('Error al enviar el mensaje:', error);
              });
            }
          }
        });
      } // if this.currentUserEmail != null
    });
  }

  //Guardaba los mensajes pero el campo ID, no era el mismo que el ID del documento
  // sendMessage() {
  //   this.loginService.user$.subscribe(user => {
  //     this.currentUserEmail = user ? user.email: null;
  //     if (this.currentUserEmail != null){  
  //       //buscamos los datos del usuario por el email del currentUser
  //       this.userService.getusrbyEmail(this.currentUserEmail.toString()).valueChanges().subscribe(data => {
  //         if (data[0]){
  //           this.user = data[0];

  //           if (this.user.name){
  //             this.sendersName = this.user.name;
  //           }
            
  //           if (this.newMessage) {
  //             this.firestore.collection('chats').add({
  //               senderUid: this.currentUserUid,
  //               receiverUid: this.receiveUserUid,
  //               message: this.newMessage,
  //               timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  //               uidProject: this.uidProy,
  //               sendersName: this.sendersName,
  //               id: this.id,
  //               status: 'E' //Enviado
  //             }).then(() => {
  //               this.newMessage = '';
  //             }).catch((error) => {
  //               console.error('Error al enviar el mensaje:', error);
  //             });
  //           }
  //         }
  //       });
  //     }// if this.currentUserEmail != null
  //   });

  // }//end sendMessage

  obtenerPrimerNombre(nombreCompleto: string): string {
    const partesNombre = nombreCompleto.split(' ');
    return partesNombre[0];
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
    }, 0);
  }

}