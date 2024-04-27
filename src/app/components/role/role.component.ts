import { Component, OnInit, ViewChild } from '@angular/core';
import { RoleModel } from 'src/app/models/role.model';
import { RoleService } from 'src/app/services/role.service';
import { map } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertService } from 'src/app/services/alert.service';
import { LoginService } from 'src/app/services/login.service';
import { ActivatedRoute } from '@angular/router';
import { CountryModel } from 'src/app/models/country.model';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {
  showForm: string = "";
  currentDate: Date = new Date;
  role: RoleModel = new RoleModel();
  edditted = false;
  mostrarForm: boolean = false;
  mostrarViewForm: boolean = false;
  currentRoleEmail: string | null = null;
  strtitle:string ="Agregar Role";

  editing: boolean = false;

  //listar
  roles?: RoleModel[];
  currentRole?: RoleModel;
  currentIndex = -1;
  title = '';
  
  //mat datatable
  dataSource: any;
  displayedColumns: string[] = ["roleId", "roleName", "status" , "Opc"];
  @ViewChild(MatPaginator, { static: true }) paginatior !: MatPaginator;
  @ViewChild(MatSort) sort !: MatSort;

  constructor(private route: ActivatedRoute, private loginService: LoginService, private roleService: RoleService, private alertService: AlertService) { }

  //listar
  ngOnInit(): void {
    this.retrieveRoles();

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

    this.route.queryParams.subscribe(params => {
      this.showForm = params['form'];
      // Aquí puedes hacer lo que necesites con el parámetro recibido
      console.log(this.showForm);
    });

    if (this.showForm == 'NewForm'){
      this.moForm();
    }

  }//end ngOnInit

  editRole(roleUp: RoleModel) {
    this.editing = true;
    this.role = roleUp;
    this.mostrarForm=true;
    this.strtitle = "Modificar Role"
  }

  async saveRole() {
    //buscamos el usuario actual
    this.loginService.user$.subscribe(role => {
      this.currentRoleEmail = role ? role.email : null;
    });

    if (this.editing) {
      try {
        this.role.lastUpdate =  this.currentDate;
        this.role.lastUpdateUser =  this.currentRoleEmail != null ? this.currentRoleEmail : '';
        
        await this.roleService.update(this.role);
        this.edditted = true;
        //llamada a la alerta
        //console.log("Currentrole: ",this.currentRoleEmail);
        this.doSomething("update","El Role se ha modificado correctamente.");
        this.mostrarForm = false;
        // Aquí puedes agregar código para manejar la actualización exitosa, como mostrar un mensaje al usuario
      } catch (error) {
        console.error('Error al actualizar el Role:', error);
      }
    } else {
      //Crea un nuevo usuario
      //default value
      
      this.role.lastUpdate =  this.currentDate;
      this.role.lastUpdateUser =  this.currentRoleEmail != null ? this.currentRoleEmail : '';
      
      this.role.status =  true;
      this.strtitle = "Agregar Role";
      this.roleService.createRole(this.role).then(() => {
        console.log('¡Se ha enviado con éxito!');
        this.mostrarForm = false;
        //llamada a la alerta
        this.doSomething("create","El Role se ha creado correctamente.");
      });
    }//end if (this.editing)
  }//end saveRole

  newRole(): void {
    this.edditted = false;
    this.role = new RoleModel();
    this.editing = false;
    this.role.uid = "";
    this.strtitle = "Agregar Role"
  }//end newRole

  refreshList(): void {
    this.currentRole = undefined;
    this.currentIndex = -1;
    this.retrieveRoles();
  }//end refreshList

  retrieveRoles(): void {
    this.roleService.getAllRole().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.roles = data;

      //ELEMENT_DATA FOR MAT DATATABLE
      this.dataSource = new MatTableDataSource(this.roles);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginatior;

    });    
  }//end retrieveRoles

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }//end applyFilter

  setActiveRole(role: RoleModel, index: number): void {
    this.currentRole = role;
    this.currentIndex = index;
  }//end setActiveRole

  async removeUsr(uid:string){
    //buscamos el usuario actual
    this.loginService.user$.subscribe(user => {
      this.currentRoleEmail = user ? user.email : null;
    });
    this.currentRoleEmail =  this.currentRoleEmail != null ? this.currentRoleEmail : '';
    await this.roleService.delete(uid, this.currentRoleEmail.toString(), this.currentDate)
    this.doSomething("delete","El Role se ha eliminado correctamente.");
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
  
  viewRecod(roleUp: RoleModel){
    this.role = roleUp;
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

    this.strtitle = "Agregar Role";
    this.currentIndex = -1;
    this.editing = false;
    this.currentRole = undefined;
    this.role = new RoleModel();

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
