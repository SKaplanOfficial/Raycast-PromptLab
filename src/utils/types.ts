/**
 * General preferences for the entire extension.
 */
export type ExtensionPreferences = {
  /**
   * Whether to use OCR to extract text from PDFs.
   */
  pdfOCR: boolean;

  /**
   * The directory to save any exported files to.
   */
  exportLocation: string;

  /**
   * The first action listed for Command Response views.
   */
  primaryAction: string;

  /**
   * Text to prepend to all prompts.
   */
  promptPrefix: string;

  /**
   * Text to append to all prompts.
   */
  promptSuffix: string;

  /**
   * Whether to include temperature in the data sent to the model.
   */
  includeTemperature: boolean;

  /**
   * The degree to which prompt trimming is applied.
   */
  condenseAmount: string;

  /**
   * Comma-separated list of files to source custom placeholders from.
   */
  customPlaceholderFiles: string;

  /**
   * Whether to track statistics for placeholder usage.
   */
  usePlaceholderStatistics: boolean;

  /**
   * Whether to track statistics for command usage.
   */
  useCommandStatistics: boolean;

  /**
   * Whether to track statistics for chat usage.
   */
  useChatStatistics: boolean;
};

/**
 * Preferences for the `My PromptLab Commands` command.
 */
export type searchPreferences = {
  groupByCategory: boolean;
};

/**
 * User-customizable options for PromptLab commands.
 */
export type CommandOptions = {
  minNumFiles?: number;
  acceptedFileExtensions?: string[];
  useMetadata?: boolean;
  useSoundClassification?: boolean;
  useAudioDetails?: boolean;
  useSubjectClassification?: boolean;
  useRectangleDetection?: boolean;
  useBarcodeDetection?: boolean;
  useFaceDetection?: boolean;
  useHorizonDetection?: boolean;
  outputKind?: string;
  actionScript?: string;
  showResponse?: boolean;
  useSaliencyAnalysis?: boolean;
  scriptKind?: string;
  temperature?: string;
  model?: string;
  setupConfig?: CommandConfig;
  useSpeech?: boolean;
  speakResponse?: boolean;
};

interface ConfigField {
  name: string;
  description: string;
  guideText: string;
}

export interface StringConfigField extends ConfigField {
  defaultValue: string;
  maxLength: string;
  minLength: string;
  regex: string;
  value?: string;
}

export interface BooleanConfigField extends ConfigField {
  defaultValue: boolean;
  value?: boolean;
}

export interface NumberConfigField extends ConfigField {
  defaultValue: string;
  min: string;
  max: string;
  value?: string;
}

/**
 * A PromptLab command setup configuration.
 */
export type CommandConfig = {
  /**
   * The list of configuration fields.
   */
  fields: (NumberConfigField | BooleanConfigField | StringConfigField)[];

  /**
   * The version of the configuration schema.
   */
  configVersion: string;
};

/**
 * A PromptLab command.
 */
