import {Injectable } from '@angular/core';
import { AngularFirestore, QueryFn, DocumentChangeAction } from 'angularfire2/firestore';
import { Report } from '../models/report.model';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import DocumentReference = firebase.firestore.DocumentReference;
import { AuthService } from "./auth.service";
import { take, map } from "rxjs/operators";

@Injectable()
export class ReportService {

    readonly path = 'reports';

    constructor(private afs: AngularFirestore, private authService: AuthService) { }

    add(data: Report): Promise<DocumentReference> {
        return this.afs.collection<Report>(this.path).add({ ...data, created: new Date(), user_uid: this.authService.uid });
    }

    remove(id: string): Promise<void> {
        return this.afs.doc<Report>(`${this.path}/${id}`).delete();
    }

    update(id: string, data: Partial<Report>): Promise<void> {
        return this.afs.doc<Report>(`${this.path}/${id}`).update(data);
    }

    get(id: string): Observable<Report> {
        const reportsDocument = this.afs.doc<Report>(`${this.path}/${id}`);
        return reportsDocument.snapshotChanges()
            .pipe(
                map( (changes: any) => {
                    const data = changes.payload.data();
                    const id = changes.payload.id;
                    return { id, ...data };
                }));
    }

    getCount(): Observable<any> {
        const counter = this.afs.doc<any>(`counters/reports`);
        return counter.valueChanges();
    }

    getCollection(uid: string): Observable<Report[]> {
        let ref = (ref) => {
            let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
            query = query.where('user_uid', '==', uid).orderBy('created', 'desc').limit(30);
            
            return query;
        };

        //return this.afs.collection<Report>(this.path, ref).valueChanges();
        const reportsCollection = this.afs.collection<Report>(this.path, ref);
        return reportsCollection.snapshotChanges().pipe(
            map( (actions: DocumentChangeAction<Report>[]) => actions.map(a => {
                const data = a.payload.doc.data() as Report;
                const id = a.payload.doc.id;
                return { id, ...data };
            }))
        );
        /*return reportsDocument.snapshotChanges().pipe(
            map((changes) => {
                changes.map(a => {
                    const data = a.payload.doc.data() as Report;
                    const id = a.payload.doc.id;
                    return { id, ...data };
                }))
            }));*/
    }

    /*getCollection$(ref?: QueryFn): Observable<Report[]> {
        return this.afs.collection<Report>(this.path, ref).snapshotChanges().pipe(map(action => {
            const data = action.payload.data() as Report;
            const id = action.payload.id;
            return { id, ...data };
        }));

        return this.afs.collection<Report>(this.path, ref)
            .snapshotChanges().map(actions => {
                return actions.map(a => {
                    const data = a.payload.doc.data() as Report;
                    const id = a.payload.doc.id;
                    return { id, ...data };
                });
            });
    }*/

}