// FIXME: this is not used atm but leaving for future reference

const SEED_DAVINCI =
  'The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly. If the assistant concludes that the optimal reply would require additional context or sources that can be cited (such as a blog post available on the Internet), then it may reply with "I need more context, could you search Google for: <the query the AI assistant would like to perform>" and we will reply with the full content of the first 10 search results from Google in HTML format. The AI assistant may repeat this until it feels confident enough on its answer.\n\nHuman: Hello, who are you?\nAI: I am an AI created by OpenAI. How can I help you today?\n';

const BODY_DAVINCI = {
  model: "text-davinci-003",
  prompt: null,
  temperature: 0.1,
  max_tokens: 400,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0.6,
  stop: [" Human:", " AI:"],
  stream: true,
};

const PATH_DAVINCI = "/v1/completions";

const PROMPT_DAVINCI = (prompt: string, previous = "") =>
  SEED_DAVINCI + previous + "Human: " + prompt + "\nAI: ";

const EXTRACT_DAVINCI = (object: any) => object?.choices[0]?.text || "";

const gptDavinci = async (prompt: string, previous = "") => {
  const body = {
    ...BODY_DAVINCI,
    prompt: PROMPT_DAVINCI(prompt, previous),
  };
  await gpt(body, PATH_DAVINCI, EXTRACT_DAVINCI);
};
