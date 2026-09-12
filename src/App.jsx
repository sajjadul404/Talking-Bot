import React, { useState, useEffect, useMemo, useRef } from 'react';
import { INITIAL_CONVERSATIONS } from './data/initialConversations';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { ExitView } from './components/ExitView';
import { ErrorView } from './components/ErrorView';
import { DotNetHubModal } from './components/DotNetHubModal';
import { AuthView } from './components/AuthView';
import { ProfileView } from './components/ProfileView';

const DEFAULT_USER_PROFILE = {
  name: 'Sajjadul Islam',
  email: 'sajjadul@example.com',
  avatarInitials: 'SI',
  isLoggedIn: true,
};

const normalizeAccountEmail = (email) => {
  const clean = (email || '').toLowerCase().trim();
  if (!clean || clean === 'guest@example.com') return 'guest@example.com';
  if (clean === 'sajjadul@example.com' || clean === 'sajjadul.islam@gmail.com') {
    return 'sajjadul@example.com';
  }
  return clean;
};

export default function App() {
  const [viewMode, setViewMode] = useState('chat');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('talking_bot_theme') || 'light';
  });

  // User Profile state
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('talking_bot_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user profile', e);
      }
    }
    return DEFAULT_USER_PROFILE;
  });

  // User configured Gemini API key (optional local override / direct connect)
  const [userApiKey, setUserApiKey] = useState(() => {
    return localStorage.getItem('talking_bot_gemini_api_key') || '';
  });

  useEffect(() => {
    localStorage.setItem('talking_bot_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Conversations stored in localStorage
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('talking_bot_conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((c) => ({
            ...c,
            userEmail: c.userEmail || 'sajjadul@example.com',
          }));
        }
      } catch (e) {
        console.error('Failed to parse saved conversations', e);
      }
    }
    return INITIAL_CONVERSATIONS;
  });

  // Current account email
  const currentAccountEmail = normalizeAccountEmail(userProfile.email);

  // Filter conversations strictly for the currently logged-in account
  const activeUserConversations = useMemo(() => {
    return conversations.filter((c) => {
      const email = normalizeAccountEmail(c.userEmail);
      return email === currentAccountEmail;
    });
  }, [conversations, currentAccountEmail]);

  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDotNetHubOpen, setIsDotNetHubOpen] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);

  // When active account changes, reset the active chat so previous account's messages aren't displayed
  const prevEmailRef = useRef(currentAccountEmail);
  useEffect(() => {
    if (prevEmailRef.current !== currentAccountEmail) {
      prevEmailRef.current = currentAccountEmail;
      setActiveConversationId(null);
      setActiveMessages([]);
    }
  }, [currentAccountEmail]);

  // Apply theme class to HTML element and body
  useEffect(() => {
    localStorage.setItem('talking_bot_theme', theme);
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'light') {
        isDark = false;
      } else {
        isDark = mediaQuery.matches;
      }

      if (isDark) {
        root.classList.add('dark');
        document.body.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        document.body.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    applyTheme();

    const listener = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  // Persist conversations
  useEffect(() => {
    localStorage.setItem('talking_bot_conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Initial health check to server
  useEffect(() => {
    testHealth();
  }, [userApiKey]);

  const testHealth = async () => {
    try {
      const headers = {};
      if (userApiKey) {
        headers['x-gemini-api-key'] = userApiKey;
      }
      const res = await fetch('/api/health', { headers });
      if (res.ok) {
        setApiOnline(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleSaveApiKey = async (key) => {
    try {
      const res = await fetch('/api/set-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserApiKey(key);
        localStorage.setItem('talking_bot_gemini_api_key', key);
        setApiOnline(true);
        return { success: true, message: data.message || 'API Key verified and connected!' };
      }
      return { success: false, error: data.error || 'Failed to verify API Key.' };
    } catch (e) {
      return { success: false, error: e?.message || 'Network connection error.' };
    }
  };

  const handleToggleTheme = () => {
    setTheme((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'light';
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'light' : 'dark';
    });
  };

  // Start a fresh, clean chat session
  const handleNewChat = () => {
    setActiveConversationId(null);
    setActiveMessages([]);
    setViewMode('chat');
  };

  // Select a past conversation to view
  const handleSelectConversation = (conv) => {
    setActiveConversationId(conv.id);
    setActiveMessages(conv.messages);
    setViewMode('chat');
  };

  // Delete a conversation
  const handleDeleteConversation = (id) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      handleNewChat();
    }
  };

  // Clear current user's conversations
  const handleClearHistory = () => {
    setConversations((prev) =>
      prev.filter((c) => normalizeAccountEmail(c.userEmail) !== currentAccountEmail)
    );
    handleNewChat();
  };

  // Format current time e.g. "10:24 AM"
  const getCurrentTimeDisplay = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Send message
  const handleSendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    // Assignment Step 4 / Exit Check
    if (/^(exit|quit|bye|goodbye)$/i.test(trimmed)) {
      const userMsg = {
        id: `msg-${Date.now()}`,
        sender: 'user',
        text: trimmed,
        timestamp: new Date().toISOString(),
        timeDisplay: getCurrentTimeDisplay(),
      };
      setActiveMessages((prev) => [...prev, userMsg]);
      setTimeout(() => {
        setViewMode('exit');
      }, 500);
      return;
    }

    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toISOString(),
      timeDisplay: getCurrentTimeDisplay(),
    };

    const newMessages = [...activeMessages, userMessage];
    setActiveMessages(newMessages);
    setIsLoading(true);
    setLastFailedMessage(null);

    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      if (userApiKey) {
        headers['x-gemini-api-key'] = userApiKey;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: trimmed,
          history: activeMessages.map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.isExit) {
        setViewMode('exit');
        setIsLoading(false);
        return;
      }

      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || "I'm here! What else can I help you with?",
        timestamp: new Date().toISOString(),
        timeDisplay: getCurrentTimeDisplay(),
      };

      const updatedMessages = [...newMessages, botMessage];
      setActiveMessages(updatedMessages);

      // Update or create conversation record in history
      updateConversationStore(trimmed, botMessage.text, updatedMessages);
      setApiOnline(true);
    } catch (err) {
      console.error('Talking Bot request failed:', err);
      setLastFailedMessage(trimmed);

      const errorMessage = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: "I couldn't reach the server. Please check your internet connection or try again.",
        timestamp: new Date().toISOString(),
        timeDisplay: getCurrentTimeDisplay(),
        isError: true,
      };

      setActiveMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update conversation record
  const updateConversationStore = (prompt, reply, allMessages) => {
    setConversations((prev) => {
      // Determine category icon from prompt keywords
      let icon = 'message';
      const p = prompt.toLowerCase();
      if (p.includes('ai') || p.includes('intelligence') || p.includes('brain')) {
        icon = 'brain';
      } else if (p.includes('code') || p.includes('python') || p.includes('c#') || p.includes('.net')) {
        icon = 'code';
      } else if (p.includes('explain') || p.includes('idea') || p.includes('creative')) {
        icon = 'bulb';
      } else {
        icon = 'sparkles';
      }

      if (activeConversationId) {
        return prev.map((c) => {
          if (c.id === activeConversationId) {
            return {
              ...c,
              snippet: reply.slice(0, 60).replace(/[#*`_]/g, '') + '...',
              messages: allMessages,
              timeAgo: 'Just now',
              userEmail: c.userEmail || currentAccountEmail,
            };
          }
          return c;
        });
      } else {
        // Create new conversation
        const newId = `conv-${Date.now()}`;
        setActiveConversationId(newId);

        // Derive title from prompt
        const title = prompt.length > 28 ? prompt.slice(0, 28) + '...' : prompt;

        const newConv = {
          id: newId,
          userEmail: currentAccountEmail,
          title: title.charAt(0).toUpperCase() + title.slice(1),
          snippet: reply.slice(0, 60).replace(/[#*`_]/g, '') + '...',
          categoryIcon: icon,
          timestamp: new Date().toISOString(),
          timeAgo: 'Just now',
          messages: allMessages,
        };

        return [newConv, ...prev];
      }
    });
  };

  const handleRetryLast = () => {
    if (lastFailedMessage) {
      handleSendMessage(lastFailedMessage);
    }
  };

  const handleLogout = () => {
    const guestProfile = {
      name: 'Guest User',
      email: 'guest@example.com',
      avatarInitials: 'GU',
      isLoggedIn: false,
    };
    setUserProfile(guestProfile);
    setViewMode('auth');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={viewMode}
        onSelectView={(view) => setViewMode(view)}
        onNewChat={handleNewChat}
        conversations={activeUserConversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        userProfile={userProfile}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onExit={() => setViewMode('exit')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopBar
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenDotNetHub={() => setIsDotNetHubOpen(true)}
          userProfile={userProfile}
          onOpenAuth={() => setViewMode('auth')}
          onOpenProfile={() => setViewMode('profile')}
          aiOnline={apiOnline}
        />

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {viewMode === 'chat' && (
            <ChatView
              messages={activeMessages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              userProfile={userProfile}
              onRetryLastMessage={lastFailedMessage ? handleRetryLast : undefined}
            />
          )}

          {viewMode === 'history' && (
            <HistoryView
              conversations={activeUserConversations}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
              onNewChat={handleNewChat}
            />
          )}

          {viewMode === 'settings' && (
            <SettingsView
              theme={theme}
              onSetTheme={setTheme}
              onClearHistory={handleClearHistory}
              userProfile={userProfile}
              onOpenAuth={() => setViewMode('auth')}
              onOpenProfile={() => setViewMode('profile')}
              apiConnected={apiOnline}
              onTestConnection={testHealth}
              userApiKey={userApiKey}
              onSaveApiKey={handleSaveApiKey}
            />
          )}

          {viewMode === 'profile' && (
            <ProfileView
              userProfile={userProfile}
              onUpdateProfile={(updated) => setUserProfile(updated)}
              conversations={activeUserConversations}
              onOpenChat={() => setViewMode('chat')}
              onOpenAuth={() => setViewMode('auth')}
              onLogout={handleLogout}
            />
          )}

          {viewMode === 'auth' && (
            <AuthView
              currentUser={userProfile}
              onSuccess={(newProfile) => {
                setUserProfile(newProfile);
                setViewMode('profile');
              }}
              onCancel={() => setViewMode('chat')}
            />
          )}

          {viewMode === 'exit' && (
            <ExitView
              onBackToHome={() => {
                handleNewChat();
                setViewMode('chat');
              }}
            />
          )}

          {viewMode === 'error' && (
            <ErrorView
              onRetry={() => {
                setViewMode('chat');
                handleRetryLast();
              }}
              onGoHome={handleNewChat}
            />
          )}
        </main>
      </div>

      {/* C# & .NET 8 Source Explorer Modal */}
      <DotNetHubModal
        isOpen={isDotNetHubOpen}
        onClose={() => setIsDotNetHubOpen(false)}
      />
    </div>
  );
}
