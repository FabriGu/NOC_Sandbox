/**
 * Constraint system for connecting particles with springs or other constraints
 */
class Constraint {
  constructor(particleA, particleB) {
    this.particleA = particleA;
    this.particleB = particleB;
    this.length = config.constraintLength;
    if (!this.length) {
      // If no length specified, use current distance
      this.length = p5.Vector.dist(particleA.position, particleB.position);
    }
    this.stiffness = config.constraintStiffness;
    this.damping = config.constraintDamping;
    this.color = color(
      config.constraintColor[0],
      config.constraintColor[1],
      config.constraintColor[2]
    );
    this.thickness = config.constraintWeight;
  }
  
  update() {
    // Calculate the distance between the particles
    let force = p5.Vector.sub(this.particleB.position, this.particleA.position);
    let distance = force.mag();
    
    // Calculate direction and amount of force
    let stretch = distance - this.length;
    
    // Only apply force if the particles are not at the target distance
    if (abs(stretch) > 0.1) {
      force.normalize();
      force.mult(stretch * this.stiffness);
      
      // Apply damping (resistance based on velocity)
      const velDiff = p5.Vector.sub(this.particleB.velocity, this.particleA.velocity);
      const damping = p5.Vector.mult(velDiff, this.damping);
      force.add(damping);
      
      // Apply equal and opposite forces to both particles
      this.particleA.applyForce(force);
      force.mult(-1);
      this.particleB.applyForce(force);
    }
  }
  
  display() {
    if (!config.constraintVisible) return;
    
    // Draw the constraint as a line
    stroke(this.color);
    strokeWeight(this.thickness);
    
    // Calculate how stretched the constraint is
    const distance = p5.Vector.dist(this.particleA.position, this.particleB.position);
    const stretch = distance / this.length;
    
    // Adjust color based on stretch
    if (stretch > 1.1) {
      // Stretched - reddish
      stroke(
        lerp(red(this.color), 255, (stretch - 1) * 0.5),
        lerp(green(this.color), 0, (stretch - 1) * 0.5),
        lerp(blue(this.color), 0, (stretch - 1) * 0.5)
      );
    } else if (stretch < 0.9) {
      // Compressed - blueish
      stroke(
        lerp(red(this.color), 0, (1 - stretch) * 0.5),
        lerp(green(this.color), 0, (1 - stretch) * 0.5),
        lerp(blue(this.color), 255, (1 - stretch) * 0.5)
      );
    }
    
    line(
      this.particleA.position.x,
      this.particleA.position.y,
      this.particleB.position.x,
      this.particleB.position.y
    );
  }
}

/**
 * System to manage multiple constraints
 */
class ConstraintSystem {
  constructor() {
    this.constraints = [];
    this.initialize();
  }
  
  initialize() {
    this.constraints = [];
    
    // Create constraints if particles exist
    if (config.constraintCount > 0 && particleSystem && particleSystem.particles.length > 1) {
      for (let i = 0; i < config.constraintCount; i++) {
        // Get two random particles
        const particleCount = particleSystem.particles.length;
        const indexA = Math.floor(random(particleCount));
        let indexB = Math.floor(random(particleCount));
        
        // Make sure we get different particles
        while (indexB === indexA) {
          indexB = Math.floor(random(particleCount));
        }
        
        const particleA = particleSystem.particles[indexA];
        const particleB = particleSystem.particles[indexB];
        
        this.constraints.push(new Constraint(particleA, particleB));
      }
    }
  }
  
  run() {
    // Update and display constraints
    for (let i = this.constraints.length - 1; i >= 0; i--) {
      const constraint = this.constraints[i];
      
      // Check if either particle is dead
      if (constraint.particleA.isDead || constraint.particleB.isDead) {
        this.constraints.splice(i, 1);
        continue;
      }
      
      constraint.update();
      constraint.display();
    }
    
    // Add constraints if needed
    if (this.constraints.length < config.constraintCount && 
        particleSystem && particleSystem.particles.length > 1) {
      // Find two random particles that don't already have a constraint
      const particleCount = particleSystem.particles.length;
      let foundValidPair = false;
      let attempts = 0;
      
      while (!foundValidPair && attempts < 10) {
        attempts++;
        
        const indexA = Math.floor(random(particleCount));
        let indexB = Math.floor(random(particleCount));
        
        // Make sure we get different particles
        while (indexB === indexA) {
          indexB = Math.floor(random(particleCount));
        }
        
        const particleA = particleSystem.particles[indexA];
        const particleB = particleSystem.particles[indexB];
        
        // Check if these particles already have a constraint
        let alreadyConstrained = false;
        for (const c of this.constraints) {
          if ((c.particleA === particleA && c.particleB === particleB) ||
              (c.particleA === particleB && c.particleB === particleA)) {
            alreadyConstrained = true;
            break;
          }
        }
        
        if (!alreadyConstrained) {
          this.constraints.push(new Constraint(particleA, particleB));
          foundValidPair = true;
        }
      }
    }
  }
}

let constraintSystem;