/**
 * Utility functions for the simulation
 */
class Utils {
  /**
   * Generate a color based on the configuration
   */
  static getColor(index, total) {
    switch (config.particleColorMode) {
      case 'solid':
        return color(
          config.particleColor[0], 
          config.particleColor[1], 
          config.particleColor[2], 
          config.particleOpacity
        );
      
      case 'rainbow':
        // Distribute colors across hue spectrum
        return color(
          (index * 360 / total) % 360, 
          100, 
          100, 
          config.particleOpacity
        );
      
      case 'gradient':
        // Create gradient based on position
        const hue = map(index, 0, total, 0, 360);
        return color(
          hue, 
          80, 
          100, 
          config.particleOpacity
        );
      
      default:
        return color(255, 255, 255, config.particleOpacity);
    }
  }
  
  /**
   * Calculate distance between two points
   */
  static distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
  
  /**
   * Map a value from one range to another (like p5's map function)
   */
  static map(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
  }
  
  /**
   * Create Perlin noise value
   */
  static noise(x, y, z) {
    // This is a simplified implementation, as p5.js already has noise()
    return noise(x, y, z);
  }
  
  /**
   * Generate a random size based on configuration
   */
  static getRandomSize() {
    if (config.particleSizeVariation) {
      return random(config.particleMinSize, config.particleMaxSize);
    }
    return config.particleSize;
  }
  
  /**
   * Convert degrees to radians
   */
  static radians(degrees) {
    return degrees * Math.PI / 180;
  }
  
  /**
   * Convert radians to degrees
   */
  static degrees(radians) {
    return radians * 180 / Math.PI;
  }
  
  /**
   * Check if a point is within the canvas bounds
   */
  static isInBounds(x, y, padding = 0) {
    return x >= padding && x <= config.width - padding && 
           y >= padding && y <= config.height - padding;
  }
  
  /**
   * Constrain a value between min and max
   */
  static constrain(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
}