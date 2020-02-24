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

    /**
     * Show tutorial/help message
     * Once user has done one map report, we save it in localstorage and set showTutorial to false the next time
     */
    showTutorial: boolean = true;
    messageOne = 'Zoom in and move the map to highlight the location in the circle';
    messageTwo = 'Click to add a start and click to add an end.'
    messageTwoA = 'Click to add the start';
    messageTwoB = 'Click to add the end';

    public map;

    public routingControl;
    public geocoderControl;

    /**
     * step1: choose the location
     * step2: draw the direction
     */
    public locationType: string = 'point';

    /**
     * Use a circle to pick the location
     * Let the user choose the accuracy with zoom level
     * eg. complete suburb or just a corner
     */
    public centerCircle: L.Circle = L.circle([-41.286461, 174.776230], { radius: 5000 });

    /**
     * mapHasMoved: detect if user has moved to then show the 'next' button
     * locationSelected: thie first step: pick a location in the circle. basically our boolean for step 1/2 since we only have 2 steps
     */
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

    ngAfterViewInit() {
        this.storage.get('ion_did_tutorial_map').then(res => {
            if (res === true) {
                this.showTutorial = false;
            }
            this.handleMapSteps();
        });
    }

    ngAfterViewChecked() {
        this.map.invalidateSize(false);
    }

    async helpMessage(message: string) {
        if (this.showTutorial) {
            this.presentHelpTwo();
        } else {
            // Just a toast if use has already used the map
            this.presentToast(message);
        }
    }

    /**
     * Special case because it has a gif
     */
    async helpMessageStep1() {
        if (this.showTutorial) {
            this.presentHelpOne();
        } else {
            // Just a toast if use has already used the map
            this.presentToast(this.messageOne);
        }
    }

    async presentToast(message: string) {
        const toast = await this.toastController.create({
            message: message,
            duration: 2000
        });
        toast.present();
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

    /**
     * Handle leaflet event
     * At step2 we keep a circle in the center 
     * @param eventType
     * @param event
     */
    public handleEvent(eventType: string, event: any) {
        if (eventType === 'leafletMapMove' || eventType === 'leafletMapMoveEnd') {
            if (!this.step.locationSelected) {
                this.drawCircleCenter(); // redraw
            }
        }

        if (eventType === 'leafletMapMove' && !this.step.mapHasMoved ) {
            if (!this.step.mapHasMoved) {
                setTimeout(() => {
                    this.step.mapHasMoved = true;
                }, 5000);
            }
        }

    }

    /**
     * Draw and keep a circle in the center of the map
     */
    public drawCircleCenter() {
        this.centerCircle.setLatLng(this.map.getCenter());
        const increaseSizeCoeff = this.map.getZoom() <= 11 ? 14 - this.map.getZoom() : 1;
        this.centerCircle.setRadius(10 * Math.pow(Math.abs(20 - this.map.getZoom()), 2) * increaseSizeCoeff);
    }

    /**
     * Handle leaflet click event
     * At step2 we create a waypoints/direction
     * @param event
     */
    public handleClick(event: any) {
        if (this.step.locationSelected) {
            let waypoints = this.routingControl.getWaypoints();

            if ((waypoints.length === 0 || !waypoints[0].latLng)) {
                this.routingControl.spliceWaypoints(0, 1, event.latlng);
                this.presentToast(this.messageTwoB);
            }
            else if ((waypoints.length === 1 || !waypoints[1].latLng)) {
                this.routingControl.spliceWaypoints(this.routingControl.getWaypoints().length - 1, 1, event.latlng);
            }
            else {
                this.routingControl.spliceWaypoints(this.routingControl.getWaypoints().length - 1, 1, event.latlng);
            }
        }
    }

    public onMapReady(map: L.Map) {
        this.map = map;
        // fix fullscreen bug
        this.map.invalidateSize(false);

        this.geocoderControl = L.Control.geocoder({
            defaultMarkGeocode: false
        }).addTo(this.map);

        if (!this.dataService.hasLocation()) {
            // Move to user location
            this.geolocation.getCurrentPosition().then((resp) => {
                this.map.panTo(new L.LatLng(resp.coords.latitude, resp.coords.longitude));
            }).catch((error) => {
                console.log('Error getting location', error);
            });
        } else {
            // Edit report. Move to report location
            this.map.panTo(new L.LatLng(this.dataService.report.location.lat, this.dataService.report.location.lng));
            this.drawCircleCenter();
            if (this.dataService.report.location.radius) {
                this.centerCircle.setRadius(this.dataService.report.location.radius);
            }
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
        })
        .addTo(this.map)
        .on('waypointschanged', function (e) {
            console.log('waypoint changed', e);
        });
    }

    /**
     * Prepare map for steps 
     */
    public handleMapSteps() {
        if (!this.step.locationSelected) {
            // Step 1
            this.drawCircleCenter();
            this.map.dragging.enable();
            if (this.routingControl) {
                this.map.removeControl(this.routingControl);
            }
            this.helpMessageStep1();
        } else if (this.step.locationSelected) {
            // Step 2
            this.map.fitBounds(this.centerCircle.getBounds())
            this.map.removeControl(this.geocoderControl);
            this.addRouting();
            this.map.dragging.disable();
            this.helpMessage(this.messageTwo)
        }
    }

    /**
     * User click 'next'
     */
    public next() {
        // step 1
        if (!this.step.locationSelected) {

            this.dataService.report.location = {};
            this.dataService.report.location.bbox = this.centerCircle.getBounds().toBBoxString();
            this.dataService.report.location.radius = this.centerCircle.getRadius();
            this.dataService.report.location.lat = this.centerCircle.getLatLng().lat;
            this.dataService.report.location.lng = this.centerCircle.getLatLng().lng;

            this.step.locationSelected = true;
            this.handleMapSteps();
            return;
        }
        // else step 2 done

        if (this.routingControl.getWaypoints().length > 0) {
            let waypoints: Array<any> = this.routingControl.getWaypoints();
            waypoints = waypoints.filter(elt => { return elt.latLng !== null })
            this.dataService.report.waypoints = waypoints.map((elt) => { return { 'lat': elt.latLng.lat, 'lng': elt.latLng.lng } }) 
        } else {
            this.dataService.report.waypoints = [];
        }
        console.log(this.dataService.report);

        this.reportService.update(this.dataService.report.id, this.dataService.report).then(() => {
            this.storage.set('ion_did_tutorial_map', true);
            this.router.navigateByUrl('/report-time');
        })

    }

    /**
     * Back button only showing at step 2
     */
    public back() {
        this.step.locationSelected = false;
        this.handleMapSteps();
    }
}
