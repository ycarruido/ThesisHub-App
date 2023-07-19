import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
import { UserCredential } from 'firebase/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  formLogin: FormGroup;

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {
    this.formLogin = new FormGroup({
      email: new FormControl(),
      password: new FormControl()
    })
  }

  ngOnInit(): void {
  }

  onSubmit() {
    if (this.formLogin.valid) {
      const email = this.formLogin.value.email;
      const password = this.formLogin.value.password;
  
      this.loginService.login({ email, password })
        .then((response: UserCredential) => {
          //console.log(response);
          this.router.navigate(['/dashboard']);
        })
        .catch((error: any) => {
          const errorCode = error.code;
          let errorMessage = error.message;
  
          if (errorCode === 'auth/wrong-password') {
            this.formLogin.setErrors({ wrongPassword: true });
          } else if (errorCode === 'auth/user-not-found') {
            this.formLogin.setErrors({ userNotFound: true });
          }else if (errorCode === 'auth/missing-password') {
            this.formLogin.setErrors({ missingPassword: true });
          }else if (errorCode === 'auth/invalid-email') {
            this.formLogin.setErrors({ invalidEmail: true });
          }
  
          console.log(errorMessage);
          // Aquí puedes mostrar la alerta correspondiente utilizando una librería de alertas o creando tu propia implementación
        });
    }
  }

  onClick() {
    this.loginService.loginWithGoogle()
      .then((response: UserCredential) => {
        //console.log(response);
        this.router.navigate(['/dashboard']);
      })
      .catch((error: any) => console.log(error));
  }



}
