import gpt from "../apis/gpt.js";
import Agent from "../agents/types.js";
import { History, Role } from "./types.js";

export const SEARCH_CUE = "##BAZINGA##";

export default class Chat {
  private history: History = [];
  private agent: Agent;
  private truncateHistoryLength: number;

  constructor(agent: Agent, truncateHistoryLength = 0) {
    this.agent = agent;
    this.truncateHistoryLength = truncateHistoryLength;
  }

  async send(prompt: string, printDelay?: number, metadata?: string) {
    const body = {
      ...this.agent.gptParams,
      messages: [
        ...this.agent.seed,
        ...this.history,
        {
          role: Role.user,
          content: prompt,
        },
      ],
    };

    const chat = await gpt(body, printDelay);
    chat.metadata = metadata;
    if (this.agent.transformer) {
      chat.text = this.agent.transformer(chat.text);
    }
    if (this.agent.validator && !this.agent.validator(chat.text, prompt)) {
      chat.dropped = true;
      return chat;
    }

    this.history.push(
      {
        role: Role.user,
        content: prompt,
      },
      {
        role: Role.assistant,
        content: chat.text + "\n",
      }
    );

    if (
      this.truncateHistoryLength > 0 &&
      this.history.length > this.truncateHistoryLength
    ) {
      // truncate history to keep it from growing too large
      this.history = this.history.slice(2);
    }

    return chat;
  }

  // get all the messages by the assistant from the history
  getAssistantMessages() {
    return this.history
      .filter((m) => m.role === Role.assistant)
      .map((m) => m.content);
  }

  clearHistory() {
    this.history = [];
  }
}
