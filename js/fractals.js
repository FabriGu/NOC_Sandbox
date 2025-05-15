/**
 * Fractal generation system
 */
class FractalSystem {
  constructor() {
    this.currentType = 'none';
    this.depth = config.fractalDepth;
    this.size = config.fractalSize;
    this.angle = 0;
    this.rotationSpeed = config.fractalRotationSpeed;
    
    // Fractal-specific parameters
    this.treeAngle = PI / 6; // For tree fractal
    this.treeRatio = 0.67;   // For tree fractal
    
    this.kochLines = [];     // For Koch fractal
    
    this.points = [];        // For Sierpinski fractal
    
    this.initialize();
  }
  
  initialize() {
    this.currentType = config.fractalType;
    this.depth = config.fractalDepth;
    this.size = config.fractalSize;
    this.rotationSpeed = config.fractalRotationSpeed;
    
    switch (this.currentType) {
      case 'koch':
        this.initializeKoch();
        break;
        
      case 'sierpinski':
        this.initializeSierpinski();
        break;
        
      case 'tree':
      case 'none':
      default:
        // No initialization needed
        break;
    }
  }
  
  initializeKoch() {
    // Initialize Koch curve
    this.kochLines = [];
    
    // Create initial line
    const start = createVector(width/2 - this.size, height/2);
    const end = createVector(width/2 + this.size, height/2);
    this.kochLines.push({a: start, b: end});
    
    // Generate the fractal
    for (let i = 0; i < this.depth; i++) {
      this.generateKoch();
    }
  }
  
  generateKoch() {
    const nextGen = [];
    
    for (const line of this.kochLines) {
      // Find the four points of the Koch curve segment
      const a = line.a.copy();
      const e = line.b.copy();
      
      const v = p5.Vector.sub(e, a);
      v.div(3);
      
      const b = p5.Vector.add(a, v);
      
      const c = b.copy();
      v.rotate(-PI/3);
      c.add(v);
      
      const d = p5.Vector.add(a, p5.Vector.mult(v, 2));
      
      // Add the four new line segments
      nextGen.push({a: a, b: b});
      nextGen.push({a: b, b: c});
      nextGen.push({a: c, b: d});
      nextGen.push({a: d, b: e});
    }
    
    this.kochLines = nextGen;
  }
  
  initializeSierpinski() {
    // Initialize Sierpinski triangle
    this.points = [];
    
    // Create initial triangle
    const h = this.size * Math.sqrt(3) / 2;
    const centerX = width / 2;
    const centerY = height / 2;
    
    const p1 = createVector(centerX, centerY - 2*h/3);
    const p2 = createVector(centerX - this.size/2, centerY + h/3);
    const p3 = createVector(centerX + this.size/2, centerY + h/3);
    
    this.points.push({vertices: [p1, p2, p3], level: 0});
    
    // Generate the fractal
    for (let i = 0; i < this.depth; i++) {
      this.generateSierpinski();
    }
  }
  
  generateSierpinski() {
    const nextGen = [];
    
    for (const triangle of this.points) {
      if (triangle.level >= this.depth) continue;
      
      const p1 = triangle.vertices[0];
      const p2 = triangle.vertices[1];
      const p3 = triangle.vertices[2];
      
      // Calculate midpoints
      const m12 = p5.Vector.lerp(p1, p2, 0.5);
      const m23 = p5.Vector.lerp(p2, p3, 0.5);
      const m31 = p5.Vector.lerp(p3, p1, 0.5);
      
      // Create three new triangles
      nextGen.push({
        vertices: [p1, m12, m31],
        level: triangle.level + 1
      });
      
      nextGen.push({
        vertices: [m12, p2, m23],
        level: triangle.level + 1
      });
      
      nextGen.push({
        vertices: [m31, m23, p3],
        level: triangle.level + 1
      });
    }
    
    this.points = this.points.concat(nextGen);
  }
  
  update() {
    // Update fractal parameters if configuration changed
    if (this.currentType !== config.fractalType || 
        this.depth !== config.fractalDepth ||
        this.size !== config.fractalSize) {
      this.initialize();
    }
    
    // Update rotation angle
    this.angle += this.rotationSpeed;
    
    // Handle interactive elements
    if (config.fractalInteractive) {
      // For tree fractal, adjust angle based on mouse position
      if (this.currentType === 'tree') {
        this.treeAngle = map(mouseX, 0, width, 0, PI/2);
      }
    }
  }
  
  display() {
    if (this.currentType === 'none') return;
    
    push();
    translate(width/2, height/2);
    rotate(this.angle);
    translate(-width/2, -height/2);
    
    stroke(
      config.fractalColor[0],
      config.fractalColor[1],
      config.fractalColor[2]
    );
    
    switch (this.currentType) {
      case 'tree':
        this.drawTree();
        break;
        
      case 'koch':
        this.drawKoch();
        break;
        
      case 'sierpinski':
        this.drawSierpinski();
        break;
        
      default:
        break;
    }
    
    pop();
  }
  
  drawTree() {
    // Draw fractal tree
    const startX = width / 2;
    const startY = height / 2 + this.size;
    
    push();
    translate(startX, startY);
    stroke(config.fractalColor[0], config.fractalColor[1], config.fractalColor[2]);
    strokeWeight(this.size / 20);
    
    // Tree grows upward
    this.branch(this.size, -PI/2, this.depth);
    
    pop();
  }
  
  branch(len, angle, depth) {
    line(0, 0, 0, -len);
    translate(0, -len);
    
    if (depth > 0) {
      // Reduce branch length
      len *= this.treeRatio;
      
      // Right branch
      push();
      rotate(this.treeAngle);
      this.branch(len, angle + this.treeAngle, depth - 1);
      pop();
      
      // Left branch
      push();
      rotate(-this.treeAngle);
      this.branch(len, angle - this.treeAngle, depth - 1);
      pop();
    }
  }
  
  drawKoch() {
    // Draw Koch curve
    stroke(config.fractalColor[0], config.fractalColor[1], config.fractalColor[2]);
    strokeWeight(2);
    
    for (const line of this.kochLines) {
      line(line.a.x, line.a.y, line.b.x, line.b.y);
    }
  }
  
  drawSierpinski() {
    // Draw Sierpinski triangle
    noStroke();
    fill(config.fractalColor[0], config.fractalColor[1], config.fractalColor[2], 150);
    
    for (const triangle of this.points) {
      // Only draw triangles at the maximum depth
      if (triangle.level === this.depth) {
        beginShape();
        for (const p of triangle.vertices) {
          vertex(p.x, p.y);
        }
        endShape(CLOSE);
      }
    }
  }
}

let fractalSystem;