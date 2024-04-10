// --------------------------------------------------------------------
// Additional helper functions.
// --------------------------------------------------------------------
function drawTitle(title, xCoor, yCoor) {
  noStroke();
  fill(0);
  textSize(20);
  textAlign('center', 'center');
  text(title, xCoor, yCoor);
}

// Generating options for a selector with an array
let selectorProperties = (selector, array, xCoor, yCoor) => {
  selector.position(xCoor, yCoor);

  for (elt of array) {
    selector.option(elt);
  }
}

// Summation of all values in two arrays and returning a new array
function sumArrays(array1, array2) {
  var sum = array1.map((num, idx) => {
    return num + array2[idx];
  });
  return sum;
}

// Calulate mean of all values in an array and returning the array
let calculateMean = (array) => {
  return array.reduce((acc, curr) => { return acc + curr }, 0) / array.length;
}

// Calculate standard deviation of values in array
let calculateStandardDeviation = (array) => {
  let mean = calculateMean(array);

  // Square each value in the array
  array = array.map((k) => { return (k - mean) ** 2 })

  // Calculating the sum of updated array
  let sum = array.reduce((acc, curr) => acc + curr, 0);

  // Returning the standered deviation
  return Math.sqrt(sum / array.length)
}

// --------------------------------------------------------------------
// Data processing helper functions.
// --------------------------------------------------------------------
function sum(data) {
  var total = 0;

  // Ensure that data contains numbers and not strings.
  data = stringsToNumbers(data);

  for (let i = 0; i < data.length; i++) {
    total = total + data[i];
  }

  return total;
}

function mean(data) {
  var total = sum(data);

  return total / data.length;
}

function sliceRowNumbers(row, start = 0, end) {
  var rowData = [];

  if (!end) {
    // Parse all values until the end of the row.
    end = row.arr.length;
  }

  for (i = start; i < end; i++) {
    rowData.push(row.getNum(i));
  }

  return rowData;
}

function stringsToNumbers(array) {
  return array.map(Number);
}

// --------------------------------------------------------------------
// Plotting helper functions
// --------------------------------------------------------------------
function drawAxis(layout, colour = 0) {
  // noStroke();
  stroke(0);
  strokeWeight(2);
  stroke(color(colour));

  // x-axis
  line(
    layout.leftMargin,
    layout.bottomMargin,
    layout.rightMargin,
    layout.bottomMargin
  );

  // y-axis
  line(
    layout.leftMargin,
    layout.topMargin,
    layout.leftMargin,
    layout.bottomMargin
  );
}

function drawAxisLabels(xLabel, yLabel, layout) {
  fill(0);
  noStroke();
  textSize(12);
  textAlign('center', 'center');

  // Draw x-axis label.
  text(
    xLabel,
    (layout.plotWidth() / 2) + layout.leftMargin,
    layout.bottomMargin + (layout.marginSize * 1.5)
  );

  // Draw y-axis label.
  push();
  translate(
    layout.leftMargin - (layout.marginSize * 1.5),
    layout.bottomMargin / 2
  );
  rotate(- PI / 2);
  text(yLabel, 0, 0);
  pop();
}

function drawYAxisTickLabels(min, max, layout, mapFunction, decimalPlaces) {
  // Map function must be passed with .bind(this).
  var range = max - min;
  var yTickStep = range / layout.numYTickLabels;

  fill(0);
  noStroke();
  textSize(12);
  textAlign('right', 'center');

  // Draw all axis tick labels and grid lines.
  for (i = 0; i <= layout.numYTickLabels; i++) {
    var value = min + (i * yTickStep);
    var y = mapFunction(value);

    // Add tick label.
    text(
      value.toFixed(decimalPlaces),
      layout.leftMargin - layout.pad,
      y
    );

    if (layout.grid) {
      // Add grid line.
      stroke(200);
      line(layout.leftMargin, y, layout.rightMargin, y);
    }
  }
}

function drawXAxisTickLabel(value, layout, mapFunction) {
  // Map function must be passed with .bind(this).
  var x = mapFunction(value);

  fill(0);
  noStroke();
  textSize(12);
  textAlign('center', 'center');

  // Add tick label.
  text(
    value,
    x,
    layout.bottomMargin + layout.marginSize / 2
  );

  if (layout.grid) {
    // Add grid line.
    stroke(220);
    line(
      x,
      layout.topMargin,
      x,
      layout.bottomMargin
    );
  }
}
