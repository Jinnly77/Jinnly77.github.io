/**
 * Animation configuration for the blog
 * 
 * This file contains all animation-related settings used throughout the application.
 * Values marked as "for reference" are documented here for consistency but remain
 * hardcoded in CSS files (see src/styles/index.css).
 */

export interface AnimationConfig {
  /** Delay in milliseconds between sequential list item animations */
  readonly SEQUENTIAL_DELAY_MS: number;
  /** Animation duration in seconds (for reference only, defined in CSS) */
  readonly ANIMATION_DURATION_S: number;
  /** Initial Y-axis offset in pixels for fade-in animation (for reference only, defined in CSS) */
  readonly ANIMATION_OFFSET_PX: number;
}

/**
 * Animation configuration constants
 * 
 * To customize animation behavior:
 * - For JavaScript-controlled values: modify the constants below
 * - For CSS-controlled values: edit src/styles/index.css and keep this file updated
 */
export const animationConfig: AnimationConfig = {
  /** Delay between each list item appearing (milliseconds) */
  SEQUENTIAL_DELAY_MS: 150,

  /** Animation duration in seconds - defined in src/styles/index.css line 761 */
  ANIMATION_DURATION_S: 0.6,

  /** Y-axis translation offset (pixels) for fade-in effect - defined in src/styles/index.css line 760 */
  ANIMATION_OFFSET_PX: 30,
} as const;

/** Export individual constants for convenient imports */
export const { SEQUENTIAL_DELAY_MS, ANIMATION_DURATION_S, ANIMATION_OFFSET_PX } = animationConfig;
