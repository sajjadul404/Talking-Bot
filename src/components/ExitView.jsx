import React from 'react';
import { MessageSquare } from 'lucide-react';
import { RobotMascot } from './RobotMascot';

export const ExitView = ({ onBackToHome }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 text-center bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col items-center">
        {/* Mascot */}
        <div className="mb-6">
          <div className="w-40 h-40 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center">
            <RobotMascot size="lg" expression="farewell" showBubble={false} />
          </div>
        </div>

        {/* Closing Title */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
          Thanks for chatting with <br />
          <span className="text-blue-600 dark:text-blue-400">Talking Bot!</span>
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">
          See you again anytime. Have a wonderful day!
        </p>

        {/* Action Button */}
        <button
          id="btn-back-to-home"
          onClick={onBackToHome}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Start New Conversation</span>
        </button>
      </div>
    </div>
  );
};