export type Command = {
  /**
   * The unique ID of the command.
   */
  id: string;

  /**
   * The name of the command.
   */
  name: string;

  /**
   * The raw prompt for the command.
   */
  prompt: string;

  /**
   * The Raycast icon for the command.
   */
  icon: string;

  /**
   * The Raycast color for the icon of the command.
   */
  iconColor?: string;

  /**
   * The minimum number of files required for the command. If 0, PromptLab will not check for selected files.
   */
  minNumFiles?: string;

  /**
   * The accepted file extensions for the command. If empty, all file extensions will be accepted.
   */
  acceptedFileExtensions?: string;

  /**
   * Whether to include metadata of selected files in the data sent to the model.
   */
  useMetadata?: boolean;

  /**
   * Whether to include sound classifications of selected audio files in the data sent to the model.
   */
  useSoundClassification?: boolean;

  /**
   * Whether to include audio details (e.g. transcriptions) of selected audio files in the data sent to the model.
   */
  useAudioDetails?: boolean;

  /**
   * Whether to include subject classifications for selected images/videos in the data sent to the model.
   */
  useSubjectClassification?: boolean;

  /**
   * Whether to include rectangle detection information of selected images in the data sent to the model.
   */
  useRectangleDetection?: boolean;

  /**
   * Whether to include values of barcodes in selected images in the data sent to the model.
   */
  useBarcodeDetection?: boolean;

  /**
   * Whether to include face detection information for selected images/videos in the data sent to the model.
   */
  useFaceDetection?: boolean;

  /**
   * Whether to include horizon detection information for selected images/videos in the data sent to the model.
   */
  useHorizonDetection?: boolean;

  /**
   * The response view for the command.
   */
  outputKind?: string;

  /**
   * The raw text of the action script that runs after a response is received.
   */
  actionScript?: string;

  /**
   * Whether to show the response view at all.
   */
  showResponse?: boolean;

  /**
   * A brief description of what the command does / what it outputs.
   */
  description?: string;

  /**
   * Whether to include saliency analysis information for selected images/videos in the data sent to the model.
   */
  useSaliencyAnalysis?: boolean;

  /**
   * The name of the author of the command.
   */
  author?: string;

  /**
   * A link to the author's website, or the command's website, if applicable.
   */
  website?: string;

  /**
   * The version of the command.
   */
  version?: string;

  /**
   * A list/description of any requirements for the command to work.
   */
  requirements?: string;

  /**
   * The kind of script that the {@link actionScript} is written in.
   */
  scriptKind?: string;

  /**
   * The categories that the command belongs to.
   */
  categories?: string[];

  /**
   * The temperature to use when sending data to the model.
   */
  temperature?: string;

  /**
   * The model to use for the command.
   */
  model?: string;

  /**
   * Whether the command is favorited.
   */
  favorited?: boolean;

  /**
   * The setup configuration fields for the command.
   */
  setupConfig?: CommandConfig;

  /**
   * Whether the command was installed from the store.
   */
  installedFromStore?: boolean;

  /**
   * Whether the command has its configuration fields locked.
   */
  setupLocked?: boolean;

  /**
   * Whether to use voice input for the command.
   */
  useSpeech?: boolean;

  /**
   * Whether to speak the response.
   */
  speakResponse?: boolean;

  /**
   * Whether to show the command in PromptLab's menu bar extra.
   */
  showInMenuBar?: boolean;

  /**
   * Whether the command is a template (i.e. can only be used as a template for other commands, not directly run).
   */
  template?: boolean;
};

/**
 * Checks if an object is an installed command object.
 * @param obj The object to check.
 * @returns True if the object is an installed command, false otherwise.
 */
export const isCommand = (obj: object): obj is Command => {
  return !("exampleOutput" in obj);
};

/**
 * A command response from SlashAPI.
 */
export type StoreCommand = {
  name: string;
  prompt: string;
  icon: string;
  iconColor?: string;
  minNumFiles?: string;
  acceptedFileExtensions?: string;
  useMetadata?: string;
  useSoundClassification?: string;
  useAudioDetails?: string;
  useSubjectClassification?: string;
  useRectangleDetection?: string;
  useBarcodeDetection?: string;
  useFaceDetection?: string;
  useHorizonDetection?: string;
  outputKind?: string;
  actionScript?: string;
  showResponse?: string;
  description?: string;
  useSaliencyAnalysis?: string;
  exampleOutput?: string;
  author?: string;
  website?: string;
  version?: string;
  requirements?: string;
  scriptKind?: string;
  categories?: string;
  temperature?: string;
  model?: string;
  favorited?: boolean;
  setupConfig?: string;
  useSpeech?: string;
  speakResponse?: string;
};

/**
 * Checks if an object is a store command object.
 * @param obj The object to check.
 * @returns True if the object is a store command, false otherwise.
 */
export const isStoreCommand = (obj: object): obj is StoreCommand => {
  return "exampleOutput" in obj;
};

/***************/
/* Model Types */
/***************/

export type ModelManager = {
  /**
   * The list of models.
   */
  models: Model[];

  /**
   * Whether the model list is loading.
   */
  isLoading: boolean;

  /**
   * The error message, if any.
   */
  error: string | undefined;

  /**
   * Revalidates the model list, ensuring it is up-to-date.
   * @returns A promise that resolves when the model list is loaded.
   */
  revalidate: () => Promise<void>;

  /**
   * Updates a model's data.
   * @param model The model to update.
   * @param newData The new data to update the model with.
   * @returns A promise that resolves when the model is updated.
   */
  updateModel: (model: Model, newData: Model) => Promise<void>;

  /**
   * Function to delete a model.
   * @param model The model to delete.
   * @returns A promise that resolves when the model is deleted.
   */
  deleteModel: (model: Model) => Promise<void>;

  /**
   * Creates a new model.
   * @param newData The new model's data.
   * @returns A promise that resolves with the new model.
   */
  createModel: (
    newData: Model & {
      [key: string]: string | boolean;
    }
  ) => Promise<false | Model>;

  /**
   * Gets the list of favorite models.
   * @returns The list of favorite models.
   */
  favorites: () => Model[];

  /**
   * Gets a dummy model with default values.
   * @returns A new dummy model object.
   */
  dummyModel: () => Model;
};

