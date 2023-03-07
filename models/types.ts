export enum Role {
  "user" = "user",
  "assistant" = "assistant",
  "system" = "system",
}

export type Message = {
  role: Role;
  content: string;
};

export type History = Message[];

export type GptParams = {
  max_tokens: number;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  model: string;
  stream: boolean;
};
