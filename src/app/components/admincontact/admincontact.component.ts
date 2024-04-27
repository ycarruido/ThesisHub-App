import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { AngularFirestore, QueryFn } from '@angular/fire/compat/firestore';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
import { UserService } from 'src/app/services/user.service';
import { UserModel } from 'src/app/models/user.model';
import { Observable, combineLatest, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-admincontact',
  templateUrl: './admincontact.component.html',
  styleUrls: ['./admincontact.component.css']
})
export class AdmincontactComponent implements OnInit, AfterViewInit{
  panelUsr: boolean = false; //Muestra o no el panel izquierdo de usuarios en el chat
  usuariosConMensajes: any[] = [];

  //usuariosConMensajes$: Observable<any[]> = new Observable<any[]>();
  
  @ViewChild('chatBody') chatBody!: ElementRef;
  user: UserModel = new UserModel();

  currentUserUid: string | null = null;
  currentUserEmail: string | null = null;
  sendersName:string = 'Usuario';

  receiveUserUid: string;
  chatMessages: any[] = [];
  newMessage: string = '';
  tituloPrd: string = 'ADMINISTRACIÓN';
  displayframe:boolean = false;
  
  constructor(private router: Router, private route: ActivatedRoute, private firestore: AngularFirestore, private loginService: LoginService, private userService: UserService) {
    // Obtener los UIDs de los usuarios desde la lista de proyectos o cualquier otra fuente
    this.currentUserUid = 'uid_del_usuario_actual';
    this.receiveUserUid = 'USUARIOADMIN';
  }

  ngOnInit() {
    
    this.loginService.user$.subscribe(user => {
      this.currentUserUid = user ? user.uid : null;
      this.currentUserEmail = user ? user.email: null;

      if (this.currentUserEmail != null){  
        //buscamos los datos del usuario por el email del currentUser
        this.userService.getusrbyEmail(this.currentUserEmail.toString()).valueChanges().subscribe(data => {
          if (data[0]){
            this.user = data[0];
            let usrUID: string = '';

            if (this.user.uid){
              usrUID = this.user.uid;
            }
            
            //si el usuario conectado es Admin
            if (this.user.user_type == 'Admin'){
              this.panelUsr = true; 
              this.receiveUserUid = '';
              this.currentUserUid = "USUARIOADMIN";
              this.sendersName = "Admin";
              //Buscas usuarios con mensajes de chat para admin
              this.getUsuariosConMensajes().subscribe(data => {
                this.usuariosConMensajes = data;
              });
            }else{ //si el usuario conectado es cliente o tutor
              this.panelUsr = false;
              this.receiveUserUid = 'USUARIOADMIN';
              if(this.user.name){
                this.sendersName = this.user.name;
              }
              //Muestra los mensajes de chat de ese usuario
              this.viewChatMessage(usrUID);
            }
          }
        });
      }
    });

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

  }//end ngOnInit

  displayframeOpt(userType: string) {
    if (userType) {
      if (userType == "Admin" || userType == "Asistente") {
        this.displayframe=true;
      }else{
        this.router.navigate(['/main'])
      }
      if (userType == "Cliente") {
      }
      if (userType == "Profesor") {
      }
      if (userType == "Asistente") {
      }
    }
  }

  getUsuariosConMensajes(): Observable<any[]> {

    //Obcion 1 para filtra por uidProject === 'AyudaAdmin'
    // const chatsCollection = this.firestore.collection('chats');
    // const senderUids$ = chatsCollection.valueChanges({ idField: 'id' }).pipe(
    //   map((chats: any[]) => chats.filter(chat => chat.uidProject === 'AyudaAdmin')),
    //   map((chats: any[]) => chats.map(chat => chat.senderUid)),
    //   map(senderUids => [...new Set(senderUids)]),
    //   map(senderUids => senderUids.filter(uid => uid != null && uid !== ''))
    // );

    //Obcion 3 para filtra por uidProject === 'AyudaAdmin'. 
    const chatsCollection = this.firestore.collection('chats', ref => ref
      .where('uidProject', '==', 'AyudaAdmin')
    );
    const senderUids$ = chatsCollection.valueChanges({ idField: 'id' }).pipe(
      //map((chats: any[]) => chats.filter(chat => chat.uidProject === 'AyudaAdmin')),
      map((chats: any[]) => chats.map(chat => chat.senderUid)),
      map(senderUids => [...new Set(senderUids)]),
      map(senderUids => senderUids.filter(uid => uid != null && uid !== ''))
    );

    const receiverUids$ = chatsCollection.valueChanges({ idField: 'id' }).pipe(
      //map((chats: any[]) => chats.filter(chat => chat.uidProject === 'AyudaAdmin')),
      map((chats: any[]) => chats.map(chat => chat.receiverUid)),
      map(receiverUids => [...new Set(receiverUids)]),
      map(receiverUids => receiverUids.filter(uid => uid != null && uid !== ''))
    );

    return combineLatest([senderUids$, receiverUids$]).pipe(
      switchMap(([senderUids, receiverUids]) => {
        const uids = [...senderUids, ...receiverUids];
        if (uids.length > 0) {
          return this.firestore.collection('users', ref => ref.where('uid', 'in', uids)).valueChanges();
        } else {
          return [];
        }
      })
    );
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  sendMessage() {    
    if (this.newMessage) {
      this.firestore.collection('chats').add({
        senderUid: this.currentUserUid,
        receiverUid: this.receiveUserUid,
        message: this.newMessage,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        uidProject: 'AyudaAdmin',
        sendersName: this.sendersName,
        status: 'E' //Enviado
      }).then(() => {
        this.newMessage = '';
      }).catch((error) => {
        console.error('Error al enviar el mensaje:', error);
      });
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.chatBody) {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }
    }, 0);
  }

  viewchat(uid:string){
    this.viewChatMessage(uid);
  }

  viewChatMessage(usrCode: string) {
    if (this.currentUserEmail != null) {
      // Buscamos los datos del usuario por el email del currentUser
      this.userService.getusrbyEmail(this.currentUserEmail.toString()).valueChanges().subscribe(data => {
        if (data[0]) {
          this.user = data[0];
          if (this.user.user_type == 'Admin') {
            this.receiveUserUid = usrCode;
            this.currentUserUid = 'USUARIOADMIN';
          } else {
            this.receiveUserUid = 'USUARIOADMIN';
            this.currentUserUid = usrCode;
          }
          // Con los datos encontrados, consultamos los mensajes de chats para los usuarios Admin
          this.firestore.collection('chats', ref => ref
            .where('senderUid', 'in', [this.currentUserUid, this.receiveUserUid])
            .where('receiverUid', 'in', [this.currentUserUid, this.receiveUserUid])
            .where('uidProject', '==', 'AyudaAdmin')
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
          // Con los datos encontrados, consultamos los mensajes de chats para los usuarios Admin
        } // end if (data[0])
      });
    } else {
      // No se encontró el email del currentUser, mostrar error
      console.log("Error al recuperar los datos");
    }
  }

}
