# PCB Connection Network (Graph Project)

## 📌 Project Idea
This project simulates a PCB (Printed Circuit Board) as a weighted undirected graph.  
Each electronic component is represented as a node, and possible connections between components are represented as weighted edges.

The goal is to build a Minimum Spanning Tree (MST) using algorithms like Kruskal or Prim to minimize total connection cost.

---

## 🧠 Data Structure Used
- Graph (Adjacency List)
- Nodes: PCB components (Resistors, Capacitors, ICs, Power sources)
- Edges: Possible connections with weights (cost / distance)

---

## ⚙️ Features
- Add / remove nodes
- Add / remove edges
- Get neighbors of a node
- Update edge weight
- Print adjacency list
- Test graph with sample PCB layout

---

## 🚀 Algorithms (Next Phase)
- Kruskal Algorithm (MST)
- Prim Algorithm (MST)
- BFS / DFS for connectivity checks

---

## 👥 Team Roles
- Graph Data Structure (you)
- MST Algorithms
- UI / Visualization

---

## 📦 How to Run
```bash
python graph.py
