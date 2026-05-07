import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  DarkMode,
  LightMode,
  Menu as MenuIcon,
  AutoAwesome,
} from "@mui/icons-material";
import { useThemeMode } from "../context/ThemeContext";
import { useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "About", href: "#about" },
  ];

  const handleNavClick = (href) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
    setDrawerOpen(false);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        background:
          mode === "dark"
            ? "rgba(15,15,35,0.85)"
            : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
      elevation={0}
    >
      <Toolbar sx={{ maxWidth: 1280, width: "100%", mx: "auto", px: { xs: 2, md: 4 } }}>
        {/* Logo */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", mr: 4 }}
          onClick={() => navigate("/")}
        >
          <AutoAwesome sx={{ color: "primary.main", fontSize: 28 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            InsightDocs AI
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Desktop nav */}
        {!isMobile && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {navLinks.map((l) => (
              <Button
                key={l.label}
                onClick={() => handleNavClick(l.href)}
                sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
              >
                {l.label}
              </Button>
            ))}
            <IconButton onClick={toggleTheme} sx={{ ml: 1 }}>
              {mode === "dark" ? (
                <LightMode sx={{ color: "#FCD34D" }} />
              ) : (
                <DarkMode sx={{ color: "#64748B" }} />
              )}
            </IconButton>
            <Button variant="outlined" onClick={() => navigate("/login")} sx={{ ml: 1 }}>
              Login
            </Button>
            <Button variant="contained" onClick={() => navigate("/signup")}>
              Sign Up
            </Button>
          </Box>
        )}

        {/* Mobile menu */}
        {isMobile && (
          <>
            <IconButton onClick={toggleTheme}>
              {mode === "dark" ? (
                <LightMode sx={{ color: "#FCD34D" }} />
              ) : (
                <DarkMode sx={{ color: "#64748B" }} />
              )}
            </IconButton>
            <IconButton onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <Box sx={{ width: 260, pt: 2 }}>
                <List>
                  {navLinks.map((l) => (
                    <ListItem key={l.label} onClick={() => handleNavClick(l.href)} sx={{ cursor: "pointer" }}>
                      <ListItemText primary={l.label} />
                    </ListItem>
                  ))}
                  <ListItem onClick={() => { navigate("/login"); setDrawerOpen(false); }} sx={{ cursor: "pointer" }}>
                    <ListItemText primary="Login" />
                  </ListItem>
                  <ListItem onClick={() => { navigate("/signup"); setDrawerOpen(false); }} sx={{ cursor: "pointer" }}>
                    <ListItemText primary="Sign Up" />
                  </ListItem>
                </List>
              </Box>
            </Drawer>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
