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

  constructor(private loginService: LoginService, private leadService: LeadService, private alertService: AlertService) { }

  //listar
  ngOnInit(): void {
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
  
  viewRecod(leadUp: LeadModel){
    this.lead = leadUp;
    this.mostrarForm=false;
    this.mostrarViewForm=true;
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

    // console.log("moform: ",this.mostrarForm);
    // console.log("strtitle: ",this.strtitle);
    // console.log("currentIndex: ",this.currentIndex);
    // console.log("editing: ",this.editing);
    // console.log("lead: ",this.lead);

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

}

