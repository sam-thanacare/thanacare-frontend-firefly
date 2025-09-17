/**
 * Thanacare Brand Color Configuration
 * Based on the official brand color palette
 */

export const brandColors = {
  // Primary Colors
  traverseMagenta: '#A616BD',
  infinityPink: '#D14398',
  pureWhite: '#FFFFFF',

  // Secondary Colors
  xiketic: '#1E2739',
  spaceBlue: '#415376',
  slate: '#617CAE',
  stone: '#A9B0C2',
} as const;

export const colorPalette = {
  // Primary brand colors
  primary: {
    magenta: brandColors.traverseMagenta,
    pink: brandColors.infinityPink,
    white: brandColors.pureWhite,
  },

  // Secondary brand colors
  secondary: {
    xiketic: brandColors.xiketic,
    spaceBlue: brandColors.spaceBlue,
    slate: brandColors.slate,
    stone: brandColors.stone,
  },

  // Semantic color mappings
  semantic: {
    // Light theme
    light: {
      background: brandColors.pureWhite,
      foreground: brandColors.xiketic,
      primary: brandColors.traverseMagenta,
      secondary: brandColors.stone,
      accent: brandColors.infinityPink,
      muted: '#F8F9FA',
      border: brandColors.stone,
      card: brandColors.pureWhite,
    },

    // Dark theme
    dark: {
      background: brandColors.xiketic,
      foreground: brandColors.pureWhite,
      primary: brandColors.infinityPink,
      secondary: brandColors.spaceBlue,
      accent: brandColors.traverseMagenta,
      muted: '#3A4552',
      border: brandColors.spaceBlue,
      card: '#2A3441',
    },
  },
} as const;

// Tailwind CSS color classes
export const tailwindColors = {
  'traverse-magenta': brandColors.traverseMagenta,
  'infinity-pink': brandColors.infinityPink,
  'pure-white': brandColors.pureWhite,
  xiketic: brandColors.xiketic,
  'space-blue': brandColors.spaceBlue,
  slate: brandColors.slate,
  stone: brandColors.stone,
} as const;

// RGB values for programmatic use
export const colorRGB = {
  traverseMagenta: { r: 166, g: 22, b: 189 },
  infinityPink: { r: 209, g: 67, b: 152 },
  pureWhite: { r: 255, g: 255, b: 255 },
  xiketic: { r: 30, g: 39, b: 57 },
  spaceBlue: { r: 65, g: 83, b: 118 },
  slate: { r: 97, g: 124, b: 174 },
  stone: { r: 169, g: 176, b: 194 },
} as const;

// CMYK values for print/design use
export const colorCMYK = {
  traverseMagenta: { c: 12, m: 88, y: 0, k: 26 },
  infinityPink: { c: 0, m: 68, y: 27, k: 18 },
  pureWhite: { c: 0, m: 0, y: 0, k: 0 },
  xiketic: { c: 47, m: 32, y: 0, k: 78 },
  spaceBlue: { c: 45, m: 30, y: 0, k: 54 },
  slate: { c: 44, m: 29, y: 0, k: 32 },
  stone: { c: 13, m: 9, y: 0, k: 24 },
} as const;

export type BrandColor = keyof typeof brandColors;
export type ColorPalette = typeof colorPalette;
export type TailwindColor = keyof typeof tailwindColors;
