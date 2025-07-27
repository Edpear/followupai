export interface FollowUpQuestion {
  question: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface followupaiConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface SetupOptions {
  createDemoPage: boolean;
  apiKey: string;
  model: string;
}

export const GROQ_MODELS = [
  'llama-3.1-8b-instant',
  'llama-3.1-70b-version',
  'llama-3.1-405b-reasoning',
  'llama-3.1-1b-omni',
  'mixtral-8x7b-32768',
  'gemma-7b-it',
  'llama-2-70b-4096'
] as const;

export type GroqModel = typeof GROQ_MODELS[number]; 