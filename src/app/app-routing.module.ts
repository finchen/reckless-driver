import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from "./auth-guard/auth-guard";

import { ReportResolverService } from "../resolver/report-resolver.service";
import { DefaultLayoutComponent } from "../containers/default-layout/default-layout.component";
import { TutorialGuardService } from "./tutorial/tutorial.guard";
import { AboutPage } from "./about/about.page";

const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'tutorial', loadChildren: './tutorial/tutorial.module#TutorialPageModule' },
    { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
    { path: 'phone-login', loadChildren: './phone-login/phone-login.module#PhoneLoginPageModule' },
    { path: 'signup', loadChildren: './signup/signup.module#SignupPageModule' },
    {
        path: '',
        component: DefaultLayoutComponent,
        canActivate: [TutorialGuardService, AuthGuard],
        children: [
            { path: 'home', loadChildren: './home/home.module#HomePageModule' },
            { path: 'reports', loadChildren: './reports/reports.module#ReportsPageModule' },
            { path: 'report', loadChildren: './report/report.module#ReportPageModule', resolve: { report: ReportResolverService } },
            { path: 'quick-report', loadChildren: './quick-report/quick-report.module#QuickReportPageModule' },
            { path: 'report-map', loadChildren: './report-map/report-map.module#ReportMapPageModule', resolve: { report: ReportResolverService } },
            { path: 'report-time', loadChildren: './report-time/report-time.module#ReportTimePageModule', resolve: { report: ReportResolverService } },
            { path: 'report-vehicle-info', loadChildren: './report-vehicle-info/report-vehicle-info.module#ReportVehicleInfoPageModule', resolve: { report: ReportResolverService } },            { path: 'report-photos', loadChildren: './report-photos/report-photos.module#ReportPhotosPageModule', resolve: { report: ReportResolverService } },
            { path: 'thanks', loadChildren: './thanks/thanks.module#ThanksPageModule' },
            { path: 'thanks-quick', loadChildren: './thanks-quick/thanks-quick.module#ThanksQuickPageModule' },
            
        ]
    },
    { path: 'about', component: DefaultLayoutComponent, children: [{ path: '', component: AboutPage }] },
    { path: 'privacy', loadChildren: './privacy/privacy.module#PrivacyPageModule' }

];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
