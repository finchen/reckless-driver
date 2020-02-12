import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ReportVehicleInfoPage } from './report-vehicle-info.page';

const routes: Routes = [
  {
    path: '',
    component: ReportVehicleInfoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
      FormsModule,
      ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ReportVehicleInfoPage]
})
export class ReportVehicleInfoPageModule {}
