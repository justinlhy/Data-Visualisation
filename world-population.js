function PopulationBarChart() {
    // Variables
    let barFactory;
    let bars;
    let yearSlider;
    let selectedYearText;

    // Displaying of visualisation name on menu bar
    this.name = 'Most Populated Countries 1970 - 2022';

    // Every visualisation will have a unique ID
    this.id = 'PopulationBarChart';

    // Property to indicate whether data has been loaded
    this.loaded = false;

    // Preload the data
    this.preload = function () {
        var self = this;
        this.data = loadTable(
            './data/world-population/world-population.csv',
            'csv',
            'header',
            function (table) {
                self.loaded = true;
            }
        );
    };

    // Create a slider with values based on available years
    const years = [
        '2022 Population',
        '2020 Population',
        '2015 Population',
        '2010 Population',
        '2000 Population',
        '1990 Population',
        '1980 Population',
        '1970 Population'
    ];

    this.setup = function () {
        // Initializing the bar factory and array to store all the bars
        barFactory = new BarFactory();
        bars = [];

        yearSlider = createSlider(1, years.length, 0);
        yearSlider.position(this.layout.leftMargin * 3.4, this.layout.bottomMargin + 80);

        // Create a text element to display the selected year
        selectedYearText = createP();
        selectedYearText.position(this.layout.rightMargin, this.layout.bottomMargin + 70);
        selectedYearText.style('font-size', '14px');


    };

    this.destroy = function () {
        barFactory.returnBars(bars);
        yearSlider.remove();
        selectedYearText.remove();
    };

    this.draw = function () {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        // Draw title
        drawTitle(this.name, width / 2, 35);

        // Draw axis
        drawAxis(this.layout);

        // Draw X axis breakdown
        this.drawXAxisBreakdown(this.layout)

        // Plot graph
        this.plotGraph();

        // Draw infographics
        this.drawInfographics();
    };

    // A layout object is used to store all the shared plot layout parameters and methods.
    const marginSize = 35;

    this.layout = {
        marginSize: marginSize,
        leftMargin: marginSize * 4,
        rightMargin: width - marginSize,
        topMargin: marginSize * 2,
        bottomMargin: height - marginSize * 3,
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

    this.plotGraph = function () {
        const barChart = [];
        const min = 0;
        const max = 100;
        const selectedYear = yearSlider.value();

        // Update the selected year text
        selectedYearText.html(`Selected Year: ${years[selectedYear - 1].split(' ')[0]}`);

        // Filter the data for the selected year
        const filteredData = this.data.getArray().map((row, index) => {
            return {
                country: row[0],
                population: parseFloat(row[selectedYear]),
            };
        });

        // Calculate the total world population for the selected year
        totalPopulationForYear = filteredData.reduce(
            (sum, country) => sum + country.population,
            0
        );

        // Sort the filtered object array from highest to lowest population
        sortedPopulationArray = sortArrayByValue(filteredData, 15);

        // Deconstruct the sorted object array into two arrays
        const sortedCountryArray = sortedPopulationArray.map((x) => x.country);
        const sortedPopulationPercentageArray = sortedPopulationArray.map(
            (x) => (x.population / totalPopulationForYear) * 100
        );

        // Iterate through the sorted array
        for (let i = sortedPopulationArray.length - 1; i >= 0; i--) {
            const xCoor = this.layout.leftMargin;
            const yCoor = this.layout.topMargin + 5;
            const height = 20;
            const country = sortedCountryArray[i];
            const populationPercentage = sortedPopulationPercentageArray[i];
            // Calculate the bar width based on the percentage
            const barWidth = (populationPercentage / 100) * this.layout.plotWidth();


            // Properties for the bar chart
            noStroke();

            // Creating and drawing the bar object
            fill('#74AFFF');
            barChart[i] = barFactory.getBar(
                xCoor,
                yCoor + i * 25,
                barWidth,
                height,
                country
            );
            barChart[i].draw();
            bars.push(barChart[i]);

            // Writing the name of each bar
            textSize(12);
            fill(0);
            textAlign('right');
            text(
                country,
                this.layout.leftMargin - 10,
                this.layout.topMargin * 1.25 + i * 25
            );

            // Writing the population percentage of each bar
            textAlign('left');
            text(
                populationPercentage.toFixed(2) + '%',
                this.layout.leftMargin + barWidth + 20,
                this.layout.topMargin * 1.25 + i * 25
            );

            barChart[i].displayInfo(
                years[selectedYear - 1].split(' ')[0],
                'Population: ' + filteredData[i].population,
                i // Pass the index of the bar
            );
        }
    };


    // Function to draw infographics
    this.drawInfographics = function () {
        // Square box
        fill('#74AFFF');
        rect(this.layout.leftMargin, this.layout.bottomMargin + 30, 20, 20);

        // Text properties
        fill(0);
        textSize(14);
        textAlign('left');

        // Infographic text
        text(
            'Percentage of World Population',
            this.layout.leftMargin + 30,
            this.layout.bottomMargin + 40
        );

        // Slider text
        text('2022', this.layout.leftMargin, this.layout.bottomMargin + 80);
        text('1970', this.layout.leftMargin * 2.35, this.layout.bottomMargin + 80);
    };

    // Sorts an array from the highest to lowest value
    const sortArrayByValue = (arr, n) => {
        if (n > arr.length) {
            return false;
        }
        return arr
            .slice()
            .sort((a, b) => b.population - a.population)
            .slice(0, n);
    };

    // Function to draw the X axis breakdown
    this.drawXAxisBreakdown = function (layout) {
        const min = 0;
        const max = 100;
        const range = max - min;
        const xTickStep = range / layout.numXTickLabels;

        textSize(14);
        stroke(200);
        strokeWeight(1);

        // Draw all axis tick labels and grid lines.
        for (i = 0; i <= layout.numXTickLabels; i++) {
            var value = min + (i * xTickStep);
            var x = map(value, min, max, layout.leftMargin, layout.rightMargin);

            // Add tick label.
            text(value.toFixed(0) + '%', x, layout.bottomMargin + layout.marginSize / 2);

            if (layout.grid) {
                // Add grid line.
                stroke(200);
                line(x, layout.topMargin, x, layout.bottomMargin);
            }
        }
    }
}