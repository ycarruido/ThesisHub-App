import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  constructor(
    private loginService: LoginService,
    private router: Router
  ) { }

  displayframe:boolean = false;

  ngOnInit(): void {
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
      if (userType == "Admin") {
        this.displayframe=true;
      }else{
        this.router.navigate(['/main'])
      }
    }
  }

  onClick() {
    this.loginService.logout()
      .then(() => {
        this.router.navigate(['/login']);
      })
      .catch(error => console.log(error));
  }
}
