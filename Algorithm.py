import json
from typing import Dict, List, Tuple, Optional
import math


# ==========================================
# 🧱 NODE CLASSES FOR DIFFERENT COMPONENTS
# ==========================================

class PCBComponent:
    """Base class for all PCB components (nodes)"""

    def __init__(self, comp_id: str, comp_type: str, value: str, pins: int,
                 position: Dict[str, float], layer: str, status: str = "active"):
        self.id = comp_id
        self.type = comp_type
        self.value = value
        self.pins = pins
        self.position = position  # {"x": float, "y": float}
        self.layer = layer  # "top" or "bottom"
        self.status = status  # "active" or "inactive"

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "type": self.type,
            "value": self.value,
            "pins": self.pins,
            "position": self.position,
            "layer": self.layer,
            "status": self.status
        }

    def distance_to(self, other: 'PCBComponent') -> float:
        """Calculate Euclidean distance to another component"""
        dx = self.position["x"] - other.position["x"]
        dy = self.position["y"] - other.position["y"]
        return math.sqrt(dx ** 2 + dy ** 2)

    def __repr__(self):
        return f"{self.type.capitalize()}({self.id}: {self.value})"


class Resistor(PCBComponent):
    def __init__(self, comp_id: str, value: str, pins: int = 2,
                 position: Dict[str, float] = None, layer: str = "top", status: str = "active"):
        super().__init__(comp_id, "resistor", value, pins, position or {"x": 0, "y": 0}, layer, status)


class Capacitor(PCBComponent):
    def __init__(self, comp_id: str, value: str, pins: int = 2,
                 position: Dict[str, float] = None, layer: str = "top", status: str = "active"):
        super().__init__(comp_id, "capacitor", value, pins, position or {"x": 0, "y": 0}, layer, status)


class Diode(PCBComponent):
    def __init__(self, comp_id: str, value: str, pins: int = 2,
                 position: Dict[str, float] = None, layer: str = "top", status: str = "active"):
        super().__init__(comp_id, "diode", value, pins, position or {"x": 0, "y": 0}, layer, status)


class Microcontroller(PCBComponent):
    def __init__(self, comp_id: str, value: str, pins: int = 28,
                 position: Dict[str, float] = None, layer: str = "top", status: str = "active"):
        super().__init__(comp_id, "microcontroller", value, pins, position or {"x": 0, "y": 0}, layer, status)


class Sensor(PCBComponent):
    def __init__(self, comp_id: str, value: str, pins: int = 3,
                 position: Dict[str, float] = None, layer: str = "top", status: str = "active"):
        super().__init__(comp_id, "sensor", value, pins, position or {"x": 0, "y": 0}, layer, status)


class LED(PCBComponent):
    def __init__(self, comp_id: str, value: str, pins: int = 2,
                 position: Dict[str, float] = None, layer: str = "top", status: str = "active"):
        super().__init__(comp_id, "led", value, pins, position or {"x": 0, "y": 0}, layer, status)


# ==========================================
# 🔗 EDGE STRUCTURE
# ==========================================

class Connection:
    """Represents a connection (edge) between two components"""

    def __init__(self, u: str, v: str, weight: float, conn_type: str = "signal", layer: str = "top"):
        self.u = u  # Source component ID
        self.v = v  # Destination component ID
        self.weight = weight  # Cost of connection
        self.type = conn_type  # "power", "ground", "signal"
        self.layer = layer  # "top" or "bottom"

    def to_dict(self) -> Dict:
        return {
            "u": self.u,
            "v": self.v,
            "weight": self.weight,
            "type": self.type,
            "layer": self.layer
        }

    def __repr__(self):
        return f"Edge({self.u}--{self.v}, weight={self.weight:.2f})"

    def __lt__(self, other):
        """Comparison for sorting by weight (for Kruskal's)"""
        return self.weight < other.weight


# ==========================================
# 🧠 UNION-FIND DATA STRUCTURE
# ==========================================

class UnionFind:
    """Disjoint Set Union with path compression and union by rank"""

    def __init__(self, n: int):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, u: int) -> int:
        """Find the root/representative of set containing u (with path compression)"""
        if self.parent[u] != u:
            self.parent[u] = self.find(self.parent[u])
        return self.parent[u]

    def union(self, u: int, v: int) -> bool:
        """
        Union the sets containing u and v.
        Returns True if union was successful (different sets), False if already connected.
        """
        pu, pv = self.find(u), self.find(v)
        if pu == pv:
            return False  # Already in same set (would form cycle)

        # Union by rank
        if self.rank[pu] < self.rank[pv]:
            self.parent[pu] = pv
        else:
            self.parent[pv] = pu
            if self.rank[pu] == self.rank[pv]:
                self.rank[pu] += 1
        return True


# ==========================================
# 🌐 PCB GRAPH CLASS
# ==========================================

