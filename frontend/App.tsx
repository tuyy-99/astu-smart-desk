import React, { useEffect, useMemo, useState } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import AdminDashboard from "./components/AdminDashboard";
import Auth from "./components/Auth";
import Navbar from "./components/Navbar";
import ChatWidget from "./components/ChatWidget";
import { ChatSession, Document, User } from "./types";
import {
  deleteChatSession,
  deleteDocument,
  getChatHistory,
  getCurrentUser,
  getDocuments,
  mapBackendDocument,
  uploadDocumentText,
} from "./services/backendApi";

const STORAGE_KEYS = {
  token: "astu_smartdesk_token",
  sessions: "astu_smartdesk_sessions",
  currentSessionId: "astu_smartdesk_current_sid",
};

const parseStoredSessions = (): ChatSession[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.sessions);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return parsed.map((s: any) => ({
      ...s,
      updatedAt: new Date(s.updatedAt),
      messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
    }));
  } catch {
    return [];
  }
};

const mapBackendSessions = (records: any[]): ChatSession[] =>
  records.map((record) => ({
    id: record.sessionId,
    title:
      record.messages?.find((m: any) => m.role === "user")?.content?.slice(0, 35) ||
      "SmartDesk Chat",
    messages: (record.messages || []).map((m: any, idx: number) => ({
      id: `${record.sessionId}_${idx}`,
      sender: m.role === "assistant" ? "ai" : "user",
      text: m.content,
      timestamp: new Date(m.timestamp),
      sources: m.sources?.map((s: any) => s.title) || [],
    })),
    updatedAt: new Date(record.updatedAt),
  }));

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEYS.token));
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTrigger, setActiveTrigger] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>(parseStoredSessions);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEYS.currentSessionId)
  );
  const [knowledgeBase, setKnowledgeBase] = useState<Document[]>([]);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [isDocsLoading, setIsDocsLoading] = useState(false);

  const isAuthenticated = useMemo(() => Boolean(user && token), [user, token]);

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEYS.token);
  };

  const refreshDocuments = async (authToken: string) => {
    setIsDocsLoading(true);
    setDocsError(null);
    try {
      const data = await getDocuments(authToken);
      setKnowledgeBase((data.documents || []).map(mapBackendDocument));
    } catch (error) {
      setDocsError(error instanceof Error ? error.message : "Failed to load documents.");
    } finally {
      setIsDocsLoading(false);
    }
  };

  const refreshChatHistory = async (authToken: string) => {
    try {
      const data = await getChatHistory(authToken);
      const mapped = mapBackendSessions(data.chatHistories || []);
      if (mapped.length > 0) setSessions(mapped);
    } catch {
      // Keep local sessions as fallback when history endpoint fails.
    }
  };

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId) localStorage.setItem(STORAGE_KEYS.currentSessionId, currentSessionId);
    else localStorage.removeItem(STORAGE_KEYS.currentSessionId);
  }, [currentSessionId]);

  useEffect(() => {
    if (!token) return;
    localStorage.setItem(STORAGE_KEYS.token, token);
    getCurrentUser(token)
      .then((data) => setUser(data.user))
      .catch(() => handleLogout());
    refreshDocuments(token);
    refreshChatHistory(token);
  }, [token]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const handleLogin = (loggedInUser: User, authToken: string) => {
    setUser(loggedInUser);
    setToken(authToken);
  };

  const handlePurgeHistory = async () => {
    if (token && sessions.length > 0) {
      await Promise.allSettled(sessions.map((s) => deleteChatSession(token, s.id)));
    }
    setSessions([]);
    setCurrentSessionId(null);
    localStorage.removeItem(STORAGE_KEYS.sessions);
    localStorage.removeItem(STORAGE_KEYS.currentSessionId);
  };

  const handleAddDocument = async (payload: { title: string; content: string; category: string }) => {
    if (!token) return;
    await uploadDocumentText(token, payload);
    await refreshDocuments(token);
  };

  const handleDeleteDocument = async (id: string) => {
    if (!token) return;
    await deleteDocument(token, id);
    await refreshDocuments(token);
  };

  return (
    <HashRouter>
      <div className="min-h-screen transition-colors duration-300 font-sans antialiased">
        <Navbar user={user} onLogout={handleLogout} toggleTheme={toggleTheme} isDarkMode={isDarkMode} />

        <Routes>
          <Route path="/" element={<LandingPage user={user} onTriggerChat={(q) => setActiveTrigger(q)} />} />
          <Route
            path="/admin"
            element={
              user?.role === "admin" || user?.role === "staff" ? (
                <AdminDashboard
                  docs={knowledgeBase}
                  isLoading={isDocsLoading}
                  error={docsError}
                  onAdd={handleAddDocument}
                  onDelete={handleDeleteDocument}
                />
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          <Route path="/auth" element={!isAuthenticated ? <Auth onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <ChatWidget
          knowledgeBase={knowledgeBase}
          activeTrigger={activeTrigger}
          clearTrigger={() => setActiveTrigger(null)}
          sessions={sessions}
          onUpdateSessions={setSessions}
          onPurgeHistory={handlePurgeHistory}
          currentSessionId={currentSessionId}
          onSelectSession={setCurrentSessionId}
          user={user}
          token={token}
          onAuthExpired={handleLogout}
        />
      </div>
    </HashRouter>
  );
};

export default App;
