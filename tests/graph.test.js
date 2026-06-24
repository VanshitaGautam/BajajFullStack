const request = require('supertest');
const app = require('../src/app');
const graphService = require('../src/services/graphService');

describe('Graph Processing Service Unit Tests', () => {
  test('Rule 1: Input Validation - Valid and Invalid Formats', () => {
    const input = [
      'A->B',      // Valid
      '  C->D  ',  // Valid (whitespace trimmed)
      'hello',     // Invalid (no arrow)
      '1->2',      // Invalid (numbers)
      'AB->C',     // Invalid (double letter parent)
      'A->BC',     // Invalid (double letter child)
      'A-B',       // Invalid (wrong separator)
      'A->',       // Invalid (missing child)
      'A->A',      // Invalid (self-loop)
      ''           // Invalid (empty)
    ];

    const result = graphService.processGraph(input);

    expect(result.invalid_entries).toEqual([
      'hello',
      '1->2',
      'AB->C',
      'A->BC',
      'A-B',
      'A->',
      'A->A',
      ''
    ]);
    expect(result.hierarchies.map(h => h.root)).toEqual(['A', 'C']);
  });

  test('Rule 2: Duplicate Edges', () => {
    const input = ['A->B', 'A->B', 'A->B', 'C->D', 'C->D'];
    const result = graphService.processGraph(input);

    expect(result.duplicate_edges).toEqual(['A->B', 'C->D']);
    // Check that we processed only unique versions
    expect(result.hierarchies.length).toBe(2);
  });

  test('Rule 3: Multi-parent Rule (First Parent Wins)', () => {
    const input = ['A->D', 'B->D', 'C->D'];
    const result = graphService.processGraph(input);

    // D should only have parent A. B->D and C->D should be discarded silently.
    const treeA = result.hierarchies.find(h => h.root === 'A');
    expect(treeA).toBeDefined();
    expect(treeA.tree.A).toEqual({ D: {} });

    // Node B and C are left as separate roots without children (since B->D/C->D were discarded,
    // they don't form edges. Wait! Let's check:
    // If B has no child and no parent, does B appear in the graph?
    // Since B->D was processed, does B appear in kept_edges?
    // Wait, B->D was discarded, so B does NOT appear in kept_edges!
    // Since B does not appear in any kept edges, B is NOT in allNodes,
    // so B is not processed as a component at all.
    // That means B is discarded silently as expected!
    const rootNodes = result.hierarchies.map(h => h.root);
    expect(rootNodes).toContain('A');
    expect(rootNodes).not.toContain('B');
    expect(rootNodes).not.toContain('C');
  });

  test('Rule 4 & 6: Cycle Detection (DFS recursion stack)', () => {
    // Pure Cycle
    const inputPure = ['A->B', 'B->C', 'C->A'];
    const resultPure = graphService.processGraph(inputPure);
    expect(resultPure.summary.total_cycles).toBe(1);
    expect(resultPure.summary.total_trees).toBe(0);
    expect(resultPure.hierarchies[0]).toEqual({
      root: 'A', // Lexicographically smallest
      tree: {},
      has_cycle: true
    });

    // Cycle with branch
    const inputBranch = ['A->B', 'B->C', 'C->A', 'C->D'];
    const resultBranch = graphService.processGraph(inputBranch);
    expect(resultBranch.summary.total_cycles).toBe(1);
    expect(resultBranch.hierarchies[0]).toEqual({
      root: 'A',
      tree: {},
      has_cycle: true
    });
  });

  test('Rule 5 & 8: Tree Generation and Depth Calculation', () => {
    const input = ['A->B', 'A->C', 'B->D'];
    const result = graphService.processGraph(input);

    expect(result.hierarchies[0]).toEqual({
      root: 'A',
      tree: {
        A: {
          B: {
            D: {}
          },
          C: {}
        }
      },
      depth: 3
    });
  });

  test('Rule 9: Summary and Largest Tree Root by Depth (with tie-breaker)', () => {
    // Tree A has depth 4 (A->B->C->D)
    // Tree X has depth 2 but 5 nodes (X->Y, X->Z, X->P, X->Q)
    const input = [
      'A->B', 'B->C', 'C->D',
      'X->Y', 'X->Z', 'X->P', 'X->Q'
    ];
    const result = graphService.processGraph(input);

    expect(result.summary.total_trees).toBe(2);
    expect(result.summary.total_cycles).toBe(0);
    expect(result.summary.largest_tree_root).toBe('A'); // Depth 4 > Depth 2

    // Tie-breaker: Tree A (A->B, depth 2) and Tree E (E->F, depth 2)
    const inputTie = ['E->F', 'A->B'];
    const resultTie = graphService.processGraph(inputTie);
    expect(resultTie.summary.largest_tree_root).toBe('A'); // A < E
  });

  test('Edge Case: Empty Input Array', () => {
    const result = graphService.processGraph([]);
    expect(result).toEqual({
      invalid_entries: [],
      duplicate_edges: [],
      hierarchies: [],
      summary: {
        total_trees: 0,
        total_cycles: 0,
        largest_tree_root: ''
      }
    });
  });
});

describe('API Route Integration Tests', () => {
  test('GET / - Server Running Check', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'running' });
  });

  test('GET /health - Health Check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.uptime).toBeDefined();
  });

  test('POST /bfhl - Missing or invalid request body', async () => {
    let res = await request(app).post('/bfhl').send({});
    expect(res.status).toBe(400);
    expect(res.body.is_success).toBe(false);
    expect(res.body.message).toContain("Missing 'data'");

    res = await request(app).post('/bfhl').send({ data: "not-an-array" });
    expect(res.status).toBe(400);
    expect(res.body.is_success).toBe(false);
    expect(res.body.message).toContain("must be an array");
  });

  test('POST /bfhl - Successful Processing', async () => {
    const payload = {
      data: ['A->B', 'A->C', 'B->D']
    };
    const res = await request(app).post('/bfhl').send(payload);
    
    expect(res.status).toBe(200);
    expect(res.body.is_success).toBe(true);
    expect(res.body.user_id).toBeDefined();
    expect(res.body.email_id).toBeDefined();
    expect(res.body.college_roll_number).toBeDefined();
    expect(res.body.hierarchies).toBeDefined();
    expect(res.body.summary).toEqual({
      total_trees: 1,
      total_cycles: 0,
      largest_tree_root: 'A'
    });
  });
});
