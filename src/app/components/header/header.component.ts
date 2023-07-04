import { animate, state,keyframes, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

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
export class HeaderComponent implements OnInit{
@Output() sideNavToggled = new EventEmitter<boolean>();
menuStatus: boolean = false;
userData: any;
userEmail: string | null = null;

highlight: boolean = false;

  constructor(private router:Router, public userService: UserService){

  }

  ngOnInit(): void {
    // this.userService.getUserData().subscribe(user => {
    //   console.log("ddd ",user)
    //   if (user) {
    //     this.userData = user?.email;
    //   }
    // });  

    this.userService.user$.subscribe(user => {
      this.userEmail = user ? user.email : null;
    });
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
    this.userService.logout()
      .then(() => {
        this.router.navigate(['/login']);
      })
      .catch(error => console.log(error));
  }
}
