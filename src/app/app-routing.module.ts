import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { RegisterComponent } from "./components/register/register.component";
import { LoginComponent } from "./components/login/login.component";
import { canActivate, redirectUnauthorizedTo } from "@angular/fire/auth-guard";
import { AdmincontactComponent } from "./components/admincontact/admincontact.component";
import { LeadsComponent } from "./components/leads/leads.component";
import { InvoicesComponent } from "./components/invoices/invoices.component";
import { InforComponent } from "./components/infor/infor.component";
import { SettingsComponent } from "./components/settings/settings.component";
import { ProjectComponent } from "./components/project/project.component";
import { UserComponent } from "./components/user/user.component";
import { ChatComponent } from "./components/chat/chat.component";
import { DocumentUploadComponent } from "./components/document-upload/document-upload.component";
import { ManagerequestsComponent } from "./components/managerequests/managerequests.component";
import { RoleComponent } from "./components/role/role.component";
import { CurrencyComponent } from "./components/currency/currency.component";
import { CountryComponent } from "./components/country/country.component";
import { CityComponent } from "./components/city/city.component";
import { MainComponent } from "./components/main/main.component";
import { PasswdResetComponent } from "./components/passwd-reset/passwd-reset.component";
import { RoleGuard } from "./services/role.guard";
import { AuthGuard } from "./services/authGuard";


// function callRoleGuard() {
//   const option = [RoleGuard];
//   console.log("retono de role: ",option);
//   return option;
// }

// function callAuthGuard() {
//   const option = AuthGuard;
//   console.log("retono de Auth: ",option);
//   return option;
// }

const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  {
    path: "dashboard",
    component: DashboardComponent,
    ...canActivate(() => redirectUnauthorizedTo(["/login"])),
  },
  {
    path: "project",
    component: ProjectComponent,
    ...canActivate(() => redirectUnauthorizedTo(["/login"])),
  },
  {
    path: "admincontact",
    component: AdmincontactComponent,
    ...canActivate(() => redirectUnauthorizedTo(["/login"])),
  },
  {
    path: "leads",
    component: LeadsComponent,
    ...canActivate(() => redirectUnauthorizedTo(["/login"])),
  },
  {
    path: "invoices",
    component: InvoicesComponent,
    ...canActivate(() => redirectUnauthorizedTo(["/login"])),
  },
  {
    path: "infor",
    component: InforComponent,
    ...canActivate(() => redirectUnauthorizedTo(["/login"])),
  },
  {
    path: "settings",
    component: SettingsComponent,
    ...canActivate(() => redirectUnauthorizedTo(["/login"])),
  },
  {
    path: "user",
    component: UserComponent,
    ...canActivate(() => redirectUnauthorizedTo(["/login"])),
  },
  {
    path: "chat",
    component: ChatComponent,
    ...canActivate(() => redirectUnauthorizedTo(["/login"])),
  },
  {
    path: "document-upload",
    component: DocumentUploadComponent,
    ...canActivate(() => redirectUnauthorizedTo(["/login"])),
  },
  {
    path: "managerequests",
    component: ManagerequestsComponent,
    ...canActivate(() => redirectUnauthorizedTo(["/login"])),
  },
  {
    path: "role",
    component: RoleComponent,
    ...canActivate(() => redirectUnauthorizedTo(["/login"])),
  },
  {
    path: "currency",
    component: CurrencyComponent,
    ...canActivate(() => redirectUnauthorizedTo(["/login"])),
  },
  {
    path: "country",
    component: CountryComponent,
    ...canActivate(() => redirectUnauthorizedTo(["/login"])),
  },
  {
    path: "city",
    component: CityComponent,
    ...canActivate(() => redirectUnauthorizedTo(["/login"])),
  },
  {
    path: "register",
    component: RegisterComponent,
    ...canActivate(() => redirectUnauthorizedTo(["/login"])),
  },
  { path: "login", component: LoginComponent },
  { path: "passwd-reset", component: PasswdResetComponent },
  { path: "**", component: MainComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
