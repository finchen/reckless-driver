import { Component, ViewEncapsulation, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Router, ActivatedRoute, NavigationStart  } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DataService } from "../../services/data.service";
import { ReportService } from "../../services/report.service";
import { Observable } from "rxjs";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomePage implements AfterViewInit {
    @ViewChild('PureChatWidget') myDiv: ElementRef;

    counterReport$: Observable<any>

    constructor(private router: Router, private route: ActivatedRoute, private dataService: DataService, private reportService: ReportService, @Inject(DOCUMENT) private document: Document, private toastController: ToastController, public alertController: AlertController, private authService: AuthService) {
        // TODO emailVerified console.log(this.authService.user);
        this.route.queryParams.subscribe(params => {
            let message = params['message'];
            if (message === 'pok') {
                this.presentToast('Your crypto payment has been received.');
            }
        });

        this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                const chat = this.document.getElementById('PureChatWidget');
                
                if (chat) {
                    console.log(chat);
                    chat.style.setProperty('display', 'none', 'important');
                }
            }
        });

        this.counterReport$ = this.reportService.getCount();
    }

    ngAfterViewInit() {
        const chat = this.document.getElementById('PureChatWidget');
        if (chat) {
            chat.style.display = "block";
        }
    }

    async presentToast(message: string) {
        const toast = await this.toastController.create({
            message: message,
            duration: 2000,
            position: 'middle',
            closeButtonText: 'Ok',
            showCloseButton: true
        });
        toast.present();
    }

    openFacebook() {
        window.open('https://www.facebook.com/recklessdriver.co.nz', '_blank', 'location=yes')
    }

    newReport() {
        this.dataService.initReport();
        this.dataService.report.purchased = true;

        return this.reportService.add(this.dataService.report).then((documentRef) => {
            // set it in context. not sure if we just use firebase object..
            this.dataService.report.id = documentRef.id;

            // assign to current. we might actually not need that
            this.authService.updateUserData({ current_report_uid: documentRef.id });

            this.router.navigateByUrl('/report');
        });
        
    }

    async confirmQuickReport() {
        const alert = await this.alertController.create({
            header: 'Quick Report',
            message: 'Record current information (time, location, photo) and complete the report later on. <br /><br />  Use this if you just stop after an incident (eg. at an intersection) or if you are following an offender and a passenger can record the information.',
            buttons: [{
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'secondary',
                handler: (blah) => {
                    console.log('Confirm Cancel');
                }
            }, {
                text: 'Okay',
                handler: () => {
                    return this.router.navigateByUrl('/quick-report');
                }
            }]
        });

        await alert.present();
    }
}
