import { useState } from "react";
// ─────────────────────────────────────────────────────────────────────────────
// ALGORITHMS PANEL
// ─────────────────────────────────────────────────────────────────────────────
export default function AlgorithmsPanel({ nodes, onRunKruskal, onRunBFS, onRunDFS, onRunCycle, traversalResult, cycleResult, mstEdges, mstWeight, loading }) {
  const [bfsStart, setBfsStart] = useState("");
  const [dfsStart, setDfsStart] = useState("");

  return (
    <div className="flex-1 overflow-auto p-6">
      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Kruskal */}
        <div className="card" style={{ gridColumn: "1 / -1", borderColor: "rgba(0,255,136,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: "Orbitron", fontSize: 14, color: "#00ff88", fontWeight: 700 }}>KRUSKAL'S MST</div>
              <div style={{ fontSize: 11, color: "#4a5568", marginTop: 2 }}>Minimum Spanning Tree — Union-Find · O(E log E)</div>
            </div>
            <button className="btn btn-green" onClick={onRunKruskal} disabled={loading}>▶ Run Kruskal</button>
          </div>
          {mstEdges.length > 0 && (
            <div className="fade-in">
              <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "#4a5568" }}>Edges: <span style={{ color: "#00ff88" }}>{mstEdges.length}</span></div>
                <div style={{ fontSize: 11, color: "#4a5568" }}>Total Weight: <span style={{ color: "#00ff88" }}>{mstWeight?.toFixed(4)}</span></div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {mstEdges.map((e, i) => (
                  <div key={i} style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 4, padding: "4px 10px", fontSize: 11, color: "#00ff88" }}>
                    {e.node_a} ↔ {e.node_b} <span style={{ color: "#4a5568" }}>({e.weight?.toFixed(2)})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BFS */}
        <div className="card" style={{ borderColor: "rgba(0,212,255,0.2)" }}>
          <div style={{ fontFamily: "Orbitron", fontSize: 13, color: "#00d4ff", fontWeight: 700, marginBottom: 4 }}>BFS</div>
          <div style={{ fontSize: 11, color: "#4a5568", marginBottom: 12 }}>Breadth-First Search · O(V+E)</div>
          <label className="label">Start Node</label>
          <select className="select" value={bfsStart} onChange={(e) => setBfsStart(e.target.value)} style={{ marginBottom: 10 }}>
            <option value="">— choose —</option>
            {nodes.map((n) => <option key={n.node_id} value={n.node_id}>{n.node_id}</option>)}
          </select>
          <button className="btn btn-cyan" onClick={() => bfsStart && onRunBFS(bfsStart)} disabled={!bfsStart || loading}>▶ Run BFS</button>
          {traversalResult?.type === "BFS" && (
            <div className="fade-in" style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: "#4a5568", marginBottom: 6 }}>Order ({traversalResult.nodes_visited} nodes):</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {(traversalResult.traversal_order || []).map((n, i) => (
                  <span key={n} style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 3, padding: "2px 8px", fontSize: 10, color: "#00d4ff" }}>
                    {i}: {n}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* DFS */}
        <div className="card" style={{ borderColor: "rgba(180,77,255,0.2)" }}>
          <div style={{ fontFamily: "Orbitron", fontSize: 13, color: "#b44dff", fontWeight: 700, marginBottom: 4 }}>DFS</div>
          <div style={{ fontSize: 11, color: "#4a5568", marginBottom: 12 }}>Depth-First Search · O(V+E)</div>
          <label className="label">Start Node</label>
          <select className="select" value={dfsStart} onChange={(e) => setDfsStart(e.target.value)} style={{ marginBottom: 10 }}>
            <option value="">— choose —</option>
            {nodes.map((n) => <option key={n.node_id} value={n.node_id}>{n.node_id}</option>)}
          </select>
          <button className="btn btn-purple" onClick={() => dfsStart && onRunDFS(dfsStart)} disabled={!dfsStart || loading}>▶ Run DFS</button>
          {traversalResult?.type === "DFS" && (
            <div className="fade-in" style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: "#4a5568", marginBottom: 6 }}>Order ({traversalResult.nodes_visited} nodes):</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {(traversalResult.traversal_order || []).map((n, i) => (
                  <span key={n} style={{ background: "rgba(180,77,255,0.08)", border: "1px solid rgba(180,77,255,0.2)", borderRadius: 3, padding: "2px 8px", fontSize: 10, color: "#b44dff" }}>
                    {i}: {n}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cycle Detection */}
        <div className="card" style={{ gridColumn: "1 / -1", borderColor: "rgba(255,106,0,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "Orbitron", fontSize: 13, color: "#ff6a00", fontWeight: 700 }}>CYCLE DETECTION</div>
              <div style={{ fontSize: 11, color: "#4a5568", marginTop: 2 }}>Detect cycles using Union-Find · O(E·α(V))</div>
            </div>
            <button className="btn btn-orange" onClick={onRunCycle} disabled={loading}>▶ Detect Cycles</button>
          </div>
          {cycleResult && (
            <div className="fade-in" style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                padding: "8px 20px", borderRadius: 4,
                background: cycleResult.has_cycle ? "rgba(255,106,0,0.1)" : "rgba(0,255,136,0.1)",
                border: `1px solid ${cycleResult.has_cycle ? "rgba(255,106,0,0.4)" : "rgba(0,255,136,0.4)"}`,
                color: cycleResult.has_cycle ? "#ff6a00" : "#00ff88",
                fontSize: 13, fontWeight: 700,
              }}>
                {cycleResult.has_cycle ? "⚠ CYCLE DETECTED" : "✓ NO CYCLES"}
              </div>
              <div style={{ fontSize: 11, color: "#4a5568" }}>{cycleResult.status}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
