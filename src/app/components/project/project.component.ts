import { Component, OnInit, ViewChild } from '@angular/core';
import { ProjectModel } from 'src/app/models/project.model';
import { ProjectService } from 'src/app/services/project.service';
import { map } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertService } from 'src/app/services/alert.service';
import { Timestamp } from 'firebase/firestore';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit{
  currentDate: Date = new Date;
  project: ProjectModel = new ProjectModel();
  edditted = false;
  mostrarForm: boolean = false;
  mostrarViewForm: boolean = false;
  currentUserEmail: string | null = null;
  strtitle:string ="AGREGAR PROYECTOS";

  //bibliografias
  options: string[] = [
    'APA', 
    'Chicago', 
    'Harvard',
    'Vancouver',
    'ACS',
    'AMA',
    'IEEE',
    'MLA'
  ];

  editing: boolean = false;

  //listar
  projects?: ProjectModel[];
  currentProject?: ProjectModel;
  currentIndex = -1;
  title = '';
  
  //mat datatable
  dataSource: any;
  displayedColumns: string[] = ["project_id", "titulo", "entregas", "fecha_inicio","fecha_entrega", "presupuesto", "monto_recibido", "porcentaje_a_realizar", "state", "Opc"];
  @ViewChild(MatPaginator, { static: true }) paginatior !: MatPaginator;
  @ViewChild(MatSort) sort !: MatSort;

  constructor(private loginService: LoginService, private projectService: ProjectService, private alertService: AlertService) { }

  //listar
  ngOnInit(): void {
    this.retrieveProjects();

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

  editProject(projectUp: ProjectModel) {
    this.editing = true;
    this.project = projectUp;

    this.project.fecha_inicio = this.timestampConvert(projectUp.fecha_inicio);
    this.project.fecha_entrega = this.timestampConvert(projectUp.fecha_entrega);
    this.project.ultima_entrega = this.timestampConvert(projectUp.ultima_entrega);
    this.project.fecha_proxima = this.timestampConvert(projectUp.fecha_proxima);

    this.mostrarForm=true;
    this.mostrarViewForm=false;
    this.strtitle = "MODIFICAR PROYECTOS"
    console.log("Element: ",projectUp)
  }

  async saveProject() {
    //buscamos el usuario actual
    this.loginService.user$.subscribe(user => {
      this.currentUserEmail = user ? user.email : null;
    });

    if (this.editing) {
      try {
        this.project.lastUpdate =  this.currentDate;
        this.project.lastUpdateUser =  this.currentUserEmail != null ? this.currentUserEmail : '';
        
        await this.projectService.update(this.project);
        this.edditted = true;
        //llamada a la alerta
        this.doSomething("update","El proyecto se ha modificado correctamente.");
        this.mostrarForm = false;
        // Aquí puedes agregar código para manejar la actualización exitosa, como mostrar un mensaje al proyecto
      } catch (error) {
        console.error('Error al actualizar el proyecto:', error);
      }
    } else {
      //Crea un nuevo proyecto
      //default value
      this.project.registration_date =  this.currentDate;
      this.project.lastUpdate =  this.currentDate;
      this.project.lastUpdateUser =  this.currentUserEmail != null ? this.currentUserEmail : '';        
      this.project.status =  true;
      this.project.state =  "Activo"; //Activo - Iniactivo - Bloqueado - Suspendido
      this.strtitle = "AGREGAR PROYECTOS";

      this.projectService.create(this.project).then(() => {
        console.log('¡Se ha enviado con éxito!');
        this.mostrarForm = false;
        //llamada a la alerta
        this.doSomething("create","El proyecto se ha creado correctamente.");
      });
    }//end if (this.editing)
  }//end saveProject

  newProject(): void {
    this.edditted = false;
    this.project = new ProjectModel();
    this.editing = false;
    this.project.uid = "";
    this.strtitle = "AGREGAR PROYECTOS"
  }//end newProject

  refreshList(): void {
    this.currentProject = undefined;
    this.currentIndex = -1;
    this.retrieveProjects();
  }//end refreshList

  retrieveProjects(): void {
    this.projectService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.projects = data;
      //ELEMENT_DATA FOR MAT DATATABLE
      this.dataSource = new MatTableDataSource(this.projects);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginatior;

    });    
  }//end retrieveProjects

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }//end applyFilter

  setActiveProject(project: ProjectModel, index: number): void {
    this.currentProject = project;
    this.currentIndex = index;
  }//end setActiveProject

  removeUsr(uid:string){
    this.projectService.delete(uid)
    this.doSomething("delete","El proyecto se ha eliminado correctamente.");
    this.mostrarForm = false;
  }

  viewRecod(projectRe: ProjectModel){
    this.project = projectRe;
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
 
    this.mostrarViewForm = false;

    this.strtitle = "AGREGAR PROYECTOS";
    this.currentIndex = -1;
    this.editing = false;
    this.currentProject = undefined;
    this.project = new ProjectModel();


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

  //convierte el objeto  Timestamp  en una fecha:
  convertirFecha(timestamp: Timestamp): Date {
    return timestamp.toDate();
  }
  
  //convertir una fecha a un objeto  Timestamp
  convertirATimestamp(fecha: Date): Timestamp {
    return Timestamp.fromDate(fecha);
  }

  //Convierte una fecha de tipo timestamp a Date
  timestampConvert(fec: any){
    let dateObject = new Date(fec.seconds*1000);
    let mes_ = dateObject.getMonth()+1;
    let ano_ = dateObject.getFullYear();
    let dia_ = dateObject.getDate();
    return dateObject;
  }

  //Devuelve la fecha en formto dd/mm/yyyy
  formatDate(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Los meses en JavaScript van de 0 a 11
    const year = date.getFullYear();

    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  }
}
