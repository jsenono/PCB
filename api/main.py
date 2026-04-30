import sys
from pathlib import Path

# Add parent directory to path to import core modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Tuple
from core.graph import PCBGraph, PCBNode, PCBEdge
from algorithm.algorithm import bfs, dfs, kruskal_mst, has_cycle

app = FastAPI(
    title="PCB Circuit Design API",
    description="Comprehensive API for interactive PCB circuit design using graph data structures",
    version="2.0.0"
)

# Global graph storage
circuit_graphs: Dict[int, PCBGraph] = {}
next_circuit_id = 1


# ==================== Pydantic Models ====================

class NodeRequest(BaseModel):
    """Request model for creating/updating PCB nodes (components)"""
    node_id: str
    label: str
    x: float = 0.0
    y: float = 0.0
    kind: str = "other"
    value: Optional[str] = None
    pins: Optional[List[str]] = None
    layer: str = "top"
    status: str = "active"


class NodeResponse(BaseModel):
    """Response model for PCB nodes"""
    node_id: str
    label: str
    x: float
    y: float
    kind: str
    value: Optional[str]
    pins: Optional[List[str]]
    layer: str
    status: str

    class Config:
        from_attributes = True


class EdgeRequest(BaseModel):
    """Request model for creating/updating connections"""
    node_a: str
    node_b: str
    weight: float
    edge_type: str = "signal"
    layer: str = "top"


class EdgeResponse(BaseModel):
    """Response model for connections"""
    node_a: str
    node_b: str
    weight: float
    edge_type: str
    layer: str


class CircuitResponse(BaseModel):
    """Response model for circuit"""
    circuit_id: int
    nodes: List[NodeResponse]
    edges: List[EdgeResponse]
    total_weight: float


class CircuitCreateRequest(BaseModel):
    """Request model for creating a new circuit"""
    name: Optional[str] = None


class ConnectionAnalysis(BaseModel):
    """Response model for connection analysis"""
    node_id: str
    degree: int
    neighbors: List[Dict]
    total_connected_weight: float


class CircuitStats(BaseModel):
    """Response model for circuit statistics"""
    circuit_id: int
    node_count: int
    edge_count: int
    total_weight: float
    avg_degree: float


# ==================== Algorithm Result Models ====================

class TraversalResult(BaseModel):
    """Response model for graph traversal algorithms (BFS, DFS)"""
    circuit_id: int
    algorithm: str
    start_node: str
    traversal_order: List[str]
    nodes_visited: int


class MSTResult(BaseModel):
    """Response model for Minimum Spanning Tree (Kruskal's algorithm)"""
    circuit_id: int
    algorithm: str
    mst_edges: List[Dict]
    total_weight: float
    edge_count: int


class CycleDetectionResult(BaseModel):
    """Response model for cycle detection"""
    circuit_id: int
    has_cycle: bool
    status: str


# ==================== Helper Functions ====================

def get_circuit_or_404(circuit_id: int) -> PCBGraph:
    """Get circuit graph or raise 404 error"""
    if circuit_id not in circuit_graphs:
        raise HTTPException(status_code=404, detail=f"Circuit {circuit_id} not found")
    return circuit_graphs[circuit_id]


def node_to_response(node: PCBNode) -> NodeResponse:
    """Convert PCBNode to NodeResponse"""
    return NodeResponse(
        node_id=node.node_id,
        label=node.label,
        x=node.x,
        y=node.y,
        kind=node.kind,
        value=node.value,
        pins=node.pins,
        layer=node.layer,
        status=node.status
    )


def edge_to_response(edge: PCBEdge) -> EdgeResponse:
    """Convert PCBEdge to EdgeResponse"""
    return EdgeResponse(
        node_a=edge.node_a,
        node_b=edge.node_b,
        weight=edge.weight,
        edge_type=edge.type,
        layer=edge.layer
    )


# ==================== Root & Health ====================

