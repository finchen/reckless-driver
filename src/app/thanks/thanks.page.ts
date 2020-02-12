import { Component, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-thanks',
  templateUrl: './thanks.page.html',
  styleUrls: ['./thanks.page.scss'],
})
export class ThanksPage implements OnInit {

    user$: Observable<firebase.User>;

    constructor(private authenticationService: AuthService, public router: Router) {

        this.user$ = this.authenticationService.currentUserObservable;

    }

    public loginWithPhone() {
        this.router.navigateByUrl('/phone-login');
    }

    public onSignup() {
        this.router.navigateByUrl('/signup');
    }

    googleUpgrade() {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().currentUser.linkWithPopup(provider).then(() => {
            this.router.navigateByUrl('/home');
        }).catch(() => {
            this.router.navigateByUrl('/home');
        });
    }

    facebookUpgrade() {
        const provider = new firebase.auth.FacebookAuthProvider();
        firebase.auth().currentUser.linkWithPopup(provider).then(() => {
            this.router.navigateByUrl('/home');
        }).catch(() => {
            this.router.navigateByUrl('/home');
        });
    }

    
  ngOnInit() {
  }

}
