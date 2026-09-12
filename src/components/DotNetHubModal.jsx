import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Code2,
  FileCode,
  Terminal,
  Server,
  Layers,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { DOTNET_FILES } from '../data/dotnetCode';

export const DotNetHubModal = ({
  isOpen,
  onClose,
}) => {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('code'); // 'code' | 'assignment'

  if (!isOpen) return null;

  const currentFile = DOTNET_FILES[activeFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl h-[90vh] max-h-[850px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-xs">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  C# &amp; .NET 8 Architecture Explorer
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  .NET 8.0 SDK
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete ASP.NET Core Web API &amp; C# Console Talking Bot source code
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'code'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>C# Code</span>
              </button>
              <button
                onClick={() => setActiveTab('assignment')}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'assignment'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Assignment Steps</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        {activeTab === 'code' ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* File List / Explorer */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-950/40 overflow-y-auto">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Project Files</span>
              </div>
              <div className="space-y-1">
                {DOTNET_FILES.map((file, idx) => {
                  const isSelected = idx === activeFileIndex;
                  return (
                    <button
                      key={file.name}
                      onClick={() => setActiveFileIndex(idx)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-indigo-500'}`} />
                      <span className="font-mono truncate">{file.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-[11px] text-indigo-900 dark:text-indigo-300 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>C# .NET 8 Backend Ready</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[10px]">
                  All files follow Microsoft ASP.NET Core Clean Architecture patterns with dependency injection.
                </p>
              </div>
            </div>

            {/* Code Viewer */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-900 text-slate-100 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="font-mono text-xs font-bold text-slate-300 ml-2 truncate">
                    {currentFile.name}
                  </span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">
                    — {currentFile.description}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    title="Copy code"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 text-[11px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    title="Download file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Save</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-auto custom-scrollbar font-mono text-xs leading-relaxed text-slate-300 select-text">
                <pre className="whitespace-pre">
                  <code>{currentFile.code}</code>
                </pre>
              </div>
            </div>
          </div>
        ) : (
          /* Assignment Tab */
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950 transition-colors custom-scrollbar">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                <h4 className="font-bold text-indigo-950 dark:text-indigo-200 text-base flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Assignment Instructions: C# (.NET 8.0) Talking Bot</span>
                </h4>
                <p className="text-xs text-indigo-800 dark:text-indigo-300 mt-1 leading-relaxed">
                  Here is how each step of your Talking Bot assignment is structured in pure C#:
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-xs">
                      1
                    </span>
                    <span>Step 1: Setup &amp; API Key Configuration</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 pl-8">
                    In C#, the API key is retrieved via <code>Environment.GetEnvironmentVariable(&quot;GEMINI_API_KEY&quot;)</code> or configured in <code>appsettings.json</code>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-xs">
                      2
                    </span>
                    <span>Step 2: Interactive Conversation Loop</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 pl-8">
                    Implemented in <code>while(true)</code> reading user input via <code>Console.ReadLine()</code> and persisting previous dialog context in a <code>List&lt;ChatMessage&gt;</code>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-xs">
                      3
                    </span>
                    <span>Step 3: Calling Gemini API in C#</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 pl-8">
                    Using <code>System.Net.Http.HttpClient</code> and <code>System.Text.Json</code> to send POST requests to <code>https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent</code>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-xs">
                      4
                    </span>
                    <span>Step 4: Exit Commands Detection</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 pl-8">
                    When the user types <code>exit</code>, <code>quit</code>, or <code>bye</code>, the bot responds with a friendly farewell message and gracefully breaks out of the loop.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
