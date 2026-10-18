import { MessageQueueRecord } from '../types';
import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';

export interface MessagingProvider {
  sendMessage(message: MessageQueueRecord): Promise<{ status: MessageQueueRecord['status'], providerResponse?: string }>;
}

class TestMessagingAdapter implements MessagingProvider {
  async sendMessage(message: MessageQueueRecord) {
    // Deterministic test adapter: doesn't send live SMS.
    console.log('[TestMessagingAdapter] Simulated sending message:', message);
    return {
      status: 'provider-accepted' as const,
      providerResponse: 'SIMULATED_SUCCESS_ID_12345'
    };
  }
}

export const activeMessagingProvider: MessagingProvider | null = new TestMessagingAdapter();

export async function enqueueMessage(recipientId: string, contactNumber: string, messageText: string, templateId?: string): Promise<MessageQueueRecord> {
  const newRecord: MessageQueueRecord = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
    recipientId,
    contactNumber,
    messageText,
    templateId,
    status: 'queued',
    createdAt: new Date().toISOString()
  };

  // Add to Dexie DB queue
  await (db as any).messageQueue.put(newRecord);
  return newRecord;
}

export async function processMessageQueue() {
  if (!activeMessagingProvider) {
    console.warn('No messaging provider configured.');
    return;
  }
  
  const queuedMessages: MessageQueueRecord[] = await (db as any).messageQueue.where('status').equals('queued').toArray();
  for (const msg of queuedMessages) {
    try {
      msg.status = 'submitted';
      await (db as any).messageQueue.put(msg);

      const result = await activeMessagingProvider.sendMessage(msg);
      msg.status = result.status;
      msg.providerResponse = result.providerResponse;
      msg.updatedAt = new Date().toISOString();
      await (db as any).messageQueue.put(msg);
    } catch (err: any) {
      msg.status = 'failed';
      msg.providerResponse = err.message || 'Unknown error';
      msg.updatedAt = new Date().toISOString();
      await (db as any).messageQueue.put(msg);
    }
  }
}
