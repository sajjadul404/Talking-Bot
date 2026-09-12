import React from 'react';
import { RefreshCw, Home } from 'lucide-react';
import { RobotMascot } from './RobotMascot';

export const ErrorView = ({
  onRetry,
  onGoHome,
  errorMessage = 'Something went wrong. Please check your connection and try again.',
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 text-center bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col items-center">
        {/* Error Mascot Illustration */}
        <div className="mb-6 relative">
          <div className="w-36 h-36 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 flex items-center justify-center">
            <RobotMascot size="lg" expression="error" showBubble={false} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
          Connection Error
        </h2>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs leading-relaxed">
          {errorMessage}
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <button
            id="btn-try-again"
            onClick={onRetry}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            id="btn-go-home"
            onClick={onGoHome}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
