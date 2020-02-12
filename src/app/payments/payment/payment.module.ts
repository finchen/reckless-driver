import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MakePaymentComponent } from '../make-payment/make-payment.component';
import { PaymentService } from '../payment.service';
import { BuyNowComponent } from '../buy-now/buy-now.component';
import { StripePipe } from '../stripe.pipe';
import { IonicModule } from "@ionic/angular";

@NgModule({
    imports: [
        CommonModule,
        IonicModule
        
    ],
    exports: [MakePaymentComponent, BuyNowComponent],
    declarations: [
        MakePaymentComponent,
        BuyNowComponent,
        StripePipe
    ],
    providers: [
        PaymentService,
        StripePipe
    ]
})
export class PaymentModule { }