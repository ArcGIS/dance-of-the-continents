/**
 * Shared configuration for the Dance of the Continents project
 * 
 * Centralizes frame-related constants that need to be consistent
 * across different modules.
 */

export const FRAME_CONFIG = {
  // Total number of frames (0000-0207 = 208 frames)
  TOTAL_FRAMES: 208,
  
  // Frame file naming - ensure absolute path from site root
  FRAME_PATH: (import.meta.env.BASE_URL + 'frames/').replace(/([^:]\/)\/+/g, '$1'),
  FRAME_EXTENSION: '.jpg'
};

// CSS selectors (used in main controller)
export const SELECTORS = {
  SIDECAR: "#n-SOFOgt > div",
  TARGET_DOCKED: "#n-SOFOgt > div > div.container",
  IFRAME: "div.iframe-wrapper > iframe"
};

export default { FRAME_CONFIG, SELECTORS };