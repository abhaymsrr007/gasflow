
export const theme = {
  colors: {
    primary: "#2563EB",
    primaryDark: "#1D4ED8",

    background: "#F8FAFC",
    surface: "#FFFFFF",

    textPrimary: "#1E293B",
    textSecondary: "#64748B",

    border: "#E2E8F0",
    success: "#16A34A",
    danger: "#DC2626",
    warning: "#D97706",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  radius: {
    sm: 6,
    md: 12,
    lg: 16,
    full: 999,
  },

  typography: {
    small: 12,
    body: 14,
    subtitle: 18,
    title: 24,
    heading: 32,
  },
} as const;
