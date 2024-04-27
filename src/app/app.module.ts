import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HeaderComponent } from './components/header/header.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { DataTablesModule } from 'angular-datatables';

//Angular Material
import { ModulosAngularMaterials } from './material.module';

//Authentication
import { getAuth, provideAuth } from '@angular/fire/auth';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainComponent } from './components/main/main.component';
import { AdmincontactComponent } from './components/admincontact/admincontact.component';
import { LeadsComponent } from './components/leads/leads.component';
import { InvoicesComponent } from './components/invoices/invoices.component';
import { InforComponent } from './components/infor/infor.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ProjectComponent } from './components/project/project.component';
import { UserComponent } from './components/user/user.component';
import { ChatComponent } from './components/chat/chat.component';
import { DocumentUploadComponent } from './components/document-upload/document-upload.component';
import { ManagerequestsComponent } from './components/managerequests/managerequests.component';
import { RoleComponent } from './components/role/role.component';
import { CurrencyComponent } from './components/currency/currency.component';
import { CountryComponent } from './components/country/country.component';

import { MAT_DATE_LOCALE } from '@angular/material/core';
import { CityComponent } from './components/city/city.component';
import { PasswdResetComponent } from './components/passwd-reset/passwd-reset.component';


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    HeaderComponent,
    SidenavComponent,
    LoginComponent,
    RegisterComponent,
    MainComponent,
    AdmincontactComponent,
    LeadsComponent,
    InvoicesComponent,
    InforComponent,
    SettingsComponent,
    ProjectComponent,
    UserComponent,
    ChatComponent,
    DocumentUploadComponent,
    ManagerequestsComponent,
    RoleComponent,
    CurrencyComponent,
    CountryComponent,
    CityComponent,
    PasswdResetComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    BrowserAnimationsModule,
    DataTablesModule,
    ModulosAngularMaterials,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'es-VE' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
