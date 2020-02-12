export class PhoneNumber {
  number: string;

  // format phone numbers as E.164
    get e164() {
        if (this.number.indexOf('0') === 0) {
            // remove first 0
            this.number.slice(1, this.number.length);
        }
        const num = '+64' + this.number;
        return `+${num}`
  }

}