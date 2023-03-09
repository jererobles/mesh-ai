import { History, GptParams } from "../models/types.js";

export type Agent = {
  /**
   * seed messages to start the conversation, this is excluded from the history
   */
  seed: History;

  /**
   * GPT-3 parameters
   * @see https://beta.openai.com/docs/api-reference/create-completion
   */
  gptParams: GptParams;

  /**
   * modify the answer before printing, runs before validator
   * @param answer
   * @returns modified answer
   */
  transformer?: (answer: string) => string;

  /**
   * validate the answer before printing, runs after transformer
   * @param answer
   * @param prompt
   * @returns true if answer is valid
   */
  validator?: (answer: string, prompt: string) => boolean;
};

export default Agent;
