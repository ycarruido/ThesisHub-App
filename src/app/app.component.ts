import { Component } from '@angular/core';
import { AlertService } from './services/alert.service';
import { Subscription } from 'rxjs';
import { LoginService } from './services/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Creado en Angular 16 Firebase htts://andromedaoll.com';
  sideNavStatus: boolean = false;
  tipoUsr?: string = '';
  sideNavDisplay: boolean = false;
  showAlert = false;
  message = '';
  typeAlert = 'alert alert-info alerta';
  userEmail: string | null = null;
  userSeudonimo: string | null = null;
  private userSubscription: Subscription = new Subscription;

  constructor(private alertService: AlertService, public loginService: LoginService){}

  ngOnInit(){
    //alert
    this.alertService.alert$.subscribe((res: any) => {
      this.message = res.message;
      this.showAlert = true;
      
      if (res.type=="create"){
        this.typeAlert = "alert alert-info alerta";
      }
      if (res.type=="update"){
        this.typeAlert = "alert alert-info alerta";
      }
      if (res.type=="delete"){
        this.typeAlert = "alert alert-danger alerta";
      }

      setTimeout(() =>{
        this.showAlert = false;
      }, res.time);
    });



    //nos subscribimos para verificar si se inicio o no session
    this.userSubscription = this.loginService.getUserObservable().subscribe((user) => {
      if (user) {
        this.loginService.getUserName(user.uid).subscribe((users) => {
          if (users) {
            if (users.name) {
              //console.log("user: ", users.user_type);
              this.userSeudonimo = ", " + this.capitalizeText(users.name);
              this.tipoUsr = users.user_type;
              this.sideNavDisplay = true;

              //console.log("USER: ",this.loginService.structUser)
              // Realiza las acciones que necesites con el nombre del usuario
            } else {
              console.log('No se encontró el nombre del usuario');
            }
            
          } else {
            console.log('No se encontró el nombre del usuario');
          }
        });
      } else {
        this.userEmail = null;
        this.userSeudonimo = null;
        this.sideNavDisplay = false;
      }
    });

  } //end ngOnInit


  capitalizeText(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

}
