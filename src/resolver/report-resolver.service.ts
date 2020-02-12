import { Injectable }             from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
}                                 from '@angular/router';
import { Observable, of, EMPTY }  from 'rxjs';
import { mergeMap, take, map, concatMap, flatMap, switchMap, first }         from 'rxjs/operators';
 
import { Report } from "../models/report.model";
import { AuthService } from "../services/auth.service";
import { DataService } from "../services/data.service";
import { ReportService } from "../services/report.service";
import { UserData } from "../models/userData.model";
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from "angularfire2/firestore";
 
@Injectable({
  providedIn: 'root',
})
export class ReportResolverService implements Resolve<Report> {
    constructor(private authService: AuthService, private dataService: DataService, private reportService: ReportService, private router: Router, public afAuth: AngularFireAuth, private afs: AngularFirestore) {}
 
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Report> {


        if (this.dataService.hasReport()) {
            console.log('Report in session');
            return Promise.resolve(this.dataService.report);
        } 

        console.warn('No report in session. Page refresh? Look if one to load');

        return new Promise((resolve, reject) => {
            const observable = this.authService.userData$.subscribe(userData => {
                if (!userData || !('current_report_uid' in userData) || userData.current_report_uid === null) {
                    console.log('No report found');
                    this.router.navigateByUrl('/home');
                    return reject(null);
                }
                this.reportService.get(userData.current_report_uid).subscribe(report => {
                    console.log('Found report in progress in user data', report);
                    this.dataService.report = report;
                    resolve(report);
                });
            });
        });
  }
}