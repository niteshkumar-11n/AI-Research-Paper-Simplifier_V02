import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { Visibility, VisibilityOff, AutoAwesome, DarkMode, LightMode } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const result = await signup(form.name, form.email, form.password);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        position: "relative",
        background: isDark
          ? "radial-gradient(ellipse at top, rgba(6,182,212,0.08) 0%, #0F0F23 60%)"
          : "radial-gradient(ellipse at top, rgba(6,182,212,0.05) 0%, #F8FAFC 60%)",
      }}
    >
      <IconButton onClick={toggleTheme} sx={{ position: "absolute", top: 20, right: 20 }}>
        {mode === "dark" ? <LightMode sx={{ color: "#FCD34D" }} /> : <DarkMode sx={{ color: "#64748B" }} />}
      </IconButton>

      <Card
        sx={{
          maxWidth: 440,
          width: "100%",
          border: `1px solid ${theme.palette.divider}`,
          background: isDark ? "rgba(26,26,46,0.8)" : "rgba(255,255,255,0.9)",
          backdropFilter: "blur(20px)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            <AutoAwesome sx={{ color: "primary.main" }} />
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

          <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>
            Create account
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
            Start analyzing documents with AI
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Full Name"
              fullWidth
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              sx={{ mb: 2.5 }}
              autoComplete="name"
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              sx={{ mb: 2.5 }}
              autoComplete="email"
            />
            <TextField
              label="Password"
              type={showPw ? "text" : "password"}
              fullWidth
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              sx={{ mb: 2.5 }}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPw(!showPw)} edge="end" size="small">
                      {showPw ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm Password"
              type={showPw ? "text" : "password"}
              fullWidth
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              sx={{ mb: 3.5 }}
              autoComplete="new-password"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                background: "linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)",
                "&:hover": { background: "linear-gradient(135deg, #6D28D9 0%, #0891B2 100%)" },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 3, textAlign: "center", color: "text.secondary" }}>
            Already have an account?{" "}
            <Typography
              component={RouterLink}
              to="/login"
              variant="body2"
              sx={{ color: "primary.main", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}
            >
              Sign in
            </Typography>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
