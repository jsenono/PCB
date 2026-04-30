import { useState, useRef } from "react";
import Modal from "./Modal";

export default function NewCircuitModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  return (
    <Modal title="NEW CIRCUIT" onClose={onClose} color="#00ff88">
      <label className="label">Circuit Name</label>
      <input className="input" placeholder="e.g. Motherboard v2" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 16 }} />
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className="btn btn-dim" onClick={onClose}>Cancel</button>
        <button className="btn btn-green" onClick={() => { if (name) { onCreate(name); onClose(); } }}>Create</button>
      </div>
    </Modal>
  );
}