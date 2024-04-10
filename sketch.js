var gallery;

function setup() {
  // Create a canvas to fill the content div from index.html.
  canvasContainer = select('#app');
  var c = createCanvas(1024, 576);
  c.parent('app');

  // Create a new gallery object.
  gallery = new Gallery();

  // Add the visualisation objects here.
  gallery.addVisual(new TechDiversityRace());
  gallery.addVisual(new TechDiversityGender());
  gallery.addVisual(new PayGapByJob2017());
  gallery.addVisual(new PayGapTimeSeries());
  gallery.addVisual(new ClimateChange());
  gallery.addVisual(new ResidentialProperties());
  gallery.addVisual(new MicrosoftStockAnalysis());
  gallery.addVisual(new PopulationBarChart());
}

function draw() {
  background(255);
  if (gallery.selectedVisual != null) {
    gallery.selectedVisual.draw();
  }
}

function mouseClicked() {
  if (gallery.selectedVisual.hasOwnProperty("mouseClicked")) {
    gallery.selectedVisual.mouseClicked();
  }
}
