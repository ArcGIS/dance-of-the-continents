/**
 * Shared configuration for the Dance of the Continents project
 * 
 * Centralizes frame-related constants that need to be consistent
 * across different modules.
 */

export const FRAME_CONFIG = {
  // Total number of frames (0000-0170 = 171 frames)
  TOTAL_FRAMES: 171,
  
  // Frame file naming
  FRAME_PATH: '/frames_doc/frame_',
  FRAME_EXTENSION: '.jpg'
};

// CSS selectors (used in main controller)
export const SELECTORS = {
  SIDECAR: "#n-SOFOgt > div",
  TARGET_DOCKED: "#n-SOFOgt > div > div.jsx-2592556314.jsx-1848129036.container",
  IFRAME: "div.jsx-1072141097.iframe-wrapper > iframe"
};

export default { FRAME_CONFIG, SELECTORS };