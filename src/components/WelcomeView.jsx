import React from 'react';
import { Brain, Code2, Lightbulb, Sparkles } from 'lucide-react';
import { RobotMascot } from './RobotMascot';

export const WelcomeView = ({ onSelectPrompt }) => {
  const promptCards = [
    {
      id: 'prompt-ai',
      icon: <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      bg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900/60',
      title: 'Tell me about',
      subtitle: 'Artificial Intelligence',
      text: 'Tell me about Artificial Intelligence',
    },
    {
      id: 'prompt-code',
      icon: <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      bg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-100 dark:border-indigo-900/60',
      title: 'Help me learn',
      subtitle: 'Python & AI Chatbot',
      text: 'Help me learn how to build an AI chatbot in Python with an easy example',
    },
    {
      id: 'prompt-explain',
      icon: <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/60',
      title: 'Explain something',
      subtitle: 'simply',
      text: 'Explain cloud computing and microservices simply',
    },
    {
      id: 'prompt-creative',
      icon: <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900/60',
      title: 'Give me a creative',
      subtitle: 'idea',
      text: 'Give me a creative idea for an AI software project',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 max-w-3xl mx-auto w-full text-center">
      {/* Robot Mascot Hero */}
      <div className="mb-6">
        <RobotMascot size="lg" expression="happy" showBubble={true} />
      </div>

      {/* Greeting Title */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
        Hello! I&apos;m <span className="text-blue-600 dark:text-blue-400">Talking Bot</span>
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-md mb-8">
        Ask me anything and let&apos;s have a conversation.
      </p>

      {/* 4 Suggestion Cards in 2x2 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-xl">
        {promptCards.map((card) => (
          <button
            key={card.id}
            id={card.id}
            onClick={() => onSelectPrompt(card.text)}
            className={`p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${card.bg}`}
          >
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-2xs shrink-0">
              {card.icon}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {card.title}
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {card.subtitle}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
