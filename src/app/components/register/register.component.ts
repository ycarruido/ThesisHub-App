import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  formReg: FormGroup;

  constructor(
    private userService: LoginService,
    private router: Router
  ) {
    this.formReg = new FormGroup({
      email: new FormControl(''),
      password: new FormControl('')
    })
  }

  ngOnInit(): void {
  }

  onSubmit() {
    this.userService.register(this.formReg.value)
      .then(response => {
        console.log(response);
        this.router.navigate(['/login']);
      })
      .catch((error: any) => {
        const errorCode = error.code;
          let errorMessage = error.message;
  
          if (errorCode === 'auth/wrong-password') {
            this.formReg.setErrors({ wrongPassword: true });
          } else if (errorCode === 'auth/user-not-found') {
            this.formReg.setErrors({ userNotFound: true });
          }else if (errorCode === 'auth/missing-password') {
            this.formReg.setErrors({ missingPassword: true });
          }else if (errorCode === 'auth/invalid-email') {
            this.formReg.setErrors({ invalidEmail: true });
          }else if (errorCode === 'auth/weak-password') {
            this.formReg.setErrors({ weakPassword: true });
          }
          
          console.log(errorMessage);
      });



  }

}