@app.get("/")
async def root():
    """Welcome endpoint with API overview"""
    return {
        "message": "Welcome to PCB Circuit Design API",
        "version": "2.0.0",
        "description": "Comprehensive graph-based PCB design and circuit management",
        "main_endpoints": {
            "circuits": "/circuits - Manage circuits",
            "nodes": "/circuits/{circuit_id}/nodes - Manage components/nodes",
            "edges": "/circuits/{circuit_id}/edges - Manage connections/edges",
            "analysis": "/circuits/{circuit_id}/analysis - Circuit analysis",
            "docs": "/docs - Interactive API documentation"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "active_circuits": len(circuit_graphs)
    }


# ==================== Circuit Management ====================

@app.post("/circuits", response_model=CircuitResponse)
async def create_circuit(request: CircuitCreateRequest):
    """Create a new circuit"""
    global next_circuit_id
    circuit_id = next_circuit_id
    next_circuit_id += 1
    
    circuit_graphs[circuit_id] = PCBGraph()
    return CircuitResponse(
        circuit_id=circuit_id,
        nodes=[],
        edges=[],
        total_weight=0.0
    )


@app.get("/circuits")
async def list_circuits():
    """List all circuits with summary statistics"""
    return [
        {
            "circuit_id": cid,
            "node_count": len(g.nodes),
            "edge_count": len(g.edges),
            "total_weight": g.total_weight()
        }
        for cid, g in circuit_graphs.items()
    ]


@app.get("/circuits/{circuit_id}", response_model=CircuitResponse)
async def get_circuit(circuit_id: int):
    """Get circuit details"""
    graph = get_circuit_or_404(circuit_id)
    return CircuitResponse(
        circuit_id=circuit_id,
        nodes=[node_to_response(node) for node in graph.nodes.values()],
        edges=[edge_to_response(edge) for edge in graph.edges],
        total_weight=graph.total_weight()
    )


@app.delete("/circuits/{circuit_id}")
async def delete_circuit(circuit_id: int):
    """Delete a circuit"""
    if circuit_id not in circuit_graphs:
        raise HTTPException(status_code=404, detail=f"Circuit {circuit_id} not found")
    
    del circuit_graphs[circuit_id]
    return {"message": f"Circuit {circuit_id} deleted successfully"}


@app.post("/circuits/{circuit_id}/stats", response_model=CircuitStats)
async def get_circuit_stats(circuit_id: int):
    """Get comprehensive circuit statistics"""
    graph = get_circuit_or_404(circuit_id)
    
    node_count = len(graph.nodes)
    edge_count = len(graph.edges)
    total_weight = graph.total_weight()
    avg_degree = sum(graph.degree(nid) for nid in graph.nodes) / node_count if node_count > 0 else 0
    
    return CircuitStats(
        circuit_id=circuit_id,
        node_count=node_count,
        edge_count=edge_count,
        total_weight=total_weight,
        avg_degree=avg_degree
    )


# ==================== Node/Component Management ====================

@app.post("/circuits/{circuit_id}/nodes", response_model=NodeResponse)
async def add_node(circuit_id: int, node_req: NodeRequest):
    """Add a new component (node) to circuit"""
    graph = get_circuit_or_404(circuit_id)
    
    if graph.has_node(node_req.node_id):
        raise HTTPException(status_code=409, detail=f"Node {node_req.node_id} already exists")
    
    graph.add_node(
        node_id=node_req.node_id,
        label=node_req.label,
        x=node_req.x,
        y=node_req.y,
        kind=node_req.kind,
        value=node_req.value,
        pins=node_req.pins,
        layer=node_req.layer,
        status=node_req.status
    )
    
    return node_to_response(graph.nodes[node_req.node_id])


@app.get("/circuits/{circuit_id}/nodes", response_model=List[NodeResponse])
async def list_nodes(circuit_id: int):
    """Get all nodes in circuit"""
    graph = get_circuit_or_404(circuit_id)
    return [node_to_response(node) for node in graph.nodes.values()]


@app.get("/circuits/{circuit_id}/nodes/{node_id}", response_model=NodeResponse)
async def get_node(circuit_id: int, node_id: str):
    """Get specific node details"""
    graph = get_circuit_or_404(circuit_id)
    
    if not graph.has_node(node_id):
        raise HTTPException(status_code=404, detail=f"Node {node_id} not found")
    
    return node_to_response(graph.nodes[node_id])


@app.put("/circuits/{circuit_id}/nodes/{node_id}", response_model=NodeResponse)
async def update_node(circuit_id: int, node_id: str, node_req: NodeRequest):
    """Update node properties (recreate node with new properties)"""
    graph = get_circuit_or_404(circuit_id)
    
    if not graph.has_node(node_id):
        raise HTTPException(status_code=404, detail=f"Node {node_id} not found")
    
    # Remove old node and add updated one
    graph.remove_node(node_id)
    graph.add_node(
        node_id=node_req.node_id,
        label=node_req.label,
        x=node_req.x,
        y=node_req.y,
        kind=node_req.kind,
        value=node_req.value,
        pins=node_req.pins,
        layer=node_req.layer,
        status=node_req.status
    )
    
    return node_to_response(graph.nodes[node_req.node_id])


@app.delete("/circuits/{circuit_id}/nodes/{node_id}")
async def remove_node(circuit_id: int, node_id: str):
    """Remove a node from circuit"""
    graph = get_circuit_or_404(circuit_id)
    
    if not graph.has_node(node_id):
        raise HTTPException(status_code=404, detail=f"Node {node_id} not found")
    
    graph.remove_node(node_id)
    return {"message": f"Node {node_id} removed successfully"}


# ==================== Edge/Connection Management ====================

@app.post("/circuits/{circuit_id}/edges", response_model=EdgeResponse)
async def add_edge(circuit_id: int, edge_req: EdgeRequest):
    """Add a connection (edge) between two nodes"""
    graph = get_circuit_or_404(circuit_id)
    
    # Validate nodes exist
    if not graph.has_node(edge_req.node_a):
        raise HTTPException(status_code=404, detail=f"Node {edge_req.node_a} not found")
    if not graph.has_node(edge_req.node_b):
        raise HTTPException(status_code=404, detail=f"Node {edge_req.node_b} not found")
    
    # Check if edge already exists
    if graph.has_edge(edge_req.node_a, edge_req.node_b):
        raise HTTPException(status_code=409, detail="Connection already exists between these nodes")
    
    try:
        graph.add_edge(
            u=edge_req.node_a,
            v=edge_req.node_b,
            weight=edge_req.weight,
            edge_type=edge_req.edge_type,
            layer=edge_req.layer
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Find and return the created edge
    created_edge = next(
        e for e in graph.edges
        if (e.node_a == edge_req.node_a and e.node_b == edge_req.node_b) or
           (e.node_a == edge_req.node_b and e.node_b == edge_req.node_a)
    )
    
    return edge_to_response(created_edge)


@app.get("/circuits/{circuit_id}/edges", response_model=List[EdgeResponse])
async def list_edges(circuit_id: int):
    """Get all connections in circuit"""
    graph = get_circuit_or_404(circuit_id)
    return [edge_to_response(edge) for edge in graph.edges]


@app.get("/circuits/{circuit_id}/edges/{node_a}/{node_b}")
async def get_edge(circuit_id: int, node_a: str, node_b: str):
    """Check if connection exists between two nodes"""
    graph = get_circuit_or_404(circuit_id)
    
    if not graph.has_node(node_a) or not graph.has_node(node_b):
        raise HTTPException(status_code=404, detail="One or both nodes not found")
    
    if not graph.has_edge(node_a, node_b):
        raise HTTPException(status_code=404, detail="No connection between these nodes")
    
    # Find the edge
    edge = next(
        e for e in graph.edges
        if (e.node_a == node_a and e.node_b == node_b) or
           (e.node_a == node_b and e.node_b == node_a)
    )
    
    return edge_to_response(edge)


@app.delete("/circuits/{circuit_id}/edges/{node_a}/{node_b}")
async def remove_edge(circuit_id: int, node_a: str, node_b: str):
    """Remove a connection between two nodes"""
    graph = get_circuit_or_404(circuit_id)
    
    if not graph.has_node(node_a) or not graph.has_node(node_b):
        raise HTTPException(status_code=404, detail="One or both nodes not found")
    
    if not graph.has_edge(node_a, node_b):
        raise HTTPException(status_code=404, detail="No connection between these nodes")
    
    graph.remove_edge(node_a, node_b)
    return {"message": f"Connection between {node_a} and {node_b} removed"}


# ==================== Circuit Analysis & Queries ====================

@app.get("/circuits/{circuit_id}/analysis/neighbors/{node_id}", response_model=ConnectionAnalysis)
async def analyze_node_connections(circuit_id: int, node_id: str):
    """Analyze all connections for a specific node"""
    graph = get_circuit_or_404(circuit_id)
    
    if not graph.has_node(node_id):
        raise HTTPException(status_code=404, detail=f"Node {node_id} not found")
    
    neighbors = graph.get_neighbors(node_id)
    degree = graph.degree(node_id)
    total_weight = sum(edge.weight for _, edge in neighbors)
    
    neighbors_list = [
        {
            "neighbor_id": neighbor_id,
            "weight": edge.weight,
            "edge_type": edge.type,
            "layer": edge.layer
        }
        for neighbor_id, edge in neighbors
    ]
    
    return ConnectionAnalysis(
        node_id=node_id,
        degree=degree,
        neighbors=neighbors_list,
        total_connected_weight=total_weight
    )


@app.get("/circuits/{circuit_id}/analysis/connectivity")
async def analyze_circuit_connectivity(circuit_id: int):
    """Analyze overall circuit connectivity"""
    graph = get_circuit_or_404(circuit_id)
    
    if not graph.nodes:
        return {
            "node_count": 0,
            "edge_count": 0,
            "total_weight": 0,
            "avg_degree": 0,
            "nodes_by_degree": [],
            "isolated_nodes": []
        }
    
    node_degrees = {nid: graph.degree(nid) for nid in graph.nodes}
    isolated_nodes = [nid for nid, degree in node_degrees.items() if degree == 0]
    
    nodes_by_degree = sorted(node_degrees.items(), key=lambda x: x[1], reverse=True)
    
    return {
        "node_count": len(graph.nodes),
        "edge_count": len(graph.edges),
        "total_weight": graph.total_weight(),
        "avg_degree": sum(node_degrees.values()) / len(node_degrees),
        "nodes_by_degree": [{"node_id": nid, "degree": deg} for nid, deg in nodes_by_degree],
        "isolated_nodes": isolated_nodes,
        "max_degree": max(node_degrees.values()) if node_degrees else 0,
        "min_degree": min(node_degrees.values()) if node_degrees else 0
    }


@app.get("/circuits/{circuit_id}/analysis/layers")
async def analyze_layers(circuit_id: int):
    """Analyze nodes and edges by layer"""
    graph = get_circuit_or_404(circuit_id)
    
    layers = {}
    
    # Count nodes per layer
    for node in graph.nodes.values():
        layer = node.layer
        if layer not in layers:
            layers[layer] = {"nodes": 0, "edges": 0, "node_list": [], "edge_list": []}
        layers[layer]["nodes"] += 1
        layers[layer]["node_list"].append(node.node_id)
    
    # Count edges per layer
    for edge in graph.edges:
        layer = edge.layer
        if layer not in layers:
            layers[layer] = {"nodes": 0, "edges": 0, "node_list": [], "edge_list": []}
        layers[layer]["edges"] += 1
        layers[layer]["edge_list"].append(f"{edge.node_a}-{edge.node_b}")
    
    return {
        "circuit_id": circuit_id,
        "layers": layers
    }


@app.get("/circuits/{circuit_id}/analysis/components-by-kind")
async def analyze_components_by_kind(circuit_id: int):
    """Analyze components by kind/type"""
    graph = get_circuit_or_404(circuit_id)
    
    kinds = {}
    for node in graph.nodes.values():
        kind = node.kind
        if kind not in kinds:
            kinds[kind] = []
        kinds[kind].append({
            "node_id": node.node_id,
            "label": node.label,
            "value": node.value,
            "status": node.status
        })
    
    return {
        "circuit_id": circuit_id,
        "component_types": kinds,
        "summary": {kind: len(components) for kind, components in kinds.items()}
    }



# ==================== Graph Algorithm Endpoints ====================

@app.post("/circuits/{circuit_id}/algorithms/bfs", response_model=TraversalResult)
async def run_bfs(circuit_id: int, start_node: str):
    """Run Breadth-First Search traversal from a starting node"""
    graph = get_circuit_or_404(circuit_id)
    
    if not graph.has_node(start_node):
        raise HTTPException(status_code=404, detail=f"Start node {start_node} not found")
    
    try:
        traversal_order = bfs(graph, start_node)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"BFS algorithm error: {str(e)}")
    
    return TraversalResult(
        circuit_id=circuit_id,
        algorithm="BFS (Breadth-First Search)",
        start_node=start_node,
        traversal_order=traversal_order,
        nodes_visited=len(traversal_order)
    )


@app.post("/circuits/{circuit_id}/algorithms/dfs", response_model=TraversalResult)
async def run_dfs(circuit_id: int, start_node: str):
    """Run Depth-First Search traversal from a starting node"""
    graph = get_circuit_or_404(circuit_id)
    
    if not graph.has_node(start_node):
        raise HTTPException(status_code=404, detail=f"Start node {start_node} not found")
    
    try:
        traversal_order = dfs(graph, start_node)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"DFS algorithm error: {str(e)}")
    
    return TraversalResult(
        circuit_id=circuit_id,
        algorithm="DFS (Depth-First Search)",
        start_node=start_node,
        traversal_order=traversal_order,
        nodes_visited=len(traversal_order)
    )


