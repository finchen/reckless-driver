import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { ViewEncapsulation } from "@angular/core";
import { Report } from "../../models/report.model";
import { ActivatedRoute } from "@angular/router";
import { ReportService } from "../../services/report.service";
import { DataService } from "../../services/data.service";

@Component({
  selector: 'page-report-time',
  templateUrl: './report-time.page.html',
  styleUrls: ['./report-time.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReportTimePage implements OnInit {

    public reportDate: string = new Date().toISOString();
    public reportTime: string = new Date().toISOString();
    public timeType = 'precise';
    public precision = 60;

    constructor(public router: Router, public route: ActivatedRoute, private reportService: ReportService, private dataService: DataService) { }

    ngOnInit() {
        this.route.data.subscribe((data: { report: Report }) => {
            if (data.report.report_time && data.report.report_time.date) {
                this.reportDate = data.report.report_time.date;
            }
            if (data.report.report_time && data.report.report_time.time) {
                this.reportTime = data.report.report_time.time;
            }
            if (data.report.report_time && data.report.report_time.timeType) {
                this.timeType = data.report.report_time.timeType;
            }
            if (data.report.report_time && data.report.report_time.precision) {
                this.precision = data.report.report_time.precision;
            }
        });
      }

    public next() {
        this.dataService.report.report_time.date = this.reportDate;
        this.dataService.report.report_time.time = this.reportTime;
        this.dataService.report.report_time.timeType = this.timeType;
        this.dataService.report.report_time.precision = this.precision;

        this.reportService.update(this.dataService.report.id, this.dataService.report).then(() => {
            this.router.navigateByUrl('/report-vehicle-info');
        })

      }

}
