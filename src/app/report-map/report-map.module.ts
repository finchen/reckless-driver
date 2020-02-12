import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { IonicModule } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ReportMapPage } from './report-map.page';

const routes: Routes = [
  {
    path: '',
    component: ReportMapPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
      LeafletModule
  ],
  declarations: [ReportMapPage],
  providers: [
      Geolocation
  ]
})
export class ReportMapPageModule {}
