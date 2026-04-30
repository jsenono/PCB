import { useState, useRef, useEffect } from "react";
import { KIND_COLORS, KIND_SYMBOLS } from "../utils/constants";
// ─────────────────────────────────────────────────────────────────────────────
// GRAPH CANVAS PANEL
// ─────────────────────────────────────────────────────────────────────────────
export default function GraphPanel({ nodes, edges, mstEdges, bfsHighlight, dfsHighlight, traversalResult, mstWeight, onAddNode, onAddEdge, onRunKruskal }) {
  const svgRef = useRef(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const mstSet = new Set(
    mstEdges.map((e) => `${e.node_a}__${e.node_b}`)
  );
  const bfsSet = new Set(bfsHighlight);
  const dfsSet = new Set(dfsHighlight);

  const nodeMap = {};
  nodes.forEach((n) => { nodeMap[n.node_id] = n; });

  // Compute bounding box for auto-fit
  useEffect(() => {
    if (nodes.length === 0) return;
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const W = svgEl.clientWidth || 800;
    const H = svgEl.clientHeight || 600;
    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const padX = 80, padY = 80;
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const scale = Math.min((W - padX * 2) / rangeX, (H - padY * 2) / rangeY, 2);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    setTransform({ x: W / 2 - cx * scale, y: H / 2 - cy * scale, scale });
  }, [nodes.length]);

  const handleWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((t) => ({ ...t, scale: Math.max(0.1, Math.min(5, t.scale * factor)) }));
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
  };

  const handleMouseUp = () => { isDragging.current = false; };

  const tx = (x) => x * transform.scale + transform.x;
  const ty = (y) => y * transform.scale + transform.y;

  return (
    <div className="flex-1 flex flex-col" style={{ background: "#0a0e1a", overflow: "hidden" }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2" style={{ borderBottom: "1px solid #1e2d45", background: "#111827" }}>
        <button className="btn btn-green" onClick={onAddNode}>+ Node</button>
        <button className="btn btn-cyan" onClick={onAddEdge}>+ Edge</button>
        <button className="btn btn-purple" onClick={onRunKruskal}>▶ Kruskal MST</button>
        <div style={{ flex: 1 }} />
        {mstEdges.length > 0 && (
          <span style={{ fontSize: 11, color: "#00ff88" }}>
            MST: {mstEdges.length} edges · weight {mstWeight?.toFixed(2)}
          </span>
        )}
        {traversalResult && (
          <span style={{ fontSize: 11, color: "#b44dff" }}>
            {traversalResult.type}: {traversalResult.nodes_visited} nodes visited
          </span>
        )}
        <span style={{ fontSize: 10, color: "#4a5568" }}>scroll=zoom · drag=pan</span>
      </div>

      {/* SVG canvas */}
      <div className="flex-1 relative grid-bg" style={{ overflow: "hidden", cursor: "grab" }}>
        <svg
          ref={svgRef}
          style={{ width: "100%", height: "100%" }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#1e2d45" />
            </marker>
            <filter id="glow-green">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-purple">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <g>
            {/* All edges (dim) */}
            {edges.map((e, i) => {
              const na = nodeMap[e.node_a];
              const nb = nodeMap[e.node_b];
              if (!na || !nb) return null;
              const isMst = mstSet.has(`${e.node_a}__${e.node_b}`) || mstSet.has(`${e.node_b}__${e.node_a}`);
              const mx = (tx(na.x) + tx(nb.x)) / 2;
              const my = (ty(na.y) + ty(nb.y)) / 2;
              return (
                <g key={i}>
                  <line
                    x1={tx(na.x)} y1={ty(na.y)}
                    x2={tx(nb.x)} y2={ty(nb.y)}
                    stroke={isMst ? "#00ff88" : "#1e2d45"}
                    strokeWidth={isMst ? 2.5 : 1}
                    strokeOpacity={isMst ? 1 : 0.6}
                    style={isMst ? { filter: "drop-shadow(0 0 4px #00ff88)" } : {}}
                  />
                  {/* Weight label */}
                  <text x={mx} y={my - 5} fill={isMst ? "#00ff88" : "#2d3d55"} fontSize={9} textAnchor="middle" style={{ fontFamily: "JetBrains Mono" }}>
                    {e.weight?.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* BFS/DFS order lines */}
            {(bfsHighlight.length > 0 || dfsHighlight.length > 0) && (() => {
              const order = bfsHighlight.length > 0 ? bfsHighlight : dfsHighlight;
              const color = bfsHighlight.length > 0 ? "#00d4ff" : "#b44dff";
              return order.slice(0, -1).map((nid, i) => {
                const na = nodeMap[nid];
                const nb = nodeMap[order[i + 1]];
                if (!na || !nb) return null;
                return (
                  <line key={`trav-${i}`}
                    x1={tx(na.x)} y1={ty(na.y)}
                    x2={tx(nb.x)} y2={ty(nb.y)}
                    stroke={color}
                    strokeWidth={1.5}
                    strokeDasharray="4,4"
                    strokeOpacity={0.7}
                  />
                );
              });
            })()}

            {/* Nodes */}
            {nodes.map((n) => {
              const cx = tx(n.x);
              const cy = ty(n.y);
              const color = KIND_COLORS[n.kind] || KIND_COLORS.other;
              const sym = KIND_SYMBOLS[n.kind] || "?";
              const r = 18;
              const isBfs = bfsSet.has(n.node_id);
              const isDfs = dfsSet.has(n.node_id);
              const bfsOrder = bfsHighlight.indexOf(n.node_id);
              const dfsOrder = dfsHighlight.indexOf(n.node_id);
              const isHovered = hoveredNode === n.node_id;

              return (
                <g key={n.node_id}
                  onMouseEnter={() => setHoveredNode(n.node_id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Glow ring */}
                  {(isBfs || isDfs) && (
                    <circle cx={cx} cy={cy} r={r + 6}
                      fill="none"
                      stroke={isBfs ? "#00d4ff" : "#b44dff"}
                      strokeWidth={1.5}
                      strokeOpacity={0.5}
                    />
                  )}
                  {/* Body */}
                  <circle cx={cx} cy={cy} r={r}
                    fill={`${color}22`}
                    stroke={color}
                    strokeWidth={isHovered ? 2 : 1.5}
                    style={isHovered ? { filter: `drop-shadow(0 0 6px ${color})` } : {}}
                  />
                  {/* Symbol */}
                  <text x={cx} y={cy + 4} textAnchor="middle" fill={color}
                    fontSize={11} fontWeight={700} style={{ fontFamily: "JetBrains Mono", pointerEvents: "none" }}>
                    {sym}
                  </text>
                  {/* Label */}
                  <text x={cx} y={cy + r + 12} textAnchor="middle" fill="#8892a4"
                    fontSize={9} style={{ fontFamily: "JetBrains Mono", pointerEvents: "none" }}>
                    {n.node_id.length > 8 ? n.node_id.slice(0, 8) + "…" : n.node_id}
                  </text>
                  <text x={cx} y={cy - r - 12} textAnchor="middle" fill="#8892a4"
                    fontSize={9} style={{ fontFamily: "JetBrains Mono", pointerEvents: "none" }}>
                      {n.label}
                  </text>
                  {/* BFS/DFS order badge */}
                  {(bfsOrder >= 0 || dfsOrder >= 0) && (
                    <text x={cx + r - 3} y={cy - r + 8} textAnchor="middle"
                      fill={isBfs ? "#00d4ff" : "#b44dff"} fontSize={8} fontWeight={700}
                      style={{ fontFamily: "JetBrains Mono" }}>
                      {bfsOrder >= 0 ? bfsOrder : dfsOrder}
                    </text>
                  )}
                  {/* Hover tooltip */}
                  {isHovered && (
                    <g>
                      <rect x={cx + r + 4} y={cy - 22} width={120} height={44}
                        fill="#1a2236" stroke="#1e2d45" rx={3} />
                      <text x={cx + r + 10} y={cy - 7} fill="#c8d0e0" fontSize={9} style={{ fontFamily: "JetBrains Mono" }}>
                        {n.node_id}
                      </text>
                      <text x={cx + r + 10} y={cy + 5} fill="#4a5568" fontSize={8} style={{ fontFamily: "JetBrains Mono" }}>
                        {n.kind} · {n.layer}
                      </text>
                      <text x={cx + r + 10} y={cy + 17} fill="#4a5568" fontSize={8} style={{ fontFamily: "JetBrains Mono" }}>
                        ({n.x?.toFixed(0)}, {n.y?.toFixed(0)})
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {nodes.length === 0 && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", pointerEvents: "none",
          }}>
            <div style={{ fontSize: 40, marginBottom: 8, opacity: 0.15 }}>⬡</div>
            <div style={{ fontSize: 12, color: "#2d3d55", letterSpacing: "0.1em" }}>NO NODES · ADD COMPONENTS TO BEGIN</div>
          </div>
        )}

        {/* Legend */}
        <div style={{
          position: "absolute", bottom: 12, left: 12,
          background: "rgba(17,24,39,0.9)", border: "1px solid #1e2d45",
          borderRadius: 6, padding: "8px 12px",
        }}>
          <div style={{ fontSize: 9, color: "#4a5568", letterSpacing: "0.1em", marginBottom: 6 }}>LEGEND</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", maxWidth: 320 }}>
            {Object.entries(KIND_COLORS).map(([k, c]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                <span style={{ fontSize: 9, color: "#4a5568", textTransform: "uppercase" }}>{k}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 16, height: 2, background: "#00ff88" }} />
              <span style={{ fontSize: 9, color: "#4a5568" }}>MST</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}