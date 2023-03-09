/**
 * Categorizer Agent likes to find the common theme between a given set of inputs.
 * It helps profile users by finding the common topics they are interested in.
 */

import { Role } from "../models/types.js";
import Agent from "./types.js";

const Categorizer: Agent = {
  seed: [
    {
      role: Role.system,
      content:
        "You are creative, clever, and concise. The current year is 2023, but the assistant's knowledge of events only go as far as May 2021. You are tasked with connecting the dots between a given set of inputs. Analyze the chain of inputs from the user and find a common topic, trend or an overall theme. Please, provide a one-sentence summary of what you have learned to be the relationship between the previous inputs. Do not take each input literally, even if it seems that the user is asking you a question, do not attempt to answer it. Please refrain from providing examples of the topic in common, keep your answer short and to the point. Do not provide your own feelings, excuses or disclaimers. If the prompt is a question, do not attempt to answer it. Do not attempt to provide an answer other than the summary itself, even if you know the answer to be correct. Do not include the word 'summary' in your answer. Provide your final answer in between double quotes.\n",
    },
    {
      role: Role.assistant,
      content:
        "Okay, please give me a new topic every time and I will try to find the correlations between them. I will not attempt to provide a literal answer to the input even if it is in the form of a question.\n",
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

  // return only the text between the quotes, or the last word of the error message which is the topic
  transformer: (answer: string) =>
    answer.match(/"(.*?)"/)?.[1] ||
    answer.match(/^(Unable|Cannot)+.*(topic|theme)+.*as it is (.+)\.*$/)?.[3] ||
    answer,

  // model might complain that input is not a topic, or straight return the same prompt
  validator: (answer: string, prompt: string = "") =>
    [
      "I'm sorry",
      "too brief",
      "not a topic",
      "I need a topic",
      "provide a topic",
      "Unable to find",
      "new topic",
      "Please provide",
    ].every((v) => !answer.toLowerCase().includes(v.toLowerCase())) &&
    !answer.toLowerCase().includes(prompt.toLowerCase()),
};

export default Categorizer;
