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

import './style.css';
import { FRAME_CONFIG, SELECTORS } from '../shared/config.js';

const selectorSidecar = SELECTORS.SIDECAR;
const selectorTargetDocked = SELECTORS.TARGET_DOCKED;
const selectorIframe = SELECTORS.IFRAME;

// --- shared state ---
let isDocked = false;
let dockStartScroll = null;
let lastScrollY = window.scrollY;
let scrollDirection = 'down';  // or 'up';

// --- utility: wait for element to appear ---
function waitForElement(selector, callback) {
  const interval = setInterval(
		() => {
			const element = document.querySelector(selector);
			if (element) {
				clearInterval(interval);
				callback(element);
			}
	  }, 
		100
	);
}

const setupDockingObserver = ()=>
{
  console.log("Setting up docking observer...");
	waitForElement(
		selectorTargetDocked, 
		(target) => {

      console.log("docking target found:", target);

			const observer = new MutationObserver(
				() => {
					
					const currentlyDocked = target.classList.contains('docked');

					if (currentlyDocked && !isDocked) {

						isDocked = true;
						const currentScroll = window.scrollY;
						console.log(currentScroll, scrollDirection);

						if (scrollDirection === 'down') {
							dockStartScroll = currentScroll;
						}					
						
						console.log('Docked: Starting scroll tracking at', dockStartScroll);

					}

					if (!currentlyDocked && isDocked) {
						isDocked = false;
					}
				}
			);

			observer.observe(target, { attributes: true, attributeFilter: ['class'] });

			console.log("Docking observer attached.");
		}
	);

}

const setupScrollListener = ()=> {
  window.addEventListener(
    'scroll', 
    () => {

			const currentScroll = window.scrollY;

			scrollDirection = currentScroll > lastScrollY ? 'down' :
												currentScroll < lastScrollY ? 'up' :
												scrollDirection;

			lastScrollY = currentScroll;

      if (!isDocked || dockStartScroll === null) return;

			const elementSidecar = document.querySelector(selectorSidecar);
			const sideCarHeight = elementSidecar.clientHeight;
			const sideCarTop = elementSidecar.offsetTop;
			const scrollTop = window.scrollY;
			
			// Account for viewport height - when bottom of sidecar reaches top of viewport, we're at 100%
			const availableScrollDistance = sideCarHeight - window.innerHeight;
			const scrollProgress = (scrollTop - sideCarTop) / availableScrollDistance;
      
			const growthMultiplier = 1; // adjust as you like
			const adjustedProgress = Math.min(scrollProgress*growthMultiplier, 1);

      
      const iframe = document.querySelector(selectorIframe);

      if (!iframe || !iframe.contentWindow) return;

      // Calculate frame index
      const frameIndex = Math.floor(adjustedProgress * (FRAME_CONFIG.TOTAL_FRAMES - 1)) + 1;

      iframe.contentWindow.postMessage(
        {
          source: 'storymap-controller',
          payload: frameIndex
        },
        '*'
      );

		}
  );  
}


// --- main logic ---


function initialize() {
  setupDockingObserver();
  setupScrollListener();
}

initialize();

