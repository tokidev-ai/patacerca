export interface ChatMessage {
  id: string;
  sender: 'owner' | 'walker';
  text: string;
  timestamp: number;
}

export interface ChatThread {
  id: string;
  ownerPhone: string;
  ownerName: string;
  walkerId: string;
  walkerName: string;
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  updatedAt: number;
}

