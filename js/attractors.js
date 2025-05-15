/**
 * Attractor system inspired by gravitational attraction from The Nature of Code
 */
class Attractor {
  constructor(x, y) {
    this.position = createVector(x || width/2, y || height/2);
    this.mass = config.attractorSize;
    this.G = config.attractorStrength;
    this.isDragging = false;
    this.dragOffset = createVector(0, 0);
    this.fixed = config.attractorFixed;
    this.color = color(
      config.attractorColor[0], 
      config.attractorColor[1], 
      config.attractorColor[2]
    );
  }
  
  calculateAttraction(particle) {
    // Calculate direction of force
    const force = p5.Vector.sub(this.position, particle.position);
    // Distance between objects
    let distance = force.mag();
    
    // Constrain distance to prevent extreme values
    distance = constrain(distance, 5, 500);
    
    // Normalize force vector to get direction
    force.normalize();
    
    // Calculate gravitational force magnitude
    const strength = (this.G * this.mass * particle.mass) / (distance * distance);
    
    // Apply magnitude to direction
    force.mult(strength);
    
    return force;
  }
  
  update() {
    // Handle mouse interaction
    if (mouseIsPressed && !this.fixed) {
      const mousePos = createVector(mouseX, mouseY);
      const distance = p5.Vector.dist(mousePos, this.position);
      
      if (distance < this.mass || this.isDragging) {
        this.isDragging = true;
        this.position.x = mouseX - this.dragOffset.x;
        this.position.y = mouseY - this.dragOffset.y;
      }
    } else {
      this.isDragging = false;
    }
  }
  
  display() {
    if (!config.attractorVisible) return;
    
    noStroke();
    fill(this.color);
    ellipse(this.position.x, this.position.y, this.mass * 2, this.mass * 2);
    
    // Add a subtle glow effect if glow is enabled
    if (config.glowEffect) {
      for (let i = 3; i > 0; i--) {
        const glowSize = this.mass * 2 + i * 5;
        const alpha = map(i, 0, 3, 150, 0);
        fill(red(this.color), green(this.color), blue(this.color), alpha);
        ellipse(this.position.x, this.position.y, glowSize, glowSize);
      }
    }
  }
  
  handleMousePressed() {
    if (this.fixed) return;
    
    const d = dist(mouseX, mouseY, this.position.x, this.position.y);
    if (d < this.mass) {
      this.isDragging = true;
      this.dragOffset.x = mouseX - this.position.x;
      this.dragOffset.y = mouseY - this.position.y;
    }
  }
  
  handleMouseReleased() {
    this.isDragging = false;
  }
}

/**
 * System to manage multiple attractors
 */
class AttractorSystem {
  constructor() {
    this.attractors = [];
    this.initialize();
  }
  
  initialize() {
    // Clear existing attractors
    this.attractors = [];
    
    // Create initial attractors
    for (let i = 0; i < config.attractorCount; i++) {
      const x = random(width);
      const y = random(height);
      this.attractors.push(new Attractor(x, y));
    }
  }
  
  run() {
    // Add or remove attractors if count changed
    while (this.attractors.length < config.attractorCount) {
      this.attractors.push(new Attractor(random(width), random(height)));
    }
    
    while (this.attractors.length > config.attractorCount) {
      this.attractors.pop();
    }
    
    // Apply forces to particles
    if (config.activeModules.particles && particleSystem) {
      for (const attractor of this.attractors) {
        for (const particle of particleSystem.particles) {
          const force = attractor.calculateAttraction(particle);
          particle.applyForce(force);
        }
      }
    }
    
    // Update and display attractors
    for (const attractor of this.attractors) {
      attractor.update();
      attractor.display();
    }
  }
  
  handleMousePressed() {
    for (const attractor of this.attractors) {
      attractor.handleMousePressed();
    }
  }
  
  handleMouseReleased() {
    for (const attractor of this.attractors) {
      attractor.handleMouseReleased();
    }
  }
}

let attractorSystem;