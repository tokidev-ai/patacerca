import { ChatThread, ChatMessage } from '../models/chat.model';

export interface IChatRepository {
  getThreadsForOwner(ownerPhone: string): Promise<ChatThread[]>;
  getThreadsForWalker(walkerId: string): Promise<ChatThread[]>;
  getThread(ownerPhone: string, walkerId: string): Promise<ChatThread>;
  sendMessage(
    ownerPhone: string,
    walkerId: string,
    sender: 'owner' | 'walker',
    text: string,
    ownerName?: string,
    walkerName?: string
  ): Promise<ChatMessage>;
}

