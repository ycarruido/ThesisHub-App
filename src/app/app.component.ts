import { Component } from '@angular/core';
import { AlertService } from './services/alert.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Creado en Angular 16 Firebase htts://andromedaoll.com';
  sideNavStatus: boolean = false;
  showAlert = false;
  message = '';
  typeAlert = 'alert alert-info alerta';

  constructor(private alertService: AlertService){}

  ngOnInit(){
    //alert
    this.alertService.alert$.subscribe((res: any) => {
      this.message = res.message;
      this.showAlert = true;
      
      if (res.type=="create"){
        this.typeAlert = "alert alert-info alerta";
      }
      if (res.type=="update"){
        this.typeAlert = "alert alert-info alerta";
      }
      if (res.type=="delete"){
        this.typeAlert = "alert alert-danger alerta";
      }

      setTimeout(() =>{
        this.showAlert = false;
      }, res.time);
    });
  }
}
