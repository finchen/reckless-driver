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

    public geolocation: Coordinates;
//

    public userData$: Observable<UserData>;

    constructor(public afAuth: AngularFireAuth, private afs: AngularFirestore /*, private paymentService: PaymentService*/) {

        // TODo we probably need to create a cusomtom obersavle on user+userData so we can register and wait for it
        /*this.authState.subscribe(user => {
            this.user = user;
            user.metadata
            if (user) {
                this.loadUserData(user);
            } else {
                this.userData = null;
            }
        });*/

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
                console.log('user data retrieved');
            }
        });
    }


    public signInAnonymously() {
        console.log('Sign in Anonymously');
        return this.afAuth.auth.signInAnonymously();
    }

    public signInWithEmail(credentials) {
        console.log('Sign in with email');
        return this.afAuth.auth.signInWithEmailAndPassword(credentials.email, credentials.password);
    }

    /*public loadUserData(user): Promise<UserData> {
        console.log('loading user data', user.uid);
        const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);

        return this.afs.firestore.doc(`users/${user.uid}`).get()
            .then(doc => {
                if (doc.exists) {
                    console.log("User data:", doc.data());
                    this.userData = doc.data();
                    return this.userData;
                } 

                // doc.data() will be undefined in this case
                console.log("Add user data");
                return this.afs.doc<UserData>(`users/${this.user.uid}`).set({}).then(() => {
                    this.userData = {};
                    return this.userData;
                });
            });
    }*/

    /*public getUserData(): Promise<UserData> {
        if (this.userData) {
            return new Promise(resolve => {
                resolve(this.userData);
            }); 
        }

        return this.userData$.subscribe
    }*/

    /* now done in cloud function
    public updateUserDataFromUser(user: firebase.User) {
        console.log('updateUserDataFromUser');
        const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);

        const data: UserData = {
            uid: user.uid,
        }

        return userRef.set(data, { merge: true })
    }*/

    public updateUserData(data: UserData) {
        console.log('updateUserData');
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

    signOut(): Promise<void> {
        return this.afAuth.auth.signOut();
    }

    signInWithGoogle(): Promise<firebase.auth.UserCredential> {
        console.log('Sign in with google');
        return this.oauthSignIn(new firebase.auth.GoogleAuthProvider());
    }

    signInWithFacebook(): Promise<firebase.auth.UserCredential> {
        console.log('Sign in with facebook');
        return this.oauthSignIn(new firebase.auth.FacebookAuthProvider());
    }

    private oauthSignIn(provider: AuthProvider): Promise<firebase.auth.UserCredential> {
        return this.afAuth.auth.signInWithPopup(provider);

        /*if (!(<any>window).cordova) {
            return this.afAuth.auth.signInWithPopup(provider);
        } else {
            return this.afAuth.auth.signInWithRedirect(provider)
                .then(() => {
                    return this.afAuth.auth.getRedirectResult().then(result => {
                        // The signed-in user info.
                        let user = result.user;
                        console.log(user);
                    }).catch(function (error) {
                        // Handle Errors here.
                        alert(error.message);
                    });
                });
        }*/
    }

}
