import React from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ identity }) {
  // Use identity fields if provided by API, otherwise fallback to defaults
  const userId = identity?.user_id || 'vansh_24062026';
  const emailId = identity?.email_id || 'vansh.student@chitkara.edu.in';
  const rollNumber = identity?.college_roll_number || '2410991234';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-900/80 bg-white/75 dark:bg-slate-950/75 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 shadow-md shadow-brand-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="font-outfit text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
              Chitkara Hierarchy Processor
            </h1>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 -mt-1">
              Full Stack Engineering Challenge
            </p>
          </div>
        </div>

        {/* Right Side: Identity Details & Theme Mode Toggle */}
        <div className="flex items-center gap-4">
          {/* Identity Badge Block */}
          <div className="hidden md:flex flex-col items-end font-mono text-[11px] text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 pr-4">
            <div>
              <span className="text-slate-400 dark:text-slate-600 font-semibold mr-1">USER_ID:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{userId}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-600 font-semibold mr-1">ROLL_NO:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{rollNumber}</span>
            </div>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
