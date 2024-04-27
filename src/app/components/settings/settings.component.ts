import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  constructor(private loginService: LoginService, private router: Router) {}
  displayframe:boolean = false;

  irAModulo(modulo: string, f:string) {
    //this.router.navigate([`/${modulo}`,uidCurrentUser]);
    this.router.navigate([`/${modulo}`], { queryParams: { form: f } });
  }

  ngOnInit() {
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

}
