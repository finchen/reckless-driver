import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import AuthProvider = firebase.auth.AuthProvider;
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { UserData } from "../models/userData.model";
import { Observable, of } from "rxjs";
import { switchMap } from "rxjs/operators";
import { PaymentService } from "../app/payments/payment.service";

@Injectable()
export class AuthService {

    public user: firebase.User = null;
    public userData: UserData;
    public userData$: Observable<UserData>;

    constructor(public afAuth: AngularFireAuth, private afs: AngularFirestore /*, private paymentService: PaymentService*/) {

        this.userData$ = this.afAuth.authState.pipe(
            switchMap( (user: firebase.User) => {
                if (user) {
                    console.log('Loading user data');
                    this.user = user;
                    return this.afs.doc<UserData>(`users/${user.uid}`).valueChanges()
                } else {
                    return of(null);
                }
            })
        )

        this.userData$.subscribe(userData => {
            if (userData) {
                this.userData = userData;
            }
        });
    }


    public signInAnonymously() {
        return this.afAuth.auth.signInAnonymously();
    }

    public signInWithEmail(credentials) {
        return this.afAuth.auth.signInWithEmailAndPassword(credentials.email, credentials.password);
    }

    public signInWithGoogle(): Promise<firebase.auth.UserCredential> {
        return this.oauthSignIn(new firebase.auth.GoogleAuthProvider());
    }

    public signInWithFacebook(): Promise<firebase.auth.UserCredential> {
        return this.oauthSignIn(new firebase.auth.FacebookAuthProvider());
    }

    private oauthSignIn(provider: AuthProvider): Promise<firebase.auth.UserCredential> {
        return this.afAuth.auth.signInWithPopup(provider);
    }

    public signOut(): Promise<void> {
        return this.afAuth.auth.signOut();
    }

    public updateUserData(data: UserData) {
        return this.afs.doc<UserData>(`users/${this.user.uid}`).set(data, { merge: true });
    }

    public signUp(email: string, password: string) {
        return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
    }

    get authenticated(): boolean {
        return this.user !== null;
    }

    get currentUserObservable() {
        return this.afAuth.authState;
    }


    get uid() {
        return this.user && this.user.uid;
    }

    get email() {
        return this.user && this.user.email;
    }
}
