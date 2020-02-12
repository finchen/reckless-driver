import { Component, OnInit, ViewEncapsulation, AfterViewChecked, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { ReportService } from "../../services/report.service";
import { AngularFireStorage, AngularFireUploadTask, AngularFireStorageReference } from 'angularfire2/storage';
import { AngularFirestore } from 'angularfire2/firestore';
import { DocumentReference } from "@angular/fire/firestore";
import { AuthService } from "../../services/auth.service";
import { DataService } from "../../services/data.service";
import { Report } from "../../models/report.model";
import * as L from 'leaflet'
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Observable, timer } from "rxjs";
import { take, map, finalize, last, mergeMap, merge } from "rxjs/operators";
import { NgxPicaService, NgxPicaErrorInterface } from '@digitalascetic/ngx-pica';
import { tap } from "rxjs/internal/operators/tap";
import { UploadTaskSnapshot } from "@angular/fire/storage/interfaces";
import { LoadingBarService } from '@ngx-loading-bar/core';
import { AfterViewInit, OnDestroy } from "@angular/core";

@Component({
    selector: 'quick-report',
    templateUrl: './quick-report.page.html',
    styleUrls: ['./quick-report.page.scss'],
    encapsulation: ViewEncapsulation.None
})
export class QuickReportPage implements OnInit, AfterViewChecked, AfterViewInit, OnDestroy  {

    initializing = true;
    captured = true;
    currentPosition: L.Marker;

    counter$: Observable<number>;
    count = 30;

    path: string;

    plateNumber: string = "";

    file: File = null;

    tempWaypoints: Array<{
        lat: number,
        lng: number
    }> = [];

    options = {
        time: true,
        location: true,
        direction: true,
        opposite: false
    }

    map;

    mapOptions = {
        zoom: 11,
        center: L.latLng(-41.286461, 174.776230)
    };

    layers = [
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ];

    recognition = null;
    supportSpeech = ('webkitSpeechRecognition' in window) || ('SpeechRecognition ' in window);
    supportSpeak = ('speechSynthesis' in window);
    hasMic: boolean = true;

    constructor(public router: Router, private zone: NgZone, private loadingBar: LoadingBarService, private storage: AngularFireStorage, private db: AngularFirestore, private _ngxPicaService: NgxPicaService, private reportService: ReportService, private authService: AuthService, public dataService: DataService, private geolocation: Geolocation, private cd: ChangeDetectorRef) {
        
    }

    ngOnInit() {

        // create new report in instance
        this.dataService.initReport();
        this.dataService.report.purchased = true;
        this.dataService.report.vehicle = {};
        this.initializing = false;

        console.log('Report created', this.dataService.report);
    }

