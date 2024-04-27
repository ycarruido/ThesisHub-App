import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { LoginService } from "src/app/services/login.service";

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.loginService.getUserObservable().pipe(
      switchMap(user => {
        if (!user) {
          this.router.navigate(['/login']); // Redireccionamiento si no hay usuario
          return of(false);
        } else {
          return this.loginService.getUserTypeObservable(user.uid).pipe(
            switchMap(userType => {
                console.log(userType)
              if (userType === 'admin') {
                return of(true); // Permitir acceso si es admin
              } else {
                //this.router.navigate(['/home']); // Redireccionar a otra ruta si no es admin
                return of(false);
              }
            })
          );
        }
      })
    );
  }
}
