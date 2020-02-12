import { Component, ViewEncapsulation, Inject, AfterViewInit } from '@angular/core';
import { Angulartics2GoogleGlobalSiteTag } from 'angulartics2/gst';
import { environment } from "../environments/environment";
import { SwUpdate } from "@angular/service-worker";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class AppComponent {

    constructor(private angulartics: Angulartics2GoogleGlobalSiteTag, private swUpdate: SwUpdate) {

        if (environment.production) {
            angulartics.startTracking();
        }

        if (this.swUpdate.isEnabled) {

            this.swUpdate.available.subscribe(() => {

                if (confirm("New version available. Load New Version?")) {

                    window.location.reload();
                }
            });
        }  
    }
}
