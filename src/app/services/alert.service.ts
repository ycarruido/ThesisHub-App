import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSource = new Subject();
  alert$ = this.alertSource.asObservable();

  constructor() { }

  ShowAlert(type: string,message:string, time: number = 5000){
    this.alertSource.next({type,message, time})
  }
}
