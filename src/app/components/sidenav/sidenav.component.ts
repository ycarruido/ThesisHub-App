import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit {
  @Input() sideNavStatus: boolean = false;
  list = [
    {
      number: '1',
      name: 'Dashboard',
      icon: 'fa fa-solid fa-gauge',
    },
    {
      number: '2',
      name: 'Proyectos',
      icon: 'fa fa-solid fa-diagram-project',
    },
    {
      number: '3',
      name: 'Consulta Adm',
      icon: 'fa fa-regular fa-message',
    },
    {
      number: '4',
      name: 'Leads',
      icon: 'fa fa-regular fa-address-card',
    },
    {
      number: '5',
      name: 'Facturas',
      icon: 'fa fa-solid fa-file-invoice',
    },
    {
      number: '6',
      name: 'Información',
      icon: 'fa fa-solid fa-circle-info',
    },
    {
      number: '7',
      name: 'Configuración',
      icon: 'fa fa-solid fa-gear',
    },
  ]

  constructor(){}

  ngOnInit(): void {
    
  }
}
