import gpt, { Message } from "../apis/gpt.js";
import { Persona } from "../other/personas.js";

export type GptParams = {
  max_tokens: number;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  model: string;
  stream: boolean;
};

export const SEARCH_CUE = "##BAZINGA##";

class GPT_3_5 {
  private history: Message[] = [];
  private persona: Persona;
  private truncateHistoryLength: number;

  constructor(persona: Persona, truncateHistoryLength = 0) {
    this.persona = persona;
    this.truncateHistoryLength = truncateHistoryLength;
  }

  async gpt(prompt: string, printDelay?: number) {
    const body = {
      ...this.persona.gptParams,
      messages: [
        ...this.persona.seed,
        ...this.history,
        {
          role: "user",
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
        role: "user",
        content: prompt,
      },
      {
        role: "assistant",
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
      .filter((m) => m.role === "assistant")
      .map((m) => m.content);
  }
}

export default GPT_3_5;
