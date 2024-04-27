import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(
    private loginService: LoginService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  onClick(opc: number) {
    if (opc==1){
      this.loginService.logout().then(() => {
          this.router.navigate(['/register']);
      }).catch(error => console.log(error));
    }else{
          this.router.navigate(['/login']);
    }
  }//end onClick
    

}
