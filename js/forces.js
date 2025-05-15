/**
 * Force systems for creating various effects
 */
class ForceSystem {
  constructor() {
    this.forceFields = [];
    this.initialize();
  }
  
  initialize() {
    // Create force fields if needed
    if (config.turbulence.active) {
      this.createTurbulenceField();
    }
  }
  
  createTurbulenceField() {
    // Create a grid of force vectors for the turbulence field
    const gridSize = 20;
    this.forceFields = [];
    
    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        const noiseVal = noise(x * 0.01, y * 0.01, frameCount * 0.001);
        const angle = noiseVal * TWO_PI * 2;
        const force = p5.Vector.fromAngle(angle);
        force.mult(config.turbulence.strength);
        
        this.forceFields.push({
          position: createVector(x, y),
          force: force
        });
      }
    }
  }
  
  applyForcesToParticle(particle) {
    // Apply gravity
    if (config.gravity.active) {
      const gravity = createVector(config.gravity.x, config.gravity.y);
      gravity.mult(particle.mass);
      particle.applyForce(gravity);
    }
    
    // Apply turbulence
    if (config.turbulence.active) {
      // Find the nearest force field point
      let closestDist = Infinity;
      let closestForce = null;
      
      for (const field of this.forceFields) {
        const distance = p5.Vector.dist(particle.position, field.position);
        if (distance < closestDist) {
          closestDist = distance;
          closestForce = field.force;
        }
      }
      
      if (closestForce) {
        particle.applyForce(closestForce);
      }
    }
  }
  
  run() {
    // Update force fields if needed
    if (config.turbulence.active) {
      this.createTurbulenceField();
    }
    
    // Visualization of force fields (optional)
    if (config.turbulence.active && false) { // Set to true to visualize
      this.displayForceField();
    }
  }
  
  displayForceField() {
    // Visualize the force field
    stroke(100, 100, 255, 50);
    for (const field of this.forceFields) {
      const x = field.position.x;
      const y = field.position.y;
      const force = field.force.copy();
      force.mult(20); // Scale for visibility
      
      line(x, y, x + force.x, y + force.y);
      // Draw a small dot at the end
      fill(100, 100, 255, 50);
      noStroke();
      ellipse(x + force.x, y + force.y, 3, 3);
    }
  }
}

let forceSystem;