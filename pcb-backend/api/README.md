Here is the ultra-compressed summary for your edited API, which now includes algorithm endpoints.

### **1. Base & Health**
| Endpoint | Purpose |
| --- | --- |
| `GET /` | API welcome & overview |
| `GET /health` | Health check |

### **2. Circuits**
| Endpoint | Purpose | Request Schema | Response Schema |
| --- | --- | --- | --- |
| `POST /circuits` | Create circuit | `{"name": "string"}` | `{"circuit_id": "int", "nodes": [], "edges": [], "total_weight": "float"}` |
| `GET /circuits` | List all circuits | – | `[{"circuit_id": "int", "node_count": "int", "edge_count": "int"}]` |
| `GET /circuits/{id}` | Get circuit | – | Same as POST response |
| `DELETE /circuits/{id}` | Delete circuit | – | `200 OK` |
| `POST /circuits/{id}/stats` | Get statistics | – | `{"circuit_id": "int", "node_count": "int", "edge_count": "int", "total_weight": "float", "avg_degree": "float"}` |

### **3. Nodes (Components)**
| Endpoint | Purpose | Request Schema | Response Schema |
| --- | --- | --- | --- |
| `POST /circuits/{id}/nodes` | Add node | `{"node_id": "string", "label": "string", "x": "float", "y": "float", "kind": "string", "value": "string", "pins": ["string"], "layer": "string", "status": "string"}` | Same as request |
| `GET /circuits/{id}/nodes` | List nodes | – | `[same as request]` |
| `GET /circuits/{id}/nodes/{node_id}` | Get node | – | Same as request |
| `PUT /circuits/{id}/nodes/{node_id}` | Update node | Same as POST | Same as request |
| `DELETE /circuits/{id}/nodes/{node_id}` | Delete node | – | `200 OK` |

### **4. Edges (Connections)**
| Endpoint | Purpose | Request Schema | Response Schema |
| --- | --- | --- | --- |
| `POST /circuits/{id}/edges` | Add connection | `{"node_a": "string", "node_b": "string", "weight": "float", "edge_type": "string", "layer": "string"}` | Same as request |
| `GET /circuits/{id}/edges` | List connections | – | `[same as request]` |
| `GET /circuits/{id}/edges/{a}/{b}` | Check connection | – | `200 OK` or `404` |
| `DELETE /circuits/{id}/edges/{a}/{b}` | Remove connection | – | `200 OK` |

### **5. Analysis (Not important Now) ** 
| Endpoint | Purpose | Response Schema |
| --- | --- | --- |
| `GET /circuits/{id}/analysis/neighbors/{node_id}` | Find connected nodes | `{"node_id": "string", "degree": "int", "neighbors": [{"node": "string", "weight": "float"}], "total_connected_weight": "float"}` |
| `GET /circuits/{id}/analysis/connectivity` | Check circuit connectivity | `{"is_fully_connected": "bool", "components": "int", "isolated_nodes": ["string"]}` |
| `GET /circuits/{id}/analysis/layers` | Count by PCB layer | `{"top": {"nodes": "int", "edges": "int"}, "bottom": {...}}` |
| `GET /circuits/{id}/analysis/components-by-kind` | Count by component type | `{"resistor": "int", "capacitor": "int", ...}` |

### **6. Algorithms **
| Endpoint | Purpose | Request Schema (Query Param) | Response Schema |
| --- | --- | --- | --- |
| `POST /circuits/{id}/algorithms/bfs` | Run Breadth-First Search | `?start_node=string` | `{"circuit_id": "int", "algorithm": "bfs", "start_node": "string", "traversal_order": ["string"], "nodes_visited": "int"}` |
| `POST /circuits/{id}/algorithms/dfs` | Run Depth-First Search | `?start_node=string` | Same as BFS |
| `POST /circuits/{id}/algorithms/kruskal-mst` | Run Kruskal's MST | – | `{"circuit_id": "int", "algorithm": "kruskal", "mst_edges": [{"node_a": "string", "node_b": "string", "weight": "float"}], "total_weight": "float", "edge_count": "int"}` |
| `POST /circuits/{id}/algorithms/cycle-detection` | Detect cycles in circuit | – | `{"circuit_id": "int", "has_cycle": "bool", "status": "string"}` |
| `GET /algorithms` | List all available algorithms | – | `{"algorithms": ["bfs", "dfs", "kruskal-mst", "cycle-detection"]}` |

### **Default Values**
| Field | Default |
| --- | --- |
| `x, y` | `0` |
| `kind` | `"other"` |
| `layer` | `"top"` |
| `status` | `"active"` |
| `edge_type` | `"signal"` |
| `value, pins` | `null` |

The API now fully supports the graph algorithms (BFS, DFS, Kruskal's MST, cycle detection) you planned earlier. You can test them directly via the interactive docs.