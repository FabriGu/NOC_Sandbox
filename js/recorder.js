/**
 * Recording system to capture frames at a consistent rate
 * regardless of simulation performance
 */
class Recorder {
  constructor() {
    this.isRecording = false;
    this.frames = [];
    this.capturer = null;
    this.recordedFrameCount = 0;
    this.totalFramesToRecord = 0;
    this.recordingStartTime = 0;
    this.lastCaptureTime = 0;
    this.frameDuration = 0;
    this.format = 'gif';
    this.quality = 1;
    this.captureCanvas = null;
  }
  
  setup() {
    // Create a capture canvas that we'll use for recording
    this.captureCanvas = createGraphics(config.width, config.height);
  }
  
  startRecording() {
    if (this.isRecording) return;
    
    this.isRecording = true;
    this.recordedFrameCount = 0;
    this.recordingStartTime = millis();
    this.frameDuration = 1000 / config.recordingFPS;
    this.totalFramesToRecord = config.recordingDuration * config.recordingFPS;
    this.lastCaptureTime = this.recordingStartTime;
    this.frames = [];
    
    // Set format and quality based on config
    this.format = config.recordingFormat;
    
    switch (config.recordingQuality) {
      case 'low': this.quality = 0.5; break;
      case 'medium': this.quality = 0.8; break;
      case 'high': this.quality = 1.0; break;
      default: this.quality = 0.8;
    }
    
    console.log(`Started recording: ${this.totalFramesToRecord} frames at ${config.recordingFPS} FPS`);
  }
  
  update() {
    if (!this.isRecording) return;
    
    const currentTime = millis();
    const elapsedTime = currentTime - this.lastCaptureTime;
    
    // If it's time to capture a frame
    if (elapsedTime >= this.frameDuration) {
      // Copy the main canvas to the capture canvas
      this.captureCanvas.image(canvas, 0, 0);
      
      // Add frame data (base64 image)
      this.frames.push(this.captureCanvas.canvas.toDataURL('image/png'));
      this.recordedFrameCount++;
      this.lastCaptureTime = currentTime;
      
      // Show recording feedback
      push();
      fill(255, 0, 0);
      noStroke();
      ellipse(20, 20, 10, 10);
      fill(255);
      text(`Recording: ${Math.floor(this.recordedFrameCount / this.totalFramesToRecord * 100)}%`, 35, 25);
      pop();
      
      // Check if we've recorded enough frames
      if (this.recordedFrameCount >= this.totalFramesToRecord) {
        this.finishRecording();
      }
    }
  }
  
  finishRecording() {
    if (!this.isRecording) return;
    
    console.log(`Finished recording ${this.recordedFrameCount} frames.`);
    this.isRecording = false;
    
    // We have all the frames, now create and download the file
    this.saveRecording();
  }
  
  saveRecording() {
    console.log("Processing recording...");
    
    // Create a filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `brainrot_${timestamp}`;
    
    if (this.format === 'gif') {
      this.saveAsGif(filename);
    } else {
      // For formats that p5.js doesn't natively support, we'll 
      // give instructions or could integrate with external libraries
      alert(`Recording complete! ${this.recordedFrameCount} frames captured.\n\nTo save as ${this.format}, you would need an additional library like CCapture.js or MediaRecorder API.`);
    }
  }
  
  saveAsGif(filename) {
    // Create a hidden gif.js worker (you'd need to include gif.js in your project)
    // This is a simplified example - a real implementation would use a library
    console.log("Converting frames to GIF...");
    
    // Instead of a real GIF encoding, we'll provide a data URL of the first frame
    // for demonstration purposes
    if (this.frames.length > 0) {
      const link = document.createElement('a');
      link.href = this.frames[0]; // In a real implementation, this would be the GIF
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Download initiated. In a real implementation, this would be a GIF of ${this.frames.length} frames.`);
      
      // Clear frames to free memory
      this.frames = [];
    }
  }
}

let recorder = new Recorder();