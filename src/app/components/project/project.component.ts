import { Component, OnInit, ViewChild } from "@angular/core";
import { ProjectModel } from "src/app/models/project.model";
import { ProjectService } from "src/app/services/project.service";
import { map } from "rxjs/operators";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { AlertService } from "src/app/services/alert.service";
import { LoginService } from "src/app/services/login.service";
import { UserService } from "src/app/services/user.service";
import { UserModel } from "src/app/models/user.model";
import { Router } from "@angular/router";
import { LocationService } from "src/app/services/location.service";
import { CountryModel } from "src/app/models/country.model";
import { CityModel } from "src/app/models/city.model";
import { AngularFirestore } from "@angular/fire/compat/firestore";

@Component({
  selector: "app-project",
  templateUrl: "./project.component.html",
  styleUrls: ["./project.component.css"],
})
export class ProjectComponent implements OnInit {
  currentDate: Date = new Date();
  project: ProjectModel = new ProjectModel();
  edditted = false;
  mostrarForm: boolean = false;
  mostrarViewForm: boolean = false;
  currentUserEmail: string | null = null;
  currentUserUid: string | null = null;
  strtitle: string = "Agregar Proyecto";
  confirmDelete: boolean = false;
  usersList: UserModel[] = [];
  usersList2: UserModel[] = [];
  selectedNameClientOption: string = "";
  selectedNameTutorOption: string = "";
  countryList: CountryModel[] = [];
  cityList: CityModel[] = [];
  ediBtnDisplay: boolean = false;
  delBtnDisplay: boolean = false;
  addBtnDisplay: boolean = false;
  lblDatDisplay = false;

  alldocuments: any[] = [];

  //bibliografias
  options: string[] = [
    "APA",
    "Chicago",
    "Harvard",
    "Vancouver",
    "ACS",
    "AMA",
    "IEEE",
    "MLA",
  ];

  editing: boolean = false;

  //listar
  projects?: ProjectModel[];
  currentProject?: ProjectModel;
  currentIndex = -1;
  title = "";

