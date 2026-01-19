export interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
  avatar: string;
}
export interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: number;
  messageCount: number;
}

export interface ChatState {
  activeChatId: string | null;
  sessions: ChatSession[];
  isLoading: boolean;
}
