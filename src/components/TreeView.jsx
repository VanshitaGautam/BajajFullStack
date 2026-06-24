import React, { useState } from 'react';

/**
 * TreeView Component
 * Renders a collapsible node and its subtrees recursively.
 */
export default function TreeView({ nodeName, subtree, level = 0 }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const children = subtree ? Object.keys(subtree) : [];
  const hasChildren = children.length > 0;

  return (
    <div className="relative font-sans select-none">
      {/* Visual connector lines */}
      {level > 0 && (
        <div className="absolute -left-[14px] top-0 bottom-0 border-l border-slate-200 dark:border-slate-800 pointer-events-none" />
      )}
      
      <div className="flex items-center gap-2 group py-1 relative">
        {/* Horizontal branch line */}
        {level > 0 && (
          <div className="absolute -left-[14px] top-[18px] w-[14px] border-t border-slate-200 dark:border-slate-800 pointer-events-none" />
        )}

        {/* Toggle Button / Leaf Indicator */}
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 focus:outline-none transition-all duration-150 z-10"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3 w-3 transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <div className="w-5 h-5 flex items-center justify-center shrink-0 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 transition-colors duration-150"></span>
          </div>
        )}

        {/* Node Badge */}
        <span
          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all duration-200 shadow-sm z-10
            ${hasChildren 
              ? 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-950/30 dark:border-brand-900/60 dark:text-brand-300' 
              : 'bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-850 dark:text-slate-350'
            }`}
        >
          {nodeName}
        </span>
        
        {/* Child Count Tag */}
        {hasChildren && (
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900/40 px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-slate-800/40 z-10">
             {children.length} {children.length === 1 ? 'child' : 'children'}
          </span>
        )}
      </div>

      {/* Recursive Children Rendering */}
      {hasChildren && isExpanded && (
        <div className="pl-6 mt-0.5 transition-all duration-200">
          {children.map((childName) => (
            <TreeView
              key={childName}
              nodeName={childName}
              subtree={subtree[childName]}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
