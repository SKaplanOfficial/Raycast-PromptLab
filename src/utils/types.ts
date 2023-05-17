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
