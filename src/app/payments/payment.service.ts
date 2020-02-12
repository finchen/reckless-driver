import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import * as firebase from 'firebase/app';
import 'rxjs/add/operator/switchMap';
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { ToastController } from '@ionic/angular';
import { StripePipe } from "./stripe.pipe";


@Injectable()
export class PaymentService {

    userId: string;
    balance$: Observable<number>;

    /**
     * not safe. use observable
     */
    private balance: number;

    constructor(private db: AngularFireDatabase, private afAuth: AngularFireAuth, public toastController: ToastController, private stripePipe: StripePipe) {
        this.afAuth.authState.subscribe(auth => {
            if (auth) {
                this.userId = auth.uid
            } else {
                this.userId = null;
            }
        });
    }

    /*getUserBalance() {
        return this.afAuth.authState.switchMap((auth, index) => {
            this.userId = auth.uid
            return this.db.object(`/users/${this.userId}/balance`).valueChanges().pipe(
                map(
                    (balance: any) => balance.$value
                )
            );
        })
    }*/

    async presentToast(message: string) {
        const toast = await this.toastController.create({
            message: message,
            duration: 2000
        });
        toast.present();
    }

    getBalance(): Observable<number> {
        this.balance$ = this.afAuth.authState.switchMap((auth, index) => {
            if (auth) {
                this.userId = auth.uid;
                console.log(`/users/${this.userId}/balance`);
                return this.db.object<number>(`/users/${this.userId}/balance`).valueChanges().pipe(
                    map((balance: number) => {
                        this.presentToast('Your balance is ' + this.stripePipe.transform(balance));
                        return this.balance = balance;
                    })
                );
            }
        });
        return this.balance$;
    }

    hasPurchased(buyableId) {
        return this.db.object(`/purchases/${this.userId}/${buyableId}`).valueChanges().pipe(
            map( (purchase: any) => !!purchase.timestamp)
        );
    }

    buyDigitalContent(buyableKey: any, buyableId: string, amount: number) {
        const timestamp = firebase.database.ServerValue.TIMESTAMP
        const purchase = { timestamp, amount }
        let updates = {}

        const newBalance = this.balance - amount;

        console.log('purchase. new balance: ', newBalance);

        updates[`/purchases/${this.userId}/${buyableId}`] = purchase //  probably ok to leave on frontend
        updates[`/users/${this.userId}/balance`] = newBalance // TODO must do that on cloud function!

        return this.db.object('/').update(updates)
    }

    /**
     * Payment calbback from stipe popup
     * Trigger server side operation

     * @param token
     * @param amount
     */
    processPayment(token: any, amount: number) {
        const payment = { token, amount }
        return this.db.list(`/payments/${this.userId}`).push(payment)
    }


}