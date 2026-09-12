import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Database,
  User,
  Key,
  ShieldCheck,
} from 'lucide-react';

export const SettingsView = ({
  theme,
  onSetTheme,
  onClearHistory,
  userProfile,
  onOpenAuth,
  onOpenProfile,
  apiConnected = true,
  onTestConnection,
  userApiKey = '',
  onSaveApiKey,
}) => {
  const [clearedNotice, setClearedNotice] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Gemini API Key state
  const [inputKey, setInputKey] = useState(userApiKey || '');
  const [savingKey, setSavingKey] = useState(false);
  const [keyNotice, setKeyNotice] = useState(null);
  const [keyError, setKeyError] = useState(null);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all your conversation history? This cannot be undone.')) {
      onClearHistory();
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 3000);
    }
  };

  const handleTestConnection = async () => {
    if (!onTestConnection) return;
    setTesting(true);
    setTestResult(null);
    try {
      const ok = await onTestConnection();
      setTestResult(ok ? 'ok' : 'error');
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const handleSaveKey = async (e) => {
    if (e) e.preventDefault();
    if (!onSaveApiKey) return;
    setSavingKey(true);
    setKeyNotice(null);
    setKeyError(null);

    const result = await onSaveApiKey(inputKey.trim());
    setSavingKey(false);
    if (result.success) {
      setKeyNotice(result.message || 'API Key connected successfully!');
      setTimeout(() => setKeyNotice(null), 4000);
    } else {
      setKeyError(result.error || 'Failed to verify API Key.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 dark:bg-slate-950 transition-colors custom-scrollbar">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Settings</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your AI preferences and API key configuration
          </p>
        </div>

        {/* Gemini API Key Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Gemini API Configuration
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Custom Gemini API Key integration
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveKey} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Custom Gemini API Key (Optional Override)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy... (leave blank to use server environment key)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-xs"
                />
                <button
                  type="submit"
                  disabled={savingKey}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  {savingKey ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  )}
                  <span>Save Key</span>
                </button>
              </div>
            </div>

            {keyNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{keyNotice}</span>
              </div>
            )}

            {keyError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{keyError}</span>
              </div>
            )}
          </form>
        </div>

        {/* Appearance / Theme */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Appearance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose your preferred interface theme
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Monitor },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  id={`theme-opt-${t.id}`}
                  onClick={() => onSetTheme(t.id)}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-semibold">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Server Health Check & Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Server Connection Status
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Check connection to the Talking Bot backend
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  apiConnected ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {apiConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing connection...' : 'Test Connection'}</span>
            </button>

            {testResult === 'ok' && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Healthy &amp; Ready
              </span>
            )}

            {testResult === 'error' && (
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> Offline Fallback active
              </span>
            )}
          </div>
        </div>

        {/* Data & History Management */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Data Management
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clear saved conversations and free local storage
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Clear All Conversations
              </div>
              <p className="text-[11px] text-slate-400">
                Removes your current chat logs from the browser.
              </p>
            </div>

            <button
              id="btn-clear-history"
              onClick={handleClear}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>

          {clearedNotice && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Conversation history has been cleared successfully!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
