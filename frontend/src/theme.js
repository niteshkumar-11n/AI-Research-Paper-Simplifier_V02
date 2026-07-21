import { createTheme } from "@mui/material/styles";

/**
 * Build a MUI theme for InsightDocs AI.
 * @param {"light"|"dark"} mode
 */
export const buildTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === "dark"
        ? {
            primary: { main: "#7C3AED", light: "#A78BFA", dark: "#5B21B6" },
            secondary: { main: "#06B6D4", light: "#22D3EE", dark: "#0891B2" },
            background: { default: "#0F0F23", paper: "#1A1A2E" },
            text: { primary: "#E2E8F0", secondary: "#94A3B8" },
            divider: "rgba(148,163,184,0.12)",
          }
        : {
            primary: { main: "#7C3AED", light: "#A78BFA", dark: "#5B21B6" },
            secondary: { main: "#06B6D4", light: "#22D3EE", dark: "#0891B2" },
            background: { default: "#F8FAFC", paper: "#FFFFFF" },
            text: { primary: "#1E293B", secondary: "#64748B" },
            divider: "rgba(0,0,0,0.08)",
          }),
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      h1: { fontWeight: 800, letterSpacing: "-0.02em" },
      h2: { fontWeight: 700, letterSpacing: "-0.01em" },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: "10px 24px",
            fontSize: "0.938rem",
          },
          contained: {
            boxShadow: "0 4px 14px rgba(124,58,237,0.25)",
            "&:hover": { boxShadow: "0 6px 20px rgba(124,58,237,0.35)" },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: { borderRight: "none" },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
        },
      },
    },
  });