/**
 * A PromptLab custom model.
 */
export type Model = {
  /**
   * The name of the model.
   */
  name: string;

  /**
   * A brief description of the model, for personal reference.
   */
  description: string;

  /**
   * The model's API endpoint.
   */
  endpoint: string;

  /**
   * The model's API authentication type.
   */
  authType: string;

  /**
   * A valid API key for the model.
   */
  apiKey: string;

  /**
   * The model's input schema as a JSON string.
   */
  inputSchema: string;

  /**
   * The model's output schema as a JSON object key path.
   */
  outputKeyPath: string;

  /**
   * The timing of the model's output, either "sync" or "async".
   */
  outputTiming: string;

  /**
   * The maximum length of input that the model can handle.
   */
  lengthLimit: string;

  /**
   * Whether the model is a favorite model.
   */
  favorited: boolean;

  /**
   * The unique ID of the model.
   */
  id: string;

  /**
   * The Raycast icon for the model.
   */
  icon: string;

  /**
   * The Raycast color for the icon of the model.
   */
  iconColor: string;

  /**
   * The user's personal notes on the model.
   */
  notes: string;

  /**
   * Whether the model is the default model.
   */
  isDefault: boolean;

  /**
   * The temperature setting for the model.
   */
  temperature: string;
};

/**************/
/* Chat Types */
/**************/

/**
 * A references to a chat, without the full conversation or context data.
 */
export type ChatRef = {
  /**
   * Whether the chat is favorited.
   */
  favorited: boolean;

  /**
   * The Raycast icon for the chat.
   */
  icon: string;

  /**
   * The Raycast color for the chat.
   */
  iconColor: string;

  /**
   * The unique ID of the chat.
   */
  id: string;

  /**
   * The file path to the chat.
   */
  file: string;

  /**
   * The name of the chat.
   */
  name: string;
};

export const isChatRef = (obj: object): obj is ChatRef => {
  return "file" in obj;
};

/**
 * The type of a message in a chat conversation.
 */
export enum MessageType {
  QUERY = "USER_QUERY",
  RESPONSE = "MODEL_RESPONSE",
  SYSTEM = "SYSTEM_MESSAGE",
}

/**
 * A message in a chat conversation.
 */
export type ChatMessage = {
  /**
   * The type of the message, i.e. who sent it.
   */
  type: MessageType;

  /**
   * The text of the message.
   */
  text: string;

  /**
   * The exact date the message was sent.
   */
  date: string;
};

/**
 * A PromptLab Chat instance.
 */
export type Chat = {
  /**
   * The unique ID of the chat.
   */
  id: string;

  /**
   * The name of the chat.
   */
  name: string;

  /**
   * The Raycast icon for the chat.
   */
  icon: string;

  /**
   * The Raycast color for the chat.
   */
  iconColor: string;

  /**
   * The base prompt for the chat, to always be kept included in the conversation context window.
   */
  basePrompt: string;

  /**
   * Whether the chat is favorited.
   */
  favorited: boolean;

  /**
   * The messages in the chat.
   */
  conversation: ChatMessage[];

  /**
   * Data to be used as context for the conversation.
   */
  contextData: {
    /**
     * The type of context data.
     */
    type: string;

    /**
     * The source of the context data.
     */
    source: string;

    /**
     * The data itself.
     */
    data: string;
  }[];

  /**
   * How context data should be condensed.
   */
  condensingStrategy: string;

  /**
   * The maximum length of context data summaries.
   */
  summaryLength: string;

  /**
   * Calculated statistics for the chat.
   */
  stats?: ChatStatistics;

  /**
   * Whether to display the base prompt in the chat view.
   */
  showBasePrompt: boolean;

  /**
   * Whether to use the selected files as context data.
   */
  useSelectedFilesContext: boolean;

  /**
   * Whether to use the conversation history as context data.
   */
  useConversationContext: boolean;

  /**
   * Whether to let the AI run PromptLab commands autonomously.
   */
  allowAutonomy: boolean;
};

