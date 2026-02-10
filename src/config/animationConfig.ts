/**
 * Animation configuration for the blog
 *
 * This file contains all animation-related settings used throughout the application.
 * Values here control CSS custom properties defined in src/styles/index.css (:root).
 */

export interface AnimationConfig {
  /** Delay in milliseconds between sequential list item animations */
  readonly SEQUENTIAL_DELAY_MS: number;
  /** Animation duration in seconds (controls CSS var --animation-duration) */
  readonly ANIMATION_DURATION_S: number;
  /** Initial Y-axis offset in pixels for fade-in animation (controls CSS var --animation-offset) */
  readonly ANIMATION_OFFSET_PX: number;
}

/**
 * Animation configuration constants
 *
 * To customize animation behavior:
 * - Modify the constants below to change animation settings
 * - CSS variables in src/styles/index.css will use these values
 * - SEQUENTIAL_DELAY_MS: directly used in Index.tsx
 * - ANIMATION_DURATION_S & ANIMATION_OFFSET_PX: control CSS variables
 */
export const animationConfig: AnimationConfig = {
  /** Delay between each list item appearing (milliseconds) */
  SEQUENTIAL_DELAY_MS: 100,

  /** Animation duration in seconds - sets CSS variable --animation-duration */
  ANIMATION_DURATION_S: 0.6,

  /** Y-axis translation offset (pixels) for fade-in effect - sets CSS variable --animation-offset */
  ANIMATION_OFFSET_PX: 20,
} as const;

/** Export individual constants for convenient imports */
export const { SEQUENTIAL_DELAY_MS, ANIMATION_DURATION_S, ANIMATION_OFFSET_PX } = animationConfig;
