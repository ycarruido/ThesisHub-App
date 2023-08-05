import { animate, state,keyframes, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UserModel } from 'src/app/models/user.model';
import { LoginService } from 'src/app/services/login.service';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  animations: [
    trigger('highlightAnimation', [
      state('inactive', style({
        borderColor: 'transparent',
        backgroundColor: '#343a40',
        color: 'white',
        borderRadius: '12%',
      })),
      state('active', style({
        backgroundColor: 'white',
        color: 'brown',
        borderRadius: '12%'

      })),
      transition('inactive <=> active', animate('300ms ease-in-out'))
    ])
  ]
})

export class HeaderComponent implements OnInit, OnDestroy{

  private userSubscription: Subscription = new Subscription;
  @Output() sideNavToggled = new EventEmitter<boolean>();
  menuStatus: boolean = false;
  userData: any;
  userEmail: string | null = null;
  userSeudonimo: string | null = null;
  photoUrl: string | null = null;
  users?: UserModel[];

  highlight: boolean = false;

  constructor(private router:Router, public loginService: LoginService, private usrs: UserService){ }

    ngOnInit(): void {
      
      this.userSubscription = this.loginService.getUserObservable().subscribe((user) => {
        if (user) {
          this.loginService.getUserName(user.uid).subscribe((name) => {
            if (name) {
              this.userSeudonimo = ", " + this.capitalizeText(name);
              // Realiza las acciones que necesites con el nombre del usuario
            } else {
              console.log('No se encontró el nombre del usuario');
            }
          });
        } else {
          this.userEmail = null;
          this.userSeudonimo = null;
        }
      });
      
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
  
  SideNavToggle(){
    this.menuStatus = !this.menuStatus;
    this.sideNavToggled.emit(this.menuStatus);
    this.highlight = !this.highlight;
  }

  rutaa(url: string){
    this.router.navigate([url]);
  }

  logOut() {
    this.loginService.logout().then(() => {
    this.router.navigate(['/login']);
    }).catch(
        error => console.log(error)
    );
  }

  capitalizeText(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
  //capitalizeText toma un texto como argumento y capitaliza la primera letra utilizando  
  //toUpperCase(). Luego, utiliza  slice(1)  para obtener el resto del texto en minúsculas
  //utilizando toLowerCase(). 
}
