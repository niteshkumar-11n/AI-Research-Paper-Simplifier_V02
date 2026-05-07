import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  LinearProgress,
  useTheme,
} from "@mui/material";
import { CloudUpload, InsertDriveFile } from "@mui/icons-material";

export default function UploadCard({ file, setFile, onAnalyze, uploading, progress }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const onDrop = useCallback(
    (accepted) => {
      if (accepted.length > 0) setFile(accepted[0]);
    },
    [setFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    multiple: false,
    disabled: uploading,
  });

  const fileIcon = () => {
    if (!file) return null;
    const ext = file.name.split(".").pop().toLowerCase();
    const colors = { pdf: "#EF4444", docx: "#3B82F6", txt: "#10B981" };
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 2,
          borderRadius: 2,
          background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <InsertDriveFile sx={{ color: colors[ext] || "#64748B", fontSize: 32 }} />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {file.name}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {(file.size / 1024).toFixed(1)} KB • {ext.toUpperCase()}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Card
      sx={{
        maxWidth: 560,
        mx: "auto",
        border: `1px solid ${theme.palette.divider}`,
        background: isDark ? "rgba(26,26,46,0.6)" : "rgba(255,255,255,0.8)",
        backdropFilter: "blur(12px)",
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700 }}>
          Upload Document
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          Drag & drop or click to select a file for AI analysis
        </Typography>

        {/* Dropzone */}
        <Box
          {...getRootProps()}
          sx={{
            border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
            borderRadius: 3,
            p: 5,
            textAlign: "center",
            cursor: uploading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            background: isDragActive
              ? isDark
                ? "rgba(124,58,237,0.08)"
                : "rgba(124,58,237,0.04)"
              : "transparent",
            "&:hover": {
              borderColor: "primary.main",
              background: isDark ? "rgba(124,58,237,0.06)" : "rgba(124,58,237,0.02)",
            },
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 48, color: "primary.main", mb: 2, opacity: 0.8 }} />
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
            {isDragActive ? "Drop your file here…" : "Drag & drop your file here"}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Supports PDF, DOCX, TXT
          </Typography>
        </Box>

        {/* Selected file preview */}
        {file && <Box sx={{ mt: 2.5 }}>{fileIcon()}</Box>}

        {/* Upload progress */}
        {uploading && (
          <Box sx={{ mt: 2.5 }}>
            <LinearProgress
              variant={progress > 0 ? "determinate" : "indeterminate"}
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(90deg, #7C3AED, #06B6D4)",
                },
              }}
            />
            <Typography variant="caption" sx={{ mt: 1, display: "block", color: "text.secondary", textAlign: "center" }}>
              Analyzing document with AI…
            </Typography>
          </Box>
        )}

        {/* Analyze button */}
        <Button
          variant="contained"
          fullWidth
          disabled={!file || uploading}
          onClick={onAnalyze}
          sx={{
            mt: 3,
            py: 1.5,
            fontSize: "1rem",
            background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
            "&:hover": { background: "linear-gradient(135deg, #6D28D9 0%, #4C1D95 100%)" },
            "&.Mui-disabled": { opacity: 0.5 },
          }}
        >
          {uploading ? "Analyzing…" : "Analyze Document"}
        </Button>
      </CardContent>
    </Card>
  );
}
