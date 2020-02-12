import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ReportPhotosPage } from './report-photos.page';
import { FileUploadComponent } from '../file-upload/file-upload.component';

import { NgxPicaModule } from '@digitalascetic/ngx-pica';

const routes: Routes = [
  {
    path: '',
    component: ReportPhotosPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
      IonicModule,
      NgxPicaModule,
      RouterModule.forChild(routes)
  ],
  declarations: [
      ReportPhotosPage,
        FileUploadComponent,
      ]
})
export class ReportPhotosPageModule {
}
