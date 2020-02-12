import { Component, OnInit, Input } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask, AngularFireStorageReference } from 'angularfire2/storage';
import { AngularFirestore } from 'angularfire2/firestore';
import { tap, finalize, map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NgxPicaService, NgxPicaErrorInterface } from '@digitalascetic/ngx-pica';
import { HttpClient } from "@angular/common/http";
import { HttpHeaders } from "@angular/common/http";
import { HttpErrorResponse } from "@angular/common/http";
import { HttpParams } from "@angular/common/http";
import { OpenAlprResponse } from "../../models/OpenAlprResponse";
import * as exif from "exif-js"
import { DataService } from "../../services/data.service";
import { Report } from "../../models/report.model";
import { ReportService } from "../../services/report.service";
import { LoadingController } from "@ionic/angular";

@Component({
    selector: 'file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {

    @Input() report: Report;

    // Main task 
    task: AngularFireUploadTask;

    // Progress monitoring
    percentage: Observable<number>;

    snapshot: Observable<any>;
    downloadURL: Observable<string>;
    fileRef: AngularFireStorageReference;

    // State for dropzone CSS toggling
    isHovering: boolean;
    isUploading: boolean;

    status = {
        resize: {
            label: 'File Resizing',
            labelCompleted: 'File Resized',
            completed: false
        },
        upload: {
            label: 'File Uploading',
            labelCompleted: 'File Uploaded',
            completed: false
        },
        plate: {
            label: 'Plate Recognition',
            labelCompleted: 'Plate Recognition',
            completed: false,
            found: false
        }
    }
    vehicles: Array<OpenAlprResponse.Result> = [];

    cameraSupport = 'mediaDevices' in navigator;

    constructor(private storage: AngularFireStorage,
        private db: AngularFirestore,
        private _ngxPicaService: NgxPicaService,
        private http: HttpClient,
        private reportService: ReportService,
        private loadingController: LoadingController,
        private dataService: DataService) {

        console.log('Camera support: ', this.cameraSupport);
    }


    toggleHover(event: boolean) {
        this.isHovering = event;
    }

    async startUpload(event: FileList) {

        // The File object
        let file: File = null;
        let promises: Array<Promise<any>> = [];
        this.isUploading = true;

        for (let i = 0; i < event.length; i++) {

            file = event[i];

            this.status.resize.completed = false;
            this.status.plate.completed = false;
            this.status.upload.completed = false;

            if (!file) {
                console.error('no file :( ')
                continue;
            }

            // Mime type
            if (file.type.split('/')[0] !== 'image' && file.type.split('/')[0] !== 'video') {
                // TODO error pop up
                console.error('unsupported file type :( ')
                continue;
            }

            if (file.type.split('/')[0] === 'image') {

                this._ngxPicaService.resizeImage(file, 1200, 1200, { aspectRatio: { keepAspectRatio: true } })
                    .subscribe((imageResized: File) => {
                        console.log('Image resized');
                        this.status.resize.completed = true;

                        return this.doUpload(imageResized).then(() => {
                            console.log('Uploaded');
                            this.status.upload.completed = true;
                            return imageResized;
                        }).then((imageResized) => {
                            console.log('Start plate recognition');
                            return this.recognizePlate(imageResized)
                        }).then(() => {
                            this.status.plate.completed = true;
                            //this.isUploading = false;
                        });
                        
                        //this.analyzeMetadata(file);
                        // }

                    }, (err: NgxPicaErrorInterface) => {
                        throw err.err;
                    });
            } else if (file.type.split('/')[0] === 'video') {
                // check video size
                if (file.size > 20 * 1024 * 1024) {
                    console.error('file too big');
                    alert('Video too big. We are working to increase the max size of the video');
                    continue;
                }
                promises[promises.length] = this.doUpload(file).then(() => {
                    console.log('Uploaded');

                    this.status.resize.completed = true;
                    this.status.plate.completed = true;
                    this.status.upload.completed = true;
                });
            }
        }

    }

    analyzeMetadata(file: File | any) {
        let currentReport = this;

        exif.getData(file,  function() {
            //var allMetaData = exif.getAllTags(this);
            // DateTimeOriginal "2008:10:22 16:28:39"
            // GPSLatitude, GPSLongitude

            var exifDate = exif.getTag(this, "DateTimeOriginal");
            

            var exifLong = exif.getTag(this, "GPSLongitude");
            var exifLongRef = exif.getTag(this, "GPSLongitudeRef");
            var exifLat = exif.getTag(this, "GPSLatitude");
            var exifLatRef = exif.getTag(this, "GPSLatitudeRef");
            var latitude: number
            var longitude: number;

            if (exifLong && exifLat) {
                if (exifLatRef == "S") {
                    latitude = (exifLat[0] * -1) + (((exifLat[1] * -60) + (exifLat[2] * -1)) / 3600);
                } else {
                    latitude = exifLat[0] + (((exifLat[1] * 60) + exifLat[2]) / 3600);
                }

                console.log(latitude);

                if (exifLongRef == "W") {
                    longitude = (exifLong[0] * -1) + (((exifLong[1] * -60) + (exifLong[2] * -1)) / 3600);
                } else {
                    longitude = exifLong[0] + (((exifLong[1] * 60) + exifLong[2]) / 3600);
                }
                console.log(longitude);

                //mythis.dataServiceService.report.
            }

        });
    }

    doUpload(file: File): Promise<any> {

        // The storage path
        // TODO add user in path
        const path = `bad-driver/${new Date().getTime()}_${file.name}`;
        
        // Totally optional metadata
        const customMetadata = { app: 'bad-driver' };

        // The main task
        this.task = this.storage.upload(path, file, { customMetadata })

        this.fileRef = this.storage.ref(path);

        // Progress monitoring
        this.percentage = this.task.percentageChanges();

        this.snapshot = this.task.snapshotChanges().pipe(
            // The file's download URL
            finalize(() => {
                this.fileRef.getDownloadURL().subscribe((url) => {
                    this.report.photos.push({ url: url, path: path });
                });
            }),
            tap((snap: any) => {
                console.log(snap);
                if (snap.bytesTransferred === snap.totalBytes) {
                    console.log('Upload completed');
                }
            })
        );

        return this.snapshot.toPromise();
    }

    getBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                let base64: any = reader.result;
                let encoded = base64.replace(/^data:(.*;base64,)?/, '');
                if ((encoded.length % 4) > 0) {
                    encoded += '='.repeat(4 - (encoded.length % 4));
                }
                resolve(encoded);
            };
            reader.onerror = error => reject(error);
        });
    }

    recognizePlate(file: File) {

        return this.getBase64(file).then(base64 => {
            let url = `https://api.openalpr.com/v2/recognize_bytes?recognize_vehicle=1&country=nz&secret_key=sk_cc272d4eb7c5ef943e4864e0`;
            let params = new HttpParams();

            const httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                }),
                params: params,
            };

            return this.http.post<OpenAlprResponse.Root>(url, base64, httpOptions).toPromise().then((response: OpenAlprResponse.Root) => {
                console.log('OpenAlprResponse');
                if (response.results.length === 0) {
                    /// nothing found
                    return this.vehicles;
                }

                if (this.vehicles.length >= 1 && this.vehicles[0].confidence >= response.results[0].confidence) {
                    // already detected and not better
                    return this.vehicles;
                }

                // first detection

                this.vehicles = response.results;

                if (response.results.length === 1) {
                    const result = response.results[0];
                    this.selectVehicle(result);
                }
                return this.vehicles;
            });
        });
    }

    selectVehicle(vh: OpenAlprResponse.Result) {
        this.dataService.setVehicleFromAlpr(vh);
    }

    /*getVehicleInfo(vehicle: OpenAlprResponse.Vehicle) {
        console.log(vehicle);
        const make = vehicle.make.shift();
        const model = vehicle.make_model.shift();
        const color = vehicle.color.shift();

        return (vehicle.make.length ? make.name : 'unknown model') + ' - ' + (vehicle.make_model.length ? model.name : ' unknow model') + ' (' + (vehicle.color.length ? color.name : 'unknow color') + ')';
    }*/

    // Determines if the upload task is active
    isActive(snapshot) {
        return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes
    }

    deleteImage(photo, pos) {
        // TODO delete on firebase as well
        this.report.photos.splice(pos, 1);

        if (this.report.photos.length === 0) {
            this.vehicles = [];
            this.isUploading = false;
        }
    }


}
