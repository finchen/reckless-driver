// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
    production: false,
    sentry_dsn: 'https://9a3717c018ac4112b87689a7d15983d4@sentry.io/1430719',
    stripeKey: 'pk_test_Lt93JdbveqU8hH4KHVrt8oip00NVlZ01S3',
    opennodePay: 'https://dev-checkout.opennode.co/',
    googleAnalytics: {
        domain: 'auto',
        trackingId: 'UA-139694320-1' 
    }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
import 'zone.js/dist/zone-error';  // Included with Angular CLI.
