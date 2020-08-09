export class Counter {
    constructor() {
        this.i = 0;
    }

    countUpIfLessThan(n) {
        if (this.i < n) this.i ++;
    }

    resetIfHigherThanAndExecute(n, f, ...args) {
        if (this.i >= n) {
            f(...args);
            this.i = 0;
        }
    }
}