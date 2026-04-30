import { useState, useRef } from "react";
import Modal from "./Modal";
import { KIND_COLORS } from "../utils/constants";

export default function AddNodeModal({ onClose, onAdd, existingCount }) {
  const [form, setForm] = useState({
    node_id: `N${existingCount + 1}`,
    label: "",
    x: (Math.random() * 400).toFixed(1),
    y: (Math.random() * 300).toFixed(1),
    kind: "resistor",
    value: "",
    pins: "",
    layer: "top",
    status: "active",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal title="ADD NODE" onClose={onClose} color="#00d4ff">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[["node_id", "Node ID"], ["label", "Label"], ["x", "X coord"], ["y", "Y coord"], ["value", "Value"]].map(([k, l]) => (
          <div key={k}>
            <label className="label">{l}</label>
            <input className="input" value={form[k]} onChange={(e) => set(k, e.target.value)} />
          </div>
        ))}
        <div>
          <label className="label">Kind</label>
          <select className="select" value={form.kind} onChange={(e) => set("kind", e.target.value)}>
            {Object.keys(KIND_COLORS).map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Layer</label>
          <select className="select" value={form.layer} onChange={(e) => set("layer", e.target.value)}>
            <option value="top">top</option>
            <option value="bottom">bottom</option>
            <option value="inner">inner</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="select" value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label className="label">Pins (comma-separated)</label>
          <input className="input" placeholder="e.g. VCC,GND,OUT" value={form.pins} onChange={(e) => set("pins", e.target.value)} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
        <button className="btn btn-dim" onClick={onClose}>Cancel</button>
        <button className="btn btn-cyan" onClick={() => {
          onAdd({
            ...form,
            x: parseFloat(form.x) || 0,
            y: parseFloat(form.y) || 0,
            pins: form.pins ? form.pins.split(",").map((p) => p.trim()) : [],
          });
          onClose();
        }}>Add Node</button>
      </div>
    </Modal>
  );
}