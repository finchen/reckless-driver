import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from "@angular/router";
import { ReportService } from "../../services/report.service";
import { DataService } from "../../services/data.service";
import { Report } from "../../models/report.model";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-report-photos',
  templateUrl: './report-photos.page.html',
  styleUrls: ['./report-photos.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReportPhotosPage implements OnInit {

    public report: Report;

    constructor(public router: Router, public route: ActivatedRoute, private reportService: ReportService, private dataService: DataService) { }

    ngOnInit() {
        this.route.data.subscribe((data: { report: Report }) => {
            this.report = data.report;
        });
    }

    public next() {

        this.reportService.update(this.dataService.report.id, this.dataService.report).then(() => {
            this.router.navigateByUrl('/report-map');
        })
        // TODO error management
    }
}
