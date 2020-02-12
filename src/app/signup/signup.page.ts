import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SignupPage implements OnInit {

    signupForm: FormGroup;
    errorMessage: string;

    constructor(public router: Router, public fb: FormBuilder, public auth: AuthService) { }

    ngOnInit() {

        // First Step
        this.signupForm = this.fb.group({
            'email': ['', [
                Validators.required,
                Validators.email
            ]
            ],
            'password': ['', [
                //Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
                Validators.minLength(6),
                Validators.maxLength(25),
                Validators.required
            ]
            ],
        });

    }

    // Using getters will make your code look pretty
    get email() { return this.signupForm.get('email') }
    get password() { return this.signupForm.get('password') }

    signup() {
        return this.auth.signUp(this.email.value, this.password.value).then(() => {
            this.router.navigateByUrl('/home');
        }).catch(e => {
            this.errorMessage = e.message;
        })
    }

}
