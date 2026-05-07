import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Menu as MenuIcon, DarkMode, LightMode } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import UploadCard from "../components/UploadCard";
import ResultPanel from "../components/ResultPanel";
import { useThemeMode } from "../context/ThemeContext";
import API from "../api/axios";

const DRAWER_WIDTH = 300;

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { mode, toggleTheme } = useThemeMode();
  const isDark = theme.palette.mode === "dark";

  // State
  const [history, setHistory] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultLoading, setResultLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  // Fetch history
  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await API.get("/api/history");
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Select a history item
  const handleSelect = async (id) => {
    setSelectedId(id);
    setShowUpload(false);
    setResultLoading(true);
    try {
      const { data } = await API.get(`/api/history/${id}`);
      setSelectedResult(data);
    } catch (err) {
      setSnack({ open: true, message: "Failed to load analysis", severity: "error" });
    } finally {
      setResultLoading(false);
    }
  };

  // New analysis
  const handleNewAnalysis = () => {
    setShowUpload(true);
    setSelectedId(null);
    setSelectedResult(null);
    setFile(null);
  };

  // Analyze file
  const handleAnalyze = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await API.post("/api/upload/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded * 50) / e.total));
        },
      });
      setProgress(100);
      setSelectedResult(data);
      setSelectedId(data.id);
      setShowUpload(false);
      setFile(null);
      setSnack({ open: true, message: "Analysis complete!", severity: "success" });
      fetchHistory();
    } catch (err) {
      const msg = err.response?.data?.detail || "Analysis failed. Please try again.";
      setSnack({ open: true, message: msg, severity: "error" });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // Rename
  const handleRename = async (id, newTitle) => {
    try {
      await API.put(`/api/history/${id}/rename`, { title: newTitle });
      setHistory((prev) =>
        prev.map((h) => (h.id === id ? { ...h, title: newTitle } : h))
      );
      if (selectedResult?.id === id) {
        setSelectedResult((prev) => ({ ...prev, title: newTitle }));
      }
      setSnack({ open: true, message: "Renamed successfully", severity: "success" });
    } catch (err) {
      setSnack({ open: true, message: "Rename failed", severity: "error" });
    }
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      await API.delete(`/api/history/${id}`);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      if (selectedId === id) {
        handleNewAnalysis();
      }
      setSnack({ open: true, message: "Deleted successfully", severity: "success" });
    } catch (err) {
      setSnack({ open: true, message: "Delete failed", severity: "error" });
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <Sidebar
        history={history}
        selectedId={selectedId}
        onSelect={handleSelect}
        onNewAnalysis={handleNewAnalysis}
        onRename={handleRename}
        onDelete={handleDelete}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          ml: { md: 0 },
        }}
      >
        {/* Top bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            background: isDark ? "rgba(15,15,35,0.8)" : "rgba(255,255,255,0.8)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
              {showUpload
                ? "New Analysis"
                : selectedResult?.title || "Analysis Results"}
            </Typography>
          </Box>
          <IconButton onClick={toggleTheme}>
            {mode === "dark" ? (
              <LightMode sx={{ color: "#FCD34D" }} />
            ) : (
              <DarkMode sx={{ color: "#64748B" }} />
            )}
          </IconButton>
        </Box>

        {/* Content area */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: { xs: 2, sm: 3, md: 4 },
            display: "flex",
            flexDirection: "column",
          }}
        >
          {showUpload ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UploadCard
                file={file}
                setFile={setFile}
                onAnalyze={handleAnalyze}
                uploading={uploading}
                progress={progress}
              />
            </Box>
          ) : (
            <ResultPanel result={selectedResult} loading={resultLoading} />
          )}
        </Box>
      </Box>

      {/* Snackbar alerts */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
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
