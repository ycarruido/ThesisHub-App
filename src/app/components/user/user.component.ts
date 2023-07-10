import { Component, OnInit, ViewChild } from '@angular/core';
import { UserModel } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { map } from 'rxjs/operators';
import {FormControl, Validators} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit  {
  currentDate: Date = new Date;
  user: UserModel = new UserModel();
  edditted = false;
  mostrarForm: boolean = false;
  mostrarViewForm: boolean = false;

  strtitle:string ="Agregar Usuarios";

  editing: boolean = false;

  //listar
  users?: UserModel[];
  currentUser?: UserModel;
  currentIndex = -1;
  title = '';
  
  //mat datatable
  dataSource: any;
  displayedColumns: string[] = ["id", "name", "email", "country","city", "tlf", "wapp", "state", "Opc"];
  @ViewChild(MatPaginator, { static: true }) paginatior !: MatPaginator;
  @ViewChild(MatSort) sort !: MatSort;

  constructor(private userService: UserService, private alertService: AlertService) { }

  //listar
  ngOnInit(): void {
    this.retrieveUsers();

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

  editUser(userUp: UserModel) {
    this.editing = true;
    this.user = userUp;
    this.mostrarForm=true;
    this.strtitle = "Modificar Usuarios"
  }

  async saveUser() {
    if (this.editing) {
      try {
        await this.userService.update(this.user);
        this.edditted = true;
        //llamada a la alerta
        this.doSomething("update","El usuario se ha modificado correctamente.");
        this.mostrarForm = false;
        // Aquí puedes agregar código para manejar la actualización exitosa, como mostrar un mensaje al usuario
      } catch (error) {
        console.error('Error al actualizar el usuario:', error);
      }
    } else {
      //Crea un nuevo usuario
      //default value
      this.user.registration_date =  this.currentDate;
      this.user.status =  true;
      this.user.state =  "Activo"; //Activo - Iniactivo - Bloqueado - Suspendido
      this.strtitle = "Agregar Usuarios";

      this.userService.create(this.user).then(() => {
        console.log('¡Se ha enviado con éxito!');
        this.mostrarForm = false;
        //llamada a la alerta
        this.doSomething("create","El usuario se ha creado correctamente.");
      });
    }//end if (this.editing)
  }//end saveUser

  newUser(): void {
    this.edditted = false;
    this.user = new UserModel();
    this.editing = false;
    this.user.uid = "";
    this.strtitle = "Agregar Usuarios"
  }//end newUser

  refreshList(): void {
    this.currentUser = undefined;
    this.currentIndex = -1;
    this.retrieveUsers();
  }//end refreshList

  retrieveUsers(): void {
    this.userService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.users = data;

      //ELEMENT_DATA FOR MAT DATATABLE
      this.dataSource = new MatTableDataSource(this.users);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginatior;

    });    
  }//end retrieveUsers

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }//end applyFilter

  setActiveUser(user: UserModel, index: number): void {
    this.currentUser = user;
    this.currentIndex = index;
  }//end setActiveUser

  removeUsr(uid:string){
    this.userService.delete(uid)
    this.doSomething("delete","El usuario se ha eliminado correctamente.");
    this.mostrarForm = false;
  }

  viewRecod(userUp: UserModel){
    this.user = userUp;
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

    this.strtitle = "Agregar Usuarios";
    this.currentIndex = -1;
    this.editing = false;
    this.currentUser = undefined;
    this.user = new UserModel();

    console.log("moform: ",this.mostrarForm);
    console.log("strtitle: ",this.strtitle);
    console.log("currentIndex: ",this.currentIndex);
    console.log("editing: ",this.editing);
    console.log("user: ",this.user);

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
