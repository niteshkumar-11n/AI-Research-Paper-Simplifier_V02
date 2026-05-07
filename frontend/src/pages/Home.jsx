import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";
import {
  AutoAwesome,
  Description,
  BarChart,
  Speed,
  Security,
  CloudUpload,
  Psychology,
} from "@mui/icons-material";
import Navbar from "../components/Navbar";

const features = [
  {
    icon: <CloudUpload sx={{ fontSize: 40 }} />,
    title: "Multi-Format Upload",
    desc: "Upload PDF, DOCX, or TXT files with drag-and-drop ease. Supports multiple formats seamlessly.",
  },
  {
    icon: <Psychology sx={{ fontSize: 40 }} />,
    title: "AI-Powered Analysis",
    desc: "Gemini AI extracts overviews, methodology, key points, and concise summaries from your documents.",
  },
  {
    icon: <BarChart sx={{ fontSize: 40 }} />,
    title: "Visual Insights",
    desc: "Automatically generated charts and graphs visualize the key data from your research papers.",
  },
  {
    icon: <Speed sx={{ fontSize: 40 }} />,
    title: "Instant Results",
    desc: "Get comprehensive analysis in seconds, not hours. Powered by cutting-edge AI agents.",
  },
  {
    icon: <Description sx={{ fontSize: 40 }} />,
    title: "Analysis History",
    desc: "All your analyses are saved and searchable. Re-open any past result with a single click.",
  },
  {
    icon: <Security sx={{ fontSize: 40 }} />,
    title: "Secure & Private",
    desc: "JWT authentication and encrypted storage keep your documents and data completely secure.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* ─── Hero Section ─── */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          py: { xs: 10, md: 16 },
          textAlign: "center",
          background: isDark
            ? "radial-gradient(ellipse at top, rgba(124,58,237,0.15) 0%, transparent 60%)"
            : "radial-gradient(ellipse at top, rgba(124,58,237,0.08) 0%, transparent 60%)",
        }}
      >
        {/* Decorative gradient orbs */}
        <Box
          sx={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
            top: -150,
            right: -100,
            filter: "blur(60px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
            bottom: -100,
            left: -80,
            filter: "blur(60px)",
          }}
        />

        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Box
            className="animate-fade-in-up"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 2.5,
              py: 0.8,
              borderRadius: 50,
              mb: 4,
              background: isDark
                ? "rgba(124,58,237,0.15)"
                : "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.2)",
            }}
          >
            <AutoAwesome sx={{ fontSize: 16, color: "primary.main" }} />
            <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 600 }}>
              Powered by Gemini AI + LangGraph
            </Typography>
          </Box>

          <Typography
            variant="h2"
            className="animate-fade-in-up"
            sx={{
              fontSize: { xs: "2.2rem", md: "3.5rem" },
              fontWeight: 800,
              mb: 3,
              lineHeight: 1.15,
            }}
          >
            Transform Documents into{" "}
            <Box
              component="span"
              sx={{
                background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Intelligent Insights
            </Box>
          </Typography>

          <Typography
            variant="h6"
            className="animate-fade-in-up"
            sx={{
              color: "text.secondary",
              maxWidth: 600,
              mx: "auto",
              mb: 5,
              fontWeight: 400,
              lineHeight: 1.7,
              fontSize: { xs: "1rem", md: "1.15rem" },
            }}
          >
            Upload any research paper, report, or document and get AI-powered summaries,
            key findings, methodology breakdowns, and visual data charts — instantly.
          </Typography>

          <Box
            className="animate-fade-in-up"
            sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/signup")}
              sx={{
                px: 5,
                py: 1.5,
                fontSize: "1.05rem",
                background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
                "&:hover": { background: "linear-gradient(135deg, #6D28D9 0%, #4C1D95 100%)" },
              }}
            >
              Get Started Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/login")}
              sx={{ px: 5, py: 1.5, fontSize: "1.05rem" }}
            >
              Login
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ─── Features Section ─── */}
      <Box id="features" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            textAlign="center"
            sx={{ mb: 2, fontSize: { xs: "1.8rem", md: "2.4rem" } }}
          >
            Powerful Features
          </Typography>
          <Typography
            variant="body1"
            textAlign="center"
            sx={{ color: "text.secondary", mb: 8, maxWidth: 550, mx: "auto" }}
          >
            Everything you need to analyze research papers and documents with AI precision.
          </Typography>

          <Grid container spacing={4}>
            {features.map((f, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card
                  sx={{
                    height: "100%",
                    p: 1,
                    transition: "all 0.3s ease",
                    border: `1px solid ${theme.palette.divider}`,
                    background: theme.palette.background.paper,
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: isDark
                        ? "0 20px 40px rgba(124,58,237,0.15)"
                        : "0 20px 40px rgba(0,0,0,0.08)",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2.5,
                        background: isDark
                          ? "rgba(124,58,237,0.12)"
                          : "rgba(124,58,237,0.06)",
                        color: "primary.main",
                      }}
                    >
                      {f.icon}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                      {f.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── About Section ─── */}
      <Box
        id="about"
        sx={{
          py: { xs: 8, md: 12 },
          background: isDark
            ? "rgba(124,58,237,0.04)"
            : "rgba(124,58,237,0.02)",
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography
            variant="h3"
            sx={{ mb: 3, fontSize: { xs: "1.8rem", md: "2.4rem" } }}
          >
            About InsightDocs AI
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 2, fontSize: "1.05rem", mb: 4 }}
          >
            InsightDocs AI is a next-generation document analysis platform built on the FARM stack
            (FastAPI, React, MongoDB). It leverages Google Gemini AI through LangGraph agent workflows
            to deliver structured, hallucination-free insights from your uploaded documents.
            Whether you're a researcher, student, or professional — upload your files and get
            actionable intelligence in seconds.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/signup")}
            sx={{
              px: 5,
              background: "linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)",
              "&:hover": { background: "linear-gradient(135deg, #6D28D9 0%, #0891B2 100%)" },
            }}
          >
            Start Analyzing Now
          </Button>
        </Container>
      </Box>

      {/* ─── Footer ─── */}
      <Box
        component="footer"
        sx={{
          mt: "auto",
          py: 4,
          textAlign: "center",
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          © {new Date().getFullYear()} InsightDocs AI. Built with FastAPI, React, MongoDB &amp; Gemini.
        </Typography>
      </Box>
    </Box>
  );
}
