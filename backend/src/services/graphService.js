/**
 * Graph Processing Service
 * Handles validation, deduplication, multi-parent check, cycle detection,
 * tree structure generation, and summary statistics.
 */

/**
 * Main function to process the input relations.
 * @param {string[]} data - Array of relationship strings (e.g. ["A->B", "A->C"])
 * @returns {object} Processed graph hierarchies and summary.
 */
exports.processGraph = (data) => {
  const invalid_entries = [];
  const duplicate_edges = [];
  const duplicate_set = new Set();
  const seen_edges = new Set();
  const parent_map = new Map(); // child -> parent
  const kept_edges = [];
  
  // 1. Edge Parsing, Validation, Deduplication, and Multi-Parent check
  for (const entry of data) {
    if (typeof entry !== 'string') {
      invalid_entries.push(String(entry));
      continue;
    }

    const trimmed = entry.trim();
    
    // Validate formatting X->Y where X and Y are uppercase letters
    const match = trimmed.match(/^([A-Z])->([A-Z])$/);
    if (!match) {
      invalid_entries.push(trimmed);
      continue;
    }
    
    const [_, parent, child] = match;
    
    // Self-loops are invalid (e.g. A->A)
    if (parent === child) {
      invalid_entries.push(trimmed);
      continue;
    }
    
    const edgeStr = `${parent}->${child}`;
    
    // Duplicate Edge check
    if (seen_edges.has(edgeStr)) {
      if (!duplicate_set.has(edgeStr)) {
        duplicate_set.add(edgeStr);
        duplicate_edges.push(edgeStr);
      }
      continue;
    }
    seen_edges.add(edgeStr);
    
    // Multi-Parent Rule: First parent wins. Discard silently if child already has a parent.
    if (parent_map.has(child)) {
      continue;
    }
    
    // Keep the edge
    parent_map.set(child, parent);
    kept_edges.push({ parent, child });
  }

  // 2. Identify all nodes involved in the kept edges
  const allNodes = new Set();
  for (const edge of kept_edges) {
    allNodes.add(edge.parent);
    allNodes.add(edge.child);
  }

  // 3. Find Weakly Connected Components (treating edges as undirected)
  const undirectedAdj = {};
  for (const node of allNodes) {
    undirectedAdj[node] = [];
  }
  for (const edge of kept_edges) {
    undirectedAdj[edge.parent].push(edge.child);
    undirectedAdj[edge.child].push(edge.parent);
  }

  const visitedComponents = new Set();
  const components = [];

  for (const node of allNodes) {
    if (!visitedComponents.has(node)) {
      // Find all nodes in this component via BFS
      const componentNodes = [];
      const queue = [node];
      visitedComponents.add(node);

      while (queue.length > 0) {
        const curr = queue.shift();
        componentNodes.push(curr);
        for (const neighbor of undirectedAdj[curr]) {
          if (!visitedComponents.has(neighbor)) {
            visitedComponents.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
      components.push(componentNodes);
    }
  }

  // Build directed adjacency representation for cycle detection and tree building
  const directedAdj = {};
  for (const node of allNodes) {
    directedAdj[node] = [];
  }
  for (const edge of kept_edges) {
    directedAdj[edge.parent].push(edge.child);
  }

  const hierarchies = [];
  let total_trees = 0;
  let total_cycles = 0;
  let largestTree = null; // { root, depth }

  // Helper function to build the tree recursively
  const buildTree = (node) => {
    const treeNode = {};
    const children = directedAdj[node] || [];
    // Sort children lexicographically for cleaner output
    const sortedChildren = [...children].sort();
    for (const child of sortedChildren) {
      treeNode[child] = buildTree(child);
    }
    return treeNode;
  };

  // Helper function to calculate tree depth
  const getDepth = (node) => {
    const children = directedAdj[node] || [];
    if (children.length === 0) return 1;
    let maxChildDepth = 0;
    for (const child of children) {
      maxChildDepth = Math.max(maxChildDepth, getDepth(child));
    }
    return 1 + maxChildDepth;
  };

  // 4. Process each component
  for (const compNodes of components) {
    // DFS Cycle Detection with recursion stack
    const visitedDFS = new Set();
    const recStack = new Set();
    let has_cycle = false;

    const dfsDetectCycle = (u) => {
      visitedDFS.add(u);
      recStack.add(u);

      const children = directedAdj[u] || [];
      for (const v of children) {
        if (recStack.has(v)) {
          return true;
        }
        if (!visitedDFS.has(v)) {
          if (dfsDetectCycle(v)) {
            return true;
          }
        }
      }

      recStack.delete(u);
      return false;
    };

    // Check all nodes in the component to catch cycles
    for (const node of compNodes) {
      if (!visitedDFS.has(node)) {
        if (dfsDetectCycle(node)) {
          has_cycle = true;
          break;
        }
      }
    }

    if (has_cycle) {
      total_cycles++;
      // Root of a cycle component is the lexicographically smallest node
      const root = [...compNodes].sort()[0];
      hierarchies.push({
        root,
        tree: {},
        has_cycle: true
      });
    } else {
      total_trees++;
      // Root of a tree component is the node with in-degree 0 in the component
      // (which has no parent in the parent_map)
      const root = compNodes.find(node => !parent_map.has(node));
      
      const treeStructure = {
        [root]: buildTree(root)
      };
      const depth = getDepth(root);

      hierarchies.push({
        root,
        tree: treeStructure,
        depth
      });

      // Track the largest tree by depth (tie-breaker: lexicographically smaller root)
      if (largestTree === null) {
        largestTree = { root, depth };
      } else {
        if (depth > largestTree.depth) {
          largestTree = { root, depth };
        } else if (depth === largestTree.depth) {
          if (root < largestTree.root) {
            largestTree = { root, depth };
          }
        }
      }
    }
  }

  // Sort hierarchies array by root lexicographically for clean presentation
  hierarchies.sort((a, b) => a.root.localeCompare(b.root));

  return {
    invalid_entries,
    duplicate_edges,
    hierarchies,
    summary: {
      total_trees,
      total_cycles,
      largest_tree_root: largestTree ? largestTree.root : ""
    }
  };
};
