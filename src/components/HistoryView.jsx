import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Brain,
  Code2,
  Lightbulb,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

export const HistoryView = ({
  conversations = [],
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.snippet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'brain':
        return <Brain className="w-4 h-4 text-blue-500" />;
      case 'code':
        return <Code2 className="w-4 h-4 text-emerald-500" />;
      case 'bulb':
        return <Lightbulb className="w-4 h-4 text-amber-500" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 dark:bg-slate-950 transition-colors custom-scrollbar">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Conversation History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            View and manage your past conversations
          </p>
        </div>

        {/* Search & New Chat row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-conversations"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>

          <button
            id="btn-history-new-chat"
            onClick={onNewChat}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversations List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6">
            <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
              No conversations found
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery ? 'Try a different search keyword' : 'Start a new conversation to see it saved here'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((conv) => (
              <div
                key={conv.id}
                id={`history-item-${conv.id}`}
                className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-800 transition-all shadow-2xs hover:shadow-xs"
              >
                <div
                  onClick={() => onSelectConversation(conv)}
                  className="flex items-start gap-3.5 flex-1 min-w-0 cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                    {getCategoryIcon(conv.categoryIcon)}
                  </div>
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {conv.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {conv.snippet}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-400 select-none">
                    {conv.timeAgo}
                  </span>

                  <button
                    onClick={() => onDeleteConversation(conv.id)}
                    title="Delete conversation"
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
