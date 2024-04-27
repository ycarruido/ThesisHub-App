import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { CityModel } from '../models/city.model';


import { CountryModel } from '../models/country.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private dbPath = '/citys';
  citysRef: AngularFirestoreCollection<CityModel>;
  lastId: number = 1; // Variable para almacenar el último ID asignado


  constructor(private db: AngularFirestore) {
    this.citysRef = db.collection(this.dbPath);
  }

  getAllCity(): AngularFirestoreCollection<CityModel> {
    return this.db.collection<CityModel>('citys', ref => ref.where('status', '==', true).orderBy('cityName', 'asc'));
  }

  getAllCityName(country_name: string): AngularFirestoreCollection<CityModel> {
    return this.db.collection<CityModel>('citys', ref => ref.where('status', '==', true).where('countryName', '==', country_name).orderBy('cityName', 'asc'));
  }

  getAllCityCode(country_id: string): AngularFirestoreCollection<CityModel> {
    return this.db.collection<CityModel>('citys', ref => ref.where('status', '==', true).where('countryCode', '==', country_id).orderBy('cityName', 'asc'));
  }

  getAllCountries(): AngularFirestoreCollection<CountryModel> {
    return this.db.collection<CountryModel>('countries', ref => ref.where('status', '==', true).orderBy('countryName', 'asc'));
  }
  //Funcion asíncrona que crea un nuevo ciudad en la base de datos. 




  //Consulta
  getNumberOfRecords(): Promise<number> {
      return this.db.collection('citys').ref.get().then(snapshot => {
        return snapshot.size;
      });
  }
  
  async getNextId() {
      try {
        const count = await this.getNumberOfRecords();
        this.lastId = count;
      } catch (error) {
        console.error('Error al obtener la cantidad de registros:', error);
      }
      this.lastId++;
  }

  async createCity(city: CityModel): Promise<any> {
    try {

      await this.getNextId(); //Obtener el proximo ID disponible
      const id = this.lastId.toString();
      city.cityId = id;

      const refer = this.db.collection('citys').doc(); //Referencia a la colección "citys"
      const nro = refer.ref.id; //ID Autogenerado del documento
      city.uid = nro;

      const cityData = {
        uid: nro,
        cityId: city.cityId,
        ...city
      };
  
      //se guarda el objeto  cityData
      await refer.set(cityData);
    } catch (error) {
      console.error('Error al crear el ciudad:', error);
      throw error;
    }
  }

  addCountry(country: CountryModel) {
    return this.db.collection('countries').add(country);
  } 

  update(data: any): Promise<void> {
    return this.citysRef.doc(data.uid).update(data);
  }

  delete(id: string, usr:string, fecha: Date): Promise<void> {
    return this.citysRef.doc(id).update({ status: false, lastUpdate: fecha, lastUpdateUser: usr });
  }

}
