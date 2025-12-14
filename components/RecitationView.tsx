import React, { useState, useEffect, useRef } from 'react';
import { Surah, MessageLog } from '../types';
import { useLiveSession } from '../hooks/useLiveSession';

interface RecitationViewProps {
  surah: Surah;
  onBack: () => void;
}

export const RecitationView: React.FC<RecitationViewProps> = ({ surah, onBack }) => {
  const [messages, setMessages] = useState<MessageLog[]>([]);
  const [showText, setShowText] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleTranscript = (text: string, sender: 'user' | 'ai') => {
    setMessages(prev => {
        // If AI is speaking, append to last AI message if it exists to avoid clutter
        if (sender === 'ai' && prev.length > 0 && prev[prev.length - 1].sender === 'ai') {
            const newLogs = [...prev];
            newLogs[newLogs.length - 1].text += " " + text;
            return newLogs;
        }
        return [...prev, { id: Date.now().toString(), sender, text }];
    });
  };

  const { connect, disconnect, isConnected, isTalking, volume } = useLiveSession({
    surahName: surah.name,
    onTranscript: handleTranscript,
  });

  // Auto scroll feedback
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Visualize volume
  const visualizerBars = 5;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="bg-emerald-600 text-white p-4 shadow-md z-10 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-emerald-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
        <h2 className="text-xl font-bold font-serif">{surah.name}</h2>
        <button 
          onClick={() => setShowText(!showText)} 
          className={`p-2 rounded-full transition-colors ${showText ? 'bg-emerald-700/50' : 'hover:bg-emerald-700'}`}
          title={showText ? "إخفاء النص" : "إظهار النص"}
        >
          {showText ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto flex flex-col p-4 gap-6 pb-32">
        
        {/* Quran Text Display */}
        <div className={`bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 text-center transition-all duration-500 ${showText ? 'opacity-100' : 'opacity-50 blur-sm select-none'}`}>
          {surah.verses.map((verse, idx) => (
            <p key={idx} className={`quran-text text-2xl md:text-3xl text-gray-800 mb-4 ${idx === 0 ? 'text-emerald-700 font-bold' : ''}`}>
              {showText ? verse : '.......................'} {idx > 0 && <span className="text-emerald-500 text-lg mx-2">۝</span>}
            </p>
          ))}
          {!showText && <p className="text-emerald-600 font-bold mt-4">ابدأ التسميع من حفظك...</p>}
        </div>

        {/* AI Feedback Area */}
        {messages.length > 0 && (
            <div className="flex flex-col gap-3">
                <h3 className="text-sm font-bold text-gray-500 px-2">ملاحظات المصحح الآلي</h3>
                <div ref={scrollRef} className="max-h-40 overflow-y-auto space-y-2 p-2">
                    {messages.map(msg => (
                        msg.sender === 'ai' && (
                            <div key={msg.id} className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-lg text-sm flex items-start gap-2">
                                <span className="mt-1">🤖</span>
                                <p>{msg.text}</p>
                            </div>
                        )
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* Bottom Control Panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 flex flex-col items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-t-3xl z-20">
        
        {/* Status Text */}
        <div className="mb-4 text-sm font-medium text-gray-500 h-6">
            {isConnected ? (isTalking ? "المصحح يتحدث..." : "استمع الآن...") : "اضغط الميكروفون للبدء"}
        </div>

        {/* Microphone Button */}
        <div className="relative">
            {/* Pulsing rings when active */}
            {isConnected && (
                <>
                 <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                 <div className="absolute -inset-2 bg-emerald-500 rounded-full animate-pulse opacity-10"></div>
                </>
            )}
            
            <button
            onClick={isConnected ? disconnect : connect}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                isConnected 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105'
            }`}
            >
            {isConnected ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
            )}
            </button>
        </div>

        {/* Audio Visualizer (Simple Bars) */}
        {isConnected && (
            <div className="flex items-end justify-center gap-1 h-8 mt-4">
                {[...Array(visualizerBars)].map((_, i) => (
                    <div 
                        key={i}
                        className="w-1.5 bg-emerald-400 rounded-full transition-all duration-75"
                        style={{ 
                            height: `${Math.max(4, volume * 100 * (Math.random() * 0.5 + 0.5))}px`,
                            opacity: 0.7 
                        }}
                    ></div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};