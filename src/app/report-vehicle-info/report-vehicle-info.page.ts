import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ViewEncapsulation } from "@angular/core";
import { ReportService } from "../../services/report.service";
import { DataService } from "../../services/data.service";
import { Report } from "../../models/report.model";
import { OpenAlprResponse } from "../../models/OpenAlprResponse";

@Component({
  selector: 'app-report-vehicle-info',
  templateUrl: './report-vehicle-info.page.html',
  styleUrls: ['./report-vehicle-info.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReportVehicleInfoPage implements OnInit {

    public formPlate: FormGroup;
    public formVehicle: FormGroup;

    showFormPlate = false;
    showFormVehicle = true

    constructor(public router: Router, public route: ActivatedRoute, public fb: FormBuilder, private reportService: ReportService, private dataService: DataService) { }

    ngOnInit() {

        this.formPlate = this.fb.group({
            plate: ['', Validators.compose([Validators.required])],
            color: ['', Validators.compose([])],
            driver: ['', Validators.compose([])],
            driverAge: ['', Validators.compose([])]
        });

        this.formVehicle = this.fb.group({
            type: ['', Validators.compose([])],
            make: ['', Validators.compose([])],
            model: ['', Validators.compose([])],
            color: ['', Validators.compose([])],
            driver: ['', Validators.compose([])],
            driverAge: ['', Validators.compose([])]
        });

        this.route.data.subscribe((data: { report: Report }) => {

            if (data.report.vehicle.plate) {
                this.formPlate.patchValue({ plate: data.report.vehicle.plate });
                this.showFormPlate = true;
                this.showFormVehicle = false;
            }

            if (data.report.vehicle.color) {
                this.formPlate.patchValue({ color: data.report.vehicle.color });
                this.formVehicle.patchValue({ color: data.report.vehicle.color });
            }
            if (data.report.vehicle.model) {
                this.formVehicle.patchValue({ model: data.report.vehicle.model });
            }
            if (data.report.vehicle.make) {
                this.formVehicle.patchValue({ make: data.report.vehicle.make });
            }
            if (data.report.vehicle.type) {
                this.formVehicle.patchValue({ type: data.report.vehicle.type });
            }

        });

        
  }

    public preSave() {
        if (this.showFormPlate) {
            this.dataService.report.vehicle.plate = this.formPlate.get('plate').value;
            this.dataService.report.vehicle.color = this.formPlate.get('color').value;
            this.dataService.report.vehicle.driver = this.formPlate.get('driver').value;
            this.dataService.report.vehicle.driver_age = this.formPlate.get('driverAge').value;
        } else {
            this.dataService.report.vehicle.color = this.formVehicle.get('color').value;
            this.dataService.report.vehicle.make = this.formVehicle.get('make').value;
            this.dataService.report.vehicle.model = this.formVehicle.get('model').value;
            this.dataService.report.vehicle.type = this.formVehicle.get('type').value;
            this.dataService.report.vehicle.driver = this.formVehicle.get('driver').value;
            this.dataService.report.vehicle.driver_age = this.formVehicle.get('driverAge').value;
        }
    }

    public save() {
        this.preSave();

        this.reportService.update(this.dataService.report.id, this.dataService.report).then(() => {
            this.router.navigateByUrl('/reports');
        })
    }

    public next() {

        this.preSave();
        
        this.dataService.report.locked = true;

        this.reportService.update(this.dataService.report.id, this.dataService.report).then(() => {
            this.router.navigateByUrl('/thanks');
        })
  }
}
