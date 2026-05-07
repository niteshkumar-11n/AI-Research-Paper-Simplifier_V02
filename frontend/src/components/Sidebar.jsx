import { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  TextField,
  Button,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Search,
  Description,
  Edit,
  Delete,
  Logout,
  AutoAwesome,
  Close,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

const DRAWER_WIDTH = 300;

export default function Sidebar({
  history,
  selectedId,
  onSelect,
  onNewAnalysis,
  onRename,
  onDelete,
  mobileOpen,
  onMobileClose,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";
  const { user, logout } = useAuth();

  const [search, setSearch] = useState("");
  const [renameDialog, setRenameDialog] = useState({ open: false, id: null, title: "" });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  const filtered = history.filter((h) =>
    h.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleRenameConfirm = () => {
    if (renameDialog.title.trim()) {
      onRename(renameDialog.id, renameDialog.title.trim());
    }
    setRenameDialog({ open: false, id: null, title: "" });
  };

  const handleDeleteConfirm = () => {
    onDelete(deleteDialog.id);
    setDeleteDialog({ open: false, id: null });
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: isDark ? "#12122A" : "#F1F5F9",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2.5, pb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AutoAwesome sx={{ color: "primary.main", fontSize: 22 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: "1rem" }}>
              InsightDocs
            </Typography>
          </Box>
          {isMobile && (
            <IconButton onClick={onMobileClose} size="small">
              <Close />
            </IconButton>
          )}
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          fullWidth
          onClick={() => {
            onNewAnalysis();
            if (isMobile) onMobileClose();
          }}
          sx={{
            mb: 2,
            py: 1.2,
            background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
            "&:hover": { background: "linear-gradient(135deg, #6D28D9 0%, #4C1D95 100%)" },
          }}
        >
          New Analysis
        </Button>

        <TextField
          placeholder="Search history…"
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 20, color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontSize: "0.875rem",
            },
          }}
        />
      </Box>

      <Divider />

      {/* History list */}
      <Box sx={{ flex: 1, overflow: "auto", px: 1, py: 1 }}>
        <Typography
          variant="caption"
          sx={{ px: 1.5, py: 1, display: "block", color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}
        >
          Recent Analyses
        </Typography>
        <List dense disablePadding>
          {filtered.length === 0 && (
            <Typography variant="body2" sx={{ px: 2, py: 3, color: "text.secondary", textAlign: "center" }}>
              {search ? "No matches found" : "No analyses yet"}
            </Typography>
          )}
          {filtered.map((item) => (
            <ListItemButton
              key={item.id}
              selected={item.id === selectedId}
              onClick={() => {
                onSelect(item.id);
                if (isMobile) onMobileClose();
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: 1.5,
                "&.Mui-selected": {
                  background: isDark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.08)",
                  "&:hover": { background: isDark ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.12)" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Description sx={{ fontSize: 18, color: "text.secondary" }} />
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  noWrap: true,
                  sx: { fontSize: "0.85rem", fontWeight: item.id === selectedId ? 600 : 400 },
                }}
                secondary={new Date(item.created_at).toLocaleDateString()}
                secondaryTypographyProps={{ sx: { fontSize: "0.72rem" } }}
              />
              <Box sx={{ display: "flex", gap: 0 }}>
                <Tooltip title="Rename">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenameDialog({ open: true, id: item.id, title: item.title });
                    }}
                  >
                    <Edit sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteDialog({ open: true, id: item.id });
                    }}
                  >
                    <Delete sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Divider />

      {/* User profile */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            fontSize: "0.85rem",
            fontWeight: 700,
            background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {user?.name || "User"}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
            {user?.email || ""}
          </Typography>
        </Box>
        <Tooltip title="Logout">
          <IconButton size="small" onClick={logout}>
            <Logout sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Rename Dialog */}
      <Dialog open={renameDialog.open} onClose={() => setRenameDialog({ open: false, id: null, title: "" })}>
        <DialogTitle>Rename Analysis</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            value={renameDialog.title}
            onChange={(e) => setRenameDialog((p) => ({ ...p, title: e.target.value }))}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialog({ open: false, id: null, title: "" })}>Cancel</Button>
          <Button variant="contained" onClick={handleRenameConfirm}>Rename</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })}>
        <DialogTitle>Delete Analysis</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this analysis? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  return (
    <>
      {/* Desktop permanent drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH, borderRight: "none" },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
      {/* Mobile temporary drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
}
