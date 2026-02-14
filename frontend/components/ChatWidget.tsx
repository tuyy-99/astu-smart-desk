
import React, { useState, useRef, useEffect } from 'react';
import { Message, Document, ChatSession, User } from '../types';
import { askQuestion, deleteChatSession } from '../services/backendApi';
import { useNavigate } from 'react-router-dom';

interface ChatWidgetProps {
  knowledgeBase: Document[];
  activeTrigger?: string | null;
  clearTrigger?: () => void;
  sessions: ChatSession[];
  onUpdateSessions: (sessions: ChatSession[]) => void;
  onPurgeHistory: () => void;
  currentSessionId: string | null;
  onSelectSession: (id: string | null) => void;
  user?: User | null;
  token?: string | null;
  onAuthExpired: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ 
  knowledgeBase, 
  activeTrigger, 
  clearTrigger,
  sessions,
  onUpdateSessions,
  onPurgeHistory,
  currentSessionId,
  onSelectSession,
  user,
  token,
  onAuthExpired
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [toast, setToast] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [sessions, isTyping, isOpen, currentSessionId]);

  useEffect(() => {
    if (activeTrigger) {
      if (!user) {
        navigate('/auth');
        if (clearTrigger) clearTrigger();
      } else {
        setIsOpen(true);
        handleSend(activeTrigger);
        if (clearTrigger) clearTrigger();
      }
    }
  }, [activeTrigger, user]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const triggerToast = (msg: string) => setToast(msg);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || !token) return;

    let targetLang = language;
    const lower = textToSend.toLowerCase();
    if (['amharic', 'አማርኛ', 'በአማርኛ'].some(k => lower.includes(k))) {
      targetLang = 'am';
      setLanguage('am');
      triggerToast("Mode: አማርኛ");
    } else if (['english', 'in english'].some(k => lower.includes(k))) {
      targetLang = 'en';
      setLanguage('en');
      triggerToast("Mode: English");
    }

    let targetSid = currentSessionId;
    let currentSessionsCopy = [...sessions];

    if (!targetSid) {
      targetSid = Date.now().toString();
      const newSession: ChatSession = {
        id: targetSid,
        title: textToSend.length > 25 ? textToSend.substring(0, 25) + '...' : textToSend,
        messages: [],
        updatedAt: new Date()
      };
      currentSessionsCopy = [newSession, ...currentSessionsCopy];
      onSelectSession(targetSid);
    }

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: textToSend, timestamp: new Date() };
    
    const sIndex = currentSessionsCopy.findIndex(s => s.id === targetSid);
    if (sIndex !== -1) {
      const updated = { ...currentSessionsCopy[sIndex] };
      updated.messages = [...updated.messages, userMsg];
      updated.updatedAt = new Date();
      if (updated.title === 'New Chat') updated.title = textToSend.substring(0, 30);
      currentSessionsCopy[sIndex] = updated;
    }

    onUpdateSessions(currentSessionsCopy);
    setInput('');
    setIsTyping(true);

    try {
      const result = await askQuestion(token, {
        question: textToSend,
        language: targetLang,
        sessionId: targetSid ?? undefined
      });

      setIsTyping(false);
      const aiMsg: Message = {
        id: `${Date.now()}_ai`,
        sender: 'ai',
        text: result.answer,
        timestamp: new Date(),
        sources: result.sources?.map((s) => s.title) || []
      };

      const resolvedSid = result.sessionId || targetSid;
      if (resolvedSid && resolvedSid !== currentSessionId) {
        onSelectSession(resolvedSid);
      }

      onUpdateSessions(
        currentSessionsCopy.map((s) =>
          s.id === resolvedSid ? { ...s, messages: [...s.messages, aiMsg], updatedAt: new Date() } : s
        )
      );
    } catch (error) {
      setIsTyping(false);
      const message = error instanceof Error ? error.message : 'Request failed';
      if (message.toLowerCase().includes('token') || message.toLowerCase().includes('authorized')) {
        onAuthExpired();
        return;
      }

      const aiMsg: Message = {
        id: `${Date.now()}_error`,
        sender: 'ai',
        text: 'I am having trouble reaching the assistant service. Please try again shortly.',
        timestamp: new Date(),
      };

      onUpdateSessions(
        currentSessionsCopy.map((s) =>
          s.id === targetSid ? { ...s, messages: [...s.messages, aiMsg], updatedAt: new Date() } : s
        )
      );
    }
  };

  const confirmPurge = () => {
    onPurgeHistory();
    setIsSidebarOpen(false);
    setShowSettings(false);
    setShowPurgeConfirm(false);
    triggerToast("History cleared!");
  };

  const deleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (token) {
      try {
        await deleteChatSession(token, id);
      } catch {
        // keep local state aligned even if backend call fails
      }
    }
    const updated = sessions.filter(s => s.id !== id);
    onUpdateSessions(updated);
    if (currentSessionId === id) onSelectSession(null);
    triggerToast("Chat removed");
  };

  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      const content = line.trim();
      if (!content) return <div key={i} className="h-4" />;
      
      const isList = /^[*\-•\d.]+\s+/.test(content);
      const cleanLine = content.replace(/^[*\-•\d.]+\s+/, '').replace(/^#+\s+/, '');
      
      const parts = cleanLine.split(/\*\*(.*?)\*\*/g);
      const elements = parts.map((p, idx) => idx % 2 === 1 ? <strong key={idx} className="text-indigo-600 dark:text-indigo-400 font-extrabold">{p}</strong> : p);

      if (isList) {
        return (
          <div key={i} className="flex items-start space-x-3 mb-4 ml-2">
            <span className="text-indigo-500 font-black mt-1.5">•</span>
            <div className="flex-1 leading-relaxed tracking-tight font-medium text-slate-700 dark:text-slate-200">{elements}</div>
          </div>
        );
      }
      return <p key={i} className="mb-5 leading-loose tracking-tight font-medium text-slate-700 dark:text-slate-200">{elements}</p>;
    });
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[9999]">
      {/* Toast */}
      {toast && (
        <div className="absolute bottom-full right-0 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl font-black text-[10px] uppercase tracking-widest border border-white/20">
            {toast}
          </div>
        </div>
      )}

      {isOpen ? (
        <div className="w-[calc(100vw-2rem)] sm:w-[420px] md:w-[500px] h-[650px] max-h-[85vh] flex flex-col bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-slate-700 overflow-hidden relative transition-all">
          
          {/* Header */}
          <div className="p-4 bg-indigo-600 dark:bg-indigo-700 flex items-center justify-between text-white flex-shrink-0 z-30 shadow-lg">
            <div className="flex items-center space-x-3">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded-xl transition-all" title="Menu">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase opacity-60 tracking-widest">Assistant</span>
                <h3 className="font-black text-sm truncate max-w-[150px]">{currentSession?.title || 'SmartDesk Chat'}</h3>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>

          {/* Sidebar */}
          {isSidebarOpen && (
            <div className="absolute inset-0 z-40 transition-all">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
              <div className="relative w-4/5 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
                <div className="p-4">
                  <button 
                    onClick={() => { onSelectSession(null); setIsSidebarOpen(false); }} 
                    className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    <span>New Chat</span>
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 ml-2">Chat History</span>
                  {sessions.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs italic">No history yet</div>
                  ) : (
                    sessions.map(s => (
                      <div 
                        key={s.id} 
                        onClick={() => { onSelectSession(s.id); setIsSidebarOpen(false); }} 
                        className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer border transition-all ${currentSessionId === s.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 text-indigo-700' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                      >
                        <span className="text-sm font-bold block truncate max-w-[80%]">{s.title}</span>
                        <button onClick={(e) => deleteSession(e, s.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => { setShowSettings(true); setIsSidebarOpen(false); }} 
                    className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group transition-all hover:ring-2 ring-indigo-500/20 shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black">
                        {user?.name?.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[100px]">{user?.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Profile & Settings</p>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 bg-slate-50 dark:bg-slate-900/30 custom-scrollbar">
            {sessions.find(s => s.id === currentSessionId)?.messages.length === 0 || !currentSessionId ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
                <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl rotate-6 animate-bounce">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </div>
                <div><h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2">ASTU SmartDesk</h4><p className="text-slate-500 text-sm max-w-[250px] font-medium leading-relaxed">Ask me about registrar rules, internships, or campus services in English or Amharic.</p></div>
              </div>
            ) : (
              currentSession?.messages.map((m) => (
                <div key={m.id} className={`flex w-full ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-[2rem] px-6 py-5 shadow-sm animate-in fade-in slide-in-from-bottom-2 ${m.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-none'}`}>
                    <div className="text-[15px]">{m.sender === 'ai' ? renderContent(m.text) : <p className="font-semibold leading-relaxed tracking-tight">{m.text}</p>}</div>
                    {m.sources && m.sources.length > 0 && <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap gap-2">{m.sources.map((s, idx) => <span key={idx} className="bg-indigo-50 dark:bg-slate-900 px-2.5 py-1 rounded-lg text-[9px] font-black text-indigo-600 uppercase border border-indigo-100">Ref: {s}</span>)}</div>}
                    <div className="mt-2 text-[9px] font-black opacity-30 text-right uppercase">{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))
            )}
            {isTyping && <div className="flex justify-start"><div className="bg-white dark:bg-slate-800 rounded-2xl px-6 py-4 flex space-x-2 shadow-sm border border-slate-100 dark:border-slate-700"><div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div><div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div></div></div>}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          <div className="p-5 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[2rem] focus-within:ring-2 ring-indigo-500/50 transition-all">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={language === 'am' ? 'ጥያቄዎን እዚህ ይጻፉ...' : 'Ask SmartDesk...'} className="flex-1 px-5 py-3 bg-transparent border-none text-[15px] outline-none font-bold text-slate-900 dark:text-white" />
              <button onClick={() => handleSend()} disabled={!input.trim()} className="bg-indigo-600 text-white p-4 rounded-full hover:bg-indigo-700 transition-all disabled:opacity-20"><svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg></button>
            </div>
          </div>

          {/* Settings Overlay */}
          {showSettings && (
            <div className="absolute inset-0 z-[60] bg-white dark:bg-slate-900 animate-in slide-in-from-bottom duration-500 flex flex-col">
              <div className="p-6 flex items-center border-b border-slate-100 dark:border-slate-800">
                <button onClick={() => setShowSettings(false)} className="p-2 mr-4 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg></button>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Settings</h2>
              </div>
              <div className="p-8 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
                <section className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account</h3>
                  <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl">{user?.name?.charAt(0)}</div>
                    <div><p className="font-black text-slate-900 dark:text-white">{user?.name}</p><p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">{user?.role} Profile</p></div>
                  </div>
                </section>
                <section className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferences</h3>
                  <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Language</p>
                    <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-inner">
                      <button onClick={() => setLanguage('en')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${language === 'en' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>EN</button>
                      <button onClick={() => setLanguage('am')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${language === 'am' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>አማ</button>
                    </div>
                  </div>
                </section>
                <section className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security</h3>
                  <button onClick={() => setShowPurgeConfirm(true)} className="w-full group flex items-center justify-between p-5 text-red-500 font-black bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 active:scale-95 transition-all shadow-sm">
                    <span className="text-sm">Clear All History</span>
                    <svg className="w-5 h-5 transform group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </section>
              </div>
            </div>
          )}

          {/* Purge Confirm Overlay */}
          {showPurgeConfirm && (
            <div className="absolute inset-0 z-[70] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-8 text-center animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-2xl max-w-xs space-y-6">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Delete All History?</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">This will permanently remove your conversation records from this device.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button onClick={() => setShowPurgeConfirm(false)} className="py-4 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Cancel</button>
                  <button onClick={confirmPurge} className="py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-200 dark:shadow-none hover:bg-red-600 transition-all">Confirm</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="w-16 h-16 md:w-20 md:h-20 bg-indigo-600 text-white rounded-[2.5rem] shadow-[0_30px_70px_-15px_rgba(79,70,229,0.7)] flex items-center justify-center hover:scale-110 active:scale-90 transition-all group border-4 border-white dark:border-slate-800">
          <svg className="w-8 h-8 md:w-10 md:h-10 group-hover:rotate-12 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
