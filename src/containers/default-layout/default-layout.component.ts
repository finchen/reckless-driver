import { Component, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { Events, Platform, MenuController } from "@ionic/angular";
import { Storage } from '@ionic/storage';

@Component({
    selector: 'app-dashboard',
    templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent implements OnDestroy {
    loggedIn = false;

    pages: any[] = [
        { title: 'Home', route: '/home', icon: 'home' },
        { title: 'New Report', route: '/home', icon: 'document'  }, // TODO manage buy now
        { title: 'Quick Report', route: '/quick-report', icon: 'locate' },
        { title: 'My Reports', route: '/reports', icon: 'folder' },
        //{ title: 'My Account', route: '/' },
        { title: 'Live Map [coming soon]', route: '/', icon: 'map' },
        { title: 'Tutorial', route: '/tutorial', icon: 'school' },
        { title: 'About', route: '/about', icon: 'help' }
    ]

    public sidebarMinimized = true;
    private changes: MutationObserver;
    public element: HTMLElement = document.body;

    constructor(
        private router: Router,
        public auth: AuthService,
        private events: Events,
        private platform: Platform,
        public menu: MenuController,
        public storage: Storage) {

        this.changes = new MutationObserver((mutations) => {
            this.sidebarMinimized = document.body.classList.contains('sidebar-minimized');
        });

        this.changes.observe(<Element>this.element, {
            attributes: true,
            attributeFilter: ['class']
        });

        this.initializeApp();
    }

    ngOnInit() {
        this.checkLoginStatus();
        this.listenForLoginEvents();
    }


    checkLoginStatus() {
        this.auth.afAuth.authState
            .subscribe(
            user => {
                if (user) {
                    return this.updateLoggedInStatus(true);
                } else {
                    return this.updateLoggedInStatus(false);
                }
            },
            () => {
                console.log('Error when layout check login state ');
                return this.updateLoggedInStatus(false);
            }
            );
    }

    updateLoggedInStatus(loggedIn: boolean) {
        setTimeout(() => {
            this.loggedIn = loggedIn;
        }, 300);
    }

    listenForLoginEvents() {
        this.events.subscribe('user:login', () => {
            this.updateLoggedInStatus(true);
        });

        this.events.subscribe('user:signup', () => {
            this.updateLoggedInStatus(true);
        });

        this.events.subscribe('user:logout', () => {
            this.updateLoggedInStatus(false);
        });
    }

    goTo(route: string) {
        this.menu.close();
        if (route === '/tutorial') {
            return this.storage.set('ion_did_tutorial', false).then(() => {
                return this.router.navigateByUrl(route);
            });
        }
        
        return this.router.navigateByUrl(route);
    }

    logout() {
        this.auth.signOut().then(() => {
            this.menu.close();
            return this.router.navigateByUrl('/login');
        });
    }

    initializeApp() {
        this.platform.ready().then(() => {
            //this.statusBar.styleDefault();
            //this.splashScreen.hide();
        });
    }

    ngOnDestroy(): void {
        this.changes.disconnect();
    }
}
