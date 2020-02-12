
import { Report } from "../models/report.model";
import { Injectable } from "@angular/core";
import { OpenAlprResponse } from "../models/OpenAlprResponse";


@Injectable()
export class DataService  {
    private _report: Report = null;

    public get report() {
        if (this._report === null) {
            // Initialize new report
            this.initReport();
        }
        return this._report;
    }

    public initReport(): Report {
        this._report = {} as Report;
        this._report.types = [];
        this._report.photos = [];
        this._report.waypoints = [];
        this._report.vehicle = {};
        this._report.location = {};
        this._report.report_time = {};
        return this._report;
    }

    public set report(r: Report) {
        this._report = r;
    }

    public setVehicleFromAlpr(vh: OpenAlprResponse.Result) {
        this._report.vehicle = {
            plate: vh.plate,
            make: vh.vehicle.make.length ? vh.vehicle.make[0].name : null,
            model: vh.vehicle.make_model.length ? vh.vehicle.make_model[0].name : null,
            color: vh.vehicle.color.length ? vh.vehicle.color[0].name : null,
            type: vh.vehicle.body_type.length ? vh.vehicle.body_type[0].name : null,
            alpr: true
        }
    }

    public hasPlate() {
        return this._report !== null && this._report.vehicle && 'plate' in this.report.vehicle && this.report.vehicle.plate.length;
    }

    public hasLocation() {
        return this._report !== null && this._report.location && this.report.location.lat && this.report.location.lng;
    }

    public hasTime() {
        return this._report !== null && this._report.report_time && 'date' in this._report.report_time;
    }

    public hasReport() {
        return this._report !== null;
    }
}