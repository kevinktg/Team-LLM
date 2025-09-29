export interface Model {
  name: string;
  isLocal: boolean;
}
export const EXTERNAL_MODELS: Model[] = [
  { name: 'google-ai-studio/gemini-2.5-flash', isLocal: false },
  { name: 'openai/gpt-4o', isLocal: false },
  { name: 'google-ai-studio/gemini-2.0-flash', isLocal: false },
  { name: 'google-ai-studio/gemini-2.5-pro', isLocal: false },
  { name: 'grok/grok-4-latest', isLocal: false },
  { name: 'workers-ai/@cf/moonshotai/kimi-k2-instruct', isLocal: false },
  { name: 'openai/gpt-5', isLocal: false },
  { name: 'openai/gpt-5-mini', isLocal: false },
  { name: 'openai/gpt-oss-120b', isLocal: false },
  { name: 'cerebras/gpt-oss-120b', isLocal: false },
  { name: 'cerebras/qwen-3-coder-480b', isLocal: false },
];