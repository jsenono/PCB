import { useState, useRef } from "react";
import AddNodeModal from "../components/AddNodeModal";
import EditNodeModal from "../components/EditNodeModal";
import AddEdgeModal from "../components/AddEdgeModal";
import NewCircuitModal from "../components/NewCircuitModal";
import GraphPanel from "./GraphPanel";


// ─────────────────────────────────────────────────────────────────────────────
// CIRCUITS HOME
// ─────────────────────────────────────────────────────────────────────────────
export function CircuitsHome({ circuits, onSelect, onDelete, onNew }) {
  return (
    <div className="flex-1 grid-bg overflow-auto p-8">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ fontFamily: "Orbitron", fontSize: 24, fontWeight: 900, color: "#00d4ff", marginBottom: 4 }}>
          CIRCUIT LIBRARY
        </div>
        <div style={{ fontSize: 11, color: "#4a5568", marginBottom: 28, letterSpacing: "0.05em" }}>
          SELECT OR CREATE A PCB CIRCUIT TO BEGIN
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
          {/* New circuit card */}
          <button
            onClick={onNew}
            style={{
              background: "rgba(0,212,255,0.04)",
              border: "1px dashed rgba(0,212,255,0.3)",
              borderRadius: 8,
              padding: 24,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              color: "#00d4ff",
              transition: "all 0.2s",
              fontFamily: "JetBrains Mono",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,212,255,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,212,255,0.04)"; }}
          >
            <div style={{ fontSize: 32 }}>+</div>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>New Circuit</div>
          </button>
          {circuits.map((c) => (
            <div key={c.circuit_id}
              style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 8, padding: 20, cursor: "pointer", transition: "all 0.2s", position: "relative" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,212,255,0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1e2d45"; }}
              onClick={() => onSelect(c)}
            >
              <div style={{ fontFamily: "Orbitron", fontSize: 13, color: "#00d4ff", fontWeight: 700, marginBottom: 8 }}>
                #{c.circuit_id}
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
                <span><span style={{ color: "#4a5568" }}>N: </span><span style={{ color: "#00ff88" }}>{c.node_count}</span></span>
                <span><span style={{ color: "#4a5568" }}>E: </span><span style={{ color: "#ff6a00" }}>{c.edge_count}</span></span>
              </div>
              <button
                className="btn btn-red"
                style={{ position: "absolute", top: 12, right: 12, padding: "3px 8px" }}
                onClick={(e) => { e.stopPropagation(); onDelete(c.circuit_id); }}
              >del</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
