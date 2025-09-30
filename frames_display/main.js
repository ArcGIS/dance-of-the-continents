import './style.css'
import { ImageSequenceController } from './ImageSequenceController.js';

// Global controller reference so message listener can access it
let controller = null;

function setupMessageListener() {
    window.addEventListener("message", (event) => {
        // Basic validation
        if (!event.data || event.data.source !== "storymap-controller") return;
        
        const scrollData = event.data.payload;
        
        // Check if payload is a valid number
        if (typeof scrollData !== 'number' || scrollData < 0 || scrollData > 100) {
            console.warn(`Invalid scroll data received: ${scrollData}`);
            return;
        }
        
        console.log(`Received scroll percentage: ${scrollData}%`);
        
        // Now we can use the controller!
        if (controller) {
            controller.goToProgress(scrollData / 100); // Convert percentage to 0-1
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

