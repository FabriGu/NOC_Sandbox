/**
 * Main sketch file for the Brainrot Physics Generator
 */

function setup() {
  createCanvas(config.width, config.height);
  colorMode(HSB, 360, 100, 100, 255);
  
  // Set up recorder
  recorder.setup();
  
  // Initialize all systems
  particleSystem = new ParticleSystem();
  attractorSystem = new AttractorSystem();
  forceSystem = new ForceSystem();
  constraintSystem = new ConstraintSystem();
  fractalSystem = new FractalSystem();
  effectsSystem = new EffectsSystem();
  
  // Initialize UI after all systems are created
  ui = new UI();
  
  // Set initial frame rate
  frameRate(config.frameRate);
}

function draw() {
  // Start with background/effects
  if (config.activeModules.effects) {
    effectsSystem.run();
  } else {
    background(
      config.backgroundColor[0],
      config.backgroundColor[1],
      config.backgroundColor[2],
      config.backgroundColor[3]
    );
  }
  
  // Draw fractals (behind particles)
  if (config.activeModules.fractals) {
    fractalSystem.update();
    fractalSystem.display();
  }
  
  // Run all active systems
  if (config.activeModules.forces) {
    forceSystem.run();
  }
  
  if (config.activeModules.attractors) {
    attractorSystem.run();
  }
  
  if (config.activeModules.particles) {
    particleSystem.run();
  }
  
  if (config.activeModules.constraints) {
    constraintSystem.run();
  }
  
  // Apply post-processing effects
  if (config.activeModules.effects) {
    effectsSystem.postProcess();
  }
  
  // Update recorder if recording
  recorder.update();
}

function mousePressed() {
  // Pass mouse events to systems that need them
  if (config.activeModules.attractors) {
    attractorSystem.handleMousePressed();
  }
}

function mouseReleased() {
  // Pass mouse events to systems that need them
  if (config.activeModules.attractors) {
    attractorSystem.handleMouseReleased();
  }
}

function windowResized() {
  // Update canvas size
  config.width = windowWidth;
  config.height = windowHeight;
  resizeCanvas(config.width, config.height);
  
  // Reinitialize systems that depend on canvas size
  effectsSystem.initialize();
}

function keyPressed() {
  // Toggle menu visibility when 'h' is pressed
  if (key === 'h' || key === 'H') {
    const controls = document.getElementById('controls');
    if (controls.style.display === 'none') {
      controls.style.display = '';
    } else {
      controls.style.display = 'none';
    }
  }
}