class PCBGraph:
    """Represents a PCB as a graph with components (nodes) and connections (edges)"""

    def __init__(self):
        self.nodes: Dict[str, PCBComponent] = {}
        self.edges: List[Connection] = []
        self.adj_list: Dict[str, List[Dict]] = {}

    def add_component(self, component: PCBComponent) -> None:
        """Add a component (node) to the graph"""
        self.nodes[component.id] = component
        if component.id not in self.adj_list:
            self.adj_list[component.id] = []

    def add_connection(self, u: str, v: str, weight: float, conn_type: str = "signal", layer: str = "top") -> None:
        """Add a connection (edge) between two components"""
        if u not in self.nodes or v not in self.nodes:
            raise ValueError(f"One or both component IDs ({u}, {v}) not found in graph")

        edge = Connection(u, v, weight, conn_type, layer)
        self.edges.append(edge)

        # Add to adjacency list (undirected graph - add both directions)
        self.adj_list[u].append({"node": v, "weight": weight})
        self.adj_list[v].append({"node": u, "weight": weight})

    def auto_connect_by_distance(self) -> None:
        """
        Auto-generate connections based on Euclidean distance between components.
        Each pair of components gets an edge with weight = distance.
        """
        component_list = list(self.nodes.values())
        for i in range(len(component_list)):
            for j in range(i + 1, len(component_list)):
                comp1, comp2 = component_list[i], component_list[j]
                distance = comp1.distance_to(comp2)
                self.add_connection(comp1.id, comp2.id, distance, "signal", "top")

    def to_dict(self) -> Dict:
        """Convert graph to dictionary (JSON-serializable)"""
        return {
            "nodes": {node_id: node.to_dict() for node_id, node in self.nodes.items()},
            "edges": [edge.to_dict() for edge in self.edges],
            "adjList": self.adj_list
        }

    def __repr__(self):
        return f"PCBGraph(nodes={len(self.nodes)}, edges={len(self.edges)})"


# ==========================================
# 🎯 KRUSKAL'S ALGORITHM FOR MST
# ==========================================

class KruskalMST:
    """Kruskal's algorithm implementation for finding Minimum Spanning Tree"""

    def __init__(self, graph: PCBGraph):
        self.graph = graph
        self.mst: List[Connection] = []
        self.total_weight = 0
        self.num_components = len(graph.nodes)

    def find_mst(self) -> Tuple[List[Connection], float]:
        """
        Find the Minimum Spanning Tree using Kruskal's algorithm.

        Returns:
            Tuple of (MST edges, total weight)
        """
        if self.num_components == 0:
            return [], 0

        # Create mapping of component IDs to indices
        id_to_idx = {comp_id: idx for idx, comp_id in enumerate(self.graph.nodes.keys())}

        # Initialize Union-Find
        uf = UnionFind(self.num_components)

        # Sort edges by weight
        sorted_edges = sorted(self.graph.edges)

        # Kruskal's algorithm: greedily add edges
        for edge in sorted_edges:
            u_idx = id_to_idx[edge.u]
            v_idx = id_to_idx[edge.v]

            # If u and v are in different sets, add edge to MST
            if uf.union(u_idx, v_idx):
                self.mst.append(edge)
                self.total_weight += edge.weight

                # Stop when we have n-1 edges (complete MST)
                if len(self.mst) == self.num_components - 1:
                    break

        return self.mst, self.total_weight

    def print_mst(self) -> None:
        """Print the MST in a readable format"""
        if not self.mst:
            print("No MST found. Run find_mst() first.")
            return

        print("=" * 60)
        print("🌳 MINIMUM SPANNING TREE (Kruskal's Algorithm)")
        print("=" * 60)
        for i, edge in enumerate(self.mst, 1):
            print(
                f"{i}. {edge.u:5} <--({edge.type:8})--> {edge.v:5} | Weight: {edge.weight:8.2f} | Layer: {edge.layer}")
        print("-" * 60)
        print(f"Total Weight (Total Wiring Distance): {self.total_weight:.2f}")
        print(f"Edges in MST: {len(self.mst)} / {self.num_components - 1}")
        print("=" * 60)

    def get_mst_as_dict(self) -> Dict:
        """Return MST as dictionary (JSON-serializable)"""
        return {
            "mst_edges": [edge.to_dict() for edge in self.mst],
            "total_weight": self.total_weight,
            "num_edges": len(self.mst)
        }


# ==========================================
# 🧪 EXAMPLE USAGE
# ==========================================

def main():
    print("\n" + "=" * 60)
    print("🔌 PCB COMPONENT CONNECTION OPTIMIZER (Kruskal's MST)")
    print("=" * 60 + "\n")

    # Create a new PCB graph
    pcb = PCBGraph()

    # Add components with different types
    components = [
        Resistor("R1", "1kΩ", pins=2, position={"x": 100, "y": 100}, layer="top"),
        Capacitor("C1", "10µF", pins=2, position={"x": 300, "y": 100}, layer="top"),
        Microcontroller("IC1", "ATmega328", pins=28, position={"x": 200, "y": 250}, layer="top"),
        Sensor("S1", "temperature", pins=3, position={"x": 200, "y": 400}, layer="bottom"),
        LED("LED1", "Red", pins=2, position={"x": 400, "y": 300}, layer="top"),
    ]

    for component in components:
        pcb.add_component(component)

    print("✅ Added Components:")
    for comp_id, comp in pcb.nodes.items():
        print(f"   {comp} at position {comp.position}")

    # Auto-generate connections based on distance
    pcb.auto_connect_by_distance()

    print(f"\n✅ Generated {len(pcb.edges)} possible connections (based on distances)\n")

    # Run Kruskal's algorithm
    kruskal = KruskalMST(pcb)
    mst_edges, total_weight = kruskal.find_mst()

    # Print results
    kruskal.print_mst()

    # Export as JSON
    print("\n📄 MST as JSON:")
    print(json.dumps(kruskal.get_mst_as_dict(), indent=2))

    print("\n📄 Full PCB Graph as JSON:")
    print(json.dumps(pcb.to_dict(), indent=2))


if __name__ == "__main__":
    main()