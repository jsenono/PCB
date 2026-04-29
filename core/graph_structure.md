

````md
# 📌 PCB Graph Structure

This document defines the structure used to represent a PCB  as a graph.

---

# 🧠 Concept Overview

- **Nodes (Vertices)** → PCB Components  
- **Edges** → Connections (wires/traces)  
- **Weights** → Cost (e.g., wire length, resistance, or routing cost)

---

# 🧱 Graph Structure

## Graph Object Primitives

```json
{
  "nodes": { },
  "edges": [ ],
  "adjList": { }
}
````

---

# 🔌 Node Structure (PCB Component)

Each node represents a component on the PCB.

## Example:

```json
{
  "id": "R1",
  "type": "resistor",
  "value": "1kΩ",
  "pins": 2,
  "position": { "x": 120, "y": 80 },
  "layer": "top",
  "status": "active"
}
```

---

## 🔑 Node Fields

| Field      | Description                                      |
| ---------- | ------------------------------------------------ |
| `id`       | Unique identifier (e.g., R1, C1, IC1)            |
| `type`     | Component type (resistor, capacitor, IC, sensor) |
| `value`    | Electrical value (optional, for realism)         |
| `pins`     | Number of connection points                      |
| `position` | Coordinates for visualization                    |
| `layer`    | PCB layer (`top` / `bottom`)                     |
| `status`   | Component state (`active`, `inactive`)           |

---

# 🔗 Edge Structure (Connections)

Each edge represents a connection between two components.

## Example:

```json
{
  "u": "R1",
  "v": "C1",
  "weight": 5,
  "type": "signal",
  "layer": "top"
}
```

---

## 🔑 Edge Fields

| Field    | Description                                   |
| -------- | --------------------------------------------- |
| `u`      | Source component ID                           |
| `v`      | Destination component ID                      |
| `weight` | Cost of connection                            |
| `type`   | Connection type (`power`, `ground`, `signal`) |
| `layer`  | PCB layer                                     |

---

# 🔁 Adjacency List Structure

Used for traversal algorithms.

## Example:

```json
{
  "R1": [
    { "node": "C1", "weight": 5 },
    { "node": "IC1", "weight": 2 }
  ],
  "C1": [
    { "node": "R1", "weight": 5 },
    { "node": "S1", "weight": 3 }
  ]
}
```

---

# 🧪 Example Full Graph

```json
{
  "nodes": {
    "R1": {
      "id": "R1",
      "type": "resistor",
      "value": "1kΩ",
      "pins": 2,
      "position": { "x": 100, "y": 100 },
      "layer": "top",
      "status": "active"
    },
    "C1": {
      "id": "C1",
      "type": "capacitor",
      "value": "10µF",
      "pins": 2,
      "position": { "x": 300, "y": 100 },
      "layer": "top",
      "status": "active"
    },
    "IC1": {
      "id": "IC1",
      "type": "microcontroller",
      "value": "ATmega328",
      "pins": 28,
      "position": { "x": 200, "y": 250 },
      "layer": "top",
      "status": "active"
    },
    "S1": {
      "id": "S1",
      "type": "sensor",
      "value": "temperature",
      "pins": 3,
      "position": { "x": 200, "y": 400 },
      "layer": "bottom",
      "status": "active"
    }
  },

  "edges": [
    { "u": "R1", "v": "C1", "weight": 5, "type": "signal", "layer": "top" },
    { "u": "R1", "v": "IC1", "weight": 2, "type": "signal", "layer": "top" },
    { "u": "C1", "v": "IC1", "weight": 4, "type": "power", "layer": "top" },
    { "u": "C1", "v": "S1", "weight": 3, "type": "signal", "layer": "bottom" },
    { "u": "IC1", "v": "S1", "weight": 6, "type": "ground", "layer": "bottom" }
  ]
}
```

---

# ⚙️ Notes for Implementation

* Graph is **undirected**
* Each edge must be added in both directions in adjacency list
* `edges` array is used for **Kruskal MST**
* `adjList` is used for **BFS / DFS**

---

---



---

```
```
