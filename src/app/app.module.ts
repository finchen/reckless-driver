/* Angular */
import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

/* Ionic */
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';
import { LazyLoadImageModule } from 'ng-lazyload-image';

/* firebase */
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireDatabaseModule } from "angularfire2/database";
import { AngularFireFunctionsModule, FunctionsRegionToken } from '@angular/fire/functions';

/* Analytics */
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

/* Ngx plugin */
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgxPicaModule } from '@digitalascetic/ngx-pica';

/* App */
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

/* Directive */
import { DropZoneDirective } from '../directives/drop-zone.directive';

/* Layout */
import { DefaultLayoutComponent } from "../containers/default-layout/default-layout.component";

/* Module */
import { TermsComponent } from './terms/terms.component'
import { AuthService } from "../services/auth.service";
import { ReportService } from "../services/report.service";
import { DataService } from "../services/data.service";

/* Pipes */
import { FileSizePipe } from "../pipes/file-size.pipe";

/* Log Error */
import { errorHandlerFactory } from "../error-handler/sentry-error.handler";
import { environment } from "../environments/environment";
import { AboutPageModule } from "./about/about.module";



@NgModule({
    declarations: [
        AppComponent,
        DropZoneDirective,
        DefaultLayoutComponent,
        FileSizePipe,
        TermsComponent
    ],
    entryComponents: [TermsComponent],
  imports: [
      BrowserModule,
      BrowserAnimationsModule,
      IonicModule.forRoot(),
      LeafletModule.forRoot(),
      IonicStorageModule.forRoot(),
      ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
      NgxPicaModule,

      AppRoutingModule,
      Angulartics2Module.forRoot(),

      LoadingBarRouterModule,
      LoadingBarModule,
      LoadingBarHttpClientModule,

      LazyLoadImageModule,

      // we use reactive forms
      FormsModule,
      ReactiveFormsModule,

      AngularFireModule.initializeApp(environment.firebase),
      AngularFirestoreModule.enablePersistence(),
      AngularFireStorageModule, // normal DB
      AngularFireDatabaseModule, // live DB. used for payment
      AngularFireFunctionsModule,

      /* Load module that we need right now */
      AboutPageModule
  ],
  providers: [
      AuthService,
      ReportService,
      DataService,
      AngularFireAuth,
      { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
      { provide: ErrorHandler, useFactory: errorHandlerFactory },
      { provide: FunctionsRegionToken, useValue: 'us-central1' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
