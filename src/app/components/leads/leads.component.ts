import { Component, OnInit, ViewChild } from '@angular/core';
import { LeadModel } from 'src/app/models/lead.model';
import { LeadService } from 'src/app/services/lead.service';
import { map } from 'rxjs/operators';
import {FormControl, Validators} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertService } from 'src/app/services/alert.service';
import { LoginService } from 'src/app/services/login.service';
import { Observable } from 'rxjs';
import { CountryModel } from 'src/app/models/country.model';
import { LocationService } from 'src/app/services/location.service';
import { CityModel } from 'src/app/models/city.model';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.css']
})

export class LeadsComponent implements OnInit{
  currentDate: Date = new Date;
  lead: LeadModel = new LeadModel();
  edditted = false;
  mostrarForm: boolean = false;
  mostrarViewForm: boolean = false;
  currentLeadEmail: string | null = null;
  strtitle:string ="Agregar Clientes Potenciales";
  currentUserEmail: string | null = "";
  currentUserName: string | null = "";
  countryList: CountryModel[] = [];
  cityList: CityModel[] = [];

  postulacionGuardada = false;
  postConfirmation = false;
  lblPostulacion = "Quiero Postularme";

  editing: boolean = false;

  //listar
  leads?: LeadModel[];
  currentLead?: LeadModel;
  currentIndex = -1;
  title = '';
  
  //mat datatable
  dataSource: any;
  displayedColumns: string[] = ["id", "name", "email", "country","city", "tlf", "wapp", "state", "Opc"];
  @ViewChild(MatPaginator, { static: true }) paginatior !: MatPaginator;
  @ViewChild(MatSort) sort !: MatSort;

  constructor(private locationService: LocationService, private loginService: LoginService, private leadService: LeadService, private alertService: AlertService) { }

  //listar
  ngOnInit(): void {
    //this.postulacionGuardada = false;
    //Colocamos el check para postularse en falso por defecto   

    this.loginService.getUserObservable().subscribe((user) => {
      if (user) {
        this.currentUserEmail = user.email;
      }
    });

    this.retrieveLeads();

    //Personaliza el paginador de mat datatable, con textos en espanol
    this.paginatior._intl.itemsPerPageLabel="Elementos por página";
    this.paginatior._intl.firstPageLabel="Primera Página"
    this.paginatior._intl.lastPageLabel="Última Página"
    this.paginatior._intl.nextPageLabel="Siguiente"
    this.paginatior._intl.previousPageLabel="Anterior"
    this.paginatior._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) {
        return `0 de ${length}`;
      }
  
      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      const endIndex =
        startIndex < length
          ? Math.min(startIndex + pageSize, length)
          : startIndex + pageSize;
  
