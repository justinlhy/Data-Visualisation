class BarFactory {

    // Constructing 20 bars with no values
    constructor() {
        this.bars = [];

        for (let i = 0; i < 20; i++) {
            let bar = new Bar();
            this.bars.push(bar)
        }
    }

    // Retriving the empty bars 
    getBar(xCoor, yCoor, width, height, name) {
        let bar;

        if (this.bars.length != 0) {
            bar = this.bars.pop();
            bar.setValue(xCoor, yCoor, width, height, name);
        } else {
            bar = new Bar()
            bar.setValue(xCoor, yCoor, width, height, name);
        }

        return bar;
    }

    returnBars(barsToReturn) {
        for (let i = 0; i < barsToReturn.length; i++) {
            this.bars.push(barsToReturn[i]);
        }
    }
}