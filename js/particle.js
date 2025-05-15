/**
 * Particle system inspired by The Nature of Code
 */
class Particle {
  constructor(x, y) {
    // Position
    this.position = createVector(x || random(width), y || random(height));
    this.previousPositions = []; // For trails
    
    // Motion
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.acceleration = createVector(0, 0);
    
    // Physical properties
    this.size = Utils.getRandomSize();
    this.mass = this.size / 10; // Mass proportional to size
    
    // Visual properties
    this.color = Utils.getColor(0, config.particleCount);
    this.alpha = config.particleOpacity;
    this.shape = config.particleShape;
    // this.color = Utils.getColor(20,20);
    // Life
    this.lifespan = config.particleLifespan;
    this.isDead = false;
    
    // Trail
    this.maxTrailLength = config.particleTrailLength;
  }
  
  applyForce(force) {
    // F = ma, so a = F/m
    const f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  }
  
  update() {
    // Store position for trail if enabled
    if (config.particleTrails) {
      this.previousPositions.push(this.position.copy());
      
      // Limit trail length
      if (this.previousPositions.length > this.maxTrailLength) {
        this.previousPositions.shift();
      }
    } else {
      this.previousPositions = [];
    }
    
    // Update velocity and position
    this.velocity.add(this.acceleration);
    
    // Limit speed if configured
    if (config.particleMaxSpeed > 0) {
      this.velocity.limit(config.particleMaxSpeed);
    }
    
    // Apply friction if active
    if (config.friction.active) {
      this.velocity.mult(config.friction.value);
    }
    
    // Update position
    this.position.add(this.velocity);
    
    // Reset acceleration
    this.acceleration.mult(0);
    
    // Handle boundaries
    this.handleBoundaries();
    
    // Update lifespan
    if (this.lifespan > 0) {
      this.lifespan--;
      this.alpha = map(this.lifespan, 0, config.particleLifespan, 0, config.particleOpacity);
    }
    
    if (this.lifespan === 0) {
      this.isDead = true;
    }
  }
  
  handleBoundaries() {
    if (!config.bounds.active) return;
    
    const r = this.size / 2;
    const boundsMode = config.bounds.mode;
    
    if (boundsMode === 'bounce') {
      if (this.position.x < r) {
        this.position.x = r;
        this.velocity.x *= -config.collision.elasticity;
      } else if (this.position.x > width - r) {
        this.position.x = width - r;
        this.velocity.x *= -config.collision.elasticity;
      }
      
      if (this.position.y < r) {
        this.position.y = r;
        this.velocity.y *= -config.collision.elasticity;
      } else if (this.position.y > height - r) {
        this.position.y = height - r;
        this.velocity.y *= -config.collision.elasticity;
      }
    } else if (boundsMode === 'wrap') {
      if (this.position.x < -r) this.position.x = width + r;
      if (this.position.x > width + r) this.position.x = -r;
      if (this.position.y < -r) this.position.y = height + r;
      if (this.position.y > height + r) this.position.y = -r;
    } else if (boundsMode === 'disappear') {
      if (this.position.x < -r || this.position.x > width + r ||
          this.position.y < -r || this.position.y > height + r) {
        this.isDead = true;
      }
    }
  }
  
  checkCollision(other) {
    if (!config.collision.active) return;
    
    const minDist = (this.size / 2) + (other.size / 2);
    const distance = p5.Vector.dist(this.position, other.position);
    
    if (distance < minDist) {
      // Calculate collision response
      const angle = p5.Vector.sub(other.position, this.position).heading();
      
      // Compute velocities along normal
      const thisSpeed = this.velocity.mag();
      const otherSpeed = other.velocity.mag();
      
      // Compute new velocities (simplistic model)
      const thisDirection = this.velocity.heading();
      const otherDirection = other.velocity.heading();
      
      // Reflect directions based on the collision angle
      const thisNewDirection = 2 * angle - thisDirection;
      const otherNewDirection = 2 * angle - otherDirection;
      
      // Create new velocity vectors
      const elasticity = config.collision.elasticity;
      
      this.velocity = p5.Vector.fromAngle(thisNewDirection, thisSpeed * elasticity);
      other.velocity = p5.Vector.fromAngle(otherNewDirection, otherSpeed * elasticity);
      
      // Push particles apart to prevent sticking
      const overlap = minDist - distance;
      const pushDirection = p5.Vector.sub(this.position, other.position).normalize();
      
      this.position.add(p5.Vector.mult(pushDirection, overlap * 0.5));
      other.position.add(p5.Vector.mult(pushDirection, -overlap * 0.5));
    }
  }
  
