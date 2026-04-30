import { useState } from "react";


// ─────────────────────────────────────────────────────────────────────────────
// ANALYSIS PANEL
// ─────────────────────────────────────────────────────────────────────────────
export default function AnalysisPanel({ circuitId, stats, connectivity, onLoadStats, loading }) {
  const [neighbors, setNeighbors] = useState(null);
  const [neighborNode, setNeighborNode] = useState("");
  const [layerData, setLayerData] = useState(null);
  const [kindData, setKindData] = useState(null);

  async function loadNeighbors() {
    if (!neighborNode) return;
    try {
      const res = await api.get(`/circuits/${circuitId}/analysis/neighbors/${neighborNode}`);
      setNeighbors(res);
    } catch { alert("Failed to load neighbors"); }
  }

  async function loadLayers() {
    try {
      const res = await api.get(`/circuits/${circuitId}/analysis/layers`);
      setLayerData(res);
    } catch { alert("Failed to load layer data"); }
  }

  async function loadKinds() {
    try {
      const res = await api.get(`/circuits/${circuitId}/analysis/components-by-kind`);
      setKindData(res);
    } catch { alert("Failed to load component kinds"); }
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Stats */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: "Orbitron", fontSize: 13, color: "#00d4ff", fontWeight: 700 }}>CIRCUIT STATS</div>
            <button className="btn btn-cyan" onClick={onLoadStats} disabled={loading}>Load</button>
          </div>
          {stats ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                ["Nodes", stats.node_count],
                ["Edges", stats.edge_count],
                ["Total Weight", stats.total_weight?.toFixed(3)],
                ["Avg Degree", stats.avg_degree?.toFixed(2)],
              ].map(([k, v]) => (
                <div key={k} style={{ background: "#0a0e1a", border: "1px solid #1e2d45", borderRadius: 4, padding: "10px 14px" }}>
                  <div style={{ fontSize: 10, color: "#4a5568", letterSpacing: "0.1em", textTransform: "uppercase" }}>{k}</div>
                  <div style={{ fontSize: 18, color: "#00d4ff", fontWeight: 700, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          ) : <div style={{ fontSize: 12, color: "#2d3d55" }}>Click Load to fetch stats.</div>}
        </div>

        {/* Connectivity */}
        <div className="card">
          <div style={{ fontFamily: "Orbitron", fontSize: 13, color: "#00ff88", fontWeight: 700, marginBottom: 12 }}>CONNECTIVITY</div>
          {connectivity ? (
            <div>
              <div style={{
                padding: "10px 16px", borderRadius: 4, marginBottom: 10,
                background: connectivity.is_fully_connected ? "rgba(0,255,136,0.1)" : "rgba(255,51,102,0.1)",
                border: `1px solid ${connectivity.is_fully_connected ? "rgba(0,255,136,0.3)" : "rgba(255,51,102,0.3)"}`,
                color: connectivity.is_fully_connected ? "#00ff88" : "#ff3366",
                fontSize: 13, fontWeight: 700,
              }}>
                {connectivity.is_fully_connected ? "✓ FULLY CONNECTED" : "✗ DISCONNECTED"}
              </div>
              <div style={{ fontSize: 12, color: "#4a5568", marginBottom: 6 }}>
                Components: <span style={{ color: "#c8d0e0" }}>{connectivity.components}</span>
              </div>
              {connectivity.isolated_nodes?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: "#4a5568", marginBottom: 4 }}>Isolated nodes:</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {connectivity.isolated_nodes.map((n) => (
                      <span key={n} className="badge" style={{ background: "rgba(255,51,102,0.1)", color: "#ff3366", border: "1px solid rgba(255,51,102,0.3)" }}>{n}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : <div style={{ fontSize: 12, color: "#2d3d55" }}>Loading…</div>}
        </div>

        {/* Neighbors */}
        <div className="card">
          <div style={{ fontFamily: "Orbitron", fontSize: 13, color: "#ff6a00", fontWeight: 700, marginBottom: 12 }}>NEIGHBORS</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input className="input" placeholder="node_id" value={neighborNode} onChange={(e) => setNeighborNode(e.target.value)} />
            <button className="btn btn-orange" onClick={loadNeighbors}>Go</button>
          </div>
          {neighbors && (
            <div className="fade-in">
              <div style={{ fontSize: 11, color: "#4a5568", marginBottom: 6 }}>
                Degree: <span style={{ color: "#ff6a00" }}>{neighbors.degree}</span> · Total weight: <span style={{ color: "#ff6a00" }}>{neighbors.total_connected_weight?.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {(neighbors.neighbors || []).map((nb) => (
                  <div key={nb.node} style={{ display: "flex", justifyContent: "space-between", background: "#0a0e1a", borderRadius: 3, padding: "5px 10px", fontSize: 11 }}>
                    <span style={{ color: "#c8d0e0" }}>{nb.node}</span>
                    <span style={{ color: "#ff6a00" }}>{nb.weight?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Layers */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: "Orbitron", fontSize: 13, color: "#b44dff", fontWeight: 700 }}>LAYERS</div>
            <button className="btn btn-purple" onClick={loadLayers}>Load</button>
          </div>
          {layerData ? (
            <div className="fade-in">
              {Object.entries(layerData).map(([layer, data]) => (
                <div key={layer} style={{ marginBottom: 8, background: "#0a0e1a", border: "1px solid #1e2d45", borderRadius: 4, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, color: "#b44dff", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>{layer}</div>
                  <div style={{ fontSize: 11, color: "#4a5568", display: "flex", gap: 12 }}>
                    <span>Nodes: <span style={{ color: "#c8d0e0" }}>{data.nodes}</span></span>
                    <span>Edges: <span style={{ color: "#c8d0e0" }}>{data.edges}</span></span>
                  </div>
                </div>
              ))}
            </div>
          ) : <div style={{ fontSize: 12, color: "#2d3d55" }}>Click Load.</div>}
        </div>

        {/* Components by kind */}
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: "Orbitron", fontSize: 13, color: "#eab308", fontWeight: 700 }}>COMPONENTS BY KIND</div>
            <button className="btn" style={{ background: "rgba(234,179,8,0.1)", borderColor: "rgba(234,179,8,0.4)", color: "#eab308" }} onClick={loadKinds}>Load</button>
          </div>
          {kindData ? (
            <div className="fade-in" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(kindData).map(([kind, count]) => {
                const color = KIND_COLORS[kind] || "#94a3b8";
                return (
                  <div key={kind} style={{ background: `${color}11`, border: `1px solid ${color}33`, borderRadius: 4, padding: "8px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.1em" }}>{kind}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "Orbitron" }}>{count}</div>
                  </div>
                );
              })}
            </div>
          ) : <div style={{ fontSize: 12, color: "#2d3d55" }}>Click Load.</div>}
        </div>

      </div>
    </div>
  );
}