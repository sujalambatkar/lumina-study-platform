"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  MarkerType,
  Handle,
  Position,
  NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ConceptMapResponse } from "@/types";

function ConceptNode({ data, selected }: NodeProps) {
  const d = data as { label: string; description: string; isRoot: boolean };

  return (
    <div style={{
      padding: d.isRoot ? "14px 22px" : "10px 16px",
      borderRadius: 12,
      background: d.isRoot ? "#1c1400" : "#161622",
      border: `${d.isRoot ? 2 : 1.5}px solid ${d.isRoot ? "#e8a84c" : selected ? "#e8a84c" : "rgba(232,168,76,0.2)"}`,
      boxShadow: d.isRoot
        ? "0 0 32px rgba(232,168,76,0.2), 0 4px 20px rgba(0,0,0,0.5)"
        : "0 2px 8px rgba(0,0,0,0.3)",
      minWidth: d.isRoot ? 150 : 120,
      maxWidth: 180,
      textAlign: "center",
      cursor: "pointer",
    }}>
      <Handle type="target" position={Position.Top}
        style={{ background: "#e8a84c", border: "none", width: 8, height: 8 }} />
      <p style={{
        fontFamily: "var(--font-display)",
        fontSize: d.isRoot ? 14 : 12,
        fontWeight: 600,
        color: d.isRoot ? "#e8a84c" : "#ede9e0",
        lineHeight: 1.3,
        marginBottom: d.description ? 5 : 0,
      }}>
        {d.label}
      </p>
      {d.description && (
        <p style={{
          fontSize: 10, color: "#6b6560", lineHeight: 1.4,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {d.description}
        </p>
      )}
      <Handle type="source" position={Position.Bottom}
        style={{ background: "#e8a84c", border: "none", width: 8, height: 8 }} />
    </div>
  );
}

const NODE_TYPES = { concept: ConceptNode };

function buildLayout(nodes: ConceptMapResponse["nodes"], edges: ConceptMapResponse["edges"]) {
  const n = nodes.length;
  const idToIdx = new Map(nodes.map((nd, i) => [nd.id, i]));
  const degree = new Array(n).fill(0);

  edges.forEach((e) => {
    const si = idToIdx.get(e.source);
    const ti = idToIdx.get(e.target);
    if (si !== undefined) degree[si]++;
    if (ti !== undefined) degree[ti]++;
  });

  const rootIdx = degree.indexOf(Math.max(...degree));
  const rootId = nodes[rootIdx]?.id;
  const positions: { x: number; y: number }[] = new Array(n);
  const cx = 600, cy = 400;
  positions[rootIdx] = { x: cx, y: cy };

  const rest = nodes.map((_, i) => i).filter((i) => i !== rootIdx);
  const ring1 = rest.filter((i) =>
    edges.some((e) =>
      (e.source === rootId && e.target === nodes[i].id) ||
      (e.target === rootId && e.source === nodes[i].id)
    )
  );
  const ring2 = rest.filter((i) => !ring1.includes(i));

  const r1 = Math.max(300, ring1.length * 70);
  ring1.forEach((idx, j) => {
    const angle = (j / ring1.length) * 2 * Math.PI - Math.PI / 2;
    positions[idx] = { x: cx + r1 * Math.cos(angle), y: cy + r1 * Math.sin(angle) };
  });

  const r2 = r1 + Math.max(260, ring2.length * 55);
  ring2.forEach((idx, j) => {
    const angle = (j / ring2.length) * 2 * Math.PI - Math.PI / 4;
    positions[idx] = { x: cx + r2 * Math.cos(angle), y: cy + r2 * Math.sin(angle) };
  });

  return { positions, rootIdx };
}

export default function ConceptMapCanvas({
  data,
  onNodeClick,
}: {
  data: ConceptMapResponse;
  onNodeClick: (n: { label: string; description: string }) => void;
}) {
  const { positions, rootIdx } = useMemo(() => buildLayout(data.nodes, data.edges), [data]);

  const initialNodes: Node[] = data.nodes.map((n, i) => ({
    id: n.id,
    type: "concept",
    position: positions[i] ?? { x: i * 200, y: 200 },
    data: { label: n.label, description: n.description, isRoot: i === rootIdx },
  }));

  const initialEdges: Edge[] = data.edges.map((e, i) => ({
    id: `e-${i}`,
    source: e.source,
    target: e.target,
    label: e.label,
    type: "default",
    animated: false,
    style: { stroke: "rgba(232,168,76,0.4)", strokeWidth: 1.5 },
    labelStyle: { fill: "#8a8278", fontSize: 10, fontFamily: "var(--font-body)" },
    labelBgStyle: { fill: "#0f0f18", fillOpacity: 0.9 },
    labelBgPadding: [4, 8] as [number, number],
    labelBgBorderRadius: 4,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "rgba(232,168,76,0.6)",
      width: 14,
      height: 14,
    },
  }));

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback((p: Connection) => setEdges((eds) => addEdge(p, eds)), [setEdges]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={NODE_TYPES}
      onNodeClick={(_, node) =>
        onNodeClick({
          label: node.data.label as string,
          description: node.data.description as string,
        })
      }
      fitView
      fitViewOptions={{ padding: 0.12, maxZoom: 0.9 }}
      minZoom={0.15}
      maxZoom={2}
      style={{ background: "#0a0a0f", width: "100%", height: "100%" }}
    >
      <Background variant={BackgroundVariant.Dots} gap={32} size={1} color="rgba(255,255,255,0.04)" />
      <Controls
        style={{
          background: "#161622",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
        }}
      />
    </ReactFlow>
  );
}
