import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule , ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PhoneLoginPage } from './phone-login.page';

const routes: Routes = [
  {
    path: '',
    component: PhoneLoginPage
  }
];

@NgModule({
  imports: [
      CommonModule,
      FormsModule ,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PhoneLoginPage]
})
export class PhoneLoginPageModule {}
