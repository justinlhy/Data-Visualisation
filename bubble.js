class Bubble {
    constructor(xCoor, yCoor, diameter, date, propertyType) {
        this.xCoor = xCoor;
        this.yCoor = yCoor;
        this.diameter = diameter;
        this.date = date;
        this.propertyType = propertyType;
    }

    draw() {
        noStroke();
        ellipse(this.xCoor, this.yCoor, this.diameter);
    }

    displayInfo(project, unitPrice, area) {
        // Calculate the distance
        let d = dist(mouseX, mouseY, this.xCoor, this.yCoor);
      
        // Check if the mouse is within the range of the bubble
        if (d < this.diameter / 2.8) {
          fill(0);
          noStroke();
          textSize(14);
          textAlign('center');
          text('Project Name: ' + project, mouseX - 20, mouseY - 60);
          text('Unit Price: $ ' + unitPrice, mouseX - 20, mouseY - 40);
          text('Area: ' + area + ' Sqft', mouseX - 20, mouseY - 20);
        }
      }      
}