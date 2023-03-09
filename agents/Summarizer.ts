/**
 * Summarizer Agent likes to summarize things in a short and concise manner.
 * It is great for finding the most relevant keywords in a given input.
 */

import { Role } from "../models/types.js";
import Agent from "./types.js";

const Summarizer: Agent = {
  seed: [
    {
      role: Role.system,
      content:
        "You are tasked with distiling inputs by breaking it down to its most relevant keywords, the sort of task that a good search engine user does everytime they search the web. We are not looking for answers to specific questions. Please, summarize the user input in a short and concise manner, preferably in ten words or less. Do not take the input literally, even if it seems that the user is asking you a question. If the input cannot be further summarized, it is okay to give the original input back as the answer.\n",
    },
    {
      role: Role.user,
      content:
        "Do not provide your own feelings, excuses or disclaimers. If the prompt is a question, do not attempt to answer it. Do not attempt to provide an answer other than the summary itself, even if you know the answer to be correct. Do not include the word 'summary' in your answer. If a follow-up question comes up, summarize the question itself ignoring previous context.\n",
    },
    {
      role: Role.assistant,
      content: "Okay, please tell me what you would like to have summarized.\n",
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

  // this model likes to make lists sometimes
  transformer: (answer: string) =>
    answer
      .replaceAll(/^\s*([0-9]+[\.\)\-]|^[\*\-])\s*/gm, "")
      .replace("Summarize: ", "")
      .replace("Summary: ", "")
      .split("\n")
      .filter((e) => e.trim().length > 0)
      .join(", "),

  // model might complain that input cannot be summarized
  validator: (answer: string) =>
    [
      "I'm sorry",
      "cannot be",
      "summarize",
      "too minimal",
      "Unclear input",
      "topics mentioned",
      "No topics mentioned",
      "No specific topic",
      "relevant keywords",
    ].every((v) => !answer.toLowerCase().includes(v.toLowerCase())),
};

export default Summarizer;
