import { KIND_COLORS } from "../utils/constants";
// ─────────────────────────────────────────────────────────────────────────────
// EDGES PANEL
// ─────────────────────────────────────────────────────────────────────────────
export default function EdgesPanel({ edges, nodes, onAdd, onDelete }) {
  const nodeMap = {};
  nodes.forEach((n) => { nodeMap[n.node_id] = n; });
  const sorted = [...edges].sort((a, b) => a.weight - b.weight);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: "1px solid #1e2d45", background: "#111827" }}>
        <span style={{ fontSize: 11, color: "#4a5568", letterSpacing: "0.1em" }}>EDGES ({edges.length})</span>
        <div style={{ flex: 1 }} />
        <button className="btn btn-green" onClick={onAdd}>+ Add Edge</button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {sorted.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 60, color: "#2d3d55", fontSize: 12 }}>No edges found.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e2d45" }}>
                {["Node A", "Node B", "Weight", "Type", "Layer", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "6px 12px", fontSize: 10, color: "#4a5568", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((e, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #111827" }}
                  onMouseEnter={(el) => { if (el.currentTarget) el.currentTarget.style.background = "#1a2236"; }}
                  onMouseLeave={(el) => { if (el.currentTarget) el.currentTarget.style.background = ""; }}
                >
                  <td style={{ padding: "8px 12px", color: KIND_COLORS[nodeMap[e.node_a]?.kind] || "#00d4ff" }}>{e.node_a}</td>
                  <td style={{ padding: "8px 12px", color: KIND_COLORS[nodeMap[e.node_b]?.kind] || "#00d4ff" }}>{e.node_b}</td>
                  <td style={{ padding: "8px 12px", color: "#ff6a00", fontWeight: 700 }}>{e.weight?.toFixed(3)}</td>
                  <td style={{ padding: "8px 12px", color: "#4a5568" }}>{e.edge_type}</td>
                  <td style={{ padding: "8px 12px", color: "#4a5568" }}>{e.layer}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <button className="btn btn-red" style={{ padding: "2px 8px" }} onClick={() => onDelete(e.node_a, e.node_b)}>del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
