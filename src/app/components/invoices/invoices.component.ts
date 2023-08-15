import { Component, OnInit, ViewChild } from '@angular/core';
import { InvoiceModel } from 'src/app/models/invoice.model';
import { InvoiceService } from 'src/app/services/invoice.service';
import { map } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertService } from 'src/app/services/alert.service';
import { Timestamp } from 'firebase/firestore';
import { LoginService } from 'src/app/services/login.service';
import { UserModel } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css']
})
export class InvoicesComponent {
  currentDate: Date = new Date;
  invoice: InvoiceModel = new InvoiceModel();
  edditted = false;
  mostrarForm: boolean = false;
  mostrarViewForm: boolean = false;
  currentUserEmail: string | null = null;
  strtitle:string ="Agregar Factura";
  
  usersList: UserModel[] = [];
  usersList2: UserModel[] = [];

  //bibliografias
  options: string[] = [
    'PayPal', 
    'Payoneer', 
    'Transferencia $'
  ];

  editing: boolean = false;

  //listar
  invoices?: InvoiceModel[];
  currentInvoice?: InvoiceModel;
  currentIndex = -1;
  title = '';
  
  //mat datatable
  dataSource: any;
  displayedColumns: string[] = ["invoice_id", "numeroFactura", "paymentMethod", "fechaEmision","subtotal", "impuestos", "montoTotal", "nombreProyecto", "status", "Opc"];
  @ViewChild(MatPaginator, { static: true }) paginatior !: MatPaginator;
  @ViewChild(MatSort) sort !: MatSort;

  constructor(private userService: UserService, private loginService: LoginService, private invoiceService: InvoiceService, private alertService: AlertService) { }

  //listar
  ngOnInit(): void {
    this.retrieveInvoices();

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

    //llenamos usersList 
    this.userService.getperType("Profesor").valueChanges().subscribe((data: UserModel[]) => {
      this.usersList = data;
    });
    this.userService.getperType("Cliente").valueChanges().subscribe((data: UserModel[]) => {
      this.usersList2 = data;
    });

    //Personaliza el paginador de mat datatable, con textos en espanol
  }//end ngOnInit

  //si es Date, retorna la misma fecha, si no, si es timestamp de Firestore,
  // llama a timestampConvert y se convierte en Date
  comprobarfecha(fecha: any): Date {
    if (fecha instanceof Date) {
      return fecha;
    } else {
      return this.timestampConvert(fecha);
    }
  }

  editInvoice(invoiceUp: InvoiceModel) {
    this.editing = true;
    this.invoice = invoiceUp;

    this.invoice.fechaEmision = this.comprobarfecha(invoiceUp.fechaEmision);

    this.mostrarForm=true;
    this.mostrarViewForm=false;
    this.strtitle = "Moificar Factura"
  }

  async saveInvoice() {
    //buscamos el usuario actual
    this.loginService.user$.subscribe(user => {
      this.currentUserEmail = user ? user.email : null;
    });

    if (this.editing) {
      try {
        this.invoice.lastUpdate =  this.currentDate;
        this.invoice.lastUpdateUser =  this.currentUserEmail != null ? this.currentUserEmail : '';
        
        await this.invoiceService.update(this.invoice);
        this.edditted = true;
        //llamada a la alerta
        this.doSomething("update","La factura se ha modificado correctamente.");
        this.mostrarForm = false;
        // Aquí puedes agregar código para manejar la actualización exitosa, 
      } catch (error) {
        console.error('Error al actualizar el factura:', error);
      }
    } else {
      //Crea un nuevo factura
      //default value
      this.invoice.registration_date =  this.currentDate;
      this.invoice.lastUpdate =  this.currentDate;
      this.invoice.lastUpdateUser =  this.currentUserEmail != null ? this.currentUserEmail : '';        
      this.invoice.status =  "Pendiente";
      this.strtitle = "Agregar Factura";

      this.invoiceService.create(this.invoice).then(() => {
        console.log('¡Se ha enviado con éxito!');
        this.mostrarForm = false;
        //llamada a la alerta
        this.doSomething("create","La factura se ha creado correctamente.");
      });
    }//end if (this.editing)
  }//end saveInvoice

  newInvoice(): void {
    this.edditted = false;
    this.invoice = new InvoiceModel();
    this.editing = false;
    this.invoice.uid = "";
    this.strtitle = "Agregar Factura"
  }//end newInvoice

  refreshList(): void {
    this.currentInvoice = undefined;
    this.currentIndex = -1;
    this.retrieveInvoices();
  }//end refreshList

  retrieveInvoices(): void {
    this.invoiceService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.invoices = data;
      //ELEMENT_DATA FOR MAT DATATABLE
      this.dataSource = new MatTableDataSource(this.invoices);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginatior;

    });    
  }//end retrieveInvoices

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }//end applyFilter

  setActiveInvoice(invoice: InvoiceModel, index: number): void {
    this.currentInvoice = invoice;
    this.currentIndex = index;
  }//end setActiveInvoice

  async removeUsr(uid:string){
    this.loginService.user$.subscribe(user => {
      this.currentUserEmail = user ? user.email : null;
    });
    this.currentUserEmail =  this.currentUserEmail != null ? this.currentUserEmail : '';
    await this.invoiceService.delete(uid, this.currentUserEmail.toString(), this.currentDate)
    this.doSomething("delete","La factura se ha eliminado correctamente.");
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

  viewRecod(invoiceRe: InvoiceModel){
    this.invoice = invoiceRe;
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

    this.strtitle = "Agregar Factura";
    this.currentIndex = -1;
    this.editing = false;
    this.currentInvoice = undefined;
    this.invoice = new InvoiceModel();


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

  formatFecha(dateObj: any): string {
    //si es  un objeto de fecha de Firebase Firestore 
    if (dateObj && typeof dateObj.toDate === 'function') {
      const date = dateObj.toDate();
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }else if (dateObj instanceof Date){ //si es una instancia de la clase "Date"
      let day = dateObj.getDate();
      let month = dateObj.getMonth()+1;
      let year = dateObj.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return ''; // o cualquier otro valor predeterminado que desees retornar en caso de que la conversión no sea posible
  }

  //Convierte una fecha de tipo timestamp a Date
  timestampConvert(fec: any){
    let dateObject = new Date(fec.seconds*1000);
    let mes_ = dateObject.getMonth()+1;
    let ano_ = dateObject.getFullYear();
    let dia_ = dateObject.getDate();
    return dateObject;
  }

  updateClienteId(event: any) {
    const cliente_id = event.target.value;
    this.invoice.client_id = cliente_id;
    const selectedUser = this.usersList.find(user => user.uid === cliente_id);
    this.invoice.nombreCliente = selectedUser ? selectedUser.name + ' ' + selectedUser.lastname : '';
  }

}
