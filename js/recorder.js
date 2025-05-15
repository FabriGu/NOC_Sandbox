/**
 * Recording system using CCapture.js
 */
class Recorder {
  constructor() {
    this.isRecording = false;
    this.capturer = null;
    this.recordedFrameCount = 0;
    this.totalFramesToRecord = 0;
  }
  
  setup() {
    console.log("Recorder setup complete. Use Start Recording to begin.");
  }
  
  startRecording() {
    if (this.isRecording) return;
    
    // Create options based on config
    const options = {
      framerate: config.recordingFPS,
      format: config.recordingFormat,
      name: "brainrot_" + new Date().toISOString().replace(/[:.]/g, '-'),
      verbose: false,
      display: true,
      motionBlurFrames: 1  // No motion blur by default
    };
    
    // Format-specific options
    switch (config.recordingFormat) {
      case 'gif':
        // Adjust quality based on settings
        switch (config.recordingQuality) {
          case 'low':
            options.quality = 10;
            options.workers = 2;
            break;
          case 'medium':
            options.quality = 5;
            options.workers = 4;
            break;
          case 'high':
            options.quality = 1;
            options.workers = 8;
            break;
        }
        // Set path to gif worker
        options.workersPath = 'node_modules/ccapture.js/build/';
        break;
        
      case 'webm':
        // Set WebM quality
        switch (config.recordingQuality) {
          case 'low': 
            options.quality = 0.6; 
            break;
          case 'medium': 
            options.quality = 0.8; 
            break;
          case 'high': 
            options.quality = 0.95; 
            break;
        }
        break;
        
      case 'png':
      case 'jpg':
        // These formats don't need special options
        break;
    }
    
    // Auto-save for long recordings (prevents browser issues with large files)
    if (config.recordingDuration > 20) {
      options.autoSaveTime = 30; // Save every 30 seconds for long recordings
    }
    
    // Calculate total frames to record
    this.totalFramesToRecord = config.recordingDuration * config.recordingFPS;
    
    try {
      // Create and start the capturer
      this.capturer = new CCapture(options);
      this.capturer.start();
      this.isRecording = true;
      this.recordedFrameCount = 0;
      
      console.log(`Started recording ${this.totalFramesToRecord} frames at ${config.recordingFPS} FPS in ${config.recordingFormat} format`);
    } catch (e) {
      console.error("Error starting CCapture:", e);
      alert("There was an error starting the recording. Check the console for details.");
    }
  }
  
  update() {
    if (!this.isRecording || !this.capturer) return;
    
    try {
      // Capture the current frame from the canvas
      this.capturer.capture(drawingContext.canvas);
      this.recordedFrameCount++;
      
      // Display recording indicator if not using CCapture's built-in display
      if (!this.capturer.settings.display) {
        push();
        fill(255, 0, 0);
        noStroke();
        ellipse(20, 20, 10, 10);
        fill(255);
        const percentage = Math.floor(this.recordedFrameCount / this.totalFramesToRecord * 100);
        text(`Recording: ${percentage}% (${this.recordedFrameCount}/${this.totalFramesToRecord})`, 35, 25);
        pop();
      }
      
      // Check if we've recorded enough frames
      if (this.recordedFrameCount >= this.totalFramesToRecord) {
        this.finishRecording();
      }
    } catch (e) {
      console.error("Error during frame capture:", e);
      this.cancelRecording();
    }
  }
  
  finishRecording() {
    if (!this.isRecording || !this.capturer) return;
    
    console.log(`Finishing recording after ${this.recordedFrameCount} frames.`);
    
    // Show processing message
    push();
    fill(0, 0, 0, 200);
    rect(width/2 - 150, height/2 - 50, 300, 100);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(16);
    text("Processing recording...", width/2, height/2 - 15);
    text("This may take a moment.", width/2, height/2 + 15);
    pop();
    
    // Process on next frame to ensure UI message is shown
    setTimeout(() => {
      try {
        this.capturer.stop();
        this.capturer.save();
        this.isRecording = false;
        this.capturer = null;
        
        // Update UI button
        const recordBtn = document.getElementById('record-btn');
        if (recordBtn) {
          recordBtn.textContent = 'Start Recording';
        }
      } catch (e) {
        console.error("Error finishing recording:", e);
        alert("There was an error processing the recording. Check the console for details.");
      }
    }, 100);
  }
  
  cancelRecording() {
    if (!this.isRecording || !this.capturer) return;
    
    console.log("Recording canceled");
    
    try {
      this.capturer.stop();
    } catch (e) {
      console.error("Error stopping recording:", e);
    }
    
    this.isRecording = false;
    this.capturer = null;
    
    // Update UI button
    const recordBtn = document.getElementById('record-btn');
    if (recordBtn) {
      recordBtn.textContent = 'Start Recording';
    }
  }
}

let recorder = new Recorder();