import { Component, Input, OnInit } from '@angular/core';

interface NavItem {
  number: string;
  name: string;
  icon: string;
  routeLink: string;
  selected: boolean;
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})

export class SidenavComponent implements OnInit {
  @Input() sideNavStatus: boolean = false;

  list: NavItem[] = [
    {
      number: '1',
      name: 'Dashboard',
      icon: 'fa fa-solid fa-gauge-high',
      routeLink: "dashboard",
      selected: false
    },
    {
      number: '2',
      name: 'Proyectos',
      icon: 'fa fa-solid fa-diagram-project', 
      routeLink: "project",
      selected: false
    },
    {
      number: '4',
      name: 'Leads',
      icon: 'fa fa-regular fa-address-card',
      routeLink: "leads",
      selected: false
    },
    {
      number: '5',
      name: 'Facturas',
      icon: 'fa fa-solid fa-file-invoice',
      routeLink: "invoices",
      selected: false
    },
    {
      number: '6',
      name: 'Información',
      icon: 'fa fa-solid fa-circle-info', 
      routeLink: "infor",
      selected: false
    },
    {
      number: '3',
      name: 'Consulta Adm',
      icon: 'fa fa-regular fa-message',
      routeLink: "admincontact",
      selected: false
    },
    {
      number: '7',
      name: 'Configuración',
      icon: 'fa-solid fa-ellipsis', 
      routeLink: "settings",
      selected: false
    },
  ];


  // list: NavItem[] = [
  //   {
  //     number: '1',
  //     name: 'Dashboard',
  //     icon: 'fa fa-solid fa-gauge-high',
  //     routeLink: "dashboard",
  //     selected: false
  //   },
  //   {
  //     number: '2',
  //     name: 'Proyectos',
  //     icon: 'fa fa-solid fa-diagram-project', 
  //     routeLink: "project",
  //     selected: false
  //   },
  //   {
  //     number: '3',
  //     name: 'Consulta Adm',
  //     icon: 'fa fa-regular fa-message',
  //     routeLink: "admincontact",
  //     selected: false
  //   },
  //   {
  //     number: '4',
  //     name: 'Leads',
  //     icon: 'fa fa-regular fa-address-card',
  //     routeLink: "leads",
  //     selected: false
  //   },
  //   {
  //     number: '5',
  //     name: 'Facturas',
  //     icon: 'fa fa-solid fa-file-invoice',
  //     routeLink: "invoices",
  //     selected: false
  //   },
  //   {
  //     number: '6',
  //     name: 'Información',
  //     icon: 'fa fa-solid fa-circle-info', 
  //     routeLink: "infor",
  //     selected: false
  //   },
  //   {
  //     number: '7',
  //     name: 'Configuración',
  //     icon: 'fa-solid fa-ellipsis', 
  //     routeLink: "settings",
  //     selected: false
  //   },
  // ];

  constructor() {}

  ngOnInit(): void {}

  selectItem(item: NavItem) {
    this.list.forEach((element) => {
      element.selected = false; // Reinicia el estado de todos los elementos
    });
    item.selected = true; // Marca el elemento seleccionado
  }

}