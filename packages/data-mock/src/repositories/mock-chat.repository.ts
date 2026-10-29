import {
  IChatRepository,
  ChatThread,
  ChatMessage,
  APP_STRINGS,
} from '@patacerca/core';
import { mockStorage } from '../storage/mock-storage';

const CHAT_THREADS_STORAGE_KEY = '@patacerca:chat_threads';

export class MockChatRepository implements IChatRepository {
  private async getStoredThreads(): Promise<Record<string, ChatThread>> {
    return mockStorage.getItem<Record<string, ChatThread>>(
      CHAT_THREADS_STORAGE_KEY,
      {}
    );
  }

  private getThreadKey(ownerPhone: string, walkerId: string): string {
    return `${ownerPhone}:${walkerId}`;
  }

  async getThreadsForOwner(ownerPhone: string): Promise<ChatThread[]> {
    const all = await this.getStoredThreads();
    return Object.values(all)
      .filter((t) => t.ownerPhone === ownerPhone && t.messages.length > 0)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async getThreadsForWalker(walkerId: string): Promise<ChatThread[]> {
    const all = await this.getStoredThreads();
    return Object.values(all)
      .filter((t) => t.walkerId === walkerId && t.messages.length > 0)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async getThread(ownerPhone: string, walkerId: string): Promise<ChatThread> {
    const all = await this.getStoredThreads();
    const key = this.getThreadKey(ownerPhone, walkerId);
    if (!all[key]) {
      const newThread: ChatThread = {
        id: key,
        ownerPhone,
        ownerName: 'Dueño',
        walkerId,
        walkerName: 'Paseador',
        messages: [],
        updatedAt: Date.now(),
      };
      all[key] = newThread;
      await mockStorage.setItem(CHAT_THREADS_STORAGE_KEY, all);
      return newThread;
    }
    return all[key]!;
  }

  async sendMessage(
    ownerPhone: string,
    walkerId: string,
    sender: 'owner' | 'walker',
    text: string,
    ownerName?: string,
    walkerName?: string
  ): Promise<ChatMessage> {
    const all = await this.getStoredThreads();
    const key = this.getThreadKey(ownerPhone, walkerId);
    let thread = all[key];

    if (!thread) {
      thread = {
        id: key,
        ownerPhone,
        ownerName: ownerName || 'Dueño',
        walkerId,
        walkerName: walkerName || 'Paseador',
        messages: [],
        updatedAt: Date.now(),
      };
    } else {
      if (ownerName) thread.ownerName = ownerName;
      if (walkerName) thread.walkerName = walkerName;
    }

    const isFirstOwnerMessage =
      sender === 'owner' &&
      thread.messages.filter((m) => m.sender === 'owner').length === 0;

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender,
      text,
      timestamp: Date.now(),
    };

    thread.messages.push(message);
    thread.lastMessage = message;
    thread.updatedAt = Date.now();
    all[key] = thread;
    await mockStorage.setItem(CHAT_THREADS_STORAGE_KEY, all);

    // If first owner message, trigger automatic walker response after 1.8s
    if (isFirstOwnerMessage) {
      setTimeout(async () => {
        const freshAll = await this.getStoredThreads();
        const freshThread = freshAll[key];
        if (freshThread) {
          const autoMsg: ChatMessage = {
            id: `msg_${Date.now()}_auto`,
            sender: 'walker',
            text: APP_STRINGS.chat.autoReply(
              freshThread.ownerName,
              freshThread.walkerName,
              'tu perrito'
            ),
            timestamp: Date.now(),
          };
          freshThread.messages.push(autoMsg);
          freshThread.lastMessage = autoMsg;
          freshThread.updatedAt = Date.now();
          freshAll[key] = freshThread;
          await mockStorage.setItem(CHAT_THREADS_STORAGE_KEY, freshAll);
        }
      }, 1800);
    }

    return message;
  }
}

