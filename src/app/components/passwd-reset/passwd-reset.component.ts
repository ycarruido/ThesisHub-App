import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-passwd-reset',
  templateUrl: './passwd-reset.component.html',
  styleUrls: ['./passwd-reset.component.css']
})

export class PasswdResetComponent {
  email: FormControl;

  constructor(private router: Router, private LoginService: LoginService, private alertService: AlertService) {
    this.email = new FormControl();
  }

  async onReset() {
    try {
      const email = this.email.value;
      //console.log(email)
      
      await this.LoginService.resetPassword(email);
      this.doSomething("update","Se ha enviThesisHubado un enlace de recuperación a su cuenta!");
        
      this.router.navigate(['/login']);
    } catch (error) {
      console.log(error);
    }
  }

     //llamada al Alert
     doSomething(type:string,message:string){
      //carga de datos del observable, llamando al servicio alert.service
      this.alertService.ShowAlert(type, message, 3000);
  }

}
