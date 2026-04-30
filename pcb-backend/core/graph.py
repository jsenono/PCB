
# Node (PCB Component)

class PCBNode:
    def __init__(
        self,
        node_id,
        label,
        x=0.0,
        y=0.0,
        kind="other",
        value=None,
        pins=None,
        layer="top",
        status="active"
    ):
        self.node_id = node_id
        self.label = label
        self.x = float(x)
        self.y = float(y)
        self.kind = kind

        # PCB metadata (for compatibility)
        self.value = value
        self.pins = pins
        self.layer = layer
        self.status = status

    def __repr__(self):
        return f"{self.label}({self.kind})"



# Edge (Connection)

class PCBEdge:
    def __init__(self, node_a, node_b, weight, edge_type="signal", layer="top"):
        if node_a == node_b:
            raise ValueError("Self-loop not allowed")

        self.node_a = node_a
        self.node_b = node_b
        self.weight = float(weight)

        # PCB metadata
        self.type = edge_type
        self.layer = layer

    def __lt__(self, other):
        return self.weight < other.weight

    def __repr__(self):
        return f"{self.node_a}-{self.node_b}({self.weight})"



# Graph

class PCBGraph:
    def __init__(self):
        self.nodes = {}   # id -> PCBNode
        self.adj = {}     # id -> [(neighbor, edge)]
        self.edges = []   # list of PCBEdge

    # Nodes 

    def add_node(self, node_id, label, x=0, y=0,
                 kind="other", value=None, pins=None,
                 layer="top", status="active"):

        node = PCBNode(
            node_id, label, x, y,
            kind, value, pins, layer, status
        )

        self.nodes[node_id] = node
        self.adj[node_id] = []

    def remove_node(self, node_id):
        if node_id not in self.nodes:
            return

        # remove edges related to node
        self.edges = [e for e in self.edges if e.node_a != node_id and e.node_b != node_id]

        self.adj.pop(node_id, None)
        self.nodes.pop(node_id, None)

        for n in self.adj:
            self.adj[n] = [x for x in self.adj[n] if x[0] != node_id]

    #  Edges

    def add_edge(self, u, v, weight, edge_type="signal", layer="top"):
        if u not in self.nodes or v not in self.nodes:
            raise ValueError("Nodes must exist first")

        edge = PCBEdge(u, v, weight, edge_type, layer)
        self.edges.append(edge)

        self.adj[u].append((v, edge))
        self.adj[v].append((u, edge))

    def remove_edge(self, u, v):
        self.edges = [e for e in self.edges if not (
            (e.node_a == u and e.node_b == v) or
            (e.node_a == v and e.node_b == u)
        )]

        self.adj[u] = [(n, e) for (n, e) in self.adj[u] if n != v]
        self.adj[v] = [(n, e) for (n, e) in self.adj[v] if n != u]

    #  Queries 

    def get_nodes(self):
        return self.nodes

    def get_edges(self):
        return self.edges

    def get_neighbors(self, node_id):
        return self.adj.get(node_id, [])

    def has_node(self, node_id):
        return node_id in self.nodes

    def has_edge(self, u, v):
        return any(
            (e.node_a == u and e.node_b == v) or
            (e.node_a == v and e.node_b == u)
            for e in self.edges
        )

    def degree(self, node_id):
        return len(self.adj.get(node_id, []))

    def total_weight(self):
        return sum(e.weight for e in self.edges)

    #  Debug 

    def print_graph(self):
        print("\nGRAPH:")
        for node in self.nodes:
            print(node, "->", [(n, e.weight) for n, e in self.adj[node]])