import { Injectable } from '@angular/core';
import {CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import { Storage } from '@ionic/storage';

@Injectable({ providedIn: 'root' })
export class TutorialGuardService implements CanActivate {

  constructor(
      private router: Router,
      public storage: Storage
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
      return this.storage.get('ion_did_tutorial').then(res => {
          console.log('ion_did_tutorial', res);
          if (res !== true) {
              this.router.navigateByUrl('/tutorial');
              return false;
          }
          return true;
      });
      
  }

}