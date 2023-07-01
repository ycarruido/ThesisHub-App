import { animate, state,keyframes, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

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

highlight: boolean = false;

  constructor(){

  }

  ngOnInit(): void {
  }

  SideNavToggle(){
    this.menuStatus = !this.menuStatus;
    this.sideNavToggled.emit(this.menuStatus);
    this.highlight = !this.highlight;
  }
}
