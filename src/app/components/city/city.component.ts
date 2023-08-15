import { Component, OnInit, ViewChild } from '@angular/core';
import { CityModel } from 'src/app/models/city.model';
import { LocationService } from 'src/app/services/location.service';
import { map } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertService } from 'src/app/services/alert.service';
import { LoginService } from 'src/app/services/login.service';
import { ActivatedRoute } from '@angular/router';
import { CountryModel } from 'src/app/models/country.model';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css']
})
export class CityComponent implements OnInit {
  showForm: string = "";
  currentDate: Date = new Date;
  city: CityModel = new CityModel();
  edditted = false;
  mostrarForm: boolean = false;
  mostrarViewForm: boolean = false;
  currentCityEmail: string | null = null;
  strtitle:string ="Agregar Ciudades";
  countryList: CountryModel[] = [];

  editing: boolean = false;

  //listar
  citys?: CityModel[];
  currentCity?: CityModel;
  currentIndex = -1;
  title = '';
  
  //mat datatable
  dataSource: any;
  displayedColumns: string[] = ["cityId", "cityName", "countryName", "status" , "Opc"];
  @ViewChild(MatPaginator, { static: true }) paginatior !: MatPaginator;
  @ViewChild(MatSort) sort !: MatSort;

  constructor(private route: ActivatedRoute, private loginService: LoginService, private locationService: LocationService, private alertService: AlertService) { }

  //listar
  ngOnInit(): void {
    this.retrieveCitys();

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

    //llenamos usersList 
    this.locationService.getAllCountries().valueChanges().subscribe((data: CountryModel[]) => {
      this.countryList = data;
    });
    
    if (this.showForm == 'NewForm'){
      this.moForm();
    }

  }//end ngOnInit

  editCity(cityUp: CityModel) {
    this.editing = true;
    this.city = cityUp;
    this.mostrarForm=true;
    this.strtitle = "Modificar Ciudades"
  }

  async saveCity() {
    //buscamos el usuario actual
    this.loginService.user$.subscribe(city => {
      this.currentCityEmail = city ? city.email : null;
    });

    if (this.editing) {
      try {
        this.city.lastUpdate =  this.currentDate;
        this.city.lastUpdateUser =  this.currentCityEmail != null ? this.currentCityEmail : '';
        
        let CountryFullname: any;
        CountryFullname = this.city.countryName?.split("**");
        this.city.countryCode = CountryFullname[0];
        this.city.countryName = CountryFullname[1];

        await this.locationService.update(this.city);
        this.edditted = true;
        //llamada a la alerta
        //console.log("Currentcity: ",this.currentCityEmail);
        this.doSomething("update","La ciudad se ha modificado correctamente.");
        this.mostrarForm = false;
        // Aquí puedes agregar código para manejar la actualización exitosa, como mostrar un mensaje al usuario
      } catch (error) {
        console.error('Error al actualizar el usuario:', error);
      }
    } else {
      //Crea un nuevo usuario
      //default value
      
      this.city.lastUpdate =  this.currentDate;
      this.city.lastUpdateUser =  this.currentCityEmail != null ? this.currentCityEmail : '';
      let CountryFullname2: any;
      CountryFullname2 = this.city.countryName?.split("**");
      this.city.countryCode = CountryFullname2[0];
      this.city.countryName = CountryFullname2[1];

      this.city.status =  true;
      this.strtitle = "Agregar Ciudades";
      this.locationService.createCity(this.city).then(() => {
        console.log('¡Se ha enviado con éxito!');
        this.mostrarForm = false;
        //llamada a la alerta
        this.doSomething("create","La ciudad se ha creado correctamente.");
      });
    }//end if (this.editing)
  }//end saveCity

  newCity(): void {
    this.edditted = false;
    this.city = new CityModel();
    this.editing = false;
    this.city.uid = "";
    this.strtitle = "Agregar Ciudades"
  }//end newCity

  refreshList(): void {
    this.currentCity = undefined;
    this.currentIndex = -1;
    this.retrieveCitys();
  }//end refreshList

  retrieveCitys(): void {
    this.locationService.getAllCity().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.citys = data;

      //ELEMENT_DATA FOR MAT DATATABLE
      this.dataSource = new MatTableDataSource(this.citys);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginatior;

    });    
  }//end retrieveCitys

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }//end applyFilter

  setActiveCity(city: CityModel, index: number): void {
    this.currentCity = city;
    this.currentIndex = index;
  }//end setActiveCity

  async removeUsr(uid:string){
    //buscamos el usuario actual
    this.loginService.user$.subscribe(user => {
      this.currentCityEmail = user ? user.email : null;
    });
    this.currentCityEmail =  this.currentCityEmail != null ? this.currentCityEmail : '';
    await this.locationService.delete(uid, this.currentCityEmail.toString(), this.currentDate)
    this.doSomething("delete","La ciudad se ha eliminado correctamente.");
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
  
  viewRecod(cityUp: CityModel){
    this.city = cityUp;
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

    this.strtitle = "Agregar Ciudades";
    this.currentIndex = -1;
    this.editing = false;
    this.currentCity = undefined;
    this.city = new CityModel();

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
