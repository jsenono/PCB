import { useState, useEffect, useRef, useCallback } from "react";
import {API_BASE, KIND_COLORS, KIND_SYMBOLS} from "./utils/constants";
import GraphPanel from "./panels/GraphPanel";
import NodesPanel from "./panels/NodesPanel";
import EdgesPanel from "./panels/EdgesPanel";
import AlgorithmsPanel from "./panels/AlgorithmsPanel";
import AnalysisPanel from "./panels/AnalysisPanel";
import NewCircuitModal from "./components/NewCircuitModal";
import AddNodeModal from "./components/AddNodeModal";
import EditNodeModal from "./components/EditNodeModal";
import AddEdgeModal from "./components/AddEdgeModal";
import Modal from "./components/Modal";
import { CircuitsHome } from "./panels/CircuitsHome";

// ─── API helpers ────────────────────────────────────────────────────────────
const api = {
  get: (path) => fetch(`${API_BASE}${path}`).then((r) => r.json()),
  post: (path, body) =>
    fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then((r) => r.json()),
  put: (path, body) =>
    fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  delete: (path) => fetch(`${API_BASE}${path}`, { method: "DELETE" }),
  postQuery: (path) =>
    fetch(`${API_BASE}${path}`, { method: "POST" }).then((r) => r.json()),
};



