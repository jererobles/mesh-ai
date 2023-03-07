import gpt from "../apis/gpt.js";
import Persona from "../personas/types.js";
import { History, Role } from "./types.js";

export const SEARCH_CUE = "##BAZINGA##";

export default class Chat {
  private history: History = [];
  private persona: Persona;
  private truncateHistoryLength: number;

  constructor(persona: Persona, truncateHistoryLength = 0) {
    this.persona = persona;
    this.truncateHistoryLength = truncateHistoryLength;
  }

  async send(prompt: string, printDelay?: number) {
    const body = {
      ...this.persona.gptParams,
      messages: [
        ...this.persona.seed,
        ...this.history,
        {
          role: Role.user,
          content: prompt,
        },
      ],
    };

    const chat = await gpt(body, printDelay);
    if (this.persona.transformer) {
      chat.text = this.persona.transformer(chat.text);
    }
    if (this.persona.validator && !this.persona.validator(chat.text, prompt)) {
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
}
