/**
 * Preferences for the 'PromptLab Chat' command.
 */
export interface ChatCommandPreferences {
  /**
   * The base prompt to use for newly created chats.
   */
  basePrompt: string;

  /**
   * Whether new chats should be created with the 'use selected files' option enabled.
   */
  useSelectedFiles: boolean;

  /**
   * Whether new chats should be created with the 'use conversation history' option enabled.
   */
  useConversationHistory: boolean;

  /**
   * Whether new chats should be created with the 'autonomous features' option enabled.
   */
  autonomousFeatures: boolean;
}
