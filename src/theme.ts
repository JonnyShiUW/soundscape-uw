export const theme = {
  colors: {
    background: '#ffffff',
    backgroundSecondary: '#fafafa',
    surface: '#ffffff',
    surfaceElevated: '#f7f7f7',
    primary: '#000000',
    secondary: '#6b6b6b',
    danger: '#eb5757',
    success: '#27ae60',
    text: '#000000',
    textSecondary: '#6b6b6b',
    textTertiary: '#9b9b9b',
    border: '#e0e0e0',
    borderLight: '#f0f0f0',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    full: 9999,
  },
  buttonHeight: {
    large: 56,
    medium: 48,
    small: 40,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export type Theme = typeof theme;
