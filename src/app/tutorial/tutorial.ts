import { Component, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { MenuController, IonSlides } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { OnInit, AfterViewInit } from "@angular/core";

@Component({
  selector: 'page-tutorial',
  templateUrl: './tutorial.html',
  styleUrls: ['./tutorial.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TutorialPage implements OnInit, AfterViewInit  {

    showSkip = true;
    ended = false;

    animateCss: string = 'animate';

    @ViewChild('slides') slides: IonSlides;

    img = {
        slide2: 'assets/img/map-report.webp',
        slide3: 'assets/img/reports.webp',
        slide4: 'assets/img/busted.webp',
        slide5: 'assets/img/reckless.webp'
    };

    constructor(
        public menu: MenuController,
        public router: Router,
        public storage: Storage
    ) { }

    ngAfterViewInit() {
        
    }

    startApp() {
        this.storage.set('ion_did_tutorial', true).then(() => {
            this.router
                .navigateByUrl('/home')
        })
    }

    onSlideChangeStart(event) {
        console.log(event);
        event.target.isEnd().then(isEnd => {
            this.showSkip = !isEnd;
            this.ended = isEnd;
        });
    }

    onSlideTransitionStart(event) {
        console.log('transition start');
        this.animateCss = '';
    }

    onSlideTransitionEnd(event) {
        // trigger animation
        // TODO learn angular animation
        this.animateCss = 'animate';
    }

    ngOnInit() {
        
        this.storage.get('ion_did_tutorial').then(res => {
            if (res === true) {
                this.router.navigateByUrl('/home');
            }
        });

        this.menu.enable(false);
    }

    ionViewDidLeave() {
        // enable the root left menu when leaving the tutorial page
        this.menu.enable(true);
    }

    next() {
        if (this.ended) {
            this.storage.set('ion_did_tutorial', true);
            this.router.navigateByUrl('/home');
        }
        this.slides.slideNext();
    }

    prev() {
        this.slides.slidePrev();
    }
}
