const Controls = ({ mode, setMode, runMST, resetGraph }) => {
  return (
    <div style={{ marginBottom: "10px", gap: "10px", display: "flex" }}>
      <button
        onClick={() => setMode("node")}
        style={{ background: mode === "node" ? "blue" : "white" }}
      >
        ➕ Düğüm Ekle
      </button>

      <button
        onClick={() => setMode("edge")}
        style={{ background: mode === "edge" ? "blue" : "white" }}
      >
        🔗 Kenar Ekle
      </button>

      <button onClick={runMST}>▶ Run MST</button>
      <button onClick={resetGraph}>♻ Reset</button>
    </div>
  );
};

export default Controls;