  display() {
    // Draw trail if enabled
    if (config.particleTrails && this.previousPositions.length > 1) {
      noFill();
      stroke(red(this.color), green(this.color), blue(this.color), this.alpha * 0.5);
      strokeWeight(this.size * 0.3);
      beginShape();
      for (let i = 0; i < this.previousPositions.length; i++) {
        const pos = this.previousPositions[i];
        const alpha = map(i, 0, this.previousPositions.length - 1, 0, this.alpha * 0.8);
        stroke(red(this.color), green(this.color), blue(this.color), alpha);
        vertex(pos.x, pos.y);
      }
      vertex(this.position.x, this.position.y);
      endShape();
    }
    
    // Apply stroke/fill settings
    if (config.particleOutline) {
      stroke(config.particleOutlineColor);
      strokeWeight(config.particleOutlineWeight);
    } else {
      noStroke();
    }
    
    // Set the fill color with the current alpha
    fill(red(this.color), green(this.color), blue(this.color), this.alpha);
    
    // Draw particle based on shape
    switch (this.shape) {
      case 'square':
        rectMode(CENTER);
        rect(this.position.x, this.position.y, this.size, this.size);
        break;
        
      case 'triangle':
        const r = this.size / 2;
        triangle(
          this.position.x, this.position.y - r,
          this.position.x - r, this.position.y + r,
          this.position.x + r, this.position.y + r
        );
        break;
        
      case 'custom':
        // Custom shape drawing logic - example: star
        this.drawStar(this.position.x, this.position.y, this.size/2, this.size/4, 5);
        break;
        
      case 'circle':
      default:
        ellipse(this.position.x, this.position.y, this.size, this.size);
        break;
    }
  }
  
  // Custom shape drawing function for 'custom' shape type
  drawStar(x, y, outerRadius, innerRadius, points) {
    let angle = TWO_PI / points;
    let halfAngle = angle / 2.0;
    
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = x + cos(a) * outerRadius;
      let sy = y + sin(a) * outerRadius;
      vertex(sx, sy);
      sx = x + cos(a + halfAngle) * innerRadius;
      sy = y + sin(a + halfAngle) * innerRadius;
      vertex(sx, sy);
    }
    endShape(CLOSE);
  }
  
  isDead() {
    return this.isDead;
  }
}

/**
 * Class to manage a system of particles
 */
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.initialize();
  }
  
  initialize() {
    // Create initial particles
    for (let i = 0; i < config.particleCount; i++) {
      this.addParticle();
    }
  }
  
  addParticle(x, y) {
    if (this.particles.length < config.particleCount) {
      this.particles.push(new Particle(x, y));
    }
  }
  
  run() {
    // Add particles until we reach the configured number
    while (this.particles.length < config.particleCount) {
      this.addParticle();
    }
    
    // Update and display all particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Apply gravity if active
      if (config.gravity.active) {
        const gravity = createVector(config.gravity.x, config.gravity.y);
        gravity.mult(particle.mass); // Scale gravity by mass
        particle.applyForce(gravity);
      }
      
      // Apply turbulence if active
      if (config.turbulence.active) {
        const noiseScale = 0.01;
        const noiseVal = noise(
          particle.position.x * noiseScale, 
          particle.position.y * noiseScale, 
          frameCount * 0.01
        );
        
        const angle = noiseVal * TWO_PI * 2;
        const turbulence = p5.Vector.fromAngle(angle);
        turbulence.mult(config.turbulence.strength);
        particle.applyForce(turbulence);
      }
      
      // Apply forces from attractors
      if (config.activeModules.attractors) {
        // This will be handled by the AttractorSystem
      }
      
      // Update the particle
      particle.update();
      
      // Check for collisions with other particles
      if (config.collision.active) {
        for (let j = i + 1; j < this.particles.length; j++) {
          particle.checkCollision(this.particles[j]);
        }
      }
      
      // Display the particle
      particle.display();
      
      // Remove dead particles
      if (particle.isDead) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  clear() {
    this.particles = [];
  }
  
  getParticleCount() {
    console.log(this.particles.length)
    return this.particles.length;
    // return null;
  }
}

let particleSystem;