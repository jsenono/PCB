import { useState } from "react";
import { KIND_COLORS } from "../utils/constants";
// ─────────────────────────────────────────────────────────────────────────────
// NODES PANEL
// ─────────────────────────────────────────────────────────────────────────────
export default function NodesPanel({ nodes, onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const filtered = nodes.filter((n) =>
    n.node_id.toLowerCase().includes(search.toLowerCase()) ||
    (n.label || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: "1px solid #1e2d45", background: "#111827" }}>
        <span style={{ fontSize: 11, color: "#4a5568", letterSpacing: "0.1em" }}>NODES ({nodes.length})</span>
        <input className="input" placeholder="search…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 200 }} />
        <div style={{ flex: 1 }} />
        <button className="btn btn-green" onClick={onAdd}>+ Add Node</button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 60, color: "#2d3d55", fontSize: 12 }}>No nodes found.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 10 }}>
            {filtered.map((n) => {
              const color = KIND_COLORS[n.kind] || KIND_COLORS.other;
              return (
                <div key={n.node_id} className="card fade-in" style={{ borderLeft: `3px solid ${color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#c8d0e0", fontSize: 13 }}>{n.node_id}</div>
                      {n.label && <div style={{ fontSize: 11, color: "#4a5568" }}>{n.label}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-cyan" style={{ padding: "3px 8px" }} onClick={() => onEdit(n)}>edit</button>
                      <button className="btn btn-red" style={{ padding: "3px 8px" }} onClick={() => onDelete(n.node_id)}>del</button>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, fontSize: 11 }}>
                    <span className="badge" style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>{n.kind}</span>
                    <span className="badge" style={{ background: "#ffffff08", color: "#4a5568", border: "1px solid #1e2d45" }}>{n.layer}</span>
                    <span className="badge" style={{ background: "#ffffff08", color: "#4a5568", border: "1px solid #1e2d45" }}>
                      ({n.x?.toFixed(1)}, {n.y?.toFixed(1)})
                    </span>
                    {n.value && <span className="badge" style={{ background: "#ffffff08", color: "#8892a4", border: "1px solid #1e2d45" }}>{n.value}</span>}
                    <span className="badge" style={{
                      background: n.status === "active" ? "rgba(0,255,136,0.08)" : "rgba(255,51,102,0.08)",
                      color: n.status === "active" ? "#00ff88" : "#ff3366",
                      border: `1px solid ${n.status === "active" ? "rgba(0,255,136,0.25)" : "rgba(255,51,102,0.25)"}`,
                    }}>{n.status}</span>
                  </div>
                  {n.pins && n.pins.length > 0 && (
                    <div style={{ marginTop: 6, fontSize: 10, color: "#4a5568" }}>
                      pins: {n.pins.join(", ")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}