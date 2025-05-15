/**
 * Configuration system that stores all adjustable parameters
 * for the simulation. Acts as a central source of truth.
 */
class Config {
  constructor() {
    // Canvas settings
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.backgroundColor = [10, 10, 10, 255];
    this.frameRate = 60;
    
    // General system settings
    this.activeModules = {
      particles: true,
      attractors: false,
      forces: false,
      constraints: false,
      fractals: false,
      effects: true
    };
    
    // Particle settings
    this.particleCount = 100;
    this.particleSize = 15;
    this.particleMinSize = 5;
    this.particleMaxSize = 30;
    this.particleSizeVariation = true;
    this.particleColor = [255, 255, 255];
    this.particleColorMode = 'solid'; // 'solid', 'rainbow', 'gradient'
    this.particleShape = 'circle'; // 'circle', 'square', 'triangle', 'custom'
    this.particleOutline = true;
    this.particleOutlineColor = [255, 255, 255];
    this.particleOutlineWeight = 2;
    this.particleOpacity = 200;
    this.particleLifespan = -1; // -1 for infinite
    this.particleMaxSpeed = 5;
    this.particleTrails = false;
    this.particleTrailLength = 20;
    
    // Physics settings
    this.gravity = { active: false, x: 0, y: 0.1 };
    this.bounds = { active: true, mode: 'bounce' }; // 'bounce', 'wrap', 'disappear'
    this.friction = { active: false, value: 0.99 };
    this.turbulence = { active: false, strength: 0.1 };
    this.attraction = { active: false, strength: 0.5 };
    this.collision = { active: true, elasticity: 0.9 };
    
    // Attractor settings
    this.attractorCount = 1;
    this.attractorStrength = 1;
    this.attractorSize = 20;
    this.attractorFixed = true;
    this.attractorVisible = true;
    this.attractorColor = [255, 0, 0];
    
    // Constraint settings
    this.constraintCount = 0;
    this.constraintLength = 100;
    this.constraintStiffness = 0.1;
    this.constraintDamping = 0.1;
    this.constraintVisible = true;
    this.constraintColor = [100, 100, 255];
    this.constraintWeight = 2;
    
    // Fractal settings
    this.fractalType = 'none'; // 'none', 'tree', 'koch', 'sierpinski', 'mandelbrot'
    this.fractalDepth = 5;
    this.fractalSize = 150;
    this.fractalRotationSpeed = 0;
    this.fractalColor = [0, 255, 0];
    this.fractalInteractive = false;
    
    // Effect settings
    this.backgroundEffect = 'none'; // 'none', 'gradient', 'perlin', 'stars'
    this.blurEffect = false;
    this.glowEffect = false;
    this.glowStrength = 10;
    this.vignette = false;
    this.vignetteAmount = 0.7;
    
    // Recording settings
    this.recordingDuration = 5; // seconds
    this.recordingFPS = 30;
    this.recordingFormat = 'gif'; // 'gif', 'mp4', 'webm'
    this.recordingQuality = 'medium'; // 'low', 'medium', 'high'
    
    // Presets
    this.presets = {
      bouncy: {
        particleCount: 50,
        particleSize: 20,
        particleSizeVariation: true,
        particleColorMode: 'rainbow',
        gravity: { active: true, x: 0, y: 0.2 },
        bounds: { active: true, mode: 'bounce' },
        collision: { active: true, elasticity: 0.9 },
      },
      galaxy: {
        particleCount: 200,
        particleSize: 5,
        particleOpacity: 150,
        particleTrails: true,
        particleTrailLength: 15,
        particleColorMode: 'gradient',
        attractorCount: 1,
        attractorStrength: 0.8,
        attractorFixed: true,
        gravity: { active: false },
        bounds: { active: false },
        friction: { active: true, value: 0.99 },
        backgroundEffect: 'stars',
        glowEffect: true,
        vignette: true,
      },
      fractals: {
        particleCount: 0,
        fractalType: 'tree',
        fractalDepth: 9,
        fractalRotationSpeed: 0.005,
        fractalInteractive: true,
        backgroundEffect: 'gradient',
        glowEffect: true,
      },
      fluid: {
        particleCount: 300,
        particleSize: 8,
        particleOpacity: 150,
        gravity: { active: false },
        friction: { active: true, value: 0.98 },
        turbulence: { active: true, strength: 0.3 },
        collision: { active: false },
        backgroundEffect: 'perlin',
        blurEffect: true,
        glowEffect: true,
      }
    };
  }
  