/**
 * Statistics about a PromptLab chat.
 */
export type ChatStatistics = {
  totalQueries: string;
  totalResponses: string;
  totalPlaceholdersUsedByUser: string;
  totalCommandsRunByAI: string;
  mostCommonQueryWords: string[];
  mostCommonResponseWords: string[];
  totalLengthOfContextData: string;
  lengthOfBasePrompt: string;
  averageQueryLength: string;
  averageResponseLength: string;
  mostUsedPlaceholder: string;
  mostUsedCommand: string;
  mostUsedEmojis: string[];
};

/**
 * A Raycast extension.
 */
export type Extension = {
  /**
   * The title of the extension as it appears in Raycast.
   */
  title: string;

  /**
   * The name of the extension as defined in the extension's package.json.
   */
  name: string;

  /**
   * The path to the extension's directory.
   */
  path: string;

  /**
   * The author of the extension as defined in the extension's package.json.
   */
  author: string;

  /**
   * The description of the extension as defined in the extension's package.json.
   */
  description: string;

  /**
   * The list of commands belonging to the extension.
   */
  commands: ExtensionCommand[];
};

/**
 * A Raycast extension command.
 */
export type ExtensionCommand = {
  /**
   * The title of the command as it appears in Raycast.
   */
  title: string;

  /**
   * The name of the command as defined in the extension's package.json.
   */
  name: string;

  /**
   * The description of the command as defined in the extension's package.json.
   */
  description: string;

  /**
   * The link to run the command.
   */
  deeplink: string;
};

/**
 * Checks if a value is true in either a boolean or string form.
 * @param str The value to check.
 * @returns True if the value is true or "true" (case-insensitive), false otherwise.
 */
export const isTrueStr = (str: string | boolean | undefined) => {
  return str == true || str?.toString().toLowerCase() == "true";
};

/**
 * Errors that can arise when getting the contents of selected files.
 */
export const ERRORTYPE = {
  FINDER_INACTIVE: 1,
  MIN_SELECTION_NOT_MET: 2,
  INPUT_TOO_LONG: 3,
};

/**
 * Return types for scripts.
 */
export enum ReturnType {
  STRING = "string",
  JSON = "json",
}

/**
 * Time durations to use in calendar-related methods.
 */
export enum CalendarDuration {
  DAY = 0,
  WEEK = 1,
  MONTH = 2,
  YEAR = 3,
}

/**
 * Types of EventKt events.
 */
export enum EventType {
  CALENDAR = "calendar",
  REMINDER = "reminder",
}

/**
 * A JSON object.
 */
export type JSONObject = {
  [key: string]: string | JSONObject | JSONObject[] | string[];
};

/*********************/
/* PLACEHOLDER TYPES */
/*********************/

/**
 * A placeholder type that associates Regex patterns with functions that applies the placeholder to a string, rules that determine whether or not the placeholder should be replaced, and aliases that can be used to achieve the same result.
 */
export type PlaceholderList = {
  [key: string]: Placeholder;
};

export type Placeholder = {
  /**
   * The detailed name of the placeholder.
   */
  name: string;

  /**
   * The aliases for the placeholder. Any of these aliases can be used in place of the placeholder to achieve the same result.
   */
  aliases?: string[];

  /**
   * The function that applies the placeholder to a string.
   * @param str The string to apply the placeholder to.
   * @returns The string with the placeholder applied.
   */
  apply: (str: string, context?: { [key: string]: string }) => Promise<{ result: string; [key: string]: string }>;

  /**
   * The keys of the result object relevant to the placeholder. When placeholders are applied in bulk, this list is used to determine which keys to return as well as to make optimizations when determining which placeholders to apply. The first key in the list is the key for the placeholder's value.
   */
  result_keys?: string[];

  /**
   * The dependencies of the placeholder. When placeholders are applied in bulk, this list is used to determine the order in which placeholders are applied.
   */
  dependencies?: string[];

  /**
   * Whether or not the placeholder has a constant value during the placeholder substitution process. For example, users can use multiple URL placeholders, therefore it is not constant, while {{clipboardText}} is constant for the duration of the substitution process.
   */
  constant: boolean;

  /**
   * The function that applies the placeholder to a string. This function is used when the placeholder is used a {{js:...}} placeholder.
   * @param args
   * @returns
   */
  fn: (...args: (never | string)[]) => Promise<string>;

  /**
   * The example usage of the placeholder, shown when the placeholder is detected in a prompt.
   */
  example: string;

  /**
   * The description of the placeholder, shown when the placeholder is detected in a prompt.
   */
  description: string;

  /**
   * The demonstration representation of the placeholder, shown as the "name" of the placeholder when the placeholder is detected in a prompt.
   */
  hintRepresentation: string;
};

