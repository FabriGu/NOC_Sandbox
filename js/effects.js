/**
 * Visual effects system for backgrounds and post-processing
 */
class EffectsSystem {
  constructor() {
    this.backgroundBuffer = null;
    this.blurBuffer = null;
    this.starPositions = [];
    this.initialize();
  }
  
  initialize() {
    // Create graphics buffers for effects
    this.backgroundBuffer = createGraphics(width, height);
    this.blurBuffer = createGraphics(width, height);
    
    // Generate star positions for star background
    this.generateStars();
    
    // Generate initial background if static
    if (config.backgroundEffect === 'gradient') {
      this.generateGradientBackground();
    } else if (config.backgroundEffect === 'stars') {
      this.generateStarsBackground();
    }
  }
  
  generateStars() {
    this.starPositions = [];
    const starCount = 200;
    
    for (let i = 0; i < starCount; i++) {
      this.starPositions.push({
        x: random(width),
        y: random(height),
        size: random(1, 3),
        brightness: random(100, 255),
        twinkleSpeed: random(0.02, 0.05)
      });
    }
  }
  
  generateGradientBackground() {
    // Create a static gradient background
    const c1 = color(10, 0, 50);
    const c2 = color(50, 10, 90);
    
    this.backgroundBuffer.push();
    this.backgroundBuffer.noFill();
    
    for (let y = 0; y < height; y++) {
      const inter = map(y, 0, height, 0, 1);
      const c = lerpColor(c1, c2, inter);
      this.backgroundBuffer.stroke(c);
      this.backgroundBuffer.line(0, y, width, y);
    }
    
    this.backgroundBuffer.pop();
  }
  
  generateStarsBackground() {
    // Create a stars background
    this.backgroundBuffer.background(0, 10, 40);
    
    this.backgroundBuffer.push();
    for (const star of this.starPositions) {
      const twinkle = sin(frameCount * star.twinkleSpeed) * 50 + 200;
      this.backgroundBuffer.fill(255, twinkle);
      this.backgroundBuffer.noStroke();
      this.backgroundBuffer.ellipse(star.x, star.y, star.size, star.size);
    }
    this.backgroundBuffer.pop();
  }
  
  generatePerlinBackground() {
    // Create a Perlin noise background
    this.backgroundBuffer.loadPixels();
    const noiseScale = 0.01;
    
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const noiseVal = noise(x * noiseScale, y * noiseScale, frameCount * 0.005);
        let c;
        
        if (noiseVal < 0.4) {
          c = color(0, 20, 60);
        } else if (noiseVal < 0.7) {
          c = color(20, 40, 80); 
        } else {
          c = color(40, 60, 100);
        }
        
        const index = (x + y * width) * 4;
        this.backgroundBuffer.pixels[index] = red(c);
        this.backgroundBuffer.pixels[index + 1] = green(c);
        this.backgroundBuffer.pixels[index + 2] = blue(c);
        this.backgroundBuffer.pixels[index + 3] = 255;
      }
    }
    
    this.backgroundBuffer.updatePixels();
  }
  
  applyBlur() {
    // Copy the main canvas to the blur buffer
    this.blurBuffer.image(canvas, 0, 0);
    
    // Apply a simple box blur
    this.blurBuffer.filter(BLUR, 3);
    
    // Draw the blurred image back with reduced opacity
    image(this.blurBuffer, 0, 0);
  }
  
  applyGlow() {
    // Simple glow effect - would be more sophisticated in a real implementation
    // This just adds a blurred copy underneath
    this.blurBuffer.image(canvas, 0, 0);
    this.blurBuffer.filter(BLUR, config.glowStrength);
    
    // Draw the blurred image first, then the original on top
    image(this.blurBuffer, 0, 0);
  }
  
  applyVignette() {
    // Apply a vignette effect
    const amount = config.vignetteAmount;
    
    push();
    noFill();
    strokeWeight(width / 2);
    
    // Create a radial gradient from transparent to black
    for (let i = 0; i < 10; i++) {
      const a = map(i, 0, 10, 0, 255 * amount);
      stroke(0, a);
      const size = map(i, 0, 10, max(width, height) * 1.5, 0);
      ellipse(width/2, height/2, size, size);
    }
    pop();
  }
  
  drawBackground() {
    switch (config.backgroundEffect) {
      case 'gradient':
        // Static gradient, just draw it
        image(this.backgroundBuffer, 0, 0);
        break;
        
      case 'perlin':
        // Dynamic perlin noise background
        this.generatePerlinBackground();
        image(this.backgroundBuffer, 0, 0);
        break;
        
      case 'stars':
        // Animated stars background
        this.generateStarsBackground();
        image(this.backgroundBuffer, 0, 0);
        break;
        
      case 'none':
      default:
        // Just fill with background color
        background(
          config.backgroundColor[0],
          config.backgroundColor[1],
          config.backgroundColor[2],
          config.backgroundColor[3]
        );
        break;
    }
  }
  
  applyPostEffects() {
    // Apply any post-processing effects
    if (config.blurEffect) {
      this.applyBlur();
    }
    
    if (config.glowEffect) {
      this.applyGlow();
    }
    
    if (config.vignette) {
      this.applyVignette();
    }
  }
  
  run() {
    // No post-processing here - this is called at the start of draw()
    this.drawBackground();
  }
  
  postProcess() {
    // Post-processing effects - called at the end of draw()
    this.applyPostEffects();
  }
}

let effectsSystem;