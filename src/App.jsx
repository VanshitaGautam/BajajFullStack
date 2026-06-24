import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import TreeView from './components/TreeView';

export default function App() {
  const [inputText, setInputText] = useState('A->B\nA->C\nB->D');
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Trigger Toast Notification helper
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Preset Sample Data
  const loadSample = (type) => {
    if (type === 'tree') {
      setInputText('A->B\nA->C\nB->D\nC->E');
      addToast('Loaded Tree Sample Data', 'info');
    } else if (type === 'cycle') {
      setInputText('X->Y\nY->Z\nZ->X\nZ->W');
      addToast('Loaded Cycle Sample Data', 'info');
    } else if (type === 'mixed') {
      setInputText('// Valid trees & duplicate edges\nA->B\nA->B\nB->D\n\n// Multi-parent conflict (F->D discarded)\nE->F\nF->D\n\n// Invalid format entries\nhello_world\n1->2\nP->Q->R\nA->A');
      addToast('Loaded Mixed/Complex Sample Data', 'info');
    }
  };

  const clearInput = () => {
    setInputText('');
    setApiResponse(null);
    addToast('Cleared Input & Results', 'info');
  };

  // Parse input from plain-text or JSON formats
  const parseInput = (text) => {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error('Input is empty.');
    }

    // Try parsing as JSON first
    if (trimmed.startsWith('{')) {
      try {
        const parsedJson = JSON.parse(trimmed);
        if (parsedJson && Array.isArray(parsedJson.data)) {
          return parsedJson.data;
        }
        throw new Error('JSON must contain a "data" array. E.g. {"data": ["A->B"]}');
      } catch (err) {
        throw new Error(`Invalid JSON format: ${err.message}`);
      }
    }

    // Otherwise, parse as line-separated plain text
    const lines = trimmed
      .split(/\r?\n/)
      .map(line => line.trim())
      // Ignore comment lines starting with '//' or '#'
      .filter(line => line.length > 0 && !line.startsWith('//') && !line.startsWith('#'));

    if (lines.length === 0) {
      throw new Error('No valid relationships found in the text input.');
    }

    return lines;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const parsedData = parseInput(inputText);
      
      const response = await fetch('http://localhost:5000/bfhl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: parsedData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Server responded with status ${response.status}`);
      }

      setApiResponse(data);
      addToast('Successfully processed graph hierarchies!', 'success');
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Failed to process hierarchies.', 'error');
      setApiResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!apiResponse) return;
    navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2));
    addToast('Copied JSON Response to clipboard!', 'success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Toast Notification Container */}
      <Toast toasts={toasts} onClose={removeToast} />

      {/* Main Navbar */}
      <Navbar identity={apiResponse} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner header section */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-brand-600/90 to-cyan-600/90 dark:from-brand-950/70 dark:to-cyan-950/60 border border-brand-500/20 shadow-xl shadow-brand-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
          <div className="relative z-10">
            <h2 className="font-outfit text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Graph Hierarchy & Cycle Resolver
            </h2>
            <p className="text-sm text-brand-100/90 mt-1 max-w-2xl">
              Paste relationships in line-by-line developer format (e.g. <code className="bg-white/10 px-1 py-0.5 rounded font-mono text-white text-xs">A-&gt;B</code>) or standard JSON payload. The resolver filters duplicates, implements the multi-parent override, isolates weakly connected subgraphs, runs cycle detection via directed DFS, and generates collapsible trees.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form Controls and Data Loading */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-outfit text-md font-bold tracking-tight text-slate-800 dark:text-slate-200">
                  Input Relationships
                </h3>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-200/30">
                  Line format or JSON
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter edges, e.g.:&#10;A->B&#10;A->C&#10;B->D"
                    className="w-full h-64 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/80 focus:border-brand-500 transition-all duration-150 resize-y"
                    id="relations-input"
                  />
                </div>

                {/* Preset Actions */}
                <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800/40">
                  <button
                    type="button"
                    onClick={() => loadSample('tree')}
                    className="flex-1 min-w-[100px] text-xs font-semibold px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-350 transition-all duration-150"
                  >
                    Sample Tree
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSample('cycle')}
                    className="flex-1 min-w-[100px] text-xs font-semibold px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-350 transition-all duration-150"
                  >
                    Sample Cycle
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSample('mixed')}
                    className="flex-1 min-w-[100px] text-xs font-semibold px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-350 transition-all duration-150"
                  >
                    Sample Mixed
                  </button>
                </div>

                {/* Submit & Clear Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={clearInput}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 font-semibold text-sm transition-all duration-150"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all duration-150 shadow-md shadow-brand-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Analyze Graph'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: API Output & Graph Visualizations */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* If no API response yet, show empty/guide panel */}
            {!apiResponse && (
              <div className="glass-panel rounded-2xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 mb-4 border border-brand-200/40 dark:border-brand-900/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 113.536 0V21h2v-2.243a5 5 0 013.536 0z" />
                  </svg>
                </div>
                <h4 className="font-outfit text-lg font-bold text-slate-800 dark:text-slate-200">
                  Ready for Analysis
                </h4>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 max-w-sm">
                  Provide custom relationships on the left and click "Analyze Graph" to process, detect cycles, calculate depths, and render interactive tree hierarchies.
                </p>
              </div>
            )}

            {/* Render Dashboard Results */}
            {apiResponse && (
              <div className="space-y-6 animate-fade-in">
                
                {/* 1. Summary Statistics Cards */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Trees Card */}
                  <div className="glass-panel p-4 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-850 text-center">
                    <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Trees
                    </div>
                    <div className="text-2xl font-bold font-outfit text-emerald-600 dark:text-emerald-400 mt-1">
                      {apiResponse.summary.total_trees}
                    </div>
                  </div>
                  {/* Cycles Card */}
                  <div className="glass-panel p-4 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-850 text-center">
                    <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Cycles
                    </div>
                    <div className="text-2xl font-bold font-outfit text-amber-600 dark:text-amber-400 mt-1">
                      {apiResponse.summary.total_cycles}
                    </div>
                  </div>
                  {/* Largest Tree Root Card */}
                  <div className="glass-panel p-4 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-850 text-center">
                    <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Largest Tree Root
                    </div>
                    <div className="text-2xl font-bold font-outfit text-brand-600 dark:text-brand-400 mt-1 truncate">
                      {apiResponse.summary.largest_tree_root || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* 2. Processing Logs (Invalid entries / duplicates) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Invalid Entries Panel */}
                  <div className="glass-panel p-5 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-850">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                      Invalid Entries ({apiResponse.invalid_entries.length})
                    </h4>
                    {apiResponse.invalid_entries.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic">No invalid entries detected.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                        {apiResponse.invalid_entries.map((val, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center text-xs font-mono px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950/40"
                          >
                            {val}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Duplicate Edges Panel */}
                  <div className="glass-panel p-5 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-850">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                      Duplicate Edges ({apiResponse.duplicate_edges.length})
                    </h4>
                    {apiResponse.duplicate_edges.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic">No duplicate edges detected.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                        {apiResponse.duplicate_edges.map((val, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center text-xs font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-950/40"
                          >
                            {val}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Visual Hierarchies Rendering */}
                <div className="glass-panel p-6 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-850">
                  <h4 className="font-outfit text-md font-bold tracking-tight text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Processed Hierarchies ({apiResponse.hierarchies.length})
                  </h4>

                  {apiResponse.hierarchies.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">No connected components found.</p>
                  ) : (
                    <div className="space-y-4">
                      {apiResponse.hierarchies.map((hier) => (
                        <div
                          key={hier.root}
                          className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-800/40"
                        >
                          {/* Subgraph Header */}
                          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/40 dark:border-slate-800/40">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">Root:</span>
                              <span className="text-sm font-bold font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400">{hier.root}</span>
                            </div>

                            {/* Cycle vs Depth Badges */}
                            {hier.has_cycle ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200/30 dark:border-rose-900/40">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                Cycle Detected
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/30 dark:border-emerald-900/40">
                                Depth: {hier.depth}
                              </span>
                            )}
                          </div>

                          {/* Collapsible Tree Render */}
                          {hier.has_cycle ? (
                            <div className="py-2 text-sm text-slate-400 dark:text-slate-500 italic pl-1 flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Graph component has cyclic loops; tree structure visualization is disabled.
                            </div>
                          ) : (
                            <div className="py-2 overflow-x-auto">
                              <TreeView nodeName={hier.root} subtree={hier.tree[hier.root]} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Raw JSON Response Panel */}
                <div className="glass-panel p-6 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-850">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-outfit text-md font-bold tracking-tight text-slate-800 dark:text-slate-200">
                      Raw JSON Response
                    </h4>
                    <button
                      onClick={copyToClipboard}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-300 transition-all duration-150"
                      id="copy-json-btn"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy Response
                    </button>
                  </div>
                  <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 max-h-[300px] overflow-y-auto">
                    <pre className="p-4 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
                      {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </main>

      {/* Footer Identity display for desktop and mobile */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 py-6 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:justify-between sm:items-center">
          <p className="text-xs text-slate-400 dark:text-slate-600 font-medium">
            &copy; 2026 Chitkara Full Stack Challenge. Built with Node.js, Express & React.
          </p>
          <div className="mt-3 sm:mt-0 font-mono text-[10px] text-slate-400 dark:text-slate-500 space-x-2">
            <span>USER: <strong className="text-slate-500 dark:text-slate-400">{apiResponse?.user_id || 'vansh_24062026'}</strong></span>
            <span>&bull;</span>
            <span>ROLL: <strong className="text-slate-500 dark:text-slate-400">{apiResponse?.college_roll_number || '2410991234'}</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
