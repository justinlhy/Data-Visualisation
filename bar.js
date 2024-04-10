class Bar {
    setValue(xCoor, yCoor, width, height, name) {
        this.xCoor = xCoor;
        this.yCoor = yCoor;
        this.width = width;
        this.height = height;
        this.name = name;
        this.hovered = false; // Property to track if the bar is being hovered over
    }

    draw() {
        // Draw the bar
        rect(this.xCoor, this.yCoor, this.width, this.height);

        // Check if the mouse is over the bar
        if (
            mouseX >= this.xCoor &&
            mouseX <= this.xCoor + this.width &&
            mouseY >= this.yCoor &&
            mouseY <= this.yCoor + this.height
        ) {
            this.hovered = true;
        } else {
            this.hovered = false;
        }

        // Display additional information when hovered
        this.displayInfo();
    }

    getName() {
        return this.name;
    }

    // Display additional information when hovered
    displayInfo(year, population, index) {
        if (this.hovered) {
            fill(0);
            textAlign('left');
            textSize(14);
            text(`Country: ${this.name}`, this.xCoor + 400, this.yCoor - 5 + index);
            text(`${population}`, this.xCoor + 400, this.yCoor + 10 + index);
        }
    }
}
