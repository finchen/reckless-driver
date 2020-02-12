import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from "../../services/auth.service";
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { ModalController } from "@ionic/angular";
import { Router } from "@angular/router";
import { OverlayEventDetail } from "@ionic/core/dist/types/interface";
import { TermsComponent } from "../terms/terms.component";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginPage implements OnInit {

    public loginForm: FormGroup;
    public loginError: string;

    constructor(
        private auth: AuthService,
        private fb: FormBuilder,
        private afs: AngularFirestore,
        private modalCtrl: ModalController,
        public router: Router
    ) {
        this.loginForm = fb.group({
            email: ['', Validators.compose([Validators.required, Validators.email])],
            password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
            terms: [false, Validators.compose([Validators.required, Validators.requiredTrue])]
        });
    }

    public login() {

        let data = this.loginForm.value;

        if (!data.email || this.loginForm.invalid) {
            return;
        }

        let credentials = {
            email: data.email,
            password: data.password
        };
        this.auth.signInWithEmail(credentials)
            .then(
            (credential) => {

                // go to homepage
                this.router.navigateByUrl('/home');

            },
            error => this.loginError = error.message
            );
    }

    public logout() {
        this.auth.signOut();
    }

    public loginWithPhone() {
        this.router.navigateByUrl('/phone-login');
    }
    /*private updateUserData(user) {
      // Sets user data to firestore on login
  
      const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
  
      console.log(userRef);
  
      this.afs.firestore.doc(`users/${user.uid}`).get()
        .then(document => {
          const data: any = {
            uid: user.uid,
            loginCount: document.exists ? document.get('loginCount') : 1
          }
  
          return userRef.set(data, { merge: true })
        });
  
  
  
    }*/

    public onSignup() {
        this.router.navigateByUrl('/signup');
    }

    public openAbout() {
        this.router.navigateByUrl('/about');
    }

    public loginWithGoogle() {
        this.auth.signInWithGoogle();
    }

    public loginWithFacebook() {
        this.auth.signInWithFacebook();
    }

  ngOnInit() {
  }

  async openTerms() {
      const modal: HTMLIonModalElement =
          await this.modalCtrl.create({
              component: TermsComponent
          });

      await modal.present();
  }
}
