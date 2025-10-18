export const theme = {
  colors: {
    background: '#000000',
    surface: '#1a1a1a',
    primary: '#00d4ff',
    secondary: '#ffaa00',
    danger: '#ff3b30',
    success: '#34c759',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    border: '#333333',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  fontSize: {
    sm: 14,
    md: 18,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
  buttonHeight: {
    large: 72,
    medium: 56,
    small: 44,
  },
};

export type Theme = typeof theme;
