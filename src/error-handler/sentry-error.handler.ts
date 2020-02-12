/* Log Error */
import * as Sentry from "@sentry/browser";
import { Injectable, ErrorHandler } from "@angular/core";
import { environment } from "../environments/environment";

export class SentryErrorHandler implements ErrorHandler {
    constructor() { }
    handleError(error) {
        Sentry.captureException(error.originalError || error);
        throw error;
    }
}

export function errorHandlerFactory() {
    if (environment.production) {
        Sentry.init({
            dsn: environment.sentry_dsn
        });
        return new SentryErrorHandler();
    }
    return new ErrorHandler();
}
