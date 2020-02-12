import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from "../../services/auth.service";
import { take, map, tap } from "rxjs/operators";


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        console.log('checking login status', this.authenticationService.authenticated);
        if (this.authenticationService.authenticated) {
            // authorised so return true
            return true;
        }

        // check if being logged in or redirect
        return this.authenticationService.currentUserObservable.pipe(
            take(1),
            map(user => !!user),
            tap(loggedIn => {
                if (!loggedIn) {
                    console.log("access denied")
                    console.log("create anonymous account")

                    this.authenticationService.signInAnonymously().then(
                        () => {
                            console.log("anonymous account created");
                            this.router.navigate(['/home']);
                        }
                    ).catch(
                        () => {
                            console.log("failed to create anonymous account. go to login page")
                            // not logged in so redirect to login page with the return url
                            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
                        }
                    )
                }
            })
        );
    }
}
