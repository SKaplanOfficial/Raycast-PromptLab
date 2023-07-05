/**
 * @file default-advanced-settings.ts
 *
 * @summary Default values for advanced settings, used to generate the advanced settings file and as a fallback if the advanced settings file cannot be loaded.
 * @author Stephen Kaplan <skaplanofficial@gmail.com>
 *
 * Created at     : 2023-07-05 10:31:40
 * Last modified  : 2023-07-05 10:31:44
 */

import { Color, Icon } from "@raycast/api";

import { Chat, Command, Model } from "../utils/types";

export const defaultAdvancedSettings = {
  /**
   * Default values for newly created commands.
   */
  commandDefaults: {
    name: "",
    prompt: "",
    icon: Icon.CommandSymbol,
    iconColor: Color.Red,
    minNumFiles: "0",
    useMetadata: false,
    acceptedFileExtensions: "",
    useAudioDetails: false,
    useSoundClassification: false,
    useSubjectClassification: false,
    useRectangleDetection: false,
    useBarcodeDetection: false,
    useFaceDetection: false,
    useHorizonDetection: false,
    outputKind: "detail",
    actionScript: "",
    showResponse: true,
    description: "",
    useSaliencyAnalysis: false,
    author: "",
    website: "",
    version: "1.0.0",
    requirements: "",
    scriptKind: "applescript",
    categories: ["Other"],
    temperature: "1.0",
    favorited: false,
    model: "",
    useSpeech: false,
    speakResponse: false,
    showInMenuBar: true,
    template: false,
  } as Command,

  /**
   * Default settings for newly added models.
   */
  modelDefaults: {
    name: "",
    description: "",
    endpoint: "",
    authType: "apiKey",
    apiKey: "",
    inputSchema: "",
    outputKeyPath: "",
    outputTiming: "async",
    lengthLimit: "2500",
    favorited: false,
    icon: Icon.Cog,
    iconColor: Color.Red,
    notes: "",
    isDefault: false,
    temperature: "1.0",
  } as Model,

  /**
   * Default settings for newly created chats.
   */
  chatDefaults: {
    icon: Icon.Message,
    iconColor: Color.Red,
    favorited: false,
    condensingStrategy: "summarize",
    summaryLength: "100",
    showBasePrompt: true,
    useSelectedFilesContext: false,
    useConversationContext: true,
    allowAutonomy: false,
  } as Chat,

  /**
   * Settings for the Placeholders System and for specific placeholders.
   */
  placeholderSettings: {
    /**
     * Whether to process placeholders at all.
     */
    processPlaceholders: true,

    /**
     * Whether to allow custom placeholders.
     */
    allowCustomPlaceholders: true,

    /**
     * Whether to allow custom placeholders sourced from custom paths.
     */
    allowCustomPlaceholderPaths: true,

    /**
     * Whether to use the user's shell environment when processing `{{shell:...}}` placeholders.
     */
    useUserShellEnvironment: true,
  },

  /**
   * Settings for analyzing selected files.
   */
  fileAnalysisSettings: {
    /**
     * The number of sample frames to use when analyzing video files.
     */
    videoSampleCount: 15,

    /**
     * Whether to use the preview image when analyzing Keynote files vs. analyzing the image of each slide.
     */
    singlePreviewForKeynote: false,
  },

  /**
   * Settings for actions throughout the extension.
   */
  actionSettings: {
    DeleteAction: {
      enabled: ["search-commands", "chat", "manage-models", "saved-responses"],
    },
    DeleteAllAction: {
      enabled: ["search-commands", "chat", "manage-models", "saved-responses"],
    },
    CopyIDAction: {
      enabled: ["search-commands", "chat", "manage-models", "saved-responses"],
    },
    RunCommandAction: {
      enabled: ["search-commands", "discover-commands"],
    },
    ShareCommandAction: {
      enabled: ["search-commands"],
    },
    OpenPlaceholdersGuideAction: {
      enabled: ["search-commands", "create-command", "chat", "saved-responses"],
      openIn: "default",
    },
    OpenAdvancedSettingsAction: {
      enabled: ["search-commands", "create-command", "chat", "saved-responses"],
      openIn: "default",
    },
    EditCustomPlaceholdersAction: {
      enabled: ["create-command", "search-commands", "chat", "saved-responses"],
      openIn: "default",
    },
    CopyCommandPromptAction: {
      enabled: ["search-commands"],
    },
    ExportAllCommandsAction: {
      enabled: ["search-commands"],
    },
    ToggleFavoriteAction: {
      enabled: ["search-commands", "discover-commands", "chat", "manage-models", "saved-responses"],
    },
    CreateQuickLinkAction: {
      enabled: ["search-commands"],
    },
    CreateDerivativeAction: {
      enabled: ["search-commands", "discover-commands"],
    },
    InstallAllCommandsAction: {
      enabled: ["discover-commands"],
    },
    InstallCommandAction: {
      enabled: ["discover-commands"],
    },
    ToggleSetupFieldsAction: {
      enabled: ["search-commands", "discover-commands", "create-command"],
    },
    CopyChatResponseAction: {
      enabled: ["search-commands", "discover-commands", "chat"],
    },
    CopyChatQueryAction: {
      enabled: ["search-commands", "discover-commands", "chat"],
    },
    CopyChatBasePromptAction: {
      enabled: ["search-commands", "discover-commands", "chat"],
    },
    RegenerateChatAction: {
      enabled: ["search-commands", "discover-commands", "chat"],
    },
    ExportChatAction: {
      enabled: ["search-commands", "discover-commands", "chat"],
    },
    ToggleModelDefaultAction: {
      enabled: ["manage-models"],
    },
    CreateModelDerivativeAction: {
      enabled: ["manage-models"],
    },
    CopyAllModelsJSONAction: {
      enabled: ["manage-models"],
    },
    AddNewModelAction: {
      enabled: ["manage-models"],
    },
    CopyJSONAction: {
      enabled: ["saved-responses", "chat", "search-commands", "discover-commands", "manage-models"],
    },
    CopyNameAction: {
      enabled: ["saved-responses", "chat", "search-commands", "discover-commands", "manage-models"],
    },
    EditAction: {
      enabled: ["saved-responses", "chat", "search-commands", "manage-models"],
    },
  },
};
