import { useMemo, useCallback, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Box, Typography, useTheme } from "@mui/material";

/**
 * Auto-layout: arrange nodes in a radial pattern around a center.
 */
function layoutNodes(rawNodes) {
  const count = rawNodes.length;
  if (count === 0) return [];

  const centerX = 400;
  const centerY = 300;
  const radius = Math.max(180, count * 40);

  return rawNodes.map((node, i) => {
    if (i === 0) {
      // First node at center
      return {
        ...node,
        position: { x: centerX - 75, y: centerY - 25 },
      };
    }
    const angle = ((2 * Math.PI) / (count - 1)) * (i - 1) - Math.PI / 2;
    return {
      ...node,
      position: {
        x: centerX + radius * Math.cos(angle) - 75,
        y: centerY + radius * Math.sin(angle) - 25,
      },
    };
  });
}

export default function KnowledgeGraph({ graphData }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Transform backend data into React Flow nodes & edges
  const initialNodes = useMemo(() => {
    if (!graphData?.nodes) return [];
    const raw = graphData.nodes.map((n, i) => ({
      id: n.id,
      data: { label: n.label },
      type: "default",
      style: {
        background: isDark
          ? i === 0
            ? "linear-gradient(135deg, #7C3AED, #5B21B6)"
            : "rgba(26,26,46,0.95)"
          : i === 0
          ? "linear-gradient(135deg, #7C3AED, #A78BFA)"
          : "#FFFFFF",
        color: isDark || i === 0 ? "#E2E8F0" : "#1E293B",
        border: i === 0
          ? "2px solid #7C3AED"
          : `1.5px solid ${isDark ? "rgba(124,58,237,0.4)" : "rgba(124,58,237,0.25)"}`,
        borderRadius: "12px",
        padding: "12px 20px",
        fontSize: "13px",
        fontWeight: i === 0 ? 700 : 500,
        fontFamily: "'Inter', sans-serif",
        boxShadow: isDark
          ? "0 4px 16px rgba(0,0,0,0.3)"
          : "0 2px 8px rgba(0,0,0,0.08)",
        minWidth: "100px",
        textAlign: "center",
      },
    }));
    return layoutNodes(raw);
  }, [graphData, isDark]);

  const initialEdges = useMemo(() => {
    if (!graphData?.edges) return [];
    return graphData.edges.map((e, i) => ({
      id: `e-${e.source}-${e.target}-${i}`,
      source: e.source,
      target: e.target,
      label: e.label || "",
      type: "default",
      animated: true,
      style: {
        stroke: isDark ? "#A78BFA" : "#7C3AED",
        strokeWidth: 2,
      },
      labelStyle: {
        fill: isDark ? "#CBD5E1" : "#475569",
        fontSize: 11,
        fontWeight: 500,
        fontFamily: "'Inter', sans-serif",
      },
      labelBgStyle: {
        fill: isDark ? "#1A1A2E" : "#FFFFFF",
        fillOpacity: 0.85,
      },
      labelBgPadding: [6, 4],
      labelBgBorderRadius: 6,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isDark ? "#A78BFA" : "#7C3AED",
        width: 18,
        height: 18,
      },
    }));
  }, [graphData, isDark]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes/edges when data changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (!graphData?.nodes?.length) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">No knowledge graph data available</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: 500,
        borderRadius: 3,
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
        background: isDark ? "#0F0F23" : "#FAFBFC",
        "& .react-flow__attribution": { display: "none" },
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Controls
          style={{
            background: isDark ? "#1A1A2E" : "#FFF",
            borderRadius: 10,
            border: `1px solid ${isDark ? "rgba(148,163,184,0.12)" : "rgba(0,0,0,0.08)"}`,
          }}
        />
        <MiniMap
          style={{
            background: isDark ? "#1A1A2E" : "#F1F5F9",
            borderRadius: 8,
          }}
          nodeColor={isDark ? "#7C3AED" : "#A78BFA"}
          maskColor={isDark ? "rgba(15,15,35,0.7)" : "rgba(248,250,252,0.7)"}
        />
        <Background
          color={isDark ? "#2D2D4A" : "#E2E8F0"}
          gap={20}
          size={1}
        />
      </ReactFlow>
    </Box>
  );
}
