import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ReportService } from "../../services/report.service";
import { AngularFireAuth } from "@angular/fire/auth";
import { Report } from "../../models/report.model";
import { Observable } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { DataService } from "../../services/data.service";

@Component({
    selector: 'app-reports',
    templateUrl: './reports.page.html',
    styleUrls: ['./reports.page.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ReportsPage implements OnInit {

    public reports$: Observable<Report[]>;

    constructor(public router: Router, private reportSvs: ReportService, private afAuth: AngularFireAuth, private authService: AuthService, private dataService: DataService) { }

    ngOnInit() {
        this.afAuth.authState.subscribe(auth => {
            this.reports$ = this.reportSvs.getCollection(auth.uid);
        });

    }

    loadAndRedirect(report: Report) {
        this.dataService.report = report;
        this.authService.updateUserData({ current_report_uid: this.dataService.report.id }).then(() => {
            this.router.navigateByUrl('/report');
        });
    }

}
