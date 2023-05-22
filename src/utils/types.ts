/**
 * General preferences for the entire extension.
 */
export interface ExtensionPreferences {
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
}

/**
 * Preferences for the `My PromptLab Commands` command.
 */
export interface searchPreferences {
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
];

export interface ModelManager {
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

export interface Model {
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
export interface CommandOptions {
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

export interface StringConfigField {
  name: string;
  description: string;
  guideText: string;
  maxLength: string;
  minLength: string;
  defaultValue: string;
  regex: string;
  value?: string;
}

export interface BooleanConfigField {
  name: string;
  description: string;
  guideText: string;
  defaultValue: boolean;
  value?: boolean;
}

export interface NumberConfigField {
  name: string;
  description: string;
  guideText: string;
  defaultValue: string;
  min: string;
  max: string;
  value?: string;
}

export interface CommandConfig {
  fields: (NumberConfigField | BooleanConfigField | StringConfigField)[];
  configVersion: string;
}

/**
 * A PromptLab command.
 */
export interface Command {
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
 * A command response from SlashAPI.
 */
export interface StoreCommand {
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

/** Output from a model endpoint */
export interface modelOutput {
  [key: string]: string | modelOutput;
}

/**
 * Statistics about a PromptLab chat.
 */
export interface ChatStatistics {
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
export interface Chat {
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