  //mat datatable
  dataSource: any;
  displayedColumns: string[] = [
    "project_id",
    "titulo",
    "fecha_inicio",
    "chat",
    "up",
    "state",
    "Opc",
  ];
  @ViewChild(MatPaginator, { static: true }) paginatior!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private locationService: LocationService,
    private router: Router,
    private loginService: LoginService,
    private projectService: ProjectService,
    private alertService: AlertService,
    private userService: UserService,
    private firestore: AngularFirestore
  ) {}

  //listar
  ngOnInit(): void {
    //Personaliza el paginador de mat datatable, con textos en espanol
    this.paginatior._intl.itemsPerPageLabel = "Elementos por página";
    this.paginatior._intl.firstPageLabel = "Primera Página";
    this.paginatior._intl.lastPageLabel = "Última Página";
    this.paginatior._intl.nextPageLabel = "Siguiente";
    this.paginatior._intl.previousPageLabel = "Anterior";
    this.paginatior._intl.getRangeLabel = (
      page: number,
      pageSize: number,
      length: number
    ) => {
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

    //llenamos usersList
    this.userService
      .getperType("Cliente")
      .valueChanges()
      .subscribe((data: UserModel[]) => {
        this.usersList = data;
      });
      
    this.userService
      .getperType("Profesor")
      .valueChanges()
      .subscribe((data: UserModel[]) => {
        this.usersList2 = data;
      });

    //buscamos el uid del ususario conectado
    this.loginService.user$.subscribe((user) => {
      this.currentUserUid = user ? user.uid : null;
      this.currentUserEmail = user ? user.email : null;
    });

    //llenamos countryList
    this.locationService
      .getAllCountries()
      .valueChanges()
      .subscribe((data: CountryModel[]) => {
        this.countryList = data;
      });

    //Verificamos el tipo de usuario
    this.loginService.getUserObservable().subscribe((user) => {
      if (user) {
        this.loginService.getUserName(user.uid).subscribe((users) => {
          if (users.user_type) {
            if (users.user_type == "Cliente") {
              this.addBtnDisplay = false;
              this.delBtnDisplay = false;
              this.ediBtnDisplay = false;
            }
            if (users.user_type == "Profesor") {
              this.addBtnDisplay = false;
              this.delBtnDisplay = false;
              this.ediBtnDisplay = false;
              this.lblDatDisplay = false;
            }
            if (users.user_type == "Admin") {
              this.addBtnDisplay = true;
              this.delBtnDisplay = true;
              this.ediBtnDisplay = true;
              this.lblDatDisplay = true;
            }
            if (users.user_type == "Asistente") {
              this.addBtnDisplay = true;
              this.delBtnDisplay = true;
              this.ediBtnDisplay = true;
              this.lblDatDisplay = true;
            }

            this.retrieveProjects(users.user_type, users.uid);
            //console.log(users.user_type)
          }
        });
      }
    }); //tipo de usuario
  } //end ngOnInit

  //Convierte una fecha de tipo timestamp a Date
  timestampConvert(fec: any): Date | undefined {
    if (fec && fec.seconds) {
      let dateObject = new Date(fec.seconds * 1000);
      let mes_ = dateObject.getMonth() + 1;
      let ano_ = dateObject.getFullYear();
      let dia_ = dateObject.getDate();
      return dateObject;
    } else {
      return undefined; // Devuelve null si fec es nulo o no tiene la propiedad seconds
    }
  }

  //si es Date, retorna la misma fecha, si no, si es timestamp de Firestore,
  // llama a timestampConvert y se convierte en Date
  comprobarfecha(fecha: any): Date | undefined {
    if (fecha instanceof Date) {
      return fecha;
    } else {
      return this.timestampConvert(fecha);
    }
  }

  editProject(projectUp: ProjectModel) {
    this.editing = true;
    this.project = projectUp;

    //this.project.fecha_inicio = this.comprobarfecha(projectUp.fecha_inicio);

    //Se comprueban los campos de tipo fecha, si no estan definidos, no se incluyen
    if (this.comprobarfecha(projectUp.fecha_inicio) !== undefined) {
      this.project.fecha_inicio = this.comprobarfecha(projectUp.fecha_inicio);
    }

    if (this.comprobarfecha(projectUp.fecha_entrega1) !== undefined) {
      this.project.fecha_entrega1 = this.comprobarfecha(projectUp.fecha_entrega1);
    }
    
    if (this.comprobarfecha(projectUp.fecha_entrega2) !== undefined) {
      this.project.fecha_entrega2 = this.comprobarfecha(projectUp.fecha_entrega2);
    }

    if (this.comprobarfecha(projectUp.fecha_entrega3) !== undefined) {
      this.project.fecha_entrega3 = this.comprobarfecha(projectUp.fecha_entrega3);
    }

    if (this.comprobarfecha(projectUp.fecha_entrega4) !== undefined) {
      this.project.fecha_entrega4 = this.comprobarfecha(projectUp.fecha_entrega4);
    }

    this.mostrarForm = true;
    this.mostrarViewForm = false;
    this.strtitle = "Modificar Proyecto";

    //llenamos cityList
    if (projectUp.paisCode) {
      this.locationService.getAllCityCode(projectUp.paisCode)
        .valueChanges()
        .subscribe((data: CountryModel[]) => {
          this.cityList = data;
        });
    }

  }

  async saveProject() {
    //buscamos el usuario actual
    this.loginService.user$.subscribe((user) => {
      this.currentUserEmail = user ? user.email : null;
    });

    if (this.editing) {
      try {
        this.project.lastUpdate = this.currentDate;
        this.project.lastUpdateUser =
          this.currentUserEmail != null ? this.currentUserEmail : "";
        this.project.client_name = this.selectedNameClientOption;
        this.project.tutor_name = this.selectedNameTutorOption;

        await this.projectService.update(this.project);
        this.edditted = true;
        //llamada a la alerta
        this.doSomething(
          "update",
          "El proyecto se ha modificado correctamente."
        );
        this.mostrarForm = false;
        // Aquí puedes agregar código para manejar la actualización exitosa, como mostrar un mensaje al proyecto
      } catch (error) {
        console.error("Error al actualizar el proyecto:", error);
      }
    } else {
      //Crea un nuevo proyecto
      //default value
      this.project.registration_date = this.currentDate;
      this.project.lastUpdate = this.currentDate;
      this.project.lastUpdateUser =
      this.currentUserEmail != null ? this.currentUserEmail : "";
      this.project.status = true;
      this.project.state = "Activo"; //Activo - Iniactivo - Bloqueado - Suspendido
      this.strtitle = "Agregar Proyecto";
      this.project.client_name = this.selectedNameClientOption;
      this.project.tutor_name = this.selectedNameTutorOption;

      this.projectService.create(this.project).then(() => {
        console.log("¡Se ha enviado con éxito!");
        this.mostrarForm = false;
        //llamada a la alerta
        this.doSomething("create", "El proyecto se ha creado correctamente.");
      });
    } //end if (this.editing)
  } //end saveProject

  onChangeClient(event: any) {
    this.selectedNameClientOption =
      event.target.options[event.target.options.selectedIndex].text;
  }
  onChangeTutor(event: any) {
    this.selectedNameTutorOption =
      event.target.options[event.target.options.selectedIndex].text;
  }

  newProject(): void {
    this.edditted = false;
    this.project = new ProjectModel();
    this.editing = false;
    this.project.uid = "";
    this.strtitle = "Agregar Proyecto";
  } //end newProject

  refreshList(): void {
    this.currentProject = undefined;
    this.currentIndex = -1;
    this.retrieveProjects("", "");
  } //end refreshList

  retrieveProjects(tipoUsuario?: any, uid?: any): void {
    switch (tipoUsuario) {
      case "Admin":
        this.projectService
          .getAll()
          .snapshotChanges()
          .pipe(
            map((changes) =>
              changes.map((c) => ({
                id: c.payload.doc.id,
                ...c.payload.doc.data(),
              }))
            )
          )
          .subscribe((data) => {
            this.projects = data;
            //ELEMENT_DATA FOR MAT DATATABLE
            this.dataSource = new MatTableDataSource(this.projects);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginatior;
          });
        break;
      case "Asistente":
        this.projectService
          .getAll()
          .snapshotChanges()
          .pipe(
            map((changes) =>
              changes.map((c) => ({
                id: c.payload.doc.id,
                ...c.payload.doc.data(),
              }))
            )
          )
          .subscribe((data) => {
            this.projects = data;
            //ELEMENT_DATA FOR MAT DATATABLE
            this.dataSource = new MatTableDataSource(this.projects);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginatior;
          });
        break;
      case "Cliente":
        this.projectService
          .getAllC(uid)
          .snapshotChanges()
          .pipe(
            map((changes) =>
              changes.map((c) => ({
                id: c.payload.doc.id,
                ...c.payload.doc.data(),
              }))
            )
          )
          .subscribe((data) => {
            this.projects = data;
            //ELEMENT_DATA FOR MAT DATATABLE
            this.dataSource = new MatTableDataSource(this.projects);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginatior;
          });
        break;
      case "Profesor":
        this.projectService
          .getAllP(uid)
          .snapshotChanges()
          .pipe(
            map((changes) =>
              changes.map((c) => ({
                id: c.payload.doc.id,
                ...c.payload.doc.data(),
              }))
            )
          )
          .subscribe((data) => {
            this.projects = data;
            //ELEMENT_DATA FOR MAT DATATABLE
            this.dataSource = new MatTableDataSource(this.projects);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginatior;
          });
        break;
      default:
        break;
    } //case
  } //end retrieveProjects

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  } //end applyFilter

  setActiveProject(project: ProjectModel, index: number): void {
    this.currentProject = project;
    this.currentIndex = index;
  } //end setActiveProject

  async removeUsr(uid: string) {
    //buscamos el usuario actual
    this.loginService.user$.subscribe((user) => {
      this.currentUserEmail = user ? user.email : null;
    });
    this.currentUserEmail =
      this.currentUserEmail != null ? this.currentUserEmail : "";
    await this.projectService.delete(
      uid,
      this.currentUserEmail.toString(),
      this.currentDate
    );
    this.doSomething("delete", "El proyecto se ha eliminado correctamente.");
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

  viewRecod(projectRe: ProjectModel) {
    this.project = projectRe;
    this.mostrarForm = false;
    this.mostrarViewForm = true;

    //lee los documentos cargados
    //vacia el array
    this.alldocuments.splice(0, this.alldocuments.length);
    this.firestore
      .collection("docs", (ref) =>
        ref
          .where("projectId", "==", this.project.uid)
          .where("projectNro", "==", this.project.project_id)
          .orderBy("OwnerId")
          .orderBy("uploadDate", "desc")
      )
      .valueChanges()
      .subscribe((documents) => {
        this.alldocuments = documents;
        //console.log("docs: ", this.alldocuments);
      });

  }
  closeview() {
    this.mostrarForm = false;
    this.mostrarViewForm = false;
  }

  moForm() {
    if (this.mostrarForm) {
      this.mostrarForm = false;
    } else {
      this.mostrarForm = true;
    }

    this.mostrarViewForm = false;

    this.strtitle = "Agregar Proyecto";
    this.currentIndex = -1;
    this.editing = false;
    this.currentProject = undefined;
    this.project = new ProjectModel();
  } //end moForm

  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  } //end validarEmail

  //llamada al Alert
  doSomething(type: string, message: string) {
    //carga de datos del observable, llamando al servicio alert.service
    this.alertService.ShowAlert(type, message, 3000);
  }

  formatFecha(dateObj: any): string {
    //si es  un objeto de fecha de Firebase Firestore
    if (dateObj && typeof dateObj.toDate === "function") {
      const date = dateObj.toDate();
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } else if (dateObj instanceof Date) {
      //si es una instancia de la clase "Date"
      let day = dateObj.getDate();
      let month = dateObj.getMonth() + 1;
      let year = dateObj.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return ""; // o cualquier otro valor predeterminado que desees retornar en caso de que la conversión no sea posible
  }

  callStorage(element: any) {
    const params = {
      createBy: this.currentUserUid,
      createByEmail: this.currentUserEmail,
      clientId: element.client_id,
      clientName: element.client_name,
      tutorId: element.tutor_id,
      tutorName: element.tutor_name,
      id: element.project_id,
      uidProject: element.uid,
      title: element.titulo,
    };

    this.router.navigate(["/document-upload"], { queryParams: params });
  }

  callChat(element: any) {
    if (element.client_id && element.tutor_id) {
      let auxcurrentUser;
      let auxreceiveUser;

      if (this.currentUserUid == element.client_id) {
        auxcurrentUser = element.client_id;
        auxreceiveUser = element.tutor_id;
      }

      if (this.currentUserUid == element.tutor_id) {
        auxcurrentUser = element.tutor_id;
        auxreceiveUser = element.client_id;
      }

      const params = {
        uidCurrentUser: auxcurrentUser,
        uidReceiveUser: auxreceiveUser,
        id: element.project_id,
        uidProject: element.uid,
        title: element.titulo,
      };

      this.router.navigate(["/chat"], { queryParams: params });
    } else {
      console.log("El proyecto no se ha asignado a ningun tutor");
    }
  }

  getCity(event: any) {
    const country_name = event.target.value;
    const country_id = event.target.options[event.target.selectedIndex].text;
    this.project.paisCode = country_id.split(" ")[0];
    //llenamos cityList
    this.locationService
      .getAllCityCode(country_id.split(" ")[0])
      .valueChanges()
      .subscribe((data: CountryModel[]) => {
        this.cityList = data;
      });
  }
}
