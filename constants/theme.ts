// Niyet Design System — "Nur ile İlerleme" + "Sükûnet İçinde Huzur"

export const colors = {
  // Core palette
  emerald: '#0F3D2E',
  emeraldDeep: '#0A2B20',
  emeraldSoft: '#285943',
  gold: '#C9A24B',
  goldBright: '#E8C97A',
  goldSoft: '#F2E2B8',
  cream: '#FBF6EA',
  creamDeep: '#F3EBD6',
  ivory: '#FFFDF7',

  // Neutrals
  ink: '#1C2620',
  inkSoft: '#4A5750',
  mist: '#8A9A91',
  hairline: 'rgba(28, 38, 32, 0.08)',
  hairlineOnDark: 'rgba(251, 246, 234, 0.14)',

  // Semantic
  success: '#3E7A5B',
  warning: '#C97B3A',
  danger: '#B4463E',

  // Surfaces
  surfaceLight: '#FFFDF7',
  surfaceDark: '#0F3D2E',
} as const;

export const gradients = {
  garden: ['#0A2B20', '#0F3D2E', '#285943'] as const,
  gold: ['#E8C97A', '#C9A24B'] as const,
  dawn: ['#FBF6EA', '#F2E2B8'] as const,
  nur: ['#FFF6DC', '#E8C97A', '#C9A24B'] as const,
  duskVeil: ['rgba(15,61,46,0)', 'rgba(10,43,32,0.92)'] as const,
};

export const fonts = {
  serif: 'SourceSerif4_600SemiBold',
  serifRegular: 'SourceSerif4_400Regular',
  serifItalic: 'SourceSerif4_400Regular_Italic',
  sans: 'Manrope_400Regular',
  sansMedium: 'Manrope_500Medium',
  sansSemiBold: 'Manrope_600SemiBold',
  sansBold: 'Manrope_700Bold',
  sansExtraBold: 'Manrope_800ExtraBold',
};

export const type = {
  display: { fontFamily: fonts.serif, fontSize: 32, lineHeight: 39 },
  h1: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 33 },
  h2: { fontFamily: fonts.serif, fontSize: 21, lineHeight: 27 },
  h3: { fontFamily: fonts.sansBold, fontSize: 17, lineHeight: 23 },
  bodyLarge: { fontFamily: fonts.sans, fontSize: 17, lineHeight: 25 },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: fonts.sansMedium, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 18 },
  overline: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.4,
  },
  numeric: { fontFamily: fonts.serif, fontSize: 64, lineHeight: 70 },
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const shadow = {
  soft: {
    shadowColor: '#0F3D2E',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  glow: {
    shadowColor: '#C9A24B',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
};
