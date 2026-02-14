import { Document, User } from "../types";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};

type AuthPayload = {
  user: {
    id: string;
    name: string;
    email: string;
    universityId?: string;
    role: "student" | "admin" | "staff";
  };
  token: string;
};

type AskResponse = {
  answer: string;
  sessionId: string;
  sources: Array<{ title: string }>;
};

type ChatHistoryResponse = {
  chatHistories: Array<{
    sessionId: string;
    updatedAt: string;
    messages: Array<{
      role: "user" | "assistant";
      content: string;
      timestamp: string;
      sources?: Array<{ title: string }>;
    }>;
  }>;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

const buildHeaders = (token?: string, isJson = true): HeadersInit => {
  const headers: HeadersInit = {};
  if (isJson) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    const message = payload?.message || payload?.error || `Request failed (${response.status})`;
    throw new Error(message);
  }

  if (typeof payload.data === "undefined") {
    throw new Error("API response is missing data");
  }

  return payload.data;
};

const request = async <T>(path: string, init: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  return parseResponse<T>(response);
};

export const apiBaseUrl = API_BASE_URL;

export const login = (email: string, password: string) =>
  request<AuthPayload>("/api/auth/login", {
    method: "POST",
    headers: buildHeaders(undefined, true),
    body: JSON.stringify({ email, password }),
  });

export const signup = (payload: {
  name: string;
  email: string;
  universityId: string;
  password: string;
}) =>
  request<AuthPayload>("/api/auth/signup", {
    method: "POST",
    headers: buildHeaders(undefined, true),
    body: JSON.stringify(payload),
  });

export const getCurrentUser = (token: string) =>
  request<{ user: User }>("/api/auth/me", {
    method: "GET",
    headers: buildHeaders(token, false),
  });

export const askQuestion = (
  token: string,
  payload: { question: string; language: "en" | "am"; sessionId?: string }
) =>
  request<AskResponse>("/api/chat/ask", {
    method: "POST",
    headers: buildHeaders(token, true),
    body: JSON.stringify(payload),
  });

export const getDocuments = (token: string) =>
  request<{ documents: any[] }>("/api/chat/documents", {
    method: "GET",
    headers: buildHeaders(token, false),
  });

export const uploadDocumentText = (
  token: string,
  payload: { title: string; content: string; category: string }
) =>
  request<{ document: any }>("/api/chat/upload/text", {
    method: "POST",
    headers: buildHeaders(token, true),
    body: JSON.stringify(payload),
  });

export const deleteDocument = (token: string, id: string) =>
  request<{ message?: string }>(`/api/chat/documents/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: buildHeaders(token, false),
  });

export const getChatHistory = (token: string) =>
  request<ChatHistoryResponse>("/api/chat/history?limit=50", {
    method: "GET",
    headers: buildHeaders(token, false),
  });

export const deleteChatSession = (token: string, sessionId: string) =>
  request<{ message?: string }>(`/api/chat/history/${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
    headers: buildHeaders(token, false),
  });

export const mapBackendDocument = (doc: any): Document => ({
  id: String(doc._id ?? doc.id),
  title: doc.title ?? "Untitled",
  content: doc.content ?? "",
  category: doc.category ?? "other",
  type: "text",
  uploadedAt: doc.createdAt ?? new Date().toISOString(),
});
