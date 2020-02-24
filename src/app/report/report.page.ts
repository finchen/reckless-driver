import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { ReportService } from "../../services/report.service";
import { DocumentReference } from "@angular/fire/firestore";
import { AuthService } from "../../services/auth.service";
import { DataService } from "../../services/data.service";
import { Report } from "../../models/report.model";
import { ToastController } from '@ionic/angular';
import { trigger, transition, style, animate } from "@angular/animations";

@Component({
    selector: 'app-report',
    templateUrl: './report.page.html',
    styleUrls: ['./report.page.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger(
            'enterAnimation', [
                transition(':enter', [
                    style({ transformOrigin: 'top', transform: 'rotateX(-90deg)', opacity: 0 }),
                    animate('500ms', style({ transformOrigin: 'top', transform: 'rotateX(0deg)', opacity: 1 }))
                ]),
                transition(':leave', [
                    style({ opacity: 1 }),
                    animate('500ms', style({ transformOrigin: 'top', transform: 'rotateX(-90deg)', opacity: 0 }))
                ])
            ]
        )
    ]
})
export class ReportPage implements OnInit {
    hasOneSelected: boolean = false;

    /**
     * Report type
     * Will be moved later on
     */
    public options = [
        {
            group: 'Speed', icon: "#fast", items: [
                { key: 'speed-limit', label: 'Exceeding the speed limit', description: '', selected: false, group: 'speed', icon: "#fast", captureSpeed: true, speedText: 'above' },
                { key: 'holding-traffic', label: 'Holding up traffic', description: 'Driving too slowly', selected: false, group: 'speed', icon: "#slow", captureSpeed: true, speedText: 'below'  },
                { key: 'speed-school', label: 'Speeding near a school or bus', description: '', selected: false, group: 'speed', icon: "#bus-school", captureSpeed: true, speedText: 'above'  },
            ]
        },
        {
            group: 'Overtaking', icon: "#racing", items: [
                { key: 'overtaking', label: 'Dangerous overtaking', description: 'eg. In the face of oncoming traffic', selected: false, icon: "#racing" },
                { key: 'lane-markings', label: 'Failing to obey lane markings', description: '', selected: false, icon: "#racing" },
            ]
        },
        {
            group: 'Intersection', icon: "#traffic-light", items: [
                { key: 'red-light', label: 'Failing to stop for a red light', description: '', selected: false, group: 'intersection' },
                { key: 'stop-sign', label: 'Failing to stop at a compulsory stop sign', description: '', selected: false, group: 'intersection' },
                { key: 'intersection-engage', label: 'Engage dangerously at intersection', description: 'Engage when not enough time or distance between vehicle', selected: false, group: 'intersection' },
                { key: 'fail-indicate', label: 'Failing to indicate', description: '', selected: false, group: 'intersection' },
                { key: 'roundabout', label: 'Not following roundabout rules', description: 'Wrong lane usage. Use roundabout to dangerously pass vehicle. ', selected: false, group: 'intersection' }]
        },
        {
            group: 'Parking', icon: "#parking-1", items: [
                { key: 'car-park-disabled', label: 'Parked on disabled car park', description: 'Without a mobility parking permit', selected: false, group: 'parking' },
                { key: 'car-park', label: 'Parking', description: 'Should not be parked here', selected: false, group: 'parking' },
            ]
        },
        {
            group: 'Behavior', icon: "#angry-man", items: [
                { key: 'tailgating', label: 'Tailgating', description: 'Following too close', selected: false, group: 'behavior', icon: "#car-collision", captureSpeed: false  },
                { key: 'intoxicated', label: 'Appear intoxicated', description: '', selected: false, group: 'behavior' },
                { key: 'distracted', label: 'Distracted driver', description: 'mobile phone, eating, reading while operating motor vehicle', selected: false, group: 'behavior' },
                { key: 'road-rage', label: 'Road rage', description: '', selected: false, group: 'behavior' },
                { key: 'racing', label: 'Racing', description: '', selected: false, group: 'behavior' }
            ]
        },
        {
            group: 'Pollution', icon: "#co2", items: [
                { key: 'pollution', label: 'Heavy pollution', description: '', selected: false, group: 'pollution' },
                { key: 'noise-pollution', label: 'Noise pollution', description: '', selected: false, group: 'pollution' },
                { key: 'dumping-rubbish', label: 'Dumping rubbish', description: '', selected: false, group: 'pollution' },
            ]
        },
        
        {
            group: 'Others', icon: "#bus-school", items: [
                { key: 'pedestrian-crossing', label: 'Failing to yield to a pedestrian on a pedestrian crossing', description: '', selected: false, group: 'others' },
                { key: 'hit-run', label: 'Hit and run', description: '', selected: false, group: 'others' },
                { key: 'lights', label: 'No lights on when required', description: '', selected: false, group: 'others' },
                { key: 'school-bus', label: 'School bus passed illegally', description: '', selected: false, group: 'others' },
                { key: 'other', label: 'Other', description: 'Please describe below', selected: false, group: 'others' }]
        }

    ];

    constructor(public router: Router, public route: ActivatedRoute, private reportService: ReportService, private authService: AuthService, private dataService: DataService, public toastController: ToastController) { }

    ngOnInit() { 
        this.route.data.subscribe((data: { report: Report }) => {
            this.initSelection();
            this.presentToast('Choose at least one offense');
        });
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

    private initSelection() {
        this.hasOneSelected = this.dataService.report.types.length > 0;
        this.dataService.report.types.forEach(elt => {
            this.options.forEach((group: any) => {
                group.items.forEach((item: any) => {
                    if (item.key === elt.key) {
                        item.selected = true;
                        item.comment = elt.comment || '';
                    }
                });
            });
        });
    }

    public onSelected(option) {
        option.selected = !option.selected;
        this.hasOneSelected = true;
    }
    public isOneSelected(): boolean {
        return this.hasOneSelected;
    }

    public next() {
        this.dataService.report.types = [];

        this.options.forEach((group: any) => {
            group.items.forEach((item: any) => {
                if (item.selected) {
                    this.dataService.report.types.push({
                        key: item.key,
                        label: item.label,
                        comment: item.comment || null
                    });
                }
            })
        });

        this.reportService.update(this.dataService.report.id, this.dataService.report).then(() => {
            this.router.navigateByUrl('/report-photos');
        })
        // TODO error management
    }

}
