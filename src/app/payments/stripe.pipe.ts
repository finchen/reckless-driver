import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'stripe'
})
export class StripePipe implements PipeTransform {

    transform(value: number): string {
        if (!value) { return "$0.00" }

        return `$${(value / 100).toFixed(2)}`;
    }

}
