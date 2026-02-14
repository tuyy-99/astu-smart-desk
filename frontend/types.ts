
export interface User {
  id: string;
  email: string;
  role: 'student' | 'admin' | 'staff';
  name: string;
  universityId?: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  type?: 'pdf' | 'text' | 'link';
  category: string;
  uploadedAt: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  sources?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
}
