import { Component, OnInit } from '@angular/core';
import { LocationService } from 'src/app/services/location.service';


@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent implements OnInit{
  countriesString: string = '';
  lblmsj = '';

  constructor(private locationService: LocationService) { }

  ngOnInit(): void {
  }
  
  confirmAddCountries() {
    let confirm: any;
    //confirm = window.confirm('Esta operacion, eliminará todos los registros y se reemplazarán por los nuevos registros. ¿Desea agregar los países?');
    confirm = window.confirm('¿Desea agregar los países?');
    if (confirm) {
      this.addCountries();
    }
  }

  addCountries() {
    let countriesArray = this.countriesString.split('\n');
    countriesArray.forEach(countryString => {
      let country = countryString.split(',');
      let countryModel = {
        countryId: country[0].trim(),
        countryName: country[1].trim(),
        countryCode: country[2].trim(),
        status: true
      }
      this.locationService.addCountry(countryModel);
    });
    console.log('Se terminó de agregar los países'); 
    this.lblmsj = 'Se terminó de agregar los países';
    this.countriesString = '';
  } catch (error: any) {
    this.lblmsj = 'Ocurrió un error al agregar los países';
    console.log('Ocurrió un error al agregar los países: ', error);
  }



}
