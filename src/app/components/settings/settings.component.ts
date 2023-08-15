import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  constructor(private router: Router) {}

  irAModulo(modulo: string, f:string) {
    //this.router.navigate([`/${modulo}`,uidCurrentUser]);
    this.router.navigate([`/${modulo}`], { queryParams: { form: f } });
  }
}