@app.post("/circuits/{circuit_id}/algorithms/kruskal-mst", response_model=MSTResult)
async def run_kruskal_mst(circuit_id: int):
    """Calculate Minimum Spanning Tree using Kruskal's algorithm"""
    graph = get_circuit_or_404(circuit_id)
    
    if len(graph.nodes) < 2:
        raise HTTPException(status_code=400, detail="Circuit must have at least 2 nodes for MST calculation")
    
    try:
        mst_edges, total_weight = kruskal_mst(graph)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Kruskal MST algorithm error: {str(e)}")
    
    # Format MST edges for response
    formatted_edges = [
        {
            "node_a": edge.node_a,
            "node_b": edge.node_b,
            "weight": edge.weight,
            "edge_type": edge.type,
            "layer": edge.layer
        }
        for edge in mst_edges
    ]
    
    return MSTResult(
        circuit_id=circuit_id,
        algorithm="Kruskal's MST (Minimum Spanning Tree)",
        mst_edges=formatted_edges,
        total_weight=total_weight,
        edge_count=len(mst_edges)
    )


@app.post("/circuits/{circuit_id}/algorithms/cycle-detection", response_model=CycleDetectionResult)
async def detect_cycles(circuit_id: int):
    """Detect if circuit has cycles"""
    graph = get_circuit_or_404(circuit_id)
    
    try:
        cycle_exists = has_cycle(graph)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Cycle detection error: {str(e)}")
    
    return CycleDetectionResult(
        circuit_id=circuit_id,
        has_cycle=cycle_exists,
        status="Cycle detected" if cycle_exists else "No cycles detected"
    )


# ==================== Algorithm Help ====================

@app.get("/algorithms")
async def list_available_algorithms():
    """List all available graph algorithms"""
    return {
        "available_algorithms": [
            {
                "name": "Breadth-First Search (BFS)",
                "endpoint": "POST /circuits/{circuit_id}/algorithms/bfs",
                "parameters": ["circuit_id", "start_node"],
                "description": "Traverses graph level by level from a starting node"
            },
            {
                "name": "Depth-First Search (DFS)",
                "endpoint": "POST /circuits/{circuit_id}/algorithms/dfs",
                "parameters": ["circuit_id", "start_node"],
                "description": "Traverses graph by going as deep as possible before backtracking"
            },
            {
                "name": "Kruskal's Minimum Spanning Tree",
                "endpoint": "POST /circuits/{circuit_id}/algorithms/kruskal-mst",
                "parameters": ["circuit_id"],
                "description": "Finds the minimum spanning tree that connects all nodes with minimum total weight"
            },
            {
                "name": "Cycle Detection",
                "endpoint": "POST /circuits/{circuit_id}/algorithms/cycle-detection",
                "parameters": ["circuit_id"],
                "description": "Detects if the circuit graph contains any cycles"
            }
        ]
    }




if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
