import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { QuickReportPage } from './quick-report.page';
import { Routes, RouterModule } from '@angular/router';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { Geolocation } from '@ionic-native/geolocation/ngx'

const routes: Routes = [
    {
        path: '',
        component: QuickReportPage
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
    declarations: [QuickReportPage],
    providers: [Geolocation]
})
export class QuickReportPageModule { }
