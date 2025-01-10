let mic;
let letters = [];
let textContent = "SINFONIETTA";
const frameRateValue = 25;

let prevWeights = [];
const transitionSpeed = 0.05;
let gui;
let config = {
  textContent: textContent,
  letterSpacing: -20,
  showLetterBounds: true
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  userStartAudio();       
  mic = new p5.AudioIn(); 
  mic.start();            

  gui = new dat.GUI();
  gui.add(config, 'textContent').name('TEXT').onChange(updateTextContent);
  gui.add(config, 'letterSpacing', -200, 200).name('SPACING').onChange(positionLetters);
  gui.add(config, 'showLetterBounds').name('BORDERS');

  for (let i = 0; i < textContent.length; i++) {
    let letter = createSpan(textContent[i]);
    letter.class('letter');
    letter.style('font-size', '300px');
    letters.push(letter);
    prevWeights.push(1);
  }

  setTimeout(positionLetters, 100);
  frameRate(frameRateValue);
}

function draw() {
  background(0);
  let vol = mic.getLevel();

  letters.forEach((letter, index) => {
    let desiredWeight = map(vol, 0, 0.005, 1, 1000) * noise(index + frameCount * 0.1);
    let currentWeight = lerp(prevWeights[index], desiredWeight, transitionSpeed);
    letter.style("font-variation-settings", `'wght' ${currentWeight}`);
    prevWeights[index] = currentWeight;
  });

  if (config.showLetterBounds) {
    noFill();
    stroke(0, 255, 0);
    letters.forEach(letter => {
      let bbox = letter.elt.getBoundingClientRect();
      rect(bbox.left - window.scrollX, bbox.top - window.scrollY, bbox.width, bbox.height);
    });
  }

  fill(255);
  noStroke();
  textSize(24);
  let volMapped = map(vol, 0.000, 0.007, 0, 1);
  text('Microphone Level: ' + nf(volMapped, 1, 3), 10, 30);
}

function positionLetters() {
  let totalWidth = letters.reduce((sum, letter) => sum + letter.elt.getBoundingClientRect().width, 0) + config.letterSpacing * (letters.length - 1);
  let startX = (windowWidth - totalWidth) / 2;
  let y = windowHeight / 2 - letters[0].elt.getBoundingClientRect().height / 2;

  letters.forEach((letter, index) => {
    let width = letter.elt.getBoundingClientRect().width;
    letter.position(startX, y);
    startX += width + config.letterSpacing;
  });
}

function updateTextContent() {
  letters.forEach(letter => letter.remove());
  letters = [];
  prevWeights = [];

  for (let i = 0; i < config.textContent.length; i++) {
    let letter = createSpan(config.textContent[i]);
    letter.class('letter');
    letter.style('font-size', '300px');
    letters.push(letter);
    prevWeights.push(1);
  }

  setTimeout(positionLetters, 100);
}