      return `${startIndex + 1} - ${endIndex} de ${length}`;
    };
    //Personaliza el paginador de mat datatable, con textos en espanol
    
    //llenamos countryList 
    this.locationService.getAllCountries().valueChanges().subscribe((data: CountryModel[]) => {
      this.countryList = data;
    });

  }//end ngOnInit

  editLead(leadUp: LeadModel) {
    this.editing = true;
    this.lead = leadUp;
    this.mostrarForm=true;
    this.strtitle = "Modificar Clientes Potenciales"
  }

  async saveLead() {
    //buscamos el usuario actual
    this.loginService.user$.subscribe(lead => {
      this.currentLeadEmail = lead ? lead.email : null;
    });

    if (this.editing) {
      try {
        this.lead.lastUpdate =  this.currentDate;
        this.lead.lastUpdateLead =  this.currentLeadEmail != null ? this.currentLeadEmail : '';
        
        await this.leadService.update(this.lead);
        this.edditted = true;
        //llamada a la alerta
        //console.log("Currentlead: ",this.currentLeadEmail);
        this.doSomething("update","El usuario se ha modificado correctamente.");
        this.mostrarForm = false;
        // Aquí puedes agregar código para manejar la actualización exitosa, como mostrar un mensaje al usuario
      } catch (error) {
        console.error('Error al actualizar el usuario:', error);
      }
    } else {
      //Crea un nuevo usuario
      //default value
      this.lead.registration_date =  this.currentDate;
      this.lead.lastUpdate =  this.currentDate;
      this.lead.lastUpdateLead =  this.currentLeadEmail != null ? this.currentLeadEmail : '';
      this.lead.status =  true;
      this.lead.state =  "Activo"; //Activo - Iniactivo - Bloqueado - Suspendido
      this.strtitle = "Agregar Clientes Potenciales";

      this.leadService.create(this.lead).then(() => {
        console.log('¡Se ha enviado con éxito!');
        this.mostrarForm = false;
        //llamada a la alerta
        this.doSomething("create","El usuario se ha creado correctamente.");
      });
    }//end if (this.editing)
  }//end saveLead

  newLead(): void {
    this.edditted = false;
    this.lead = new LeadModel();
    this.editing = false;
    this.lead.uid = "";
    this.strtitle = "Agregar Clientes Potenciales"
  }//end newLead

  refreshList(): void {
    this.currentLead = undefined;
    this.currentIndex = -1;
    this.retrieveLeads();
  }//end refreshList

  retrieveLeads(): void {
    this.leadService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.leads = data;

      //ELEMENT_DATA FOR MAT DATATABLE
      this.dataSource = new MatTableDataSource(this.leads);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginatior;

    });    
  }//end retrieveLeads

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }//end applyFilter

  setActiveLead(lead: LeadModel, index: number): void {
    this.currentLead = lead;
    this.currentIndex = index;
  }//end setActiveLead

  async removeUsr(uid:string){
    //buscamos el usuario actual
    this.loginService.user$.subscribe(lead => {
      this.currentLeadEmail = lead ? lead.email : null;
    });
    this.currentLeadEmail =  this.currentLeadEmail != null ? this.currentLeadEmail : '';
    await this.leadService.delete(uid, this.currentLeadEmail.toString(), this.currentDate)
    this.doSomething("delete","El usuario se ha eliminado correctamente.");
    this.mostrarForm = false;
  }

  toggleConfirmDelete(element: any) {
    if (element.confirmDelete === undefined) {
      element.confirmDelete = false;
    } 
    element.confirmDelete = !element.confirmDelete;
  }
  
  deleteConfirmed(element: any) {
    // Realiza la eliminación aquí
    this.removeUsr(element.uid);
  }

  closeview(){
    this.mostrarForm=false;
    this.mostrarViewForm=false;
  }

  moForm(){
    if (this.mostrarForm){
       this.mostrarForm = false;
    }else{
      this.mostrarForm = true;
    }

    this.strtitle = "Agregar Clientes Potenciales";
    this.currentIndex = -1;
    this.editing = false;
    this.currentLead = undefined;
    this.lead = new LeadModel();

  }//end moForm

  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }//end validarEmail

    //llamada al Alert
  doSomething(type:string,message:string){
      //carga de datos del observable, llamando al servicio alert.service
      this.alertService.ShowAlert(type, message, 3000);
  }

  viewRecod(leadUp: LeadModel){
    //verificamos si ya esta ostulado a este proyecto
    const emailCli = leadUp.email;
    const title = leadUp.titulo;
    if (this.currentUserEmail){
      const uid = 'P-'+ this.convertirTextoANumeros(title?.substring(0,8).trim().toString()) + '@' + this.convertirTextoANumeros(this.currentUserEmail?.substring(0,5).trim().toString());
      
      this.leadService.getPostulation(uid,emailCli, this.currentUserEmail).then(
        (postulacionesObservable: Observable<any[]>) => {
          postulacionesObservable.subscribe((postulaciones: any[]) => {
            const checkbox = document.getElementById('guardarPostulacion') as HTMLInputElement;
            if (postulaciones.length > 0) {
              //console.log('Se encontraron documentos:');
              checkbox.checked = true;
              checkbox.disabled = true;
              this.lblPostulacion = "Postulado";

            } else {
              //console.log('No se encontraron documentos');
              checkbox.disabled = false;
              checkbox.checked = false;
            }
          });
      })
      .catch((error) => {
        console.error('Error al obtener las postulaciones:', error);
      });

      //this.leadService.getPostulation(emailCli, this.currentUserEmail)
    }

    this.lead = leadUp;
    this.mostrarForm=false;
    this.mostrarViewForm=true;
  }//end viewrecord

  postulationConfirmed(vlue:boolean){
    
    if (!vlue){
      this.postConfirmation = false;
      this.postulacionGuardada = false;
      this.lblPostulacion = "Quiero Postularme";
    }else{      

      this.loginService.getUserObservable().subscribe((user) => {
        if (user) {
          this.currentUserEmail = user.email;

          this.loginService.getUserFullName(user.uid).subscribe((name) => {
            if (name) {
              //Datos para la postulación
              this.currentUserName = name;
              const status = 'Pendiente'; // En revisión - Aprobada - Rechazada
              const lastUpdate = new Date();
              //ID = ocho caracteres del titulo mas @ mas cinco caracteres del email del usr conectado, convertidos a numero
              const id = 'P-'+ this.convertirTextoANumeros(this.lead.titulo?.substring(0,8).trim().toString()) + '@' + this.convertirTextoANumeros(this.currentUserEmail?.substring(0,5).trim().toString());
              const fullName = this.lead.name + ' ' + this.lead.lastname;
              const postulacion = {
                id: id,
                titulo: this.lead.titulo ? this.lead.titulo : '',
                cliente: fullName,
                emailCliente: this.lead.email ? this.lead.email : '',
                currentUser: this.currentUserName ? this.currentUserName : '',
                currentUserEmail: this.currentUserEmail ? this.currentUserEmail : '',
                status: status,
                lastUpdate: lastUpdate
              };

              // Guardar la postulación en la colección
              this.leadService.savepostulation(postulacion);

            } else {
              console.log('No se encontró el nombre del usuario');
            }
          });
        }
      });

      this.postConfirmation = false;
      this.postulacionGuardada = true;
      const checkbox = document.getElementById('guardarPostulacion') as HTMLInputElement;
      checkbox.disabled = true;
    }
  }

  guardarPostulacion(e: any) {
    if (!this.postulacionGuardada) {
      this.postConfirmation = e.target.checked ? true : false;
      this.lblPostulacion = "Confirmar Postulación";
    }else{
      this.postConfirmation = false;
    }
  }

  convertirTextoANumeros(texto?: string): string {
    const abecedario = 'abcdefghijklmnopqrstuvwxyz';
    let resultado = '';
    if (texto){
      for (let i = 0; i < texto.length; i++) {
        const letra = texto[i].toLowerCase();
        const posicion = abecedario.indexOf(letra) + 1;
    
        if (posicion > 0) {
          resultado += posicion.toString();
        } else {
          resultado += letra;
        }
      }
    }
    return resultado;
  }

  getCity(event: any) {
    const country_name = event.target.value;
    const country_id = event.target.options[event.target.selectedIndex].text;

    //llenamos cityList 
    this.locationService.getAllCityCode(country_id.split(' ')[0]).valueChanges().subscribe((data: CountryModel[]) => {
      this.cityList = data;
    });
  }
  

}

