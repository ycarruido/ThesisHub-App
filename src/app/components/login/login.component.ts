import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

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

  //con email
  onSubmit() {
    this.loginService.login(this.formLogin.value)
      .then(response => {
        console.log(response);
        this.router.navigate(['/dashboard']);
      })
      .catch(error => console.log(error));
  }
  //con google
  onClick() {
    this.loginService.loginWithGoogle()
      .then(response => {
        console.log(response);
        this.router.navigate(['/dashboard']);
      })
      .catch(error => console.log(error))
  }
}
