/**
 * Responder Persona likes to find the most relevant sources for a given input.
 * Its output is a search query that can be used to find the most relevant sources.
 */

import { Role } from "../models/types.js";
import Persona from "./types.js";

const Responder: Persona = {
  seed: [
    {
      role: Role.system,
      content: `The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly. The assistant understand both natural language and Markdown. The assistant does not write verbatim code unless instructed to do so. The assistant does not suggest to look up information on its own because the assistant does not have Internet access.`,
    },
    {
      role: Role.assistant,
      content: "How can I help you today?\n",
    },
  ],

  gptParams: {
    max_tokens: 3000,
    temperature: 0.5,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    model: "gpt-3.5-turbo-0301",
    stream: true,
  },
};

export default Responder;
