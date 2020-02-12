import { Component, OnInit, HostListener } from '@angular/core';
import { PaymentService } from '../payment.service';
import { environment } from '../../../environments/environment';
import { Observable } from "rxjs";
import { ActionSheetController } from "@ionic/angular";
import { AngularFireFunctions } from "@angular/fire/functions";
import { AuthService } from "../../../services/auth.service";

@Component({
    selector: 'make-payment',
    templateUrl: './make-payment.component.html',
    styleUrls: ['./make-payment.component.scss']
})
export class MakePaymentComponent implements OnInit {

    handler: any;

    balance: Observable<any>;
    data$: Observable<any>;


    constructor(
        private paymentSvc: PaymentService,
        public actionSheetController: ActionSheetController,
        private fns: AngularFireFunctions,
        private authService: AuthService    ) {
    }

    ngOnInit() {
        this.balance = this.paymentSvc.getBalance();
    }

    async presentPaymentChoices(amount) {
        const actionSheet = await this.actionSheetController.create({
            header: 'Method',
            buttons: [{
                text: 'Credit Card',
                icon: 'card',
                handler: () => {
                    this.handlePayment(amount)
                }
            }, {
                text: 'Crypto Currency (BTC, LN)',
                icon: 'logo-bitcoin',
                handler: () => {
                    this.handleCryptoPayment(amount)
                }
            }, {
                text: 'Cancel',
                icon: 'close',
                role: 'cancel',
                handler: () => {
                    console.log('Cancel clicked');
                }
            }]
        });
        await actionSheet.present();
    }

    async presentTopupAmount() {
        const actionSheet = await this.actionSheetController.create({
            header: 'Amount',
            buttons: [{
                text: '$1',
                handler: () => {
                    this.handleAmount(1)
                }
            }, {
                text: '$5',
                handler: () => {
                    this.handleAmount(5)
                }
            }, {
                text: '$10',
                handler: () => {
                    this.handleAmount(10)
                }
            }, {
                text: 'Cancel',
                icon: 'close',
                role: 'cancel',
                handler: () => {
                    console.log('Cancel clicked');
                }
            }]
        });
        await actionSheet.present();
    }

    handleAmount(amount) {
        // Prepare payment method
        this.handler = StripeCheckout.configure({
            key: environment.stripeKey,
            image: '/assets/img/reckless.webp',
            locale: 'auto',
            token: token => {
                // token callback function
                this.paymentSvc.processPayment(token, amount)
            }
        });

        // Prepare payment method
        const callable = this.fns.httpsCallable('openNodeCharge');
        this.data$ = callable({ amount: amount, currency: 'USD', userId: this.authService.user.uid });

        this.presentPaymentChoices(amount);
    }

    handlePayment(amount) {
        this.handler.open({
            name: 'Reckless Driver',
            excerpt: 'Deposit Funds to Account',
            amount: amount*100
        });
    }

    handleCryptoPayment(amount) {
        
        this.data$.subscribe((res: ICrypto) => {
            console.log(res);
            window.location.href = environment.opennodePay + res.id;
        })
    }

    @HostListener('window:popstate')
    onPopstate() {
        this.handler.close()
    }

}

export interface ICrypto {
    id: string;
    btc: {
        address: string;
    },
    ln: {
        payreq: string;
        expires_at: number; // timestamp
    }
}