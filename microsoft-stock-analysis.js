function MicrosoftStockAnalysis() {


  this.name = 'Microsoft Stock Analysis 2020 - 2022';
  this.id = 'MicrosoftStockAnalysis';

  this.zoomSlider;

  // Property to indicate whether data has been loaded.
  this.loaded = false;

  // Zoom level for the candlestick chart
  this.zoomLevel = 1.0;
  this.minZoomLevel = 0.5;
  this.maxZoomLevel = 10;

  // Preload the data. 
  this.preload = function () {
    var self = this;
    this.data = loadTable(
      './data/microsoft-stocks/microsoft-stocks.csv', 'csv', 'header',
      // Callback function to set the value this.loaded to true
      function (table) {
        self.loaded = true;

        // Setting min and max dates 
        minDate = min(table.getColumn('Date'));
        maxDate = max(table.getColumn('Date'));
      }
    )
  }


  this.setup = function () {
    // Set start and end days
    this.startDay = this.data.getNum(0, 'Day');
    this.endDay = this.data.getNum(this.data.getRowCount() - 1, 'Day');

    // Find lowest and highest price to map canvas height
    this.lowestPrice = floor(min(this.data.getColumn('Close')));
    this.highestPrice = floor(max(this.data.getColumn('Close')));

    // Find mean price to plot the average marker
    this.meanPrice = floor(mean(this.data.getColumn('Close')));

    // Create sliders to control the start and end days.
    this.startDaySlider = createSlider(
      this.startDay,
      this.endDay - 320,
      this.startDay,
      1
    );
    this.startDaySlider.position(350, 600);

    this.endDaySlider = createSlider(
      this.startDay + 320,
      this.endDay,
      this.endDay,
      1
    );
    this.endDaySlider.position(550, 600);
  };


  this.destroy = function () {
    this.startDaySlider.remove();
    this.endDaySlider.remove();
  };

  this.draw = function () {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    // Prevent slider ranges from overlapping.
    if (this.startDaySlider.value() >= this.endDaySlider.value()) {
      this.startDaySlider.value(this.endDaySlider.value() - 1);
    }
    this.startDay = this.startDaySlider.value();
    this.endDay = this.endDaySlider.value();


    // Draw title
    drawTitle(this.name, width / 2, 35);

    // Draw axis labels
    drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);

    // Draw candlestick chart (draw this first)
    this.plotCandlestickChart();

    // Draw stock label
    this.stockLabel();

    // Plot line graph
    this.plotLineGraph();

    // Draw bollinger Band
    this.plotBollingerBand();

    // Draw axis (draw before the y-axis tick labels)
    drawAxis(this.layout);

    // Draw all y-axis tick labels (draw  last to avoid overlapping the y-axis)
    drawYAxisTickLabels(this.lowestPrice, this.highestPrice, this.layout, this.mapPriceToHeight.bind(this), 1);

  }


  // Axis's labels
  this.xAxisLabel = 'Day';
  this.yAxisLabel = 'Price';

  // Layout object 
  const marginSize = 35;

  this.layout = {
    marginSize: marginSize,
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: marginSize * 2,
    bottomMargin: height - marginSize * 8,
    pad: 5,
    plotWidth: function () {
      return this.rightMargin - this.leftMargin - 10;
    },
    plotHeight: function () {
      return this.bottomMargin - this.topMargin;
    },

    // Boolean to enable/disable background grid.
    grid: false,

    // Determine the optimal number of axis tick labels to be drawn to avoid overlapping.
    numYTickLabels: 8,
  };

  this.plotCandlestickChart = function () {
    // Iterate through all rows, plotting only the ones within a specified range
    for (var i = 0; i < this.data.getRowCount(); i++) {
      // Instantiate an object to store data specific to the current day.
      let current = {
        'day': this.data.getNum(i, 'Day'),
        'openingPrice': this.data.getNum(i, 'Open'),
        'closingPrice': this.data.getNum(i, 'Close'),
        'volume': this.data.getNum(i, 'Volume'),
        'intradayHigh': this.data.getNum(i, 'High'),
        'intradayLow': this.data.getNum(i, 'Low'),
        'date': this.data.getString(i, 'Date')
      };
  
      // Calculate candle dimensions and positions
      let x = this.mapDayToWidth(current.day);
      let candleWidth = this.layout.plotWidth() / this.data.getRowCount();
      let yHigh = this.mapPriceToHeight(current.intradayHigh);
      let yLow = this.mapPriceToHeight(current.intradayLow);
      let yOpen = this.mapPriceToHeight(current.openingPrice);
      let yClose = this.mapPriceToHeight(current.closingPrice);
  
      // Set the color of the candlestick based on the closing price
      let color = current.closingPrice >= current.openingPrice ? 'green' : 'red';
  
      // Only draw candlesticks that are to the right of the left margin
      if (x >= this.layout.leftMargin && x <= this.layout.rightMargin) {
        // Check if the candlestick is within the right margin
        if (x + candleWidth / 2 <= this.layout.rightMargin) {
          // Draw candlestick body
          stroke('black');
          strokeWeight(0.1);
          fill(color);
          rect(x - candleWidth / 2, yOpen, candleWidth, yClose - yOpen);
  
          // Draw candlestick wick
          line(x, yHigh, x, yLow);
  
          // Check if the mouse is over this candlestick
          if (
            mouseX > x - candleWidth / 2 &&
            mouseX < x + candleWidth / 2 &&
            mouseY > yLow &&
            mouseY < yHigh
          ) {
            this.showTooltip(mouseX, mouseY, current);
          }
        }
      }
    }
  }
  


  // Function to draw line graph
  this.plotLineGraph = function () {
    // Plot all price between this.startDay and this.endDay using (canvas's width - margin)
    let previous;
    let numDays = this.endDay - this.startDay;

    // Calculate the count of days plotted in each frame to achieve an animation effect.
    let dayCount = 0;

    // Iterate through all rows, plotting only those within the specified range.
    for (var i = 0; i < this.data.getRowCount(); i++) {

      // Instantiate an object to store data related to the current day.
      let current = {
        'day': this.data.getNum(i, 'Day'),
        'openingPrice': this.data.getNum(i, 'Open'),
        'closingPrice': this.data.getNum(i, 'Close'),
        'volume': this.data.getNum(i, 'Volume'),
        'intradayHigh': this.data.getNum(i, 'High'),
        'intradayLow': this.data.getNum(i, 'Low'),
        'date': this.data.getString(i, 'Date')
      };

      // Draw line to connect previous day to current day's price
      if (previous != null && current.day > this.startDay && current.day <= this.endDay) {
        // Drawing the line
        stroke('#4AA96C');
        strokeWeight(1.5);
        line(
          this.mapDayToWidth(previous.day),
          this.mapPriceToHeight(previous.closingPrice),
          this.mapDayToWidth(current.day),
          this.mapPriceToHeight(current.closingPrice)
        );

        // Check mouse position is within graph parameters
        if (
          mouseX > this.layout.leftMargin &&
          mouseX < this.layout.rightMargin &&
          mouseY > this.layout.topMargin &&
          mouseY < this.layout.bottomMargin
        ) {
          // Check if mouseX position is within a data point
          if (mouseX > this.mapDayToWidth(previous.day) && mouseX < this.mapDayToWidth(current.day)) {
            stroke(0);
            strokeWeight(1);

            // Drawing a vertical line based on mouseX position on the graph
            fill('#4AA96C');
            line(mouseX, this.layout.topMargin, mouseX, this.layout.bottomMargin);

            // Draw an ellipse when the vertical line is on the data point
            ellipse(this.mapDayToWidth(current.day), this.mapPriceToHeight(current.closingPrice), 8);

            // Display stock value of current data point
            this.stockValue(
              current.openingPrice,
              current.closingPrice,
              current.volume,
              current.intradayHigh,
              current.intradayLow,
              current.date,
            );
          }
        }

        // Number of x axis to skip so only numXTickLabels are drawn
        let xLabelSkip = ceil(numDays / this.layout.numXTickLabels);

        // Draw the tick label marking the start of the previous day
        if (dayCount % xLabelSkip == 0) {
          drawXAxisTickLabel(previous.day, this.layout, this.mapDayToWidth.bind(this));
        }

        // If six or few days are displyed, draw the final dat x tick label
        if (numDays <= 6 && dayCount == numDays - 1) {
          drawXAxisTickLabels(current.day, this.layout, this.mapDayToWidth.bind(this));
        }

        // Increment the day counter
        dayCount++;
      }

      // Assign current day to previous day so it is available as start position for the next iternation
      previous = current;
    }
  }

  // Function to draw bollinger band
  this.plotBollingerBand = function () {
    const typicalPriceArray = [];
    let previous;

    for (let i = 0; i < this.data.getRowCount(); i++) {
      let high = this.data.getNum(0 + i, "High");
      let low = this.data.getNum(0 + i, "Low");
      let close = this.data.getNum(0 + i, "Close");

      let typicalPrice = 0
      typicalPrice = (high + low + close) / 3

      typicalPriceArray.push(typicalPrice);
    }

    for (let i = 0; i < this.data.getRowCount(); i++) {
      let arr = typicalPriceArray.slice(i, i + 20);
      let a = calculateMean(arr);
      let b = calculateStandardDeviation(arr);

      let upperBound = a + b;
      let lowerBound = a - b;

      // Create an object to to store data for the current day
      let current = {
        'day': this.data.getNum(i, 'Day'),
        'upperBoundPrice': upperBound,
        'lowerBoundPrice': lowerBound
      };

      // Draw line to connect previous day to current day's price
      if (previous != null && current.day > this.startDay && current.day <= this.endDay) {
        stroke(255, 170, 76);
        strokeWeight(1);
        line(
          this.mapDayToWidth(previous.day),
          this.mapPriceToHeight(previous.upperBoundPrice),
          this.mapDayToWidth(current.day),
          this.mapPriceToHeight(current.upperBoundPrice)
        );
        stroke(57, 162, 219);
        strokeWeight(1);
        line(
          this.mapDayToWidth(previous.day),
          this.mapPriceToHeight(previous.lowerBoundPrice),
          this.mapDayToWidth(current.day),
          this.mapPriceToHeight(current.lowerBoundPrice)
        );
      }

      // Assign current day to previous day so it is available as start position for the next iternation
      previous = current;
    }
  }

  // Function to display stock label and slider label
  this.stockLabel = function () {
    fill(0);
    noStroke();
    textAlign('left');
    textSize(15);


    text("Day's Open", this.layout.leftMargin, this.layout.bottomMargin * 1.3);
    text("Closing Price", this.layout.leftMargin + 300, this.layout.bottomMargin * 1.3);
    text("Volume", this.layout.leftMargin + 600, this.layout.bottomMargin * 1.3);
    text("Intraday High", this.layout.leftMargin, this.layout.bottomMargin * 1.6);
    text("Intraday Low", this.layout.leftMargin + 300, this.layout.bottomMargin * 1.6);
    text("Date", this.layout.leftMargin + 600, this.layout.bottomMargin * 1.6);

    // Slider label
    text("End Date Zoom", 70, 570)
    text("Start Date Zoom", 270, 570)
  }

  // Function to display stock value
  this.stockValue = function (openingPrice, closingPrice, volume, intradayHigh, intradayLow, date) {
    fill(0);
    noStroke();
    textAlign('left');
    textSize(18);

    // Split the date string into day, month, and year components
    let dateComponents = date.split('/');
    if (dateComponents.length === 3) {
      // Extract day, month, and year
      let day = parseInt(dateComponents[0], 10);
      let month = parseInt(dateComponents[1], 10);
      let year = parseInt(dateComponents[2], 10);

      // Check if the date components are valid
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        // Create a new Date object with the correct format
        let formattedDate = ('0' + day).slice(-2) + '/' + ('0' + month).slice(-2) + '/' + year;

        fill(0, 128, 0);
        text(
          '$' + (openingPrice).toFixed(2),
          this.layout.leftMargin,
          this.layout.bottomMargin * 1.45
        );
        fill(128, 0, 0);
        text(
          '$' + (closingPrice).toFixed(2),
          this.layout.leftMargin + 300,
          this.layout.bottomMargin * 1.45
        );
        fill(0);
        text(
          (volume),
          this.layout.leftMargin + 600,
          this.layout.bottomMargin * 1.45
        );
        text(
          '$' + (intradayHigh).toFixed(2),
          this.layout.leftMargin,
          this.layout.bottomMargin * 1.75
        );
        text(
          '$' + (intradayLow).toFixed(2),
          this.layout.leftMargin + 300,
          this.layout.bottomMargin * 1.75
        );
        text(
          formattedDate,
          this.layout.leftMargin + 600,
          this.layout.bottomMargin * 1.75
        );

        return;
      }
    }

    // Display an error message if the date format is incorrect
    fill(255, 0, 0);
    text('Invalid Date', this.layout.leftMargin, this.layout.bottomMargin * 1.45);
  }

  // Function to map day to width
  this.mapDayToWidth = function (value) {
    let x = map(value, this.startDay, this.endDay, this.layout.leftMargin, this.layout.rightMargin);

    return map(value, this.startDay, this.endDay, this.layout.leftMargin, this.layout.rightMargin);
  }

  // Function to map price to height
  this.mapPriceToHeight = function (value) {
    return map(value, this.lowestPrice, this.highestPrice, this.layout.bottomMargin, this.layout.topMargin);
  }

  //  To check on console if mouseClicked function works
  this.mouseClicked = function () {
    console.log("mouse clicked in microsoft");
  }
}
