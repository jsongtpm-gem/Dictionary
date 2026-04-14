// Design system inspired by Ocean Depths + Modern Minimalist themes
// from the canvas-design / theme-factory skills

export const Fonts = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
};

export const Colors = {
  // Backgrounds
  bg: '#F8F8F6',        // warm off-white — premium paper
  surface: '#FFFFFF',
  surfaceAlt: '#F2F2EF',

  // Primary — Ocean Depths navy
  primary: '#1A2332',
  primaryMid: '#2D4A6B',

  // Accent — teal
  accent: '#2D8B8B',
  accentSoft: '#E4F2F2',
  accentLight: '#A8DADC',

  // Text
  textPrimary: '#1C1C1E',
  textSecondary: '#708090',
  textTertiary: '#A0A8B0',
  textInverse: '#FAFAF8',

  // Borders
  border: '#E5E5E0',
  borderMid: '#D0D0CA',

  // Status
  success: '#2D6A4F',
  successSoft: '#D8F0E6',
  error: '#C0392B',
  errorSoft: '#FDECEA',
};

export const Typography = {
  // Sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 26,
  xxl: 36,
  hero: 52,

  // Weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '800' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: '#1A2332',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A2332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#1A2332',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
};
