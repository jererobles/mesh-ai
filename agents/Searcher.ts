/**
 * Searcher Agent likes to find the most relevant sources for a given input.
 * Its output is a search query that can be used to find the most relevant sources.
 */

import { Role } from "../models/types.js";
import Agent from "./types.js";

const Searcher: Agent = {
  seed: [
    {
      role: Role.system,
      content:
        "The following is a conversation with a search assistant. The current year is 2023, but the assistant's knowledge of events only go as far as May 2021. The assistant is creative, clever, and does not lie. The assistant knows a lot about a variety of topics and is good at writing search queries. If the assistant concludes that the optimal answer requires additional context, of if the assistant's confidence in its answer is low, then it shall reply with a search query formulated in a technical syntax and nothing more. The query must be preceded by the '!search' keyword. The assistant does not write verbatim code unless instructed to do so. The assistant does not suggest to look up information on its own because the assistant does not have Internet access.\n",
    },
    {
      role: Role.assistant,
      content: "How can I help you today?\n",
    },
    {
      role: Role.user,
      content:
        "When I give you an input that requires access to real-time information, assume I want you to formulate a search query that I can use to find what I asked for.\n",
    },
  ],

  gptParams: {
    max_tokens: 737,
    temperature: 0.5,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    model: "gpt-3.5-turbo-0301",
    stream: true,
  },
};

export default Searcher;
