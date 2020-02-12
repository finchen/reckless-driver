export namespace OpenAlprResponse {

    export interface ProcessingTime {
        total: number;
        plates: number;
        vehicles: number;
    }

    export interface VehicleRegion {
        y: number;
        x: number;
        height: number;
        width: number;
    }

    export interface Candidate {
        matches_template: number;
        plate: string;
        confidence: number;
    }

    export interface Coordinate {
        y: number;
        x: number;
    }

    export interface Orientation {
        confidence: number;
        name: string;
    }

    export interface Color {
        confidence: number;
        name: string;
    }

    export interface Make {
        confidence: number;
        name: string;
    }

    export interface BodyType {
        confidence: number;
        name: string;
    }

    export interface Year {
        confidence: number;
        name: string;
    }

    export interface MakeModel {
        confidence: number;
        name: string;
    }

    export interface Vehicle {
        orientation?: Orientation[];
        color: Color[];
        make: Make[];
        body_type: BodyType[];
        year?: Year[];
        make_model: MakeModel[];
    }

    export interface Result {
        plate?: string;
        confidence?: number;
        region_confidence?: number;
        vehicle_region?: VehicleRegion;
        region?: string;
        plate_index?: number;
        processing_time_ms?: number;
        candidates?: Candidate[];
        coordinates?: Coordinate[];
        vehicle?: Vehicle;
        matches_template?: number;
        requested_topn?: number;
    }

    export interface RegionsOfInterest {
        y: number;
        x: number;
        height: number;
        width: number;
    }

    export interface Root {
        uuid: string;
        data_type: string;
        epoch_time: number;
        processing_time: ProcessingTime;
        img_height: number;
        img_width: number;
        results: Result[];
        credits_monthly_used: number;
        version: number;
        credits_monthly_total: number;
        error: boolean;
        regions_of_interest: RegionsOfInterest[];
        credit_cost: number;
    }
}


