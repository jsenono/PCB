# algorithm.py

from collections import deque


# ==========================================
# 🔁 BFS (Breadth First Search)
# ==========================================

def bfs(graph, start):
    visited = set()
    order = []
    queue = deque([start])

    while queue:
        node = queue.popleft()

        if node not in visited:
            visited.add(node)
            order.append(node)

            for neighbor, _ in graph.get_neighbors(node):
                if neighbor not in visited:
                    queue.append(neighbor)

    return order


# ==========================================
# 🔁 DFS (Depth First Search)
# ==========================================

def dfs(graph, start):
    visited = set()
    order = []

    def _dfs(node):
        if node in visited:
            return
        visited.add(node)
        order.append(node)

        for neighbor, _ in graph.get_neighbors(node):
            _dfs(neighbor)

    _dfs(start)
    return order


# ==========================================
# 🧠 UNION-FIND (Disjoint Set)
# ==========================================

class UnionFind:
    def __init__(self, elements):
        self.parent = {e: e for e in elements}
        self.rank = {e: 0 for e in elements}

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, a, b):
        rootA = self.find(a)
        rootB = self.find(b)

        if rootA == rootB:
            return False

        if self.rank[rootA] < self.rank[rootB]:
            self.parent[rootA] = rootB
        else:
            self.parent[rootB] = rootA
            if self.rank[rootA] == self.rank[rootB]:
                self.rank[rootA] += 1

        return True


# ==========================================
# 🌲 KRUSKAL MST
# ==========================================

def kruskal_mst(graph):
    mst_edges = []
    total_weight = 0

    # Initialize Union-Find with node IDs
    uf = UnionFind(graph.nodes.keys())

    # Sort edges by weight
    edges = sorted(graph.get_edges(), key=lambda e: e.weight)

    for edge in edges:
        u = edge.node_a
        v = edge.node_b

        if uf.union(u, v):
            mst_edges.append(edge)
            total_weight += edge.weight

            # Stop early if MST complete
            if len(mst_edges) == len(graph.nodes) - 1:
                break

    return mst_edges, total_weight


# ==========================================
# 🔄 OPTIONAL: Cycle Detection (DFS-based)
# ==========================================

def has_cycle(graph):
    visited = set()

    def dfs(node, parent):
        visited.add(node)

        for neighbor, _ in graph.get_neighbors(node):
            if neighbor not in visited:
                if dfs(neighbor, node):
                    return True
            elif neighbor != parent:
                return True

        return False

    for node in graph.nodes:
        if node not in visited:
            if dfs(node, None):
                return True

    return False