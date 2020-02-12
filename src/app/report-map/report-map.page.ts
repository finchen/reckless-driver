import { Component, OnInit, AfterViewChecked, ViewEncapsulation } from '@angular/core';
import * as L from 'leaflet'
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder';
import 'leaflet-textpath';
import { ModalController, AlertController, ToastController } from "@ionic/angular";
import { Router } from "@angular/router";
import { AfterViewInit } from "@angular/core";
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ReportService } from "../../services/report.service";
import { DataService } from "../../services/data.service";
import { Storage } from '@ionic/storage';

@Component({
    selector: 'page-report-map',
    templateUrl: './report-map.page.html',
    styleUrls: ['./report-map.page.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ReportMapPage implements OnInit, AfterViewChecked, AfterViewInit {
    showTutorial: boolean = true;
    messageOne = 'Zoom in and move the map to highlight the location in the circle';
    messageTwo = 'Click to add a start and click to add an end.'
    messageTwoA = 'Click to add the start';
    messageTwoB = 'Click to add the end';

    public map;

    public routingControl;
    public geocoderControl;
    public locationType: string = 'point';

    public centerCircle: L.Circle = L.circle([-41.286461, 174.776230], { radius: 5000 });

    public step = {
        mapHasMoved: false,
        locationSelected: false
    };

    public options = {
        zoom: 11,
        center: L.latLng(-41.286461, 174.776230)
    };

    public layers = [
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: 'osm' }),
        this.centerCircle
    ];

    constructor(private modalCtrl: ModalController,
        public router: Router,
        public alertController: AlertController,
        private geolocation: Geolocation,
        private reportService: ReportService,
        private dataService: DataService,
        public storage: Storage,
        public toastController: ToastController) {
    }

    ngOnInit() {
        
    }

    ionViewWillEnter() {
        
    }

    async presentToast(message: string) {
        const toast = await this.toastController.create({
            message: message,
            duration: 2000
        });
        toast.present();
    }

    ngAfterViewInit() {
        this.storage.get('ion_did_tutorial_map').then(res => {
            if (res === true) {
                this.showTutorial = false;
            }
            if (this.showTutorial) {
                this.presentHelpOne();
            } else {
                this.presentToast(this.messageOne);
            }
        });

        
    }

    ngAfterViewChecked() {
        this.map.invalidateSize(false);
    }

    async presentHelpOne() {
        const alert = await this.alertController.create({
            header: 'Indicate where it happens',
            message: this.messageOne + ' <img src="assets/img/map_tuto1.gif" style="max-width: 100%; max-height: 200px;" /></p>',
            buttons: ['OK']
        });

        await alert.present();
    }

    async presentHelpTwo() {
        const alert = await this.alertController.create({
            header: 'Indicates the driving direction of the offender',
            message: this.messageTwo,
            buttons: ['OK']
        });

        await alert.present();
    }

    public handleEvent(eventType: string, event: any) {
        console.log(eventType);

        if (this.locationType === 'point') {
            this.drawCircleCenter(); // redraw
        }

        if (!this.step.mapHasMoved) {

            setTimeout(() => {
                this.step.mapHasMoved = true;
            }, 5000);
        }
    }

    public drawCircleCenter() {
        // keep circle on the center of map
        this.centerCircle.setLatLng(this.map.getCenter());
        const increaseSizeCoeff = this.map.getZoom() <= 11 ? 14 - this.map.getZoom() : 1;
        this.centerCircle.setRadius(10 * Math.pow(Math.abs(20 - this.map.getZoom()), 2) * increaseSizeCoeff);
    }

    public handleClick(event: any) {
        console.log('click', event);
        let waypoints = this.routingControl.getWaypoints();

        if (this.locationType === 'line' && (waypoints.length === 0 || !waypoints[0].latLng)) {
            this.routingControl.spliceWaypoints(0, 1, event.latlng);
            this.presentToast(this.messageTwoB);
        }
        else if (this.locationType === 'line' && (waypoints.length === 1 || !waypoints[1].latLng)) {
            this.routingControl.spliceWaypoints(this.routingControl.getWaypoints().length - 1, 1, event.latlng);
        }
        else if (this.locationType === 'line') {
            this.routingControl.spliceWaypoints(this.routingControl.getWaypoints().length - 1, 1, event.latlng);
        }
    }

    public onMapReady(map: L.Map) {
        this.map = map;
        console.log('map ready', this.map);
        this.map.invalidateSize(false);

        this.geocoderControl = L.Control.geocoder({
            defaultMarkGeocode: false
        }).addTo(this.map);

        if (!this.dataService.hasLocation()) {
            this.geolocation.getCurrentPosition().then((resp) => {
                // resp.coords.latitude
                // resp.coords.longitude
                this.map.panTo(new L.LatLng(resp.coords.latitude, resp.coords.longitude));
            }).catch((error) => {
                console.log('Error getting location', error);
            });
        } else {
            this.map.panTo(new L.LatLng(this.dataService.report.location.lat, this.dataService.report.location.lng));
            this.drawCircleCenter();
            if (this.dataService.report.location.radius) {
                this.centerCircle.setRadius(this.dataService.report.location.radius);
            }
            //this.map.fitBounds(this.centerCircle.getBounds())
            this.step.mapHasMoved = true;
        }
    }

    public addRouting() {
        var startIcon = L.divIcon({
            className: 'map-marker ',
            iconSize: null,
            html: '<div class="pin start"></div><div class="pulse"></div>'
        });
        var endIcon = L.divIcon({
            className: 'map-marker ',
            iconSize: null,
            html: '<div class="pin end"></div><div class="pulse"></div>'
        });
        var icon = L.divIcon({
            className: 'map-marker ',
            iconSize: null,
            html: '<div class="pin"></div><div class="pulse"></div>'
        });

        this.routingControl = L.Routing.control({
            waypoints: this.dataService.report.waypoints,
            createMarker: function (i, wp) {
                console.log(i, wp);
                return L.marker(wp.latLng, {
                    draggable: true,
                    bounceOnAdd: true,
                    icon: i === 0 ? startIcon : (i === 1 ? endIcon : icon)
                });
            },
            routeLine: function (route) {

                var line = L.polyline(route.coordinates, {
                    multiOptions: {
                        optionIdxFn: function (latLng) {

                        },
                    },
                    weight: 5,
                    lineCap: 'butt',
                    opacity: 0.75,
                    smoothFactor: 1
                });

                line.setText('  ►  ', {
                    repeat: true,
                    attributes: {
                        fill: '#D4145A'
                    }
                });

                return line;
            },
            routeWhileDragging: true,
            geocoder: L.Control.Geocoder.nominatim()
        }).addTo(this.map)
            .on('waypointschanged', function (e) {
                console.log('waypoint changed', e);
            })

            ;
    }

    public handleLocationType(locationType) {
        if (locationType === 'point') {
            this.drawCircleCenter();
            if (this.routingControl) {
                this.routingControl.removeFrom(this.map);
            }
        } else if (locationType === 'line') {
            this.map.fitBounds(this.centerCircle.getBounds())
            //this.centerCircle.remove();
            this.map.removeControl(this.geocoderControl);
            this.addRouting();
            if (!this.showTutorial) {
                this.presentToast(this.messageTwoA);
            }
        }
    }

    public next() {
        this.storage.set('ion_did_tutorial_map', true);

        if (!this.step.locationSelected) {

            this.dataService.report.location = {};
            this.dataService.report.location.bbox = this.centerCircle.getBounds().toBBoxString();
            this.dataService.report.location.radius = this.centerCircle.getRadius();
            this.dataService.report.location.lat = this.centerCircle.getLatLng().lat;
            this.dataService.report.location.lng = this.centerCircle.getLatLng().lng;

            // TODO checkzoom. We need you to be a little bit more precise
            this.step.locationSelected = true;
            this.locationType = 'line';
            this.handleLocationType(this.locationType);
            if (this.showTutorial) {
                this.presentHelpTwo();
            }
            return;
        }

        if (this.routingControl.getWaypoints().length > 0) {
            let waypoints: Array<any> = this.routingControl.getWaypoints();
            waypoints = waypoints.filter(elt => { return elt.latLng !== null })
            this.dataService.report.waypoints = waypoints.map((elt) => { return { 'lat': elt.latLng.lat, 'lng': elt.latLng.lng } }) 
        } else {
            this.dataService.report.waypoints = [];
        }
        console.log(this.dataService.report);

        this.reportService.update(this.dataService.report.id, this.dataService.report).then(() => {
            this.router.navigateByUrl('/report-time');
        })

        
    }

}
