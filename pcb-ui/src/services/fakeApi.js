export const getFakeMST = async (graph) => {
  console.log("Graph sent to fake API:", graph);

  await new Promise((res) => setTimeout(res, 700));

  // Fake MST: just take first (V-1) edges
  const mstEdges = graph.edges.slice(0, graph.nodes.length - 1);

  return {
    mstEdges,
    totalCost: mstEdges.reduce((sum, e) => sum + e.weight, 0),
  };
};