import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { IonicModule } from '@ionic/angular';

import { TutorialPage } from './tutorial';

const routes: Routes = [
  {
    path: '',
    component: TutorialPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
      IonicModule,
      LazyLoadImageModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TutorialPage]
})
export class TutorialPageModule {}
