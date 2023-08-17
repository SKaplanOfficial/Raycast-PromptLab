/**
 * @file default-models.ts
 *
 * @summary Default models for PromptLab.
 * @author Stephen Kaplan <skaplanofficial@gmail.com>
 *
 * Created at     : 2023-07-05 10:35:24 
 * Last modified  : 2023-07-05 10:35:39
 */

import { Color, Icon } from '@raycast/api';
import { Model } from '../utils/types';

/**
 * Default models included with the extension.
 */
export const defaultModels: { [key: string]: Model } = {
  "--model-GPT-3.5-Turbo via Raycast AI": {
    name: "GPT-3.5-Turbo via Raycast AI",
    description: "Most capable GPT-3.5 model and optimized for chat.",
    endpoint: "Raycast AI 3.5",
    authType: "",
    apiKey: "",
    inputSchema: "",
    outputKeyPath: "",
    outputTiming: "async",
    lengthLimit: "2500",
    favorited: false,
    id: "",
    icon: Icon.Rocket,
    iconColor: Color.Red,
    notes: "",
    isDefault: false,
    temperature: "1.0",
  },
  "--model-Text-Davinci-003 Via Raycast AI": {
    name: "Text-Davinci-003 Via Raycast AI",
    description:
      "Can do any language task with better quality, longer output, and consistent instruction-following than the curie, babbage, or ada models.",
    endpoint: "Raycast AI",
    authType: "",
    apiKey: "",
    inputSchema: "",
    outputKeyPath: "",
    outputTiming: "async",
    lengthLimit: "2500",
    favorited: false,
    id: "",
    icon: Icon.TextInput,
    iconColor: Color.Blue,
    notes: "",
    isDefault: true,
    temperature: "1.0",
  },
  "--model-claude-instant-1-100k": {
    authType: "x-api-key",
    id: "",
    favorited: false,
    iconColor: "raycast-yellow",
    icon: "brush-16",
    outputKeyPath: "completion",
    notes: "",
    outputTiming: "async",
    apiKey: "",
    endpoint: "https://api.anthropic.com/v1/complete",
    isDefault: false,
    name: "claude-instant-1-100k",
    lengthLimit: "95000",
    inputSchema:
      '{"prompt": "\\n\\nHuman: {{prompt}} \\n\\nAssistant:", "model": "claude-instant-1-100k", "max_tokens_to_sample": 3000, "stream": true }',
    description:
      "An enhanced version of claude-instant-v1 with a 100,000 token context window that retains its performance. Well-suited for high throughput use cases needing both speed and additional context, allowing deeper understanding from extended conversations and documents.",
    temperature: "1.0",
  },
  "--model-GPT-3.5-Turbo Via OpenAI": {
    endpoint: "https://api.openai.com/v1/chat/completions",
    apiKey: "",
    inputSchema: '{ "model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": "{prompt}"}], "stream": true }',
    iconColor: "raycast-green",
    notes: "",
    temperature: "1.0",
    lengthLimit: "2500",
    icon: "speech-bubble-16",
    isDefault: false,
    id: "",
    authType: "bearerToken",
    favorited: false,
    description: "Optimized for chat but works well for traditional completions tasks as well.",
    name: "GPT-3.5-Turbo Via OpenAI",
    outputKeyPath: "choices[0].delta.content",
    outputTiming: "async",
  },
};
