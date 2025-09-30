import './style.css';

const selectorSidecar = "#n-SOFOgt > div";
const selectorTargetDocked = "#n-SOFOgt > div > div.jsx-2592556314.jsx-1848129036.container";
const selectorIframe = "div.jsx-1072141097.iframe-wrapper > iframe";

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
			const scrollProgress = (scrollTop - sideCarTop) / sideCarHeight;
      
			const growthMultiplier = 1; // adjust as you like
			const adjustedProgress = Math.min(scrollProgress*growthMultiplier, 1);
      

      const iframe = document.querySelector(selectorIframe);

      if (!iframe || !iframe.contentWindow) return;

      iframe.contentWindow.postMessage(
        {
          source: 'storymap-controller',
          payload: adjustedProgress*100
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

