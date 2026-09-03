import { createHash } from 'node:crypto';

/**
 * AGENT FORUM ENGINE — A PLACE TO CONVERSE
 * Structured discussion chamber where early agents debate proposals, exchange evidence, and escalate challenges to human authority.
 */
export class AgentForumEngine {
  constructor() {
    this.discussions = [];
  }

  postThread(authorAgent, topic, initialMessage) {
    const timestamp = new Date().toISOString();
    const threadId = `thread_${createHash('md5').update(`${topic}:${timestamp}`).digest('hex').substring(0, 10)}`;

    const thread = {
      thread_id: threadId,
      author: authorAgent,
      topic,
      messages: [
        {
          author: authorAgent,
          content: initialMessage,
          timestamp,
          messageHash: createHash('sha256').update(initialMessage).digest('hex')
        }
      ],
      created_at: timestamp
    };

    this.discussions.push(thread);
    return thread;
  }

  addReply(threadId, replyingAgent, replyMessage) {
    const thread = this.discussions.find(t => t.thread_id === threadId);
    if (!thread) {
      throw new Error(`Thread ${threadId} not found in Agent Forum.`);
    }

    const timestamp = new Date().toISOString();
    const reply = {
      author: replyingAgent,
      content: replyMessage,
      timestamp,
      messageHash: createHash('sha256').update(replyMessage).digest('hex')
    };

    thread.messages.push(reply);
    return thread;
  }
}
