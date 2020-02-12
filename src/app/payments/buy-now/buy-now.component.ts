import { Component, OnInit, Input } from '@angular/core';
import { PaymentService } from '../payment.service';
import { Observable } from "rxjs";
import { AlertController } from "@ionic/angular";
import { DataService } from "../../../services/data.service";
import { ReportService } from "../../../services/report.service";
import { AuthService } from "../../../services/auth.service";
import { Router } from "@angular/router";
import { StripePipe } from "../stripe.pipe";
import { Report } from "../../../models/report.model";
import { first } from "rxjs/internal/operators/first";

@Component({
    selector: 'buy-now',
    templateUrl: './buy-now.component.html',
    styleUrls: ['./buy-now.component.scss']
})
export class BuyNowComponent implements OnInit {

    @Input() label;
    @Input() price;
    @Input() confirm;
    @Input() redirect;
    @Input() report: Report;

    //balance: Observable<number>;
    //hasPurchased;


    constructor(private paymentSvc: PaymentService,
        public router: Router,
        private authService: AuthService,
        private dataService: DataService,
        public alertController: AlertController,
        private reportService: ReportService,
        private stripePipe: StripePipe    ) { }

    ngOnInit() {
        //this.balance = this.paymentSvc.getBalance()

        //this.hasPurchased = this.paymentSvc.hasPurchased(this.buyableId)
    }

    async presentAlertConfirm() {

        let balance = await this.paymentSvc.getBalance().pipe(first()).toPromise<number>();

        let newBalance = balance - this.price;
        if (newBalance < 0) {
            return this.presentNotEnoughCredit();
        }

        const alert = await this.alertController.create({
            header: this.confirm,
            message: 'Balance after purchase: ' + this.stripePipe.transform(newBalance),
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: (blah) => {
                        alert.dismiss();
                    }
                }, {
                    text: 'Okay',
                    handler: () => {
                        this.confirmPurchase().then(() => {
                            alert.dismiss();
                            this.router.navigateByUrl(this.redirect);

                        });
                    }
                }
            ]
        });

        await alert.present();

    }

    async presentNotEnoughCredit() {
        const alert = await this.alertController.create({
            header: 'Sorry you don\'t have enough credit',
            message: 'Please top up to create a new report'
        });

        await alert.present();
    }

    confirmPurchase() {
        if (this.report) {
            return this.confirmPurchaseExisting(this.report);
        } else {
            return this.confirmPurchaseNew();
        }
    }

    confirmPurchaseExisting(report: Report) {
        console.log('confirm purchase');

        // buy this new report
        return this.paymentSvc.buyDigitalContent('report', report.id, this.price).then(() => {
            // success. set the report as bought. TODO probably better to do it on cloud function
            this.dataService.report.purchased = true;
            console.log('report purchased');

            this.dataService.report = report;

            // assign to current. we might actually not need that
            this.authService.updateUserData({ current_report_uid: report.id });

            return this.reportService.update(report.id, { purchased: true });
        }).catch(() => {
            // error while paying.
            // delete report?
        });
    }

    confirmPurchaseNew() {
        console.log('confirm purchase');
        
        // create new report
        return this.reportService.add(this.dataService.initReport()).then((documentRef) => {
            // set it in context. not sure if we just use firebase object..
            this.dataService.report.id = documentRef.id;
            console.log('Report created', this.dataService.report);

            // assign to current. we might actually not need that
            this.authService.updateUserData({ current_report_uid: documentRef.id });

            // buy this new report
            return this.paymentSvc.buyDigitalContent('report', documentRef.id, this.price).then(() => {
                // success. set the report as bought. TODO probably better to do it on cloud function
                this.dataService.report.purchased = true;
                console.log('report purchased');
                return this.reportService.update(documentRef.id, { purchased: true });
            }).catch(() => {
                // error while paying.
                // delete report?
            });
        });

        
    }

}
