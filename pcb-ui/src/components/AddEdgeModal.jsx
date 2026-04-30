import { useState, useRef } from "react";
import Modal from "./Modal";
import { KIND_COLORS } from "../utils/constants";

export default function AddEdgeModal({ nodes, onClose, onAdd }) {
  const [form, setForm] = useState({ node_a: "", node_b: "", weight: "1.0", edge_type: "signal", layer: "top" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal title="ADD EDGE" onClose={onClose} color="#ff6a00">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[["node_a", "Node A"], ["node_b", "Node B"]].map(([k, l]) => (
          <div key={k}>
            <label className="label">{l}</label>
            <select className="select" value={form[k]} onChange={(e) => set(k, e.target.value)}>
              <option value="">— select —</option>
              {nodes.map((n) => <option key={n.node_id} value={n.node_id}>{n.node_id}</option>)}
            </select>
          </div>
        ))}
        <div>
          <label className="label">Weight</label>
          <input className="input" type="number" step="0.1" min="0" value={form.weight} onChange={(e) => set("weight", e.target.value)} />
        </div>
        <div>
          <label className="label">Layer</label>
          <select className="select" value={form.layer} onChange={(e) => set("layer", e.target.value)}>
            <option value="top">top</option>
            <option value="bottom">bottom</option>
            <option value="inner">inner</option>
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label className="label">Edge Type</label>
          <select className="select" value={form.edge_type} onChange={(e) => set("edge_type", e.target.value)}>
            {["signal", "power", "ground", "data", "clock"].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
        <button className="btn btn-dim" onClick={onClose}>Cancel</button>
        <button className="btn btn-orange" onClick={() => {
          if (form.node_a && form.node_b) {
            onAdd({ ...form, weight: parseFloat(form.weight) || 1 });
            onClose();
          }
        }}>Add Edge</button>
      </div>
    </Modal>
  );
}