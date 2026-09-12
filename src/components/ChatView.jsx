import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import { RobotMascot } from './RobotMascot';
import { WelcomeView } from './WelcomeView';

export const ChatView = ({
  messages = [],
  isLoading = false,
  onSendMessage,
  userProfile,
  onRetryLastMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(null);
  const [autoSpeak, setAutoSpeak] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Speech Recognition setup (Voice-to-text)
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      }
    }
  };

  // Text to Speech playback (Talking Bot voice)
  const speakText = (text, messageId) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking === messageId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for cleaner speech
    const cleanSpeech = text
      .replace(/[#*`_~[\]()]/g, '')
      .replace(/•/g, 'bullet point, ');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // friendly bot pitch

    utterance.onend = () => {
      setIsSpeaking(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(null);
    };

    setIsSpeaking(messageId);
    window.speechSynthesis.speak(utterance);
  };

  // When new bot message arrives, if autoSpeak is enabled, speak it
  useEffect(() => {
    if (autoSpeak && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === 'bot') {
        speakText(lastMsg.text, lastMsg.id);
      }
    }
  }, [messages.length, autoSpeak]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const text = inputText;
    setInputText('');
    onSendMessage(text);
  };

  const handleAttachTemplate = () => {
    setInputText('Explain C# asynchronous programming and async/await with a code example.');
    inputRef.current?.focus();
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Messages area or Welcome Hero */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar flex flex-col">
        {messages.length === 0 ? (
          <WelcomeView onSelectPrompt={(prompt) => onSendMessage(prompt)} />
        ) : (
          <div className="max-w-3xl w-full mx-auto space-y-6">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  id={`message-${msg.id}`}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className={`flex items-start gap-2.5 max-w-[85%] sm:max-w-[78%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    {isUser ? (
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs mt-1">
                        {userProfile?.avatarInitials || 'U'}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs mt-1 overflow-hidden">
                        <RobotMascot size="sm" showBubble={false} />
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`relative px-4 py-3 text-sm leading-relaxed ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-2xl rounded-tr-xs shadow-xs'
                          : msg.isError
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900 rounded-2xl rounded-tl-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-2xl rounded-tl-xs shadow-xs'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none break-words space-y-2">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      )}

                      {/* Action buttons on bot messages */}
                      {!isUser && !msg.isError && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-slate-400">
                          <button
                            onClick={() => speakText(msg.text, msg.id)}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors"
                            title={isSpeaking === msg.id ? 'Stop talking' : 'Read aloud (Voice)'}
                          >
                            {isSpeaking === msg.id ? (
                              <VolumeX className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            title="Copy text"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}

                      {msg.isError && onRetryLastMessage && (
                        <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-900/60 flex items-center gap-2">
                          <button
                            onClick={onRetryLastMessage}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:underline"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Retry sending
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timestamp below */}
                  <span className="text-[11px] text-slate-400 mt-1 px-11 select-none">
                    {msg.timeDisplay}
                  </span>
                </div>
              );
            })}

            {/* Thinking / Typing indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                  <RobotMascot size="sm" expression="thinking" showBubble={false} />
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-3 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-150" />
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-300" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input Container */}
      <div className="p-3 sm:p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto">
          {/* Controls toolbar */}
          <div className="flex items-center justify-between px-2 mb-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  autoSpeak
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-medium'
                    : 'hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="Toggle automated speech reading"
              >
                {autoSpeak ? <Volume2 className="w-3 h-3 text-blue-500" /> : <VolumeX className="w-3 h-3" />}
                <span>Auto-Voice: {autoSpeak ? 'On' : 'Off'}</span>
              </button>

              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>

              <span className="hidden sm:inline text-[11px]">
                Type <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-600 dark:text-slate-300">exit</code> or <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-600 dark:text-slate-300">quit</code> to end chat
              </span>
            </div>

            {isListening && (
              <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1 animate-pulse font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Listening...
              </span>
            )}
          </div>

          {/* Form input bar */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-xs"
          >
            {/* Attachment icon */}
            <button
              type="button"
              id="btn-attach"
              onClick={handleAttachTemplate}
              title="Insert sample C# prompt template"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors shrink-0 cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Input text */}
            <input
              ref={inputRef}
              id="chat-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none px-1"
            />

            {/* Microphone button (talking bot voice) */}
            <button
              type="button"
              id="btn-mic"
              onClick={toggleListening}
              title={isListening ? 'Stop listening' : 'Voice input (Speech to text)'}
              className={`p-2 rounded-xl transition-colors shrink-0 cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send button */}
            <button
              type="submit"
              id="btn-send"
              disabled={!inputText.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-xs shrink-0 cursor-pointer"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
