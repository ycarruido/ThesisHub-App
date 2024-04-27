import { Component, ElementRef } from "@angular/core";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Observable, tap } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { LoginService } from "src/app/services/login.service";

@Component({
  selector: "app-document-upload",
  templateUrl: "./document-upload.component.html",
  styleUrls: ["./document-upload.component.css"],
})
export class DocumentUploadComponent {
  selectedFileName: string | null = "";
  documentTitle: string = "";
  porcentajeAvance: number = 0;
  nroPaginas: number = 0;
  tipoDocumento: string = "";
  selectedFile: File | undefined;
  uploading: boolean = false;
  uploadSuccess: boolean = false;
  documentsTut: any[] = [];
  documentsCli: any[] = [];

  usertypeAdmin = false;

  confirmDeleteDoc: { [key: string]: boolean } = {};

  currentUserEmail: string | null = "";
  currentUserUID: string | null = "";
  displayField: boolean = false;

  createBy: string = "";
  createByEmail: string = "";
  clientId: string = "";
  clientName: string = "";
  tutorId: string = "";
  tutorName: string = "";
  id: string = "";
  uidProject: string = "";
  title: string = "";

  constructor(
    private route: ActivatedRoute,
    private loginService: LoginService,
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private elementRef: ElementRef
  ) {}

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
    
    //console.log("projectNro ",this.id)
    //return 0
    
    uploadTask.then(() => {
      documentRef.getDownloadURL().subscribe((downloadURL) => {
        const documentData = {
          id: documentId,
          docName: fileNameWithId,
          title: this.documentTitle,
          projectId: this.uidProject,
          projectNro: this.id,
          projectName: this.title,
          OwnerId: this.createBy,
          OwnerEmail: this.createByEmail,
          clienteId: this.clientId,
          clientName: this.clientName,
          tutorId: this.tutorId,
          tutorName: this.tutorName,
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
            this.uploadSuccess = true;
            console.log("Documento subido exitosamente");

            // Resetear los campos
            this.selectedFile = undefined;
            this.documentTitle = "";
            this.tipoDocumento = "";
            const fileInput = document.getElementById(
              "fileInput"
            ) as HTMLInputElement;
            fileInput.value = "";
            this.selectedFileName = "";
            const documentTitleInput =
              this.elementRef.nativeElement.querySelector("#documentTitle");
            if (documentTitleInput) {
              documentTitleInput.value = ""; // Restablecer el valor del campo a vacío
            }
            this.tipoDocumento = "";
          })
          .catch((error) => {
            this.uploading = false;
            console.error("Error al subir el documento", error);
          });
      });
    });
  }

  showConfirmationIcons(document: any) {
    this.confirmDeleteDoc = {};
    this.confirmDeleteDoc[document.docName] = true;
  }

  confirmDelete(document: any) {
    const documentRef = this.storage.ref(`docs/${document.docName}`);
    documentRef
      .delete()
      .pipe(
        tap(() => {
          this.uploadSuccess = false;
          this.selectedFile = undefined;
          this.selectedFileName = null;
          console.log("Documento eliminado correctamente");

          // Eliminar el documento de la colección 'docs'
          this.firestore
            .collection("docs")
            .doc(document.id)
            .delete()
            .then(() => {
              console.log(
                "Documento en la colección 'docs' eliminado correctamente"
              );
            })
            .catch((error) => {
              console.error(
                "Error al eliminar el documento de la colección 'docs'",
                error
              );
            });
        })
      )
      .subscribe({
        error: (error) => {
          console.error("Error al eliminar el documento", error);
        },
      });
    this.confirmDeleteDoc[document.docName] = false;
  }

  cancelDelete(document: any) {
    this.confirmDeleteDoc[document.docName] = false;
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.createBy = params["createBy"];
      this.createByEmail = params["createByEmail"];
      this.clientId = params["clientId"];
      this.clientName = params["clientName"];
      this.tutorId = params["tutorId"];
      this.tutorName = params["tutorName"];
      this.id = params["id"];
      this.uidProject = params["uidProject"];
      this.title = params["title"];
    });

    this.firestore
      .collection("docs", (ref) =>
        ref
          .where("projectId", "==", this.uidProject)
          .where("projectNro", "==", this.id)
          .where("OwnerId", "==", this.tutorId)
          .orderBy("uploadDate", "desc")
      )
      .valueChanges()
      .subscribe((documentsTut) => {
        this.documentsTut = documentsTut;
      });

    this.firestore
      .collection("docs", (ref) =>
        ref
          .where("projectId", "==", this.uidProject)
          .where("projectNro", "==", this.id)
          .where("OwnerId", "!=", this.tutorId)
          .orderBy("OwnerId")
          .orderBy("uploadDate", "desc")
      )
      .valueChanges()
      .subscribe((documentsCli) => {
        this.documentsCli = documentsCli;
      });

    this.loginService.getUserObservable().subscribe((user) => {
      if (user) {
        this.currentUserEmail = user.email;
        this.currentUserUID = user.uid;

        //Verificamos el tipo de usuario
        this.loginService.getUserName(user.uid).subscribe((users) => {
          if (users.user_type) {
            if (users.user_type == "Cliente") {
              this.displayField = false;
            } else {
              this.displayField = true;
            }
            if (users.user_type == "Admin") {
              this.usertypeAdmin = true;
            }
          }
        });
        //tipo de usuario
      }
    });
  }

  formatFecha(dateObj: any): string {
    const date = dateObj.toDate();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
