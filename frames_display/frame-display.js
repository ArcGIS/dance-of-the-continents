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

import './style.css'
import { ImageSequenceController } from './ImageSequenceController.js';
import { FRAME_CONFIG } from '../shared/config.js';

// Global controller reference so message listener can access it
let controller = null;

function setupMessageListener() {
    window.addEventListener("message", (event) => {
        // Basic validation
        if (!event.data || event.data.source !== "storymap-controller") return;
        
        const frameIndex = event.data.payload;
        
        // Check if payload is a valid frame number
        if (typeof frameIndex !== 'number' || frameIndex < 1 || frameIndex > FRAME_CONFIG.TOTAL_FRAMES) {
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
      totalFrames: FRAME_CONFIG.TOTAL_FRAMES,
      framePath: FRAME_CONFIG.FRAME_PATH,
      frameExtension: FRAME_CONFIG.FRAME_EXTENSION,
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

    // Initialize display with the first frame
    controller.goToFrame(1);

}

initialize();

