import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { PhoneNumber } from './phone-number.model';
import { WindowService } from '../../services/window.service';
import * as firebase from 'firebase/app';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-phone-login',
  templateUrl: './phone-login.page.html',
  styleUrls: ['./phone-login.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PhoneLoginPage implements OnInit, AfterViewInit {

    windowRef: any;

    user: any;

    phoneForm: FormGroup;
    errorMessage: string;

    constructor(private win: WindowService, public fb: FormBuilder ) { }

    ngOnInit() {
        this.phoneForm = this.fb.group({
            number: ['', Validators.compose([Validators.required/*, Validators.pattern('^02[\d| ]*$')*/])],
            verification: ['', Validators.compose([Validators.required])]
        });

        
    }

    ngAfterViewInit() {
        this.windowRef = this.win.windowRef
        this.windowRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container')

        this.windowRef.recaptchaVerifier.render()
    }

    get phoneNumber() { return this.phoneForm.get('number') }
    get verification() { return this.phoneForm.get('verification') }

    sendLoginCode() {

        const appVerifier = this.windowRef.recaptchaVerifier;

        let num = this.phoneNumber.value;

        if (num.indexOf('0') === 0) {
            // remove first 0
            num = num.slice(1, num.length);
        }

        console.log('signInWithPhoneNumber', '+64' + num);

        firebase.auth().signInWithPhoneNumber('+64' + num, appVerifier)
            .then(result => {
                this.windowRef.confirmationResult = result;

            })
            .catch(error => console.log(error));

    }

    verifyLoginCode() {
        this.windowRef.confirmationResult
            .confirm(this.verification.value)
            .then(result => {

                this.user = result.user;
               
            })
            .catch(error => this.errorMessage = error.message);
    }

}
