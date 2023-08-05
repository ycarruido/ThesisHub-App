import { Component } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
 @Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.css']
})
export class DocumentUploadComponent {
  selectedFileName: string | null = '';
  documentTitle: string = '';
  porcentajeAvance: number = 0;
  nroPaginas: number = 0;
  tipoDocumento: string = '';
  selectedFile: File | undefined;
  uploading: boolean = false;
  uploadSuccess: boolean = false;
  documents: any[] = [];

  createBy: string = '';
  createByEmail: string = '';
  clientId: string = '';
  clientName: string = '';
  tutorId: string = '';
  tutorName: string = '';
  id: string = '';
  uidProject: string = '';
  title: string = '';
  
  constructor(private route: ActivatedRoute,private storage: AngularFireStorage, private firestore: AngularFirestore) { }
  
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.selectedFileName = this.selectedFile ? this.selectedFile.name : null;
  }

  uploadDocument() {
    this.uploading = true;
    const documentId = this.firestore.createId();
    const documentRef = this.storage.ref(`docs/${this.selectedFileName}`);
    const uploadTask = documentRef.put(this.selectedFile);

    uploadTask.then(() => {
      
      documentRef.getDownloadURL().subscribe(downloadURL => {

         const documentData = {
          id: documentId,
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
          status: 'active',
        };
         this.firestore.collection('docs').doc(documentId).set(documentData)
          .then(() => {
            this.uploading = false;
            this.uploadSuccess = true;
            console.log('Documento subido exitosamente');
          })
          .catch(error => {
            this.uploading = false;
            console.error('Error al subir el documento', error);
          });
      });
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.createBy = params['createBy'];
      this.createByEmail = params['createByEmail'];
      this.clientId = params['clientId'];
      this.clientName = params['clientName'];
      this.tutorId = params['tutorId'];
      this.tutorName = params['tutorName'];
      this.id = params['id'];
      this.uidProject = params['uidProject'];
      this.title = params['title'];
    });

    this.firestore.collection('docs', ref => ref
      .where('projectId', '==', this.uidProject)
      .where('projectNro', '==', this.id)
      .orderBy('uploadDate')
      ).valueChanges().subscribe(documents => {
      this.documents = documents;
    });
  }

}