/**
 * A custom placeholder stored in custom_placeholders.json.
 */
export type CustomPlaceholder = {
  /**
   * The name of the placeholder, used as a REGEX pattern to detect the placeholder.
   */
  name: string;

  /**
   * A description of the placeholder shown when the placeholder is detected in a prompt.
   */
  description: string;

  /**
   * The text to replace the placeholder with. Can include other placeholders, which will be replaced before the custom placeholder is applied.
   */
  value: string;

  /**
   * An example usage of the placeholder, shown when the placeholder is detected in a prompt.
   */
  example: string;

  /**
   * A friendlier name for the placeholder, shown as the "name" of the placeholder when the placeholder is detected in a prompt.
   */
  hintRepresentation: string;
};

/**
 * A user-defined variable created via the {{set:...}} placeholder. These variables are stored in the extension's persistent local storage.
 */
export interface PersistentVariable {
  /**
   * The name of the variable.
   */
  name: string;

  /**
   * The current value of the variable.
   */
  value: string;

  /**
   * The original value of the variable.
   */
  initialValue: string;
}

/************/
/* Insights */
/************/

/**
 * Wrapper type for the insight manager returned by {@link useInsights}.
 */
export type InsightManager = {
  /**
   * The list of insights, loaded from the disk and sorted by date.
   */
  insights: Insight[];

  /**
   * True if the insights are currently being loaded from the disk, false otherwise.
   */
  loadingInsights: boolean;

  /**
   * Revalidates the insights by reloading them from the disk and sorting them by date.
   * @returns A promise that resolves when the insights have been revalidated.
   */
  revalidateInsights: () => Promise<void>;
};

/**
 * A piece of insight generated as a result of a user's actions.
 */
export type Insight = {
  /**
   * The unique ID of the insight. This is used as the filename of the insight.
   */
  id: string;

  /**
   * The title of the insight, non-unique.
   */
  title: string;

  /**
   * The descriptive text of the insight.
   */
  description: string;

  /**
   * The date the insight was created.
   */
  date: Date;

  /**
   * The tags associated with the insight.
   */
  tags: string[];

  /**
   * The related insights, by ID.
   */
  relatedInsights: string[];
};

/*******************/
/* Saved Responses */
/*******************/

/**
 * Locations from which commands may be launched.
 */
export enum LaunchSource {
  /**
   * Locally stored commands.
   */
  LOCAL = "local",

  /**
   * Remotely stored commands, i.e. commands launched from the PromptLab store.
   */
  REMOTE = "remote",
}

/**
 * A saved response, stored in the extension's support directory as a JSON file.
 */
export type SavedResponse = {
  /**
   * The name of the response.
   */
  name: string;

  /**
   * The base prompt that generated the response, before applying placeholders.
   */
  rawPrompt: string;

  /**
   * The prompt that generated the response, after applying placeholders.
   */
  prompt: string;

  /**
   * The full text of the response.
   */
  response: string;

  /**
   * The files that were selected when the response was generated.
   */
  files: string[];

  /**
   * The name of the command.
   */
  commandID: string;

  /**
   * The name of the command.
   */
  commandName: string;

  /**
   * The source of the command, one of @{@link LaunchSource}.
   */
  launchSource: string;

  /**
   * The options for the command.
   */
  options: CommandOptions;

  /**
   * The date the response was generated.
   */
  date: Date;

  /**
   * The unique ID of the response. This is used as the filename of the response.
   */
  id: string;

  /**
   * Whether the response is favorited.
   */
  favorited: boolean;

  /**
   * AI-generated keywords for the response.
   */
  keywords: string[];

  /**
   * User-defined tags for the response.
   */
  tags: string[];
};
