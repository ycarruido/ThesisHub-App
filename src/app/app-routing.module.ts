import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TutorialsListComponent } from './components/tutorials-list/tutorials-list.component';
import { AddTutorialComponent } from './components/add-tutorial/add-tutorial.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { AdmincontactComponent } from './components/admincontact/admincontact.component';
import { LeadsComponent } from './components/leads/leads.component';
import { InvoicesComponent } from './components/invoices/invoices.component';
import { InforComponent } from './components/infor/infor.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ProjectComponent } from './components/project/project.component';
import { UserComponent } from './components/user/user.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', component: DashboardComponent,
    ...canActivate(()=> redirectUnauthorizedTo(['/register'])) 
  },
  { 
    path: 'project', component: ProjectComponent,
    ...canActivate(()=> redirectUnauthorizedTo(['/register'])) 
  },
  { 
    path: 'admincontact', component: AdmincontactComponent,
    ...canActivate(()=> redirectUnauthorizedTo(['/register'])) 
  },
  { 
    path: 'leads', component: LeadsComponent,
    ...canActivate(()=> redirectUnauthorizedTo(['/register'])) 
  },
  { 
    path: 'invoices', component: InvoicesComponent,
    ...canActivate(()=> redirectUnauthorizedTo(['/register'])) 
  },
  { 
    path: 'infor', component: InforComponent,
    ...canActivate(()=> redirectUnauthorizedTo(['/register'])) 
  },
  { 
    path: 'settings', component: SettingsComponent,
    ...canActivate(()=> redirectUnauthorizedTo(['/register'])) 
  },
  { 
    path: 'user', component: UserComponent,
    ...canActivate(()=> redirectUnauthorizedTo(['/register'])) 
  },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },



  
  { path: 'tutorials', component: TutorialsListComponent },
  { path: 'add', component: AddTutorialComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }