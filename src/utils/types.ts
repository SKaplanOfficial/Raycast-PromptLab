/**
 * General preferences for the entire extension.
 */
export type ExtensionPreferences = {
  pdfOCR: boolean;
  modelEndpoint: string;
  authType: string;
  apiKey: string;
  inputSchema: string;
  outputKeyPath: string;
  outputTiming: string;
  lengthLimit: string;
  exportLocation: string;
  primaryAction: string;
  promptPrefix: string;
  promptSuffix: string;
  includeTemperature: boolean;
  condenseAmount: string;
  customPlaceholderFiles: string;
}

/**
 * Preferences for the `My PromptLab Commands` command.
 */
export type searchPreferences = {
  groupByCategory: boolean;
}

/**
 * Command categories.
 */
export const categories = [
  "Calendar",
  "Data",
  "Development",
  "Education",
  "Entertainment",
  "Finance",
  "Health",
  "Lifestyle",
  "Media",
  "News",
  "Other",
  "Reference",
  "Shopping",
  "Social",
  "Sports",
  "Travel",
  "Utilities",
  "Weather",
  "Web",
  "Writing",
  "Meta",
];

export type ModelManager = {
  models: Model[];
  isLoading: boolean;
  error: string | undefined;
  revalidate: () => Promise<void>;
  updateModel: (model: Model, newData: Model) => Promise<void>;
  deleteModel: (model: Model) => Promise<void>;
  createModel: (
    newData: Model & {
      [key: string]: string | boolean;
    }
  ) => Promise<false | Model>;
  favorites: () => Model[];
  dummyModel: () => Model;
}

/**
 * A PromptLab custom model.
 */
export type Model = {
  name: string;
  description: string;
  endpoint: string;
  authType: string;
  apiKey: string;
  inputSchema: string;
  outputKeyPath: string;
  outputTiming: string;
  lengthLimit: string;
  favorited: boolean;
  id: string;
  icon: string;
  iconColor: string;
  notes: string;
  isDefault: boolean;
  temperature: string;
}

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
}

export type StringConfigField = {
  name: string;
  description: string;
  guideText: string;
  maxLength: string;
  minLength: string;
  defaultValue: string;
  regex: string;
  value?: string;
}

export type BooleanConfigField = {
  name: string;
  description: string;
  guideText: string;
  defaultValue: boolean;
  value?: boolean;
}

export type NumberConfigField = {
  name: string;
  description: string;
  guideText: string;
  defaultValue: string;
  min: string;
  max: string;
  value?: string;
}

/**
 * A PromptLab command setup configuration.
 */
export type CommandConfig = {
  fields: (NumberConfigField | BooleanConfigField | StringConfigField)[];
  configVersion: string;
}

/**
 * A PromptLab command.
 */
export type Command = {
  id: string;
  name: string;
  prompt: string;
  icon: string;
  iconColor?: string;
  minNumFiles?: string;
  acceptedFileExtensions?: string;
  useMetadata?: boolean;
  useSoundClassification?: boolean;
  useAudioDetails?: boolean;
  useSubjectClassification?: boolean;
  useRectangleDetection?: boolean;
  useBarcodeDetection?: boolean;
  useFaceDetection?: boolean;
  outputKind?: string;
  actionScript?: string;
  showResponse?: boolean;
  description?: string;
  useSaliencyAnalysis?: boolean;
  author?: string;
  website?: string;
  version?: string;
  requirements?: string;
  scriptKind?: string;
  categories?: string[];
  temperature?: string;
  model?: string;
  favorited?: boolean;
  setupConfig?: CommandConfig;
  installedFromStore?: boolean;
  setupLocked?: boolean;
  useSpeech?: boolean;
  speakResponse?: boolean;
  showInMenuBar?: boolean;
}

/**
 * Checks if an object is an installed command object.
 * @param obj The object to check.
 * @returns True if the object is an installed command, false otherwise.
 */
export const isCommand = (obj: object): obj is Command => {
  return !("exampleOutput" in obj);
}

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
}

export const isStoreCommand = (obj: object): obj is StoreCommand => {
  return "exampleOutput" in obj;
}

/** Output from a model endpoint */
export type modelOutput = {
  [key: string]: string | modelOutput;
}

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
}

/**
 * A PromptLab Chat instance.
 */
export type Chat = {
  name: string;
  icon: string;
  iconColor: string;
  basePrompt: string;
  favorited: boolean;
  contextData: {
    type: string;
    source: string;
    data: string;
  }[];
  condensingStrategy: string;
  summaryLength: string;
  stats?: ChatStatistics;
}

/**
 * A Raycast extension.
 */
export type Extension = {
  title: string;
  name: string;
  path: string;
  author: string;
  description: string;
  commands: ExtensionCommand[];
}

/**
 * A Raycast extension command.
 */
export type ExtensionCommand = {
  title: string;
  name: string;
  description: string;
  deeplink: string;
}

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
 * A custom placeholder stored in custom_placeholders.json.
 */
export type CustomPlaceholder = {
  name: string;
  description: string;
  value: string;
  example: string;
  hintRepresentation: string;
}

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