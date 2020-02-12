import { Injectable } from '@angular/core';

@Injectable()
export class ConfigService {

}

export const firebaseConfig = {
    fire: {
        apiKey: "",
        authDomain: "",
        databaseURL: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: ""
    }
};
