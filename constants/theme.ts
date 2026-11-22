export type ThemeMode = 'light' | 'dark' | 'automatic';

export type AppTheme = {
  colors: {
    primary: string;
    primaryLight: string;
    accent: string;
    cyan: string;
    background: string;
    surface: string;
    elevated: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    inputText: string;
    placeholder: string;
  };
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  shadow: typeof shadow;
};

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  screenTop: 24,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 21, fontWeight: '600' as const },
  cardTitle: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '500' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
};

export const shadow = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
};

const lightColors = {
  primary: '#1D4ED8',
  primaryLight: '#2563EB',
  accent: '#7C3AED',
  cyan: '#06B6D4',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  elevated: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#15803D',
  warning: '#D97706',
  error: '#DC2626',
  info: '#2563EB',
  inputText: '#0F172A',
  placeholder: '#94A3B8',
};

const darkColors = {
  primary: '#60A5FA',
  primaryLight: '#60A5FA',
  accent: '#A78BFA',
  cyan: '#22D3EE',
  background: '#090D18',
  surface: '#151D2E',
  elevated: '#1B263B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#263449',
  success: '#22C55E',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  inputText: '#F1F5F9',
  placeholder: '#64748B',
};

export const theme: AppTheme = {
  colors: { ...lightColors },
  spacing,
  radii,
  typography,
  shadow,
};

export function applyTheme(mode: 'light' | 'dark') {
  const colors = mode === 'dark' ? darkColors : lightColors;
  Object.assign(theme.colors, colors);
}
