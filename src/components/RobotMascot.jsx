import React from 'react';

export const RobotMascot = ({
  size = 'lg',
  expression = 'happy',
  className = '',
  showBubble = true,
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-36 h-36 md:w-44 md:h-44',
    xl: 'w-48 h-48 md:w-56 md:h-56',
  }[size] || 'w-36 h-36';

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`} id="robot-mascot">
      <svg
        className={`${sizeClasses} drop-shadow-sm transition-transform duration-300 hover:scale-105`}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="headGrad" x1="40" y1="30" x2="160" y2="170" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="earGrad" x1="15" y1="75" x2="45" y2="125" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="earGradRight" x1="155" y1="75" x2="185" y2="125" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="glowGrad" x1="100" y1="60" x2="100" y2="150" gradientUnits="userSpaceOnUse">
            <stop stopColor="#60A5FA" stopOpacity="0.25" />
            <stop offset="1" stopColor="#3B82F6" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Ambient Halo behind head */}
        <circle cx="100" cy="105" r="76" fill="url(#glowGrad)" />

        {/* Headband / Antenna Bar */}
        <path
          d="M 45 95 C 45 52, 155 52, 155 95"
          stroke="#94A3B8"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Small top antenna node */}
        <line x1="100" y1="52" x2="100" y2="36" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
        <circle cx="100" cy="32" r="7" fill={expression === 'error' ? '#EF4444' : '#3B82F6'} />
        <circle cx="100" cy="32" r="3" fill="#FFFFFF" />

        {/* Left Ear Phone */}
        <rect x="18" y="76" width="18" height="48" rx="9" fill="url(#earGrad)" />
        <rect x="23" y="86" width="8" height="28" rx="4" fill="#93C5FD" opacity="0.6" />

        {/* Right Ear Phone */}
        <rect x="164" y="76" width="18" height="48" rx="9" fill="url(#earGradRight)" />
        <rect x="169" y="86" width="8" height="28" rx="4" fill="#93C5FD" opacity="0.6" />

        {/* Main Robot Face Body */}
        <rect
          x="34"
          y="56"
          width="132"
          height="102"
          rx="38"
          fill="url(#headGrad)"
          stroke="#CBD5E1"
          strokeWidth="3"
        />

        {/* Inner Screen Visor (Navy Blue / Slate) */}
        <rect
          x="48"
          y="70"
          width="104"
          height="74"
          rx="24"
          fill={expression === 'error' ? '#1E293B' : '#0F172A'}
        />

        {/* Highlights on visor */}
        <path
          d="M 58 78 Q 100 74 142 78"
          stroke="#38BDF8"
          strokeWidth="1.5"
          opacity="0.3"
          strokeLinecap="round"
        />

        {/* Eyes & Mouth depending on Expression */}
        {expression === 'error' ? (
          <>
            <path d="M 68 96 L 82 108 M 82 96 L 68 108" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 118 96 L 132 108 M 132 96 L 118 108" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 90 128 Q 100 120 110 128" stroke="#F87171" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        ) : expression === 'thinking' ? (
          <>
            <circle cx="75" cy="102" r="7" fill="#38BDF8" />
            <circle cx="125" cy="102" r="7" fill="#38BDF8" />
            <circle cx="77" cy="100" r="2.5" fill="#FFFFFF" />
            <circle cx="127" cy="100" r="2.5" fill="#FFFFFF" />
            <circle cx="100" cy="125" r="4.5" fill="#38BDF8" />
          </>
        ) : expression === 'farewell' ? (
          <>
            <path d="M 68 102 Q 75 94 82 102" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 118 102 L 132 102" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 88 118 Q 100 134 112 118" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" fill="none" />
            <ellipse cx="64" cy="118" rx="5" ry="3" fill="#F472B6" opacity="0.7" />
            <ellipse cx="136" cy="118" rx="5" ry="3" fill="#F472B6" opacity="0.7" />
          </>
        ) : (
          <>
            <path
              d="M 68 104 C 68 93, 82 93, 82 104"
              stroke="#38BDF8"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 118 104 C 118 93, 132 93, 132 104"
              stroke="#38BDF8"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 88 122 Q 100 132 112 122"
              stroke="#38BDF8"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="64" cy="118" r="4" fill="#60A5FA" opacity="0.4" />
            <circle cx="136" cy="118" r="4" fill="#60A5FA" opacity="0.4" />
          </>
        )}
      </svg>

      {/* Floating Speech Bubble */}
      {showBubble && size !== 'sm' && (
        <div className="absolute -top-1 -right-2 md:top-2 md:right-1 animate-bounce duration-1000">
          <div className="relative bg-blue-500 text-white rounded-full px-2.5 py-1 shadow-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse delay-150" />
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse delay-300" />
            <div className="absolute -bottom-1 left-2 w-2 h-2 bg-blue-500 rotate-45" />
          </div>
        </div>
      )}

      {(size === 'lg' || size === 'xl') && (
        <div className="absolute -top-3 -left-3 text-blue-400 opacity-75 animate-pulse">✦</div>
      )}
    </div>
  );
};
