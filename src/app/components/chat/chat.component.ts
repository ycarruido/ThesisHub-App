import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit, AfterViewInit {
  @ViewChild('chatBody') chatBody!: ElementRef;
  
  currentUserUid: string;
  otherUserUid: string;
  chatMessages: any[] = [];
  newMessage: string = '';

  constructor(private route: ActivatedRoute, private firestore: AngularFirestore) {
    // Obtener los UIDs de los usuarios desde la lista de proyectos o cualquier otra fuente
    this.currentUserUid = 'uid_del_usuario_actual';
    this.otherUserUid = 'uid_del_otro_usuario';
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.currentUserUid = params['uidCurrentUser'];
      this.otherUserUid = params['uidReceiveUser'];
      console.log("p1: ",this.currentUserUid)
      console.log("p2: ",this.otherUserUid)
      // Utiliza los parámetros como desees
    });



    this.firestore.collection('chats', ref => ref
      .where('senderUid', 'in', [this.currentUserUid, this.otherUserUid])
      .where('receiverUid', 'in', [this.currentUserUid, this.otherUserUid])
      .orderBy('timestamp')
    ).valueChanges().subscribe((messages: any[]) => {
      this.chatMessages = messages;
      this.scrollToBottom();
    });
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  sendMessage() {
    if (this.newMessage) {
      this.firestore.collection('chats').add({
        senderUid: this.currentUserUid,
        receiverUid: this.otherUserUid,
        message: this.newMessage,
        timestamp: new Date()
      }).then(() => {
        this.newMessage = '';
      }).catch((error) => {
        console.error('Error al enviar el mensaje:', error);
      });
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
    }, 0);
  }
}