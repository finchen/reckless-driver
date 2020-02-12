export interface ReportType {
    key: string;
    label: string;
    comment: string;
}

export interface Report {
    types?: Array<ReportType>;
    photos: Array<Photo>;
    vehicle?: Vehicle;

    report_time?: {
        date?: string; // ISO 8601 datetime format
        time?: string; // ISO 8601 datetime format 
        timeType?: string;
        precision?: number;
    }

    location: {
        radius?: number, // meters
        lat?: number,
        lng?: number,
        bbox?: string // 'southwest_lng,southwest_lat,northeast_lng,northeast_lat' format. 
    },
    waypoints: Array<{
        lat: number,
        lng: number
    }>,
    purchased?: boolean;
    locked?: boolean;

    user_uid?: string;
    created?: Date;
    id?: string;
}

export interface Photo {
    path: string;
    url: string;
}

export interface Vehicle {
    plate?: string;
    type?: string;
    make?: string;
    model?: string;
    color?: string;
    driver?: string;
    driver_age?: string;
    alpr?: boolean;
}
