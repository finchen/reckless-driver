import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { Router } from "@angular/router";
import { PaymentModule } from "../payments/payment/payment.module";

@NgModule({
  imports: [
      IonicModule,
    CommonModule,
      FormsModule,
      PaymentModule,
    RouterModule.forChild([{ path: '', component: HomePage }])
  ],
  declarations: [HomePage]
})
export class HomePageModule {

    constructor(
        public router: Router,
    ) { }

    startReport() {
        this.router
            .navigateByUrl('/report');
    }
}
