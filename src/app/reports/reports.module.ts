import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { LazyLoadImageModule } from 'ng-lazyload-image';

import { ReportsPage } from './reports.page';
import { PaymentModule } from "../payments/payment/payment.module";

const routes: Routes = [
  {
    path: '',
    component: ReportsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
      FormsModule,
      PaymentModule,
LazyLoadImageModule, 
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ReportsPage]
})
export class ReportsPageModule {}