  // Load a preset configuration
  loadPreset(presetName) {
    if (!this.presets[presetName]) return false;
    
    const preset = this.presets[presetName];
    
    // Apply the preset properties to the current configuration
    for (const key in preset) {
      if (typeof preset[key] === 'object' && !Array.isArray(preset[key])) {
        // For nested objects like gravity, merge rather than replace
        for (const subKey in preset[key]) {
          this[key][subKey] = preset[key][subKey];
        }
      } else {
        this[key] = preset[key];
      }
    }
    
    return true;
  }
  
  // Save current configuration as a new preset
  savePreset(presetName) {
    if (!presetName) return false;
    
    // Create a new preset from current settings
    this.presets[presetName] = {
      particleCount: this.particleCount,
      particleSize: this.particleSize,
      particleSizeVariation: this.particleSizeVariation,
      particleColorMode: this.particleColorMode,
      particleTrails: this.particleTrails,
      particleTrailLength: this.particleTrailLength,
      particleOpacity: this.particleOpacity,
      
      gravity: { ...this.gravity },
      bounds: { ...this.bounds },
      friction: { ...this.friction },
      turbulence: { ...this.turbulence },
      collision: { ...this.collision },
      
      attractorCount: this.attractorCount,
      attractorStrength: this.attractorStrength,
      attractorFixed: this.attractorFixed,
      
      fractalType: this.fractalType,
      fractalDepth: this.fractalDepth,
      fractalRotationSpeed: this.fractalRotationSpeed,
      
      backgroundEffect: this.backgroundEffect,
      blurEffect: this.blurEffect,
      glowEffect: this.glowEffect,
      vignette: this.vignette,
    };
    
    return true;
  }
  
  // Randomize all settings for fun exploration
  randomize() {
    this.particleCount = Math.floor(random(50, 300));
    this.particleSize = random(5, 30);
    this.particleSizeVariation = random() > 0.5;
    this.particleColorMode = ['solid', 'rainbow', 'gradient'][Math.floor(random(3))];
    this.particleOpacity = random(100, 255);
    this.particleTrails = random() > 0.7;
    this.particleTrailLength = Math.floor(random(5, 30));
    
    this.gravity.active = random() > 0.5;
    this.gravity.y = random(0.05, 0.3);
    
    this.bounds.active = random() > 0.3;
    this.bounds.mode = ['bounce', 'wrap', 'disappear'][Math.floor(random(3))];
    
    this.friction.active = random() > 0.5;
    this.friction.value = random(0.95, 0.995);
    
    this.turbulence.active = random() > 0.7;
    this.turbulence.strength = random(0.05, 0.4);
    
    this.collision.active = random() > 0.3;
    this.collision.elasticity = random(0.5, 1.0);
    
    this.attractorCount = Math.floor(random(0, 3));
    this.attractorStrength = random(0.2, 1.5);
    this.attractorFixed = random() > 0.3;
    
    const fractalOptions = ['none', 'tree', 'koch', 'sierpinski'];
    this.fractalType = fractalOptions[Math.floor(random(fractalOptions.length))];
    this.fractalDepth = Math.floor(random(3, 10));
    this.fractalRotationSpeed = random(0, 0.01);
    
    const backgroundOptions = ['none', 'gradient', 'perlin', 'stars'];
    this.backgroundEffect = backgroundOptions[Math.floor(random(backgroundOptions.length))];
    this.blurEffect = random() > 0.7;
    this.glowEffect = random() > 0.5;
    this.vignette = random() > 0.5;
  }
}

// Create global configuration
let config = new Config();