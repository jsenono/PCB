import { useState } from "react";
import GraphCanvas from "./components/GraphCanvas";
import Controls from "./components/Controls";
import { getFakeMST } from "./services/fakeApi";

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [mstEdges, setMstEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [mode, setMode] = useState("node");

  const addNode = (x, y) => {
    const newNode = {
      id: nodes.length + 1,
      x,
      y,
    };
    setNodes([...nodes, newNode]);
  };

  const handleNodeClick = (node) => {
    if (!selectedNode) {
      setSelectedNode(node);
    } else {
      // Random weight (better UX than prompt)
      const weight = Math.floor(Math.random() * 10) + 1;

      setEdges([
        ...edges,
        {
          source: selectedNode.id,
          target: node.id,
          weight,
        },
      ]);

      setSelectedNode(null);
    }
  };

  const runMST = async () => {
    if (edges.length === 0) {
      alert("Please add edges first!");
      return;
    }

    const result = await getFakeMST({ nodes, edges });

    console.log("MST result:", result);

    setMstEdges(result.mstEdges);
  };

  const resetGraph = () => {
    setNodes([]);
    setEdges([]);
    setMstEdges([]);
    setSelectedNode(null);
  };

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h2>PCB Bağlantı Ağı Optimizasyonu (MST)</h2>

      <Controls
        mode={mode}
        setMode={setMode}
        runMST={runMST}
        resetGraph={resetGraph}
      />

      <GraphCanvas
        nodes={nodes}
        edges={edges}
        mstEdges={mstEdges}
        addNode={addNode}
        onNodeClick={handleNodeClick}
        selectedNode={selectedNode}
        mode={mode}
      />
    </div>
  );
}

export default App;