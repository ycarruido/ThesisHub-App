import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { LeadModel } from "src/app/models/lead.model";
import { LeadService } from "src/app/services/lead.service";
import { map } from "rxjs/operators";
import { FormControl, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { AlertService } from "src/app/services/alert.service";
import { LoginService } from "src/app/services/login.service";
import { Observable } from "rxjs";
import { CountryModel } from "src/app/models/country.model";
import { LocationService } from "src/app/services/location.service";
import { CityModel } from "src/app/models/city.model";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { tap } from 'rxjs/operators';

@Component({
  selector: "app-leads",
  templateUrl: "./leads.component.html",
  styleUrls: ["./leads.component.css"],
})
export class LeadsComponent implements OnInit {
  //cargar docs
  selectedFileName: string | null = "";
  documentTitle: string = "";
  porcentajeAvance: number = 0;
  nroPaginas: number = 0;
  tipoDocumento: string = "";
  selectedFile: File | undefined;
  uploading: boolean = false;
  uploadSuccess: boolean = false;
  documentsTut: any[] = [];
  alldocuments: any[] = [];
  displayField: boolean = false;

  //confirmDeleteDoc=false;
  confirmDeleteDoc: { [key: string]: boolean } = {};

  //cargar docs
  currentDate: Date = new Date();
  lead: LeadModel = new LeadModel();

  edditted = false;
  mostrarForm: boolean = false;
  mostrarViewForm: boolean = false;
  currentLeadEmail: string | null = null;
  strtitle: string = "Agregar Proyectos Potenciales";
  currentUserEmail: string | null = "";
  currentUserUid: string | null = "";
  currentUserName: string | null = "";
  countryList: CountryModel[] = [];
  cityList: CityModel[] = [];
  addBtnDisplay = false;
  delBtnDisplay = false;
  ediBtnDisplay = false;
  lblDatDisplay = false;

  postulacionGuardada = false;
  postConfirmation = false;
  lblPostulacion = "Quiero Postularme";

  editing: boolean = false;

  //listar
  leads?: LeadModel[];
  currentLead?: LeadModel;
  currentIndex = -1;
  title = "";

  //mat datatable
  dataSource: any;
  displayedColumns: string[] = [
    "id",
    "name",
    "email",
    "country",
    "city",
    "wapp",
    "registration_date",
    "state",
    "Opc",
  ];
  @ViewChild(MatPaginator, { static: true }) paginatior!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private locationService: LocationService,
    private loginService: LoginService,
    private leadService: LeadService,
    private alertService: AlertService,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private elementRef: ElementRef
  ) {}

  //cargar documentos
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.selectedFileName = this.selectedFile ? this.selectedFile.name : null;
  }

  uploadDocument() {
    this.uploading = true;
    const documentId = this.firestore.createId();
    // Concatenar el ID aleatorio al nombre del archivo
    const fileNameWithId = `${documentId}_${this.selectedFileName}`;
    const documentRef = this.storage.ref(`docs/${fileNameWithId}`);

    const uploadTask = documentRef.put(this.selectedFile);

    //console.log("projectNro ",this.lead.id)
    //return 0

    uploadTask.then(() => {
      documentRef.getDownloadURL().subscribe((downloadURL) => {
        const documentData = {
          id: documentId,
          docName: fileNameWithId,
          title: this.documentTitle,
          projectId: this.lead.uid,
          projectNro: this.lead.id,
          projectName: this.lead.titulo,
          OwnerId: this.lead.lastUpdateLead,
          OwnerEmail: this.lead.lastUpdateLead,
          numeroPaginas: this.nroPaginas,
          porcentajeAvance: this.porcentajeAvance,
          tipoDocumento: this.tipoDocumento,
          uploadDate: new Date(),
          downloadURL: downloadURL,
          status: "active",
        };
        this.firestore
          .collection("docs")
          .doc(documentId)
          .set(documentData)
          .then(() => {
            this.uploading = false;
            console.log("Documento subido exitosamente");

            // Resetear los campos
            this.selectedFile = undefined;
            this.documentTitle = '';
            this.tipoDocumento = '';
            const fileInput = document.getElementById('fileInput') as HTMLInputElement;
            fileInput.value = ''; 
            this.selectedFileName = "";
            const documentTitleInput = this.elementRef.nativeElement.querySelector('#documentTitle');
            if (documentTitleInput) {
              documentTitleInput.value = ''; // Restablecer el valor del campo a vacío
            }
            this.tipoDocumento = '';

          })
          .catch((error) => {
            this.uploading = false;
            console.error("Error al subir el documento", error);
          });
      });
    });
  }
  //cargar documentos

  showConfirmationIcons(document: any) {
    this.confirmDeleteDoc = {};
    this.confirmDeleteDoc[document.docName] = true;
  }
  
  

  confirmDelete(document: any) {
    const documentRef = this.storage.ref(`docs/${document.docName}`);
    documentRef.delete().pipe(
        tap(() => {
            this.uploadSuccess = false;
            this.selectedFile = undefined;
            this.selectedFileName = null;
            console.log("Documento eliminado correctamente");

            // Eliminar el documento de la colección 'docs'
            this.firestore.collection('docs').doc(document.id).delete().then(() => {
                console.log("Documento en la colección 'docs' eliminado correctamente");
            }).catch(error => {
                console.error("Error al eliminar el documento de la colección 'docs'", error);
            });
        })
    ).subscribe({
        error: error => {
            console.error("Error al eliminar el documento", error);
        }
    });
    this.confirmDeleteDoc[document.docName] = false;
  }
  
  cancelDelete(document:any) {
    this.confirmDeleteDoc[document.docName] = false;
  }
  
  //listar
  ngOnInit(): void {

    // console.log(this.lead.country)
    // this.lead.country = 'Seleccionar opción';
    // this.lead.city = 'Seleccionar opción';

    //this.postulacionGuardada = false;
    //Colocamos el check para postularse en falso por defecto

    this.loginService.getUserObservable().subscribe((user) => {
      if (user) {
        this.currentUserEmail = user.email;

        //Verificamos el tipo de usuario
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
          }
        });
        //tipo de usuario
      }
    });

    this.retrieveLeads();

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

    //llenamos countryList
    this.locationService
      .getAllCountries()
      .valueChanges()
      .subscribe((data: CountryModel[]) => {
        this.countryList = data;
      });
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

  editLead(leadUp: LeadModel) {
    this.editing = true;
    this.lead = leadUp;
    this.mostrarForm = true;
    this.strtitle = "Modificar Proyectos Potenciales";

    //Se comprueban los campos de tipo fecha, si no estan definidos, no se incluyen
    if (this.comprobarfecha(leadUp.fecha_inicio) !== undefined) {
      this.lead.fecha_inicio = this.comprobarfecha(leadUp.fecha_inicio);
    }

    if (this.comprobarfecha(leadUp.fecha_entrega1) !== undefined) {
      this.lead.fecha_entrega1 = this.comprobarfecha(leadUp.fecha_entrega1);
    }

    if (this.comprobarfecha(leadUp.fecha_entrega2) !== undefined) {
      this.lead.fecha_entrega2 = this.comprobarfecha(leadUp.fecha_entrega2);
    }

    if (this.comprobarfecha(leadUp.fecha_entrega3) !== undefined) {
      this.lead.fecha_entrega3 = this.comprobarfecha(leadUp.fecha_entrega3);
    }

    if (this.comprobarfecha(leadUp.fecha_entrega4) !== undefined) {
      this.lead.fecha_entrega4 = this.comprobarfecha(leadUp.fecha_entrega4);
    }

    //lee los documentos cargados
    //vacia el array
    this.alldocuments.splice(0, this.alldocuments.length);
    this.firestore
      .collection("docs", (ref) =>
        ref
          .where("projectId", "==", this.lead.uid)
          .where("projectNro", "==", this.lead.id)
          .orderBy("OwnerId")
          .orderBy("uploadDate", "desc")
      )
      .valueChanges()
      .subscribe((documents) => {
        this.alldocuments = documents;
        //console.log("docs: ", this.alldocuments);
      });
  }

  async saveLead() {
    //buscamos el usuario actual
    this.loginService.user$.subscribe((lead) => {
      this.currentLeadEmail = lead ? lead.email : null;
    });

    if (this.editing) {
      try {
        this.lead.lastUpdate = this.currentDate;
        this.lead.lastUpdateLead =
          this.currentLeadEmail != null ? this.currentLeadEmail : "";

        await this.leadService.update(this.lead);
        this.edditted = true;
        //llamada a la alerta
        //console.log("Currentlead: ",this.currentLeadEmail);
        this.doSomething(
          "update",
          "El usuario se ha modificado correctamente."
        );
        this.mostrarForm = false;
        // Aquí puedes agregar código para manejar la actualización exitosa, como mostrar un mensaje al usuario
      } catch (error) {
        console.error("Error al actualizar el usuario:", error);
      }
    } else {
      //Crea un nuevo proyecto potencial

      //default value en caso de que no tengn valor
      this.lead.registration_date = this.currentDate;
      this.lead.lastUpdate = this.currentDate;
      this.lead.lastUpdateLead =
        this.currentLeadEmail != null ? this.currentLeadEmail : "";
      this.lead.status = true;
      this.lead.state = "Activo"; //Activo - Inactivo - Cerrado - Bloqueado - Suspendido
      this.strtitle = "Agregar Proyectos Potenciales";

      //si los campos on vacios o nulls se les crea con un valor en blanco o cero
      this.lead.lastname =
        this.lead.lastname === "" ||
        this.lead.lastname === null ||
        typeof this.lead.lastname === "undefined"
          ? ""
          : this.lead.lastname;
      this.lead.email =
        this.lead.email === "" ||
        this.lead.email === null ||
        typeof this.lead.email === "undefined"
          ? ""
          : this.lead.email;
      this.lead.tlf =
        this.lead.tlf === "" ||
        this.lead.tlf === null ||
        typeof this.lead.tlf === "undefined"
          ? ""
          : this.lead.tlf;
      this.lead.wapp =
        this.lead.wapp === "" ||
        this.lead.wapp === null ||
        typeof this.lead.wapp === "undefined"
          ? ""
          : this.lead.wapp;
      this.lead.university =
        this.lead.university === "" ||
        this.lead.university === null ||
        typeof this.lead.university === "undefined"
          ? ""
          : this.lead.university;
      this.lead.titulo =
        this.lead.titulo === "" ||
        this.lead.titulo === null ||
        typeof this.lead.titulo === "undefined"
          ? ""
          : this.lead.titulo;
      this.lead.bibliografia =
        this.lead.bibliografia === "" ||
        this.lead.bibliografia === null ||
        typeof this.lead.bibliografia === "undefined"
          ? ""
          : this.lead.bibliografia;
      this.lead.carrera =
        this.lead.carrera === "" ||
        this.lead.carrera === null ||
        typeof this.lead.carrera === "undefined"
          ? ""
          : this.lead.carrera;
      this.lead.tema =
        this.lead.tema === "" ||
        this.lead.tema === null ||
        typeof this.lead.tema === "undefined"
          ? ""
          : this.lead.tema;
      this.lead.especialidad =
        this.lead.especialidad === "" ||
        this.lead.especialidad === null ||
        typeof this.lead.especialidad === "undefined"
          ? ""
          : this.lead.especialidad;
      this.lead.tipofuente =
        this.lead.tipofuente === "" ||
        this.lead.tipofuente === null ||
        typeof this.lead.tipofuente === "undefined"
          ? ""
          : this.lead.tipofuente;
      this.lead.tamanofuente =
        this.lead.tamanofuente === "" ||
        this.lead.tamanofuente === null ||
        typeof this.lead.tamanofuente === "undefined"
          ? ""
          : this.lead.tamanofuente;
      this.lead.numero_paginas =
        this.lead.numero_paginas === undefined ||
        this.lead.numero_paginas === null ||
        typeof this.lead.numero_paginas === "undefined"
          ? 0
          : this.lead.numero_paginas;
      this.lead.entregas =
        this.lead.entregas === undefined ||
        this.lead.entregas === null ||
        typeof this.lead.entregas === "undefined"
          ? 0
          : this.lead.entregas;
      this.lead.descripcion =
        this.lead.descripcion === "" ||
        this.lead.descripcion === null ||
        typeof this.lead.descripcion === "undefined"
          ? ""
          : this.lead.descripcion;
      this.lead.fecha_inicio =
        this.lead.fecha_inicio === undefined ||
        this.lead.fecha_inicio === null ||
        typeof this.lead.fecha_inicio === "undefined"
          ? new Date()
          : this.lead.fecha_inicio;
      this.lead.fecha_entrega1 =
        this.lead.fecha_entrega1 === undefined ||
        this.lead.fecha_entrega1 === null ||
        typeof this.lead.fecha_entrega1 === "undefined"
          ? new Date()
          : this.lead.fecha_entrega1;
      this.lead.fecha_entrega2 =
        this.lead.fecha_entrega2 === undefined ||
        this.lead.fecha_entrega2 === null ||
        typeof this.lead.fecha_entrega2 === "undefined"
          ? new Date()
          : this.lead.fecha_entrega2;
      this.lead.fecha_entrega3 =
        this.lead.fecha_entrega3 === undefined ||
        this.lead.fecha_entrega3 === null ||
        typeof this.lead.fecha_entrega3 === "undefined"
          ? new Date()
          : this.lead.fecha_entrega3;
      this.lead.fecha_entrega4 =
        this.lead.fecha_entrega4 === undefined ||
        this.lead.fecha_entrega4 === null ||
        typeof this.lead.fecha_entrega4 === "undefined"
          ? new Date()
          : this.lead.fecha_entrega4;
      this.lead.country =
        this.lead.country === "" ||
        this.lead.country === null ||
        typeof this.lead.country === "undefined"
          ? ""
          : this.lead.country;
      this.lead.city =
        this.lead.city === "" ||
        this.lead.city === null ||
        typeof this.lead.city === "undefined"
          ? ""
          : this.lead.city;
      this.lead.sourse =
        this.lead.sourse === "" ||
        this.lead.sourse === null ||
        typeof this.lead.sourse === "undefined"
          ? ""
          : this.lead.sourse;
      this.lead.interests =
        this.lead.interests === "" ||
        this.lead.interests === null ||
        typeof this.lead.interests === "undefined"
          ? ""
          : this.lead.interests;

      this.leadService.create(this.lead).then(() => {
        console.log("¡Se ha enviado con éxito!");
        this.mostrarForm = false;
        //llamada a la alerta
        this.doSomething("create", "El proyecto se ha creado correctamente.");
      });
    } //end if (this.editing)
  } //end saveLead

  newLead(): void {
    this.edditted = false;
    this.lead = new LeadModel();
    this.editing = false;
    this.lead.uid = "";
    this.strtitle = "Agregar Proyectos Potenciales";
  } //end newLead

  refreshList(): void {
    this.currentLead = undefined;
    this.currentIndex = -1;
    this.retrieveLeads();
  } //end refreshList

  retrieveLeads(): void {
    this.leadService
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
        this.leads = data;

        //ELEMENT_DATA FOR MAT DATATABLE
        this.dataSource = new MatTableDataSource(this.leads);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginatior;
      });
  } //end retrieveLeads

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  } //end applyFilter

  setActiveLead(lead: LeadModel, index: number): void {
    this.currentLead = lead;
    this.currentIndex = index;
  } //end setActiveLead

  async removeUsr(uid: string) {
    //buscamos el usuario actual
    this.loginService.user$.subscribe((lead) => {
      this.currentLeadEmail = lead ? lead.email : null;
    });
    this.currentLeadEmail =
      this.currentLeadEmail != null ? this.currentLeadEmail : "";
    await this.leadService.delete(
      uid,
      this.currentLeadEmail.toString(),
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

    this.strtitle = "Agregar Proyectos Potenciales";
    this.alldocuments.splice(0, this.alldocuments.length);
    this.currentIndex = -1;
    this.editing = false;
    this.currentLead = undefined;
    this.lead = new LeadModel();
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

  viewRecod(leadUp: LeadModel) {
    //verificamos si ya esta postulado a este proyecto
    const emailCli = leadUp.email;
    const title = leadUp.titulo;
    if (this.currentUserEmail) {
      const uid =
        "P-" +
        this.convertirTextoANumeros(title?.substring(0, 8).trim().toString()) +
        "@" +
        this.convertirTextoANumeros(
          this.currentUserEmail?.substring(0, 5).trim().toString()
        );

      this.leadService
        .getPostulation(uid, emailCli, this.currentUserEmail)
        .then((postulacionesObservable: Observable<any[]>) => {
          postulacionesObservable.subscribe((postulaciones: any[]) => {
            const checkbox = document.getElementById(
              "guardarPostulacion"
            ) as HTMLInputElement;
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
          console.error("Error al obtener las postulaciones:", error);
        });

      //this.leadService.getPostulation(emailCli, this.currentUserEmail)
    }

    this.lead = leadUp;
    this.mostrarForm = false;
    this.mostrarViewForm = true;

    //lee los documentos cargados
    //vacia el array
    this.alldocuments.splice(0, this.alldocuments.length);
    this.firestore
      .collection("docs", (ref) =>
        ref
          .where("projectId", "==", this.lead.uid)
          .where("projectNro", "==", this.lead.id)
          .orderBy("OwnerId")
          .orderBy("uploadDate", "desc")
      )
      .valueChanges()
      .subscribe((documents) => {
        this.alldocuments = documents;
        //console.log("docs: ", this.alldocuments);
      });

  } //end viewrecord

  postulationConfirmed(vlue: boolean) {
    if (!vlue) {
      this.postConfirmation = false;
      this.postulacionGuardada = false;
      this.lblPostulacion = "Quiero Postularme";
    } else {
      this.loginService.getUserObservable().subscribe((user) => {
        if (user) {
          this.currentUserEmail = user.email;
          this.currentUserUid = user.uid;

          this.loginService.getUserFullName(user.uid).subscribe((name) => {
            if (name) {
              //Datos para la postulación
              this.currentUserName = name;
              const status = "Pendiente"; // En revisión - Aprobada - Rechazada
              const lastUpdate = new Date();
              //ID = ocho caracteres del titulo mas @ mas cinco caracteres del email del usr conectado, convertidos a numero
              const id =
                "P-" +
                this.convertirTextoANumeros(
                  this.lead.titulo?.substring(0, 8).trim().toString()
                ) +
                "@" +
                this.convertirTextoANumeros(
                  this.currentUserEmail?.substring(0, 5).trim().toString()
                );
              const fullName = this.lead.name + " " + this.lead.lastname;
              const postulacion = {
                id: id,
                titulo: this.lead.titulo ? this.lead.titulo : "",
                cliente: fullName,
                emailCliente: this.lead.email ? this.lead.email : "",
                currentUser: this.currentUserName ? this.currentUserName : "",
                currentUserEmail: this.currentUserEmail
                  ? this.currentUserEmail
                  : "",
                currentUserId: this.currentUserUid,
                status: status,
                lastUpdate: lastUpdate,
                leadUID: this.lead.uid,
              };

              // Guardar la postulación en la colección
              this.leadService.savepostulation(postulacion);
            } else {
              console.log("No se encontró el nombre del usuario");
            }
          });
        }
      });

      this.postConfirmation = false;
      this.postulacionGuardada = true;
      const checkbox = document.getElementById(
        "guardarPostulacion"
      ) as HTMLInputElement;
      checkbox.disabled = true;
    }
  }

  guardarPostulacion(e: any) {
    if (!this.postulacionGuardada) {
      this.postConfirmation = e.target.checked ? true : false;
      this.lblPostulacion = "Confirmar Postulación";
    } else {
      this.postConfirmation = false;
    }
  }

  convertirTextoANumeros(texto?: string): string {
    const abecedario = "abcdefghijklmnopqrstuvwxyz";
    let resultado = "";
    if (texto) {
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
    this.lead.paisCode = country_id.split(" ")[0];
    //llenamos cityList
    this.locationService
      .getAllCityCode(country_id.split(" ")[0])
      .valueChanges()
      .subscribe((data: CountryModel[]) => {
        this.cityList = data;
      });
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
}
