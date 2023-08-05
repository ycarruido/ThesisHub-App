import { Component } from '@angular/core';
import { map } from 'rxjs';
import { UserModel } from 'src/app/models/user.model';
import { LoginService } from 'src/app/services/login.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-infor',
  templateUrl: './infor.component.html',
  styleUrls: ['./infor.component.css']
})
export class InforComponent {
  user: UserModel = new UserModel();
  users?: UserModel[];
  userEmail: string | null = null;
  userSeudonimo: string | null = null;

  constructor(private userService: UserService, public loginService: LoginService) { }


  

  ngOnInit(): void {
    this.loginService.user$.subscribe(user => {
      this.userEmail = user ? user.email : null;

      if (this.userEmail != null){        

        this.userService.getusrbyEmail(this.userEmail.toString()).valueChanges().subscribe(data => {
          if (data[0]){
            this.user = data[0];
          }
        });
        
      }else{
        console.log("Error al recuperar los datos");
      }
      
    });
  }


  closeview(){
  }
}
