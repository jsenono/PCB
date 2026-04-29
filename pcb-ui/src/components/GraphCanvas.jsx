const GraphCanvas = ({
  nodes,
  edges,
  mstEdges,
  addNode,
  onNodeClick,
  selectedNode,
  mode,
}) => {
  const handleCanvasClick = (e) => {
    if (mode !== "node") return;

    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    addNode(x, y);
  };

  const getNodeById = (id) => nodes.find((n) => n.id === id);

  const isMSTEdge = (edge) => {
    return mstEdges.some(
      (e) =>
        (e.source === edge.source && e.target === edge.target) ||
        (e.source === edge.target && e.target === edge.source)
    );
  };

  return (
    <div>
      {/* Instructions */}
      <p>
        Mode: <b>{mode}</b> |{" "}
            {mode === "node" && "Düğüm eklemek için herhangi bir yere tıklayın"}
            {mode === "edge" && "Kenar oluşturmak için 2 düğüm seçin"}
      </p>

      <svg
        width="800"
        height="600"
        onClick={handleCanvasClick}
        style={{ border: "1px solid black" }}
      >
        {/* Draw edges */}
        {edges.map((edge, i) => {
          const n1 = getNodeById(edge.source);
          const n2 = getNodeById(edge.target);

          if (!n1 || !n2) return null;

          return (
            <g key={i}>
              <line
                x1={n1.x}
                y1={n1.y}
                x2={n2.x}
                y2={n2.y}
                stroke={isMSTEdge(edge) ? "green" : "gray"}
                strokeWidth="2"
              />

              {/* Edge weight */}
              <text
                x={(n1.x + n2.x) / 2}
                y={(n1.y + n2.y) / 2}
                fontSize="12"
                fill="white"
              >
                {edge.weight}
              </text>
            </g>
          );
        })}

        {/* Draw nodes */}
        {nodes.map((node) => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r="10"
            fill={
              selectedNode?.id === node.id ? "orange" : "blue"
            }
            onClick={(e) => {
              e.stopPropagation();
              if (mode === "edge") onNodeClick(node);
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export default GraphCanvas;