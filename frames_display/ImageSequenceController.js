/*

Copyright 2025 Esri

Licensed under the Apache License Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. 

*/

/**
 * Core image sequence controller - handles frame management without UI concerns
 * 
 * @example
 * const controller = new ImageSequenceController({
 *   totalFrames: 171,
 *   framePath: '/frames/frame_',
 *   frameExtension: '.jpg',
 *   preloadStrategy: 'progressive'
 * });
 * 
 * controller.on('onFrameChange', (data) => {
 *   myImage.src = data.imageSrc;
 * });
 * 
 * controller.goToFrame(84); // Go to frame 84
 * // or controller.goToProgress(0.5); // Alternative: go to middle frame
 */
export class ImageSequenceController {
  constructor(config = {}) {
    // Configuration
    this.totalFrames = config.totalFrames || 171;
    this.framePath = config.framePath || '/frames/frame_';
    this.frameExtension = config.frameExtension || '.jpg';
    this.preloadStrategy = config.preloadStrategy || 'progressive'; // 'none', 'key', 'progressive'
    
    // State
    this.currentFrame = 1;
    this.isPreloading = false;
    this.preloadedImages = new Map();
    this.callbacks = {
      onFrameChange: [],
      onPreloadComplete: [],
      onPreloadProgress: []
    };
    
    // Auto-initialize preloading if strategy is set
    if (this.preloadStrategy !== 'none') {
      this.startPreloading();
    }
  }
  
  /**
   * Register callback functions
   * @param {string} event - Event name ('onFrameChange', 'onPreloadComplete', 'onPreloadProgress')
   * @param {Function} callback - Callback function
   * @returns {ImageSequenceController} - For method chaining
   */
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
    return this; // For chaining
  }
  
  /**
   * Remove callback function
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   * @returns {ImageSequenceController} - For method chaining
   */
  off(event, callback) {
    if (this.callbacks[event]) {
      const index = this.callbacks[event].indexOf(callback);
      if (index > -1) {
        this.callbacks[event].splice(index, 1);
      }
    }
    return this;
  }
  
  /**
   * Trigger callbacks
   * @param {string} event - Event name
   * @param {any} data - Data to pass to callbacks
   */
  emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }
  
  /**
   * Go to a specific frame
   * @param {number} frameNumber - Frame number (1-based)
   * @returns {ImageSequenceController} - For method chaining
   */
  goToFrame(frameNumber) {
    const newFrame = Math.max(1, Math.min(this.totalFrames, Math.floor(frameNumber)));
    
    if (newFrame !== this.currentFrame) {
      const oldFrame = this.currentFrame;
      this.currentFrame = newFrame;
      
      this.emit('onFrameChange', {
        currentFrame: this.currentFrame,
        previousFrame: oldFrame,
        progress: this.getProgress(),
        imageSrc: this.getFrameImageSrc(this.currentFrame)
      });
    }
    
    return this;
  }
  
  /**
   * Go to frame based on progress (0-1)
   * @param {number} progress - Progress value between 0 and 1
   * @returns {ImageSequenceController} - For method chaining
   */
  goToProgress(progress) {
    progress = Math.max(0, Math.min(1, progress));
    const frameNumber = Math.floor(progress * (this.totalFrames - 1)) + 1;
    return this.goToFrame(frameNumber);
  }
  
  /**
   * Navigation methods
   */
  nextFrame() {
    return this.goToFrame(this.currentFrame + 1);
  }
  
  previousFrame() {
    return this.goToFrame(this.currentFrame - 1);
  }
  
  firstFrame() {
    return this.goToFrame(1);
  }
  
  lastFrame() {
    return this.goToFrame(this.totalFrames);
  }
  
  /**
   * Get current progress as 0-1
   * @returns {number} - Progress value between 0 and 1
   */
  getProgress() {
    return (this.currentFrame - 1) / (this.totalFrames - 1);
  }
  
  /**
   * Get current frame info
   * @returns {Object} - Current frame information
   */
  getCurrentInfo() {
    return {
      currentFrame: this.currentFrame,
      totalFrames: this.totalFrames,
      progress: this.getProgress(),
      imageSrc: this.getFrameImageSrc(this.currentFrame),
      isPreloading: this.isPreloading,
      preloadedCount: this.preloadedImages.size
    };
  }
  
  /**
   * Generate frame path
   * @param {number} frameNumber - Frame number (1-based)
   * @returns {string} - Frame file path
   */
  getFramePath(frameNumber) {
    // Convert 1-based frame number to 0-based for file naming
    const fileNumber = frameNumber - 1;
    const paddedNumber = fileNumber.toString().padStart(4, '0');
    return `${this.framePath}${paddedNumber}${this.frameExtension}`;
  }
  
  /**
   * Get image source (preloaded if available, otherwise path)
   * @param {number} frameNumber - Frame number
   * @returns {string} - Image source URL
   */
  getFrameImageSrc(frameNumber) {
    if (this.preloadedImages.has(frameNumber)) {
      return this.preloadedImages.get(frameNumber).src;
    }
    return this.getFramePath(frameNumber);
  }
  
  /**
   * Check if frame is preloaded
   * @param {number} frameNumber - Frame number
   * @returns {boolean} - Whether frame is preloaded
   */
  isFramePreloaded(frameNumber) {
    return this.preloadedImages.has(frameNumber);
  }
  
  /**
   * Get preload statistics
   * @returns {Object} - Preload statistics
   */
  getPreloadStats() {
    return {
      totalFrames: this.totalFrames,
      preloadedCount: this.preloadedImages.size,
      preloadedPercentage: (this.preloadedImages.size / this.totalFrames) * 100,
      isPreloading: this.isPreloading,
      strategy: this.preloadStrategy
    };
  }
  
  /**
   * Start preloading based on strategy
   * @returns {Promise} - Resolves when initial preloading is complete
   */
  startPreloading() {
    if (this.isPreloading) return Promise.resolve();
    
    console.log(`Starting frame preloading (strategy: ${this.preloadStrategy})...`);
    this.isPreloading = true;
    
    if (this.preloadStrategy === 'key') {
      return this.preloadKeyFrames();
    } else if (this.preloadStrategy === 'progressive') {
      return this.preloadKeyFrames().then(() => {
        this.preloadRemainingFrames();
      });
    }
    
    return Promise.resolve();
  }
  
  /**
   * Preload key frames (every 10th frame + first/last)
   * @returns {Promise} - Resolves when key frames are loaded
   */
  preloadKeyFrames() {
    return new Promise((resolve) => {
      const keyFrames = [];
      for (let i = 1; i <= this.totalFrames; i += 10) {
        keyFrames.push(i);
      }
      
      if (!keyFrames.includes(1)) keyFrames.unshift(1);
      if (!keyFrames.includes(this.totalFrames)) keyFrames.push(this.totalFrames);
      
      let loadedCount = 0;
      const totalToPreload = keyFrames.length;
      
      keyFrames.forEach((frameNumber) => {
        const img = new Image();
        img.onload = () => {
          this.preloadedImages.set(frameNumber, img);
          loadedCount++;
          
          this.emit('onPreloadProgress', {
            loaded: loadedCount,
            total: this.totalFrames,
            phase: 'key-frames',
            percentage: (loadedCount / totalToPreload) * 50 // Key frames = 50% of progress
          });
          
          if (loadedCount === totalToPreload) {
            console.log(`✓ Preloaded ${totalToPreload} key frames`);
            resolve();
          }
        };
        
        img.onerror = () => {
          console.warn(`Failed to preload frame ${frameNumber}`);
          loadedCount++;
          if (loadedCount === totalToPreload) resolve();
        };
        
        img.src = this.getFramePath(frameNumber);
      });
    });
  }
  
  /**
   * Preload remaining frames gradually
   */
  preloadRemainingFrames() {
    let frameIndex = 1;
    let totalLoaded = this.preloadedImages.size;
    
    const loadNextBatch = () => {
      const batchSize = 5;
      let batchCount = 0;
      
      while (frameIndex <= this.totalFrames && batchCount < batchSize) {
        if (!this.preloadedImages.has(frameIndex)) {
          const img = new Image();
          const currentFrame = frameIndex; // Capture for closure
          
          img.onload = () => {
            this.preloadedImages.set(currentFrame, img);
            totalLoaded++;
            
            this.emit('onPreloadProgress', {
              loaded: totalLoaded,
              total: this.totalFrames,
              phase: 'all-frames',
              percentage: 50 + (totalLoaded / this.totalFrames) * 50 // Second 50%
            });
            
            if (totalLoaded === this.totalFrames) {
              console.log(`✓ All ${this.totalFrames} frames preloaded`);
              this.isPreloading = false;
              this.emit('onPreloadComplete', { 
                totalFrames: this.totalFrames,
                preloadedCount: totalLoaded
              });
            }
          };
          
          img.onerror = () => {
            console.warn(`Failed to preload frame ${currentFrame}`);
            totalLoaded++;
          };
          
          img.src = this.getFramePath(currentFrame);
        }
        frameIndex++;
        batchCount++;
      }
      
      if (frameIndex <= this.totalFrames) {
        setTimeout(loadNextBatch, 100);
      }
    };
    
    loadNextBatch();
  }
  
  /**
   * Destroy the controller and clean up resources
   */
  destroy() {
    // Clear all callbacks
    Object.keys(this.callbacks).forEach(event => {
      this.callbacks[event] = [];
    });
    
    // Clear preloaded images
    this.preloadedImages.clear();
    
    // Reset state
    this.isPreloading = false;
    this.currentFrame = 1;
  }
}

export default ImageSequenceController;