    ngOnDestroy() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    public speechToPlate() {
        this.speak('Say the plate number. One letter at the time or use the NATO phonetic. Say no if it is wrong.');
        var SpeechRecognition = SpeechRecognition || window['webkitSpeechRecognition'];
        var SpeechGrammarList = SpeechGrammarList || window['webkitSpeechGrammarList']
        this.recognition = new SpeechRecognition();
        var speechRecognitionList = new SpeechGrammarList();

        var alphabet = {
            "A": "Alfa",
            "B": "Bravo",
            "C": "Charlie",
            "D": "Delta",
            "E": "Echo",
            "F": "Foxtrot",
            "G": "Golf",
            "H": "Hotel",
            "I": "India",
            "J": "Juliet",
            "K": "Kilo",
            "L": "Lima",
            "M": "Mike",
            "N": "November",
            "O": "Oscar",
            "P": "Papa",
            "Q": "Quebec",
            "R": "Romeo",
            "S": "Sierra",
            "T": "Tango",
            "U": "Uniform",
            "V": "Victor",
            "W": "Whiskey",
            "X": "X-ray",
            "Y": "Yankee",
            "Z": "Zulu"
        };
        let alpha = {};
        let alphaArray = [];
        for (var key in alphabet) {
            alpha[alphabet[key].toLowerCase()] = key;
            alphaArray.push(alphabet[key].toLowerCase());
        }
        let letters = ("abcdefghijklmnopqrstuvwxyz123456789").split("");
        let actions = ["back", "bach", "no", "clear", "reset", "end", "stop"];
        let grammar = '#JSGF V1.0; grammar plates; public <letters> = ' + letters.join(' | ') + ' ;' + ' public <commands> =  ' + actions.join(" | ") + ' ;' + ' public <alpha> =  ' + alphaArray.join(" | ") + ' ;' ;
        speechRecognitionList.addFromString(grammar, 1);

        this.recognition.grammars = speechRecognitionList;
        this.recognition.interimResults = false; // Defines whether the speech recognition system should return interim results, or just final results.
        this.recognition.maxAlternatives = 1;
        this.recognition.continuous = false; //not implement in Gecko. we'll use recognition.start(); onresult  to emulate

        this.recognition.onresult = (event) => {
            console.log(event);
            this.recognition.stop();

            // final match results. we should have only one 
            let final = "";
            // possible match results
            let interim = "";

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }

            let finalList: Array<string> = final.split(" ");
            console.log('pre finalList', finalList);
            let toadd = '';

            if (finalList.length === 2 && finalList[1].toLowerCase() in alpha) {
                // g4 juliett
                if (finalList[0].length && finalList[0].substring(finalList[0].length - 1) === '4') {
                    // we might have G4
                    finalList = [alpha[finalList[1].toLowerCase()]]; // t
                }
            }

            if (finalList.length === 3 && finalList[1] === 'for') {
                // t for tango
                if (finalList[2].toLowerCase() in alpha) { // tango?
                    finalList = [alpha[finalList[2].toLowerCase()]]; // t
                }
            }

            console.log('finalList', finalList);

            if (finalList.length) {
                for (let term of finalList) {
                    if (actions.indexOf(term) >= 0) {
                        this.doAction(term);
                    } else if (term.length === 1) {
                        toadd += term;
                    } else {
                        console.log('too long did not recognize %s', term);
                        //this.speak('I don\t understand. One letter at the time please.');
                    }
                }
                if (toadd.length) {
                    if (toadd.toUpperCase() in alphabet) {
                        this.speak(toadd + ' for ' + alphabet[toadd.toUpperCase()]);
                    } else {
                        this.speak(toadd);
                    }
                    this.zone.run(() => { 
                        this.plateNumber += toadd.toUpperCase();
                    });
                    if (this.plateNumber.length === 6) {
                        this.speak("Plate number is " + this.plateNumber + ''); // Say send to submit
                    }
                    
                } 
            }
            
        }
        this.recognition.onspeechstart = () => {
            console.log('speech start');
        }
        this.recognition.onspeechend = () => {
            console.log('speech end');
            //recognition.stop();
        }
        this.recognition.onnomatch = (event) => {
            console.log('did not recognize speech');
        }
        this.recognition.onerror = (event) => {
            console.log('Error occurred in recognition: ' + event.error);
            if (event.error === "not-allowed" || event.error === "service-not-allowed") {
                this.hasMic = false;
                console.warn("cannot connect to mic - voice recognition stopped.")
            } 
        }
        this.recognition.onstart = (event) => {
            console.log('Recognition started');
        }
        this.recognition.onend = (event) => {
            console.log('Recognition ended');
            if (this.hasMic && this.plateNumber.length < 6) {
                this.recognition.start();
            } 
        }
        this.recognition.start();

    }

    public doAction(command) {
        switch (command){
            case 'back':
            case 'bach':
            case 'no':
                this.plateNumber = this.plateNumber.substring(0, this.plateNumber.length - 1);
                this.speak('back. Plate number is currently ' + this.plateNumber);
                break;
            case 'clear':
            case 'reset':
                this.plateNumber = "";
                this.speak('cleared');
                break;
            case 'end':
            case 'stop':
                break;
        }
    }

    public speak(s: string) {
        if (this.supportSpeak) {
            var msg = new SpeechSynthesisUtterance(s);
            window.speechSynthesis.speak(msg);
        }
    }

    public toggleLocation() {

        this.dataService.report.location.lat = null;
        this.dataService.report.location.lng = null;
        this.dataService.report.location.radius = null;

        if (this.currentPosition) {
            this.currentPosition.remove();
        }

        if (this.options.location) {
            console.log('Requesting location');
            this.geolocation.getCurrentPosition().then((resp) => {
                if (resp) {
                    console.log('Got first location', resp);

                    this.currentPosition = L.marker([resp.coords.latitude, resp.coords.longitude]);
                    this.currentPosition.addTo(this.map);

                    this.map.panTo(new L.LatLng(resp.coords.latitude, resp.coords.longitude));

                    this.dataService.report.location.lat = resp.coords.latitude;
                    this.dataService.report.location.lng = resp.coords.longitude;
                    this.dataService.report.location.radius = resp.coords.accuracy;
                }
            }).catch((error) => {
                console.log('Error getting location', error);
            });
        }

    }

    public toggleDirection() {

        if (this.options.direction) {
            this.count = 30;
            this.captured = false;

            console.log('start recording direction');
            this.counter$ = timer(0, 1000).pipe(
                take(this.count),
                map(() => --this.count)
            );

            const subscription = this.geolocation.watchPosition({ enableHighAccuracy: true, timeout: 5000 }).subscribe((resp) => {
                if (this.count === 30) {
                    this.counter$.subscribe();
                }

                if (resp) {
                    if (this.currentPosition && resp.coords.accuracy < this.dataService.report.location.radius) {
                        this.dataService.report.location.lat = resp.coords.latitude;
                        this.dataService.report.location.lng = resp.coords.longitude;
                        this.dataService.report.location.radius = resp.coords.accuracy;

                        if (this.map) {
                            this.currentPosition.remove();
                            this.currentPosition = L.marker([resp.coords.latitude, resp.coords.longitude]);
                            this.currentPosition.addTo(this.map);
                        }
                    }

                    if (this.map) {
                        const circleOptions = {
                            color: 'blue',
                            fillColor: 'blue',
                            fillOpacity: 0
                        }
                        L.circle([resp.coords.latitude, resp.coords.longitude], 1, circleOptions).addTo(this.map);
                    }

                    this.tempWaypoints.push({ 'lat': resp.coords.latitude, 'lng': resp.coords.longitude });

                    console.log('added to waypoints', this.count);

                    if (this.tempWaypoints.length >= 2) {
                        subscription.unsubscribe();
                        this.dataService.report.waypoints = this.options.opposite ? this.tempWaypoints.reverse() : this.tempWaypoints;
                        this.captured = true;
                    }
                }
            });
        }
    }

    public onPlateNumber() {
        if (this.plateNumber.length > 5) {
            this.dataService.report.vehicle.plate = this.plateNumber;
        }
    }

    public onPhotoChange($event): void {
        this.file = $event.target.files[0];
    }

    private resizeImage(file: File): Observable<File> {
        return this._ngxPicaService.resizeImage(file, 1200, 1200, { aspectRatio: { keepAspectRatio: true } });
    }

    private doUpload(file: File) {

        // The storage path
        // TODO add user in path
        this.path = `bad-driver/${new Date().getTime()}_${file.name}`;

        // Totally optional metadata
        const customMetadata = { app: 'bad-driver' };

        // The main task
        const task = this.storage.upload(this.path, file, { customMetadata })

        const fileRef = this.storage.ref(this.path);

     
        return task.snapshotChanges().pipe(
            last(),
            map(() => { return fileRef.getDownloadURL() } ) // TODO would be good to just return the string, not the observale
        );
    }

    public onMapReady(map: L.Map) {
        this.map = map;
        console.log('map ready', this.map);
        this.map.invalidateSize(false);
    }

    public startRecording() {

        this.dataService.report.report_time.date = new Date().toISOString();
        this.dataService.report.report_time.time = new Date().toISOString();
        this.dataService.report.report_time.timeType = 'precise';

        if (this.map) {
            this.toggleLocation();
            this.toggleDirection();
        }
    }

    ngAfterViewInit() {
        if (!this.initializing) {
            setTimeout(() => {
                this.startRecording();
            }, 2000);
            
        }
        this.cd.detectChanges();
    }

    ngAfterViewChecked() {
        this.map.invalidateSize(false);
        
    }

    public saveReport() {
        // create new report
        return this.reportService.add(this.dataService.report);
    }

    public next() {
        if (this.recognition) {
            this.recognition.stop();
        }

        this.loadingBar.start();

        if (this.file) {
            this.loadingBar.set(5);

            this.resizeImage(this.file).subscribe((imageResized: File) => {
                this.loadingBar.set(25);

                return this.doUpload(imageResized).subscribe((getUrl: Observable<string>) => {

                    return getUrl.subscribe((url) => {
                        this.dataService.report.photos.push({ url: url, path: this.path });
                        this.loadingBar.set(70);

                        this.saveReport().then(() => {
                            this.loadingBar.stop();
                            this.router.navigateByUrl('/thanks-quick');
                        })
                    })
                });

            });
        } else {
            // Thnaks. you'll have 2 weeks to complete and submit the report

            this.saveReport().then(() => {
                this.loadingBar.stop();
                this.router.navigateByUrl('/thanks-quick');
            })
        }

    }

}
