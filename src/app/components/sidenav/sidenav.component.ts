import { Component, Input, OnInit } from "@angular/core";
import { Observable, Subscription, of } from "rxjs";
import { UserModel } from "src/app/models/user.model";
import { LoginService } from "src/app/services/login.service";

interface NavItem {
  number: string;
  name: string;
  icon: string;
  routeLink: string;
  selected: boolean;
  display: boolean;
}

@Component({
  selector: "app-sidenav",
  templateUrl: "./sidenav.component.html",
  styleUrls: ["./sidenav.component.css"],
})
export class SidenavComponent implements OnInit {
  @Input() sideNavStatus: boolean = false;
  private subscription: Subscription | undefined;
  Modelousers?: UserModel[];
  listDisplay: NavItem[] = [];
  list: NavItem[] = [
    {
      number: "1",
      name: "Dashboard",
      icon: "fa fa-solid fa-gauge-high",
      routeLink: "dashboard",
      selected: false,
      display: false,
    },
    {
      number: "2",
      name: "Proyectos",
      icon: "fa-solid fa-chart-column",
      routeLink: "project",
      selected: false,
      display: false,
    },
    {  
      number: "3",
      name: "Proyectos Potenciales",
      icon: "fa-solid fa-filter",
      routeLink: "leads",
      selected: false,
      display: false,
    },
    {  
      number: "4",
      name: "Gestión Solicitudes",
      icon: "fa-solid fa-envelope",
      routeLink: "managerequests",
      selected: false,
      display: false,
    },
    {
      number: "5",
      name: "Facturas",
      icon: "fa fa-solid fa-file-invoice",
      routeLink: "invoices",
      selected: false,
      display: false,
    },
    {
      number: "6",
      name: "Información",
      icon: "fa fa-solid fa-circle-info",
      routeLink: "infor",
      selected: false,
      display: false,
    },
    {
      number: "7",
      name: "Consulta Adm", 
      icon: "fa-solid fa-message",
      routeLink: "admincontact",
      selected: false,
      display: false,
    },
    {
      number: "8",
      name: "Configuración",
      icon: "fa-solid fa-ellipsis",
      routeLink: "settings",
      selected: false,
      display: false,
    },
  ];

  constructor(public loginService: LoginService) {}

  ngOnInit() {

    //Este código suscribe a un observable para obtener información del usuario y su tipo, actualizando las opciones del menú de manera instantánea cuando se cambia el perfil de un usuario.
    this.loginService.getUserObservable().subscribe((user) => {
      if (user) {
        this.loginService
          .getUserTypeObservable(user.uid)
          .subscribe((userType) => {
            this.updateMenuOptions(userType);
          });
      }
    });
  }

  updateMenuOptions(userType: string) {
    // Actualiza las opciones del menú según el tipo de usuario
    if (userType) {
      this.listDisplay = []; //limpia el array
      if (userType == "Admin") {
        this.list[0].display = true;
        this.list[1].display = true;
        this.list[2].display = true;
        this.list[3].display = true;
        this.list[4].display = true;
        this.list[5].display = true;
        this.list[6].display = true;
        this.list[7].display = true;
      }
      if (userType == "Cliente") {
        this.list[0].display = false;
        this.list[1].display = true;
        this.list[2].display = false;
        this.list[3].display = false;
        this.list[4].display = false;
        this.list[5].display = true;
        this.list[6].display = true;
        this.list[7].display = false;
      }
      if (userType == "Profesor") {
        this.list[0].display = false;
        this.list[1].display = true;
        this.list[2].display = true;
        this.list[3].display = false;
        this.list[4].display = false;
        this.list[5].display = true;
        this.list[6].display = true;
        this.list[7].display = false;
      }
      if (userType == "Asistente") {
        this.list[0].display = false;
        this.list[1].display = true;
        this.list[2].display = true;
        this.list[3].display = true;
        this.list[4].display = true;
        this.list[5].display = true;
        this.list[6].display = true;
        this.list[7].display = true;
      }
    }
    //recorremos la lista de opciones
    this.list.forEach((element, indice) => {
      if (element.display) {
        this.listDisplay.push({
          number: element.number,
          name: element.name,
          icon: element.icon,
          routeLink: element.routeLink,
          selected: element.selected,
          display: element.display,
        });
      }
    });
  }

  ngOnDestroy() {
    //this.subscription.unsubscribe(); // Cancela la suscripción al destruir el componente
  }

  selectItem(item: NavItem) {
    this.listDisplay.forEach((element) => {
      element.selected = false; // Reinicia el estado de todos los elementos
    });
    item.selected = true; // Marca el elemento seleccionado
  }
}
