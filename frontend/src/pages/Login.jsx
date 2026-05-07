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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  AutoAwesome,
  DarkMode,
  LightMode,
  LockReset,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";
import API from "../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  // Forgot password state
  const [fpOpen, setFpOpen] = useState(false);
  const [fpStep, setFpStep] = useState(1); // 1 = enter email, 2 = enter new password
  const [fpEmail, setFpEmail] = useState("");
  const [fpNewPw, setFpNewPw] = useState("");
  const [fpConfirmPw, setFpConfirmPw] = useState("");
  const [fpShowPw, setFpShowPw] = useState(false);
  const [fpError, setFpError] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  // Forgot password handlers
  const handleFpOpen = () => {
    setFpOpen(true);
    setFpStep(1);
    setFpEmail("");
    setFpNewPw("");
    setFpConfirmPw("");
    setFpError("");
    setFpShowPw(false);
  };

  const handleFpClose = () => {
    setFpOpen(false);
    setFpError("");
  };

  const handleFpNext = () => {
    setFpError("");
    if (!fpEmail || !fpEmail.includes("@")) {
      setFpError("Please enter a valid email address");
      return;
    }
    setFpStep(2);
  };

  const handleFpReset = async () => {
    setFpError("");
    if (!fpNewPw || fpNewPw.length < 6) {
      setFpError("Password must be at least 6 characters");
      return;
    }
    if (fpNewPw !== fpConfirmPw) {
      setFpError("Passwords do not match");
      return;
    }

    setFpLoading(true);
    try {
      const { data } = await API.post("/api/auth/forgot-password", {
        email: fpEmail,
        new_password: fpNewPw,
      });
      setFpOpen(false);
      setSnack({ open: true, message: data.message, severity: "success" });
      // Pre-fill email on login form
      setForm((prev) => ({ ...prev, email: fpEmail }));
    } catch (err) {
      setFpError(err.response?.data?.detail || "Password reset failed");
    } finally {
      setFpLoading(false);
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
          ? "radial-gradient(ellipse at top, rgba(124,58,237,0.1) 0%, #0F0F23 60%)"
          : "radial-gradient(ellipse at top, rgba(124,58,237,0.06) 0%, #F8FAFC 60%)",
      }}
    >
      {/* Theme toggle */}
      <IconButton
        onClick={toggleTheme}
        sx={{ position: "absolute", top: 20, right: 20 }}
      >
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
          {/* Logo */}
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
            Welcome back
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
            Sign in to access your dashboard
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
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
              sx={{ mb: 1.5 }}
              autoComplete="current-password"
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

            {/* Forgot Password Link */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
              <Typography
                variant="body2"
                onClick={handleFpOpen}
                sx={{
                  color: "primary.main",
                  fontWeight: 600,
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Forgot password?
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
                "&:hover": { background: "linear-gradient(135deg, #6D28D9 0%, #4C1D95 100%)" },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 3, textAlign: "center", color: "text.secondary" }}>
            Don't have an account?{" "}
            <Typography
              component={RouterLink}
              to="/signup"
              variant="body2"
              sx={{ color: "primary.main", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}
            >
              Sign up
            </Typography>
          </Typography>
        </CardContent>
      </Card>

      {/* ─── Forgot Password Dialog ─── */}
      <Dialog
        open={fpOpen}
        onClose={handleFpClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: isDark ? "#1A1A2E" : "#FFF",
            border: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isDark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.08)",
                color: "primary.main",
              }}
            >
              <LockReset />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Reset Password
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {fpStep === 1
                  ? "Enter your registered email address"
                  : "Set your new password"}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {fpError && (
            <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setFpError("")}>
              {fpError}
            </Alert>
          )}

          {fpStep === 1 ? (
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              value={fpEmail}
              onChange={(e) => setFpEmail(e.target.value)}
              autoFocus
              sx={{ mt: 1 }}
              autoComplete="email"
            />
          ) : (
            <>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={fpEmail}
                disabled
                sx={{ mt: 1, mb: 2.5 }}
              />
              <TextField
                label="New Password"
                type={fpShowPw ? "text" : "password"}
                fullWidth
                value={fpNewPw}
                onChange={(e) => setFpNewPw(e.target.value)}
                autoFocus
                sx={{ mb: 2.5 }}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setFpShowPw(!fpShowPw)} edge="end" size="small">
                        {fpShowPw ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Confirm New Password"
                type={fpShowPw ? "text" : "password"}
                fullWidth
                value={fpConfirmPw}
                onChange={(e) => setFpConfirmPw(e.target.value)}
                autoComplete="new-password"
              />
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button onClick={handleFpClose} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          {fpStep === 1 ? (
            <Button variant="contained" onClick={handleFpNext}>
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleFpReset}
              disabled={fpLoading}
              sx={{
                background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                "&:hover": { background: "linear-gradient(135deg, #6D28D9, #4C1D95)" },
              }}
            >
              {fpLoading ? <CircularProgress size={22} color="inherit" /> : "Reset Password"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
