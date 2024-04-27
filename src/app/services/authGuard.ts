// import { Injectable } from '@angular/core';
// import { CanActivate, Router } from '@angular/router';
// import { Observable } from 'rxjs';
// import { tap, map } from 'rxjs/operators';
// import { LoginService } from './login.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthGuard implements CanActivate {
//   constructor(private loginService: LoginService, private router: Router) {}

//   canActivate(): Observable<boolean> {
//     return this.loginService.getUserObservable().pipe(
//       map(user => !!user), // Devuelve true si el usuario está autenticado
//       tap(isLoggedin => {
//         if (!isLoggedin) {
//           this.router.navigate(['/main']); // Redirigir al usuario a una página de acceso no autorizado si no es un administrador
//         }
//         else{
//           console.log("Esta autenticado");
//         }
//       })
//     );
//   }
// }

import { createMayBeForwardRefExpression } from "@angular/compiler";
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { LoginService } from "./login.service";
import { Observable } from "rxjs";
import { tap, map } from 'rxjs/operators';

export const AuthGuard: CanActivateFn = (route, state) =>{
 const loginService = inject(LoginService);
 const router =inject(Router);

 return loginService.getUserObservable().pipe(
  map(user => !!user),
  tap(isLoggedin => {
    if (!isLoggedin) {
      router.navigate(['/main']); // Redirigir al usuario a una página de acceso no autorizado si no está autenticado
    }
  }),
  map(isLoggedin => {
    if (isLoggedin) {
      console.log("Está autenticado");
    }
    return isLoggedin;
  })
);

}





