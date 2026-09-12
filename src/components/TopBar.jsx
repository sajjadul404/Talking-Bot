import React from 'react';
import { Sun, Moon, Menu, UserPlus } from 'lucide-react';

export const TopBar = ({
  theme,
  onToggleTheme,
  onOpenMobileSidebar,
  userProfile,
  onOpenAuth,
  onOpenProfile,
  aiOnline = true,
}) => {
  const isEffectiveDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <header
      id="top-bar"
      className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors"
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          id="btn-mobile-menu"
          onClick={onOpenMobileSidebar}
          aria-label="Open sidebar navigation"
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
            Talking Bot
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Your intelligent AI conversation assistant
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* AI Online badge */}
        <div
          id="ai-status-badge"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-700 dark:text-emerald-400 select-none shadow-xs"
        >
          <span className={`w-2 h-2 rounded-full ${aiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span>{aiOnline ? 'AI Online' : 'Offline'}</span>
        </div>

        {/* Account / Profile button */}
        {userProfile && userProfile.isLoggedIn ? (
          <button
            id="btn-topbar-profile"
            onClick={onOpenProfile || onOpenAuth}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50/90 hover:bg-blue-100/90 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 transition-all shadow-2xs backdrop-blur-xs cursor-pointer"
            title="View My Profile"
          >
            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
              {userProfile.avatarInitials}
            </span>
            <span className="hidden sm:inline truncate max-w-[110px]">{userProfile.name}</span>
            {userProfile.provider === 'google' && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Google Account" />
            )}
          </button>
        ) : onOpenAuth ? (
          <button
            id="btn-topbar-auth"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50/90 hover:bg-blue-100/90 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 transition-all shadow-2xs backdrop-blur-xs cursor-pointer"
            title="Login or Register account"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Login / Register</span>
          </button>
        ) : null}

        {/* Theme Toggle Button */}
        <button
          id="btn-theme-toggle"
          onClick={onToggleTheme}
          aria-label="Toggle light or dark theme"
          title={isEffectiveDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isEffectiveDark ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          )}
        </button>
      </div>
    </header>
  );
};
