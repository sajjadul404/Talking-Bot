import React from 'react';
import {
  MessageSquare,
  History,
  Settings,
  Plus,
  Brain,
  Code2,
  Lightbulb,
  Sparkles,
  LogOut,
  X,
  UserCheck,
  User,
} from 'lucide-react';
import { RobotMascot } from './RobotMascot';

export const Sidebar = ({
  currentView,
  onSelectView,
  onNewChat,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  userProfile,
  isOpenMobile,
  onCloseMobile,
  onExit,
}) => {
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
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="sidebar"
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 md:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-900 flex items-center justify-center shadow-xs overflow-hidden">
              <RobotMascot size="sm" showBubble={false} />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-base leading-tight">Talking Bot</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">AI Conversation Assistant</div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action button & Navigation */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
          {/* + New Chat button */}
          <button
            id="btn-new-chat"
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-sm hover:shadow transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Primary View Links */}
          <nav className="space-y-1">
            <button
              id="nav-chat"
              onClick={() => {
                onSelectView('chat');
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentView === 'chat'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </button>

            <button
              id="nav-history"
              onClick={() => {
                onSelectView('history');
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentView === 'history'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Conversation History</span>
            </button>

            <button
              id="nav-profile"
              onClick={() => {
                onSelectView('profile');
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentView === 'profile'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </button>

            <button
              id="nav-settings"
              onClick={() => {
                onSelectView('settings');
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentView === 'settings'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <button
              id="nav-auth"
              onClick={() => {
                onSelectView('auth');
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentView === 'auth'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Login / Register</span>
            </button>
          </nav>

          {/* Recent Conversations */}
          <div className="pt-3">
            <div className="flex items-center justify-between px-3.5 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Recent Conversations
              </span>
              {conversations.length > 0 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {conversations.length}
                </span>
              )}
            </div>

            {conversations.length > 0 ? (
              <div className="space-y-1">
                {conversations.slice(0, 5).map((conv) => {
                  const isActive = activeConversationId === conv.id && currentView === 'chat';
                  return (
                    <button
                      key={conv.id}
                      id={`recent-conv-${conv.id}`}
                      onClick={() => {
                        onSelectConversation(conv);
                        onCloseMobile();
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                        isActive
                          ? 'bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-transparent'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                        {getCategoryIcon(conv.categoryIcon)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {conv.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">{conv.timeAgo}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {conv.snippet}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mx-2 px-3 py-3.5 text-center rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  No chat history for this account
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onNewChat();
                    onCloseMobile();
                  }}
                  className="mt-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <span>+ Start a new chat</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-700/80 transition-all shadow-2xs">
            <button
              onClick={() => {
                onSelectView('profile');
                onCloseMobile();
              }}
              title="Click to View My Profile"
              className="flex items-center gap-2.5 min-w-0 text-left flex-1 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {userProfile?.avatarInitials || 'SI'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {userProfile?.name || 'User'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {userProfile?.email || 'user@example.com'}
                </div>
              </div>
            </button>

            <button
              id="btn-user-exit"
              onClick={onExit}
              title="End session (Exit)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
