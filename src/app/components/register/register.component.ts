import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  formReg: FormGroup;
  showPassword: boolean = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {
    this.formReg = new FormGroup({
      email: new FormControl(''),
      password: new FormControl(''),
      name: new FormControl(''),
      phone: new FormControl(''),
      address: new FormControl(''),
      country: new FormControl(''),
      city: new FormControl('')
    })
  }

  ngOnInit(): void {
  }

  onSubmit() {


    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        let token = await user.getIdToken();
        //console.log("UID: ", uid, "User auth: ", user.getIdToken)
      } else {
        console.log('No user');
      }
    });


    this.loginService.register(this.formReg.value).then(response => {
      //console.log(response);
      this.loginService.logout();
      this.router.navigate(['/login']);
    }).catch((error: any) => {
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
        }else if (errorCode === 'auth/email-already-in-use'){
          this.formReg.setErrors({ emailalreadyinuse: true });
        }
        console.log(errorMessage);
    });

  }//onSubmit

}