// ─── Tiny toast system ───────────────────────────────────────────────────────
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  return { toasts, push };
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const { toasts, push: toast } = useToasts();
  const [circuits, setCircuits] = useState([]);
  const [activeCircuit, setActiveCircuit] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [mstEdges, setMstEdges] = useState([]);
  const [mstWeight, setMstWeight] = useState(null);
  const [traversalResult, setTraversalResult] = useState(null);
  const [cycleResult, setCycleResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [connectivity, setConnectivity] = useState(null);
  const [panel, setPanel] = useState("graph"); // graph | nodes | edges | algorithms | analysis
  const [loading, setLoading] = useState(false);
  const [bfsHighlight, setBfsHighlight] = useState([]);
  const [dfsHighlight, setDfsHighlight] = useState([]);

  // ── Modals
  const [showNewCircuit, setShowNewCircuit] = useState(false);
  const [showAddNode, setShowAddNode] = useState(false);
  const [showAddEdge, setShowAddEdge] = useState(false);
  const [showEditNode, setShowEditNode] = useState(null);

  // ── Load circuits on mount
  useEffect(() => {
    loadCircuits();
  }, []);

  // ── Reload data when circuit changes
  useEffect(() => {
    if (activeCircuit) {
      loadCircuitData(activeCircuit.circuit_id);
    } else {
      setNodes([]);
      setEdges([]);
      setMstEdges([]);
      setMstWeight(null);
      setTraversalResult(null);
      setCycleResult(null);
      setStats(null);
      setConnectivity(null);
      setBfsHighlight([]);
      setDfsHighlight([]);
    }
  }, [activeCircuit?.circuit_id]);

  // Get all circuits
  async function loadCircuits() {
    try {
      const data = await api.get("/circuits");
      setCircuits(Array.isArray(data) ? data : []);
    } catch {
      toast("Failed to load circuits", "error");
    }
  }

  // Create a new circuit
  async function createCircuit(name) {
    try {
      const c = await api.post("/circuits", { name });
      toast(`Circuit "${name}" created`, "success");
      await loadCircuits();
      setActiveCircuit(c);
    } catch {
      toast("Failed to create circuit", "error");
    }
  }

  // Delete a circuit
  async function deleteCircuit(id) {
    if (!confirm("Delete this circuit?")) return;
    try {
      await api.delete(`/circuits/${id}`);
      toast("Circuit deleted", "success");
      if (activeCircuit?.circuit_id === id) setActiveCircuit(null);
      await loadCircuits();
    } catch {
      toast("Failed to delete circuit", "error");
    }
  }

  // Get circuit data e.g nodes, edges, connectivity
  async function loadCircuitData(id) {
    setLoading(true);
    try {
      const [n, e, c] = await Promise.all([
        api.get(`/circuits/${id}/nodes`),
        api.get(`/circuits/${id}/edges`),
        api.get(`/circuits/${id}/analysis/connectivity`),
      ]);
      setNodes(Array.isArray(n) ? n : []);
      setEdges(Array.isArray(e) ? e : []);
      setConnectivity(c);
      setMstEdges([]);
      setMstWeight(null);
    } catch {
      toast("Failed to load circuit data", "error");
    } finally {
      setLoading(false);
    }
  }
  
  // add a node to the circuit
  async function addNode(nodeData) {
    try {
      await api.post(`/circuits/${activeCircuit.circuit_id}/nodes`, nodeData);
      toast("Node added", "success");
      await loadCircuitData(activeCircuit.circuit_id);
    } catch {
      toast("Failed to add node", "error");
    }
  }

  // update a node in the circuit
  async function updateNode(nodeId, nodeData) {
    try {
      await api.put(`/circuits/${activeCircuit.circuit_id}/nodes/${nodeId}`, nodeData);
      toast("Node updated", "success");
      await loadCircuitData(activeCircuit.circuit_id);
    } catch {
      toast("Failed to update node", "error");
    }
  }

  // delete a node from the circuit
  async function deleteNode(nodeId) {
    if (!confirm(`Delete node ${nodeId}?`)) return;
    try {
      await api.delete(`/circuits/${activeCircuit.circuit_id}/nodes/${nodeId}`);
      toast("Node deleted", "success");
      await loadCircuitData(activeCircuit.circuit_id);
    } catch {
      toast("Failed to delete node", "error");
    }
  }

  // add an edge to the circuit
  async function addEdge(edgeData) {
    try {
      const result = await api.post(`/circuits/${activeCircuit.circuit_id}/edges`, edgeData);
      console.log("Edge creation details:", result);
      result.detail ? toast(result.detail, "warn") : toast("Edge added", "success");
      await loadCircuitData(activeCircuit.circuit_id);
    } catch {
      toast("Failed to add edge", "error");
    }
  }

  // delete an edge from the circuit
  async function deleteEdge(a, b) {
    if (!confirm(`Delete edge ${a}↔${b}?`)) return;
    try {
      await api.delete(`/circuits/${activeCircuit.circuit_id}/edges/${a}/${b}`);
      toast("Edge deleted", "success");
      await loadCircuitData(activeCircuit.circuit_id);
    } catch {
      toast("Failed to delete edge", "error");
    }
  }

  // run kruskal's algorithm to find MST
  async function runKruskal() {
    setLoading(true);
    try {
      const res = await api.postQuery(
        `/circuits/${activeCircuit.circuit_id}/algorithms/kruskal-mst`
      );
      setMstEdges(res.mst_edges || []);
      setMstWeight(res.total_weight);
      setTraversalResult(null);
      setCycleResult(null);
      setBfsHighlight([]);
      setDfsHighlight([]);
      toast(`MST computed — total weight: ${res.total_weight?.toFixed(2)}`, "success");
      setPanel("graph");
    } catch {
      toast("Kruskal failed", "error");
    } finally {
      setLoading(false);
    }
  }

  // run binary search tree traversal
  async function runBFS(startNode) {
    setLoading(true);
    try {
      const res = await api.postQuery(
        `/circuits/${activeCircuit.circuit_id}/algorithms/bfs?start_node=${encodeURIComponent(startNode)}`
      );
      setTraversalResult({ type: "BFS", ...res });
      setBfsHighlight(res.traversal_order || []);
      setDfsHighlight([]);
      setMstEdges([]);
      setMstWeight(null);
      toast(`BFS complete — ${res.nodes_visited} nodes visited`, "success");
      setPanel("graph");
    } catch {
      toast("BFS failed", "error");
    } finally {
      setLoading(false);
    }
  }

  // run depth-first search traversal
  async function runDFS(startNode) {
    setLoading(true);
    try {
      const res = await api.postQuery(
        `/circuits/${activeCircuit.circuit_id}/algorithms/dfs?start_node=${encodeURIComponent(startNode)}`
      );
      setTraversalResult({ type: "DFS", ...res });
      setDfsHighlight(res.traversal_order || []);
      setBfsHighlight([]);
      setMstEdges([]);
      setMstWeight(null);
      toast(`DFS complete — ${res.nodes_visited} nodes visited`, "success");
      setPanel("graph");
    } catch {
      toast("DFS failed", "error");
    } finally {
      setLoading(false);
    }
  }

  // run cycle detection algorithm
  async function runCycleDetection() {
    setLoading(true);
    try {
      const res = await api.postQuery(
        `/circuits/${activeCircuit.circuit_id}/algorithms/cycle-detection`
      );
      setCycleResult(res);
      toast(res.has_cycle ? "⚠ Cycle detected!" : "✓ No cycles found", res.has_cycle ? "warn" : "success");
    } catch {
      toast("Cycle detection failed", "error");
    } finally {
      setLoading(false);
    }
  }

  // load various stats about the circuit
  async function loadStats() {
    setLoading(true);
    try {
      const s = await api.post(`/circuits/${activeCircuit.circuit_id}/stats`);
      setStats(s);
    } catch {
      toast("Failed to load stats", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}
      className="min-h-screen bg-[#0a0e1a] text-[#c8d0e0] flex flex-col">
      {/* ── Global styles injected */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Orbitron:wght@400;700;900&display=swap');
        :root {
          --green: #00ff88;
          --cyan: #00d4ff;
          --orange: #ff6a00;
          --red: #ff3366;
          --purple: #b44dff;
          --bg: #0a0e1a;
          --bg2: #111827;
          --bg3: #1a2236;
          --border: #1e2d45;
          --text: #c8d0e0;
          --dim: #4a5568;
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: var(--bg2); }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        .grid-bg {
          background-image:
            linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .glow-green { box-shadow: 0 0 12px rgba(0,255,136,0.3); }
        .glow-cyan { box-shadow: 0 0 12px rgba(0,212,255,0.3); }
        .glow-orange { box-shadow: 0 0 12px rgba(255,106,0,0.3); }
        .scan-line::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--cyan), transparent);
          animation: scan 3s linear infinite;
          opacity: 0.4;
        }
        @keyframes scan { 0%{top:0%} 100%{top:100%} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes pulse-border { 0%,100%{border-color:rgba(0,255,136,0.3)} 50%{border-color:rgba(0,255,136,0.8)} }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        .btn {
          padding: 6px 14px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.15s;
          border: 1px solid;
          text-transform: uppercase;
        }
        .btn-green { background: rgba(0,255,136,0.1); border-color: rgba(0,255,136,0.5); color: #00ff88; }
        .btn-green:hover { background: rgba(0,255,136,0.2); box-shadow: 0 0 8px rgba(0,255,136,0.4); }
        .btn-cyan { background: rgba(0,212,255,0.1); border-color: rgba(0,212,255,0.5); color: #00d4ff; }
        .btn-cyan:hover { background: rgba(0,212,255,0.2); box-shadow: 0 0 8px rgba(0,212,255,0.4); }
        .btn-orange { background: rgba(255,106,0,0.1); border-color: rgba(255,106,0,0.5); color: #ff6a00; }
        .btn-orange:hover { background: rgba(255,106,0,0.2); }
        .btn-red { background: rgba(255,51,102,0.1); border-color: rgba(255,51,102,0.5); color: #ff3366; }
        .btn-red:hover { background: rgba(255,51,102,0.2); }
        .btn-purple { background: rgba(180,77,255,0.1); border-color: rgba(180,77,255,0.5); color: #b44dff; }
        .btn-purple:hover { background: rgba(180,77,255,0.2); }
        .btn-dim { background: rgba(255,255,255,0.04); border-color: var(--border); color: var(--dim); }
        .btn-dim:hover { border-color: var(--text); color: var(--text); }
        .tab-active { border-bottom: 2px solid var(--cyan); color: #00d4ff; }
        .input {
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 7px 10px;
          color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s;
        }
        .input:focus { border-color: rgba(0,212,255,0.5); }
        .select {
          background: #111827;
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 7px 10px;
          color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          width: 100%;
          outline: none;
        }
        .card {
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 16px;
        }
        .label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dim); margin-bottom: 4px; display: block; }
        .badge {
          display: inline-block;
          padding: 2px 7px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
      `}</style>

      {/* ── Top bar */}
      <header className="relative overflow-hidden scan-line"
        style={{ background: "linear-gradient(90deg,#0a0e1a,#0d1424,#0a0e1a)", borderBottom: "1px solid #1e2d45" }}>
        <div className="flex items-center gap-4 px-5 py-3">
          <div>
            <div style={{ fontFamily: "Orbitron, monospace", fontSize: 17, fontWeight: 900, color: "#00d4ff", letterSpacing: "0.1em" }}>
              PCB<span style={{ color: "#00ff88" }}>NET</span>
            </div>
            <div style={{ fontSize: 9, color: "#4a5568", letterSpacing: "0.15em" }}>CONNECTION NETWORK OPTIMIZER</div>
          </div>
          <div style={{ width: 1, height: 32, background: "#1e2d45" }} />
          <div className="flex items-center gap-3 flex-1">
            {/* Circuit selector */}
            <div style={{ fontSize: 11, color: "#4a5568" }}>CIRCUIT:</div>
            <select
              className="select"
              style={{ maxWidth: 220 }}
              value={activeCircuit?.circuit_id ?? ""}
              onChange={(e) => {
                const c = circuits.find((x) => x.circuit_id === +e.target.value);
                setActiveCircuit(c || null);
              }}
            >
              <option value="">— select circuit —</option>
              {circuits.map((c) => (
                <option key={c.circuit_id} value={c.circuit_id}>
                  #{c.circuit_id} · {c.node_count}N · {c.edge_count}E
                </option>
              ))}
            </select>
            <button className="btn btn-green" onClick={() => setShowNewCircuit(true)}>+ New</button>
            {activeCircuit && (
              <button className="btn btn-red" onClick={() => deleteCircuit(activeCircuit.circuit_id)}>Del</button>
            )}
          </div>
          {/* Status indicators */}
          <div className="flex gap-3 items-center">
            {connectivity && (
              <span className="badge" style={{
                background: connectivity.is_fully_connected ? "rgba(0,255,136,0.15)" : "rgba(255,51,102,0.15)",
                color: connectivity.is_fully_connected ? "#00ff88" : "#ff3366",
                border: `1px solid ${connectivity.is_fully_connected ? "rgba(0,255,136,0.3)" : "rgba(255,51,102,0.3)"}`,
              }}>
                {connectivity.is_fully_connected ? "✓ connected" : `${connectivity.components} components`}
              </span>
            )}
            {cycleResult && (
              <span className="badge" style={{
                background: cycleResult.has_cycle ? "rgba(255,106,0,0.15)" : "rgba(0,255,136,0.15)",
                color: cycleResult.has_cycle ? "#ff6a00" : "#00ff88",
                border: `1px solid ${cycleResult.has_cycle ? "rgba(255,106,0,0.3)" : "rgba(0,255,136,0.3)"}`,
              }}>
                {cycleResult.has_cycle ? "⚠ cycle" : "✓ acyclic"}
              </span>
            )}
            {mstWeight !== null && (
              <span className="badge" style={{ background: "rgba(0,212,255,0.15)", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.3)" }}>
                MST: {mstWeight.toFixed(2)}
              </span>
            )}
            {loading && <div style={{ width: 14, height: 14, border: "2px solid #00d4ff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />}
          </div>
        </div>
        {/* Tabs */}
        {activeCircuit && (
          <div className="flex px-5 gap-1" style={{ borderTop: "1px solid #1e2d45" }}>
            {[
              ["graph", "Graph View"],
              ["nodes", "Nodes"],
              ["edges", "Edges"],
              ["algorithms", "Algorithms"],
              ["analysis", "Analysis"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setPanel(id)}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: panel === id ? "2px solid #00d4ff" : "2px solid transparent",
                  color: panel === id ? "#00d4ff" : "#4a5568",
                  padding: "8px 14px",
                  fontSize: 11,
                  fontFamily: "JetBrains Mono",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── Main */}
      <main className="flex-1 flex overflow-hidden">
        {!activeCircuit ? (
          <CircuitsHome
            circuits={circuits}
            onSelect={(c) => setActiveCircuit(c)}
            onDelete={deleteCircuit}
            onNew={() => setShowNewCircuit(true)}
          />
        ) : (
          <>
            {panel === "graph" && (
              <GraphPanel
                nodes={nodes}
                edges={edges}
                mstEdges={mstEdges}
                bfsHighlight={bfsHighlight}
                dfsHighlight={dfsHighlight}
                traversalResult={traversalResult}
                mstWeight={mstWeight}
                onAddNode={() => setShowAddNode(true)}
                onAddEdge={() => setShowAddEdge(true)}
                onRunKruskal={runKruskal}
              />
            )}
            {panel === "nodes" && (
              <NodesPanel
                nodes={nodes}
                onAdd={() => setShowAddNode(true)}
                onEdit={(n) => setShowEditNode(n)}
                onDelete={deleteNode}
              />
            )}
            {panel === "edges" && (
              <EdgesPanel
                edges={edges}
                nodes={nodes}
                onAdd={() => setShowAddEdge(true)}
                onDelete={deleteEdge}
              />
            )}
            {panel === "algorithms" && (
              <AlgorithmsPanel
                nodes={nodes}
                onRunKruskal={runKruskal}
                onRunBFS={runBFS}
                onRunDFS={runDFS}
                onRunCycle={runCycleDetection}
                traversalResult={traversalResult}
                cycleResult={cycleResult}
                mstEdges={mstEdges}
                mstWeight={mstWeight}
                loading={loading}
              />
            )}
            {panel === "analysis" && (
              <AnalysisPanel
                circuitId={activeCircuit.circuit_id}
                stats={stats}
                connectivity={connectivity}
                onLoadStats={loadStats}
                loading={loading}
              />
            )}
          </>
        )}
      </main>

      {/* ── Modals */}
      {showNewCircuit && (
        <NewCircuitModal
          onClose={() => setShowNewCircuit(false)}
          onCreate={createCircuit}
        />
      )}
      {showAddNode && activeCircuit && (
        <AddNodeModal
          onClose={() => setShowAddNode(false)}
          onAdd={addNode}
          existingCount={nodes.length}
        />
      )}
      {showAddEdge && activeCircuit && (
        <AddEdgeModal
          nodes={nodes}
          onClose={() => setShowAddEdge(false)}
          onAdd={addEdge}
        />
      )}
      {showEditNode && (
        <EditNodeModal
          node={showEditNode}
          onClose={() => setShowEditNode(null)}
          onUpdate={(data) => { updateNode(showEditNode.node_id, data); setShowEditNode(null); }}
        />
      )}

      {/* ── Toasts */}
      <div style={{ position: "fixed", bottom: 20, right: 20, display: "flex", flexDirection: "column", gap: 8, zIndex: 9999 }}>
        {toasts.map((t) => (
          <div key={t.id} className="fade-in" style={{
            padding: "10px 16px",
            borderRadius: 5,
            fontSize: 12,
            fontFamily: "JetBrains Mono",
            border: "1px solid",
            minWidth: 220,
            background: t.type === "success" ? "rgba(0,255,136,0.1)" :
              t.type === "error" ? "rgba(255,51,102,0.1)" :
              t.type === "warn" ? "rgba(255,106,0,0.1)" : "rgba(0,212,255,0.1)",
            borderColor: t.type === "success" ? "rgba(0,255,136,0.4)" :
              t.type === "error" ? "rgba(255,51,102,0.4)" :
              t.type === "warn" ? "rgba(255,106,0,0.4)" : "rgba(0,212,255,0.4)",
            color: t.type === "success" ? "#00ff88" :
              t.type === "error" ? "#ff3366" :
              t.type === "warn" ? "#ff6a00" : "#00d4ff",
          }}>
            {t.msg}
          </div>
        ))}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}