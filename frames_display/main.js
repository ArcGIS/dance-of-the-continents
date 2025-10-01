import './style.css'
import { ImageSequenceController } from './ImageSequenceController.js';

// Global controller reference so message listener can access it
let controller = null;

function setupMessageListener() {
    window.addEventListener("message", (event) => {
        // Basic validation
        if (!event.data || event.data.source !== "storymap-controller") return;
        
        const frameIndex = event.data.payload;
        
        // Check if payload is a valid frame number
        if (typeof frameIndex !== 'number' || frameIndex < 1 || frameIndex > 120) {
            console.warn(`Invalid frame index received: ${frameIndex}`);
            return;
        }
        
        console.log(`Received frame index: ${frameIndex}`);
        
        // Now we can use the controller!
        if (controller) {
            controller.goToFrame(frameIndex);
        }
    });
}

function initialize() {
    setupMessageListener();

    // Create scroll-driven sequence
    const config = {
      totalFrames: 120,
      framePath: '/frames_doc/frame_',
      frameExtension: '.jpg',
      triggerElement: document.getElementById('sequence-trigger'),
      imageElement: document.getElementById('sequence-image'),
      debugMode: false,
      preloadStrategy: 'progressive'
    };

    // Create the core controller and assign to global variable
    controller = new ImageSequenceController(config);

    // Listen to controller frame changes
    controller.on('onFrameChange', (data) => {
      // Update the image when frame changes
      const imageElement = document.getElementById('sequence-image');
      if (imageElement) {
        imageElement.src = data.imageSrc;
      }
      
      console.log(`Scroll → Frame ${data.currentFrame} (${(data.progress * 100).toFixed(1)}%)`);
    });

}

initialize();

