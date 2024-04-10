function ResidentialProperties() {

  // Variables
  let dateSlider;

  // Displaying of visualisation name on menu bar
  this.name = 'Residential Properties (District 15) 2018-2023';

  // Every visualisation will have a unique ID
  this.id = 'residential-properties';

  // Property to indicate whether data has been loaded
  this.loaded = false;

  // Preload the data.
  this.preload = function () {
    var self = this;
    this.data = loadTable(
      './data/residential-properties/ResidentialTransaction2023.csv',
      'csv',
      'header',
      // Callback function to set the value this.loaded to true.
      function (table) {
        self.loaded = true;
      }
    );
  };

  this.setup = function () {
    // Date selector
    dateArray = this.filterDataSet('Date');
    dateArray.unshift('All Dates'); // Adds an 'All Dates' option to the selector
    dateSelector = createSelect();
    selectorProperties(dateSelector, dateArray, width + 130, 80);

    // property type selector
    propertyTypeArray = this.filterDataSet('Property_Type');
    propertyTypeArray.unshift('All Property Types'); // Adds an 'All Property Types' option to the selector
    propertyTypeSelector = createSelect();
    selectorProperties(propertyTypeSelector, propertyTypeArray, width + 130, 110);
  };

  this.destroy = function () {
    dateSelector.remove();
    propertyTypeSelector.remove();
  };

  this.draw = function () {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    // Draw title
    drawTitle(this.name, width / 2, 35);

    // Draw axis labels
    drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);

    // Draw axis
    drawAxis(this.layout);

    // Draw X axis breakdown
    this.drawXAxisBreakdown(this.layout)

    // Draw y axis breakdown
    this.drawYAxisBreakdown(this.layout)

    // Plot chart
    this.plotChart();

    // Draw legends
    this.drawLegends();
  };

  // Axis's labels
  this.xAxisLabel = 'Unit Price (PSF)';
  this.yAxisLabel = 'Area (SqFt)';

  // Layout object to store plot layout parameters and methods
  const marginSize = 35;

  this.layout = {
    marginSize: marginSize,
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize * 6,
    topMargin: marginSize * 2,
    bottomMargin: height - marginSize * 2,
    pad: 5,
    plotWidth: function () {
      return this.rightMargin - this.leftMargin;
    },
    plotHeight: function () {
      return this.bottomMargin - this.topMargin;
    },

    // Boolean property that can be toggled to enable or disable the background grid.
    grid: true,

    // The layout object includes a property to specify the number of axis tick labels to be drawn
    numXTickLabels: 10,
    numYTickLabels: 10,
  };

  this.plotChart = function () {
    // Variables to draw bubble object
    const date = this.data.getColumn('Date');
    const property = this.data.getColumn('Property_Type');
    const project = this.data.getColumn('Project_Name');
    const unitPrice = this.data.getColumn('Unit_Price');
    const area = this.data.getColumn('Area');
    const diameter = 15;
    const bubbles = [];

    // Variables to retrieve input from the selectors
    const dateSelected = dateSelector.value();
    const propertyTypeSelected = propertyTypeSelector.value(); // Get the selected property type

    // Calculate min and max unitPrice and area values
    let minunitPrice = Math.min(...unitPrice);
    let maxunitPrice = Math.max(...unitPrice);
    let minarea = Math.min(...area);
    let maxarea = Math.max(...area);

    // Iterating through each row of data to draw the bubble
    for (let i = 0; i < this.data.getRowCount(); i++) {
      let xCoor = map(
        unitPrice[i],
        minunitPrice,
        maxunitPrice,
        this.layout.leftMargin,
        this.layout.rightMargin
      );
      let yCoor = map(
        area[i],
        minarea,
        maxarea,
        this.layout.bottomMargin,
        this.layout.topMargin
      );

      // Creating a new bubble object for each row
      bubbles[i] = new Bubble(xCoor, yCoor, 10, date[i], property[i]);

      // Determine colour based on property
      determineColour(property[i]);

      // Variables to retrieve date and property data from bubble object
      let bubbledate = bubbles[i].date;
      let bubblePropertyType = bubbles[i].propertyType; // Add property type data 
      if (
        (dateSelected === 'All Dates' || bubbledate === dateSelected) &&
        (propertyTypeSelected === 'All Property Types' || propertyTypeSelected === bubblePropertyType) // Check property type filter
      ) {
        bubbles[i].draw(); // Draw the bubble first
        bubbles[i].displayInfo(project[i], unitPrice[i], area[i]); // Display the info text on top of the bubble
                
      }
    }
  };

    // Labelling of legends 
  this.drawLegends = function () {
    // Filter the raw data to get all unique property types
    const legend = this.filterDataSet('Property_Type');

    // Iterating through the legend array
    for (let i = 0; i < legend.length; i++) {
      // Determine colour based on legend
      determineColour(legend[i]);

      // Drawing the ellipse
      noStroke();
      ellipse(870, 150 + i * 20, 10);

      // Drawing the text
      fill(0);
      textSize(14);
      textAlign('left');
      text(legend[i], 880, 150 + i * 20);
    }
  };

  // Filter a data set and return all the unique elements to an array
  this.filterDataSet = function (input) {
    const rawDataSet = this.data.getColumn(input);
    const uniqueSet = new Set(rawDataSet);
    const array = [...uniqueSet];
    return array;
  };

  // Switch statement to determine bubble's color
  let determineColour = (input) => {
    switch (input) {
      case 'Terrace House':
        fill('#FFE119');
        break;
      case 'Detached House':
        fill('#9ABDDC');
        break;
      case 'Semi-Detached House':
        fill('#F58231');
        break;
      default:
        noFill(0);
        break;
    }
  };
  // Adding Tick intervals, Grid line to the x-axis
  this.drawXAxisBreakdown = function (layout) {
    const unitPriceColumn = this.data.getColumn('Unit_Price');
    const minUnitPrice = Math.min(...unitPriceColumn);
    const maxUnitPrice = Math.max(...unitPriceColumn);

    // Define the number of intervals
    const numIntervals = 10;

    // Calculate the interval size
    const intervalSize = (maxUnitPrice - minUnitPrice) / numIntervals;

    textSize(10);
    stroke(200);
    strokeWeight(1);

    // Draw axis tick labels and grid lines for each interval
    for (let i = 0; i <= numIntervals; i++) {
      const value = minUnitPrice + i * intervalSize;
      const x = map(value, minUnitPrice, maxUnitPrice, layout.leftMargin, layout.rightMargin);

      // Add tick label.
      text(value.toFixed(0), x, layout.bottomMargin + layout.marginSize / 2);

      if (layout.grid) {
        // Add grid line.
        stroke(200);
        line(x, layout.topMargin, x, layout.bottomMargin);
      }
    }
  };

  // Adding Tick intervals, Grid line to the y-axis
  this.drawYAxisBreakdown = function (layout) {
    const areaColumn = this.data.getColumn('Area'); 
    const minArea = Math.min(...areaColumn);
    const maxArea = Math.max(...areaColumn);

     // Define the number of intervals
    const numIntervals = 10;

    // Calculate the interval size
    const intervalSize = (maxArea - minArea) / numIntervals;

    textSize(10);
    stroke(200);
    strokeWeight(1);

    // Draw axis tick labels and grid lines for each interval
    for (let i = 0; i <= numIntervals; i++) {
      const value = minArea + i * intervalSize;
      const y = map(value, minArea, maxArea, layout.bottomMargin, layout.topMargin); 

      // Add tick label.
      text(value.toFixed(0), layout.leftMargin - layout.marginSize / 2, y);

      if (layout.grid) {
        // Add grid line.
        stroke(200);
        line(layout.leftMargin, y, layout.rightMargin, y);
      }
    }
  };
}