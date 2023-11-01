/**
 * @file default-advanced-settings.ts
 *
 * @summary Default values for advanced settings, used to generate the advanced settings file and as a fallback if the advanced settings file cannot be loaded.
 * @author Stephen Kaplan <skaplanofficial@gmail.com>
 *
 * Created at     : 2023-07-05 10:31:40
 * Last modified  : 2023-08-16 23:48:35
 */

import { Color, Icon } from "@raycast/api";

import { Chat, Command, Model } from "../utils/types";

export const defaultAdvancedSettings = {
  /**
   * The version of the settings. This is used to determine if the settings need to be migrated.
   */
  settingsVersion: 1.12,

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
      enabled: ["search-commands", "chat", "manage-models", "saved-responses", "manage-placeholders"],
      shortcut: {
        key: "d",
        modifiers: ["cmd"],
      },
    },
    DeleteAllAction: {
      enabled: ["search-commands", "chat", "manage-models", "saved-responses", "manage-placeholders"],
      shortcut: {
        key: "d",
        modifiers: ["cmd", "opt", "shift"],
      },
    },
    CopyIDAction: {
      enabled: ["search-commands", "chat", "manage-models", "saved-responses"],
      shortcut: {
        key: "i",
        modifiers: ["cmd", "shift"],
      },
    },
    RunCommandAction: {
      enabled: ["search-commands", "discover-commands"],
      shortcut: {
        key: "r",
        modifiers: ["cmd"],
      },
    },
    ShareCommandAction: {
      enabled: ["search-commands"],
      shortcut: {
        key: "s",
        modifiers: ["cmd", "shift"],
      },
    },
    OpenPlaceholdersGuideAction: {
      enabled: ["search-commands", "create-command", "chat", "saved-responses", "manage-placeholders"],
      openIn: "default",
      shortcut: {
        key: "g",
        modifiers: ["cmd", "shift"],
      },
    },
    OpenAdvancedSettingsAction: {
      enabled: ["search-commands", "create-command", "chat", "saved-responses", "manage-models", "manage-placeholders"],
      openIn: "default",
      shortcut: {
        key: "v",
        modifiers: ["cmd", "shift"],
      },
    },
    EditCustomPlaceholdersAction: {
      enabled: ["create-command", "search-commands", "chat", "saved-responses"],
      openIn: "default",
      shortcut: {
        key: "p",
        modifiers: ["cmd", "shift"],
      },
    },
    CopyCommandPromptAction: {
      enabled: ["search-commands"],
      shortcut: {
        key: "p",
        modifiers: ["cmd", "shift"],
      },
    },
    ExportAllCommandsAction: {
      enabled: ["search-commands"],
      shortcut: {
        key: "a",
        modifiers: ["cmd", "shift"],
      },
    },
    ToggleFavoriteAction: {
      enabled: ["search-commands", "discover-commands", "chat", "manage-models", "saved-responses"],
      shortcut: {
        key: "f",
        modifiers: ["cmd", "shift"],
      },
    },
    CreateQuickLinkAction: {
      enabled: ["search-commands"],
      shortcut: {
        key: "q",
        modifiers: ["cmd", "shift"],
      },
    },
    CreateDerivativeAction: {
      enabled: ["search-commands", "discover-commands"],
      shortcut: {
        key: "d",
        modifiers: ["cmd"],
      },
    },
    InstallAllCommandsAction: {
      enabled: ["discover-commands"],
      shortcut: {
        key: "i",
        modifiers: ["cmd", "shift"],
      },
    },
    InstallCommandAction: {
      enabled: ["discover-commands"],
      shortcut: {
        key: "i",
        modifiers: ["cmd"],
      },
    },
    ToggleSetupFieldsAction: {
      enabled: ["search-commands", "discover-commands", "create-command"],
      shortcut: {
        key: "s",
        modifiers: ["cmd", "shift"],
      },
    },
    CopyChatResponseAction: {
      enabled: ["search-commands", "discover-commands", "chat"],
      shortcut: {
        key: "c",
        modifiers: ["cmd", "shift"],
      },
    },
    CopyChatQueryAction: {
      enabled: ["search-commands", "discover-commands", "chat"],
      shortcut: {
        key: "q",
        modifiers: ["cmd", "shift"],
      },
    },
    CopyChatBasePromptAction: {
      enabled: ["search-commands", "discover-commands", "chat"],
      shortcut: {
        key: "p",
        modifiers: ["cmd", "shift"],
      },
    },
    ChatSettingsAction: {
      enabled: ["search-commands", "discover-commands", "chat"],
      shortcut: {
        key: "e",
        modifiers: ["cmd"],
      },
    },
    RegenerateChatAction: {
      enabled: ["search-commands", "discover-commands", "chat"],
      shortcut: {
        key: "r",
        modifiers: ["cmd"],
      },
    },
    ExportChatAction: {
      enabled: ["search-commands", "discover-commands", "chat"],
      shortcut: {
        key: "e",
        modifiers: ["cmd", "shift"],
      },
    },
    ToggleModelDefaultAction: {
      enabled: ["manage-models"],
      shortcut: {
        key: "d",
        modifiers: ["cmd", "shift"],
      },
    },
    CreateModelDerivativeAction: {
      enabled: ["manage-models"],
      shortcut: {
        key: "c",
        modifiers: ["cmd", "shift"],
      },
    },
    AddNewModelAction: {
      enabled: ["manage-models"],
      shortcut: {
        key: "n",
        modifiers: ["cmd"],
      },
    },
    CopyJSONAction: {
      enabled: ["saved-responses", "chat", "search-commands", "discover-commands", "manage-models", "manage-placeholders"],
      shortcut: {
        key: "j",
        modifiers: ["cmd", "shift"],
      },
    },
    CopyNameAction: {
      enabled: ["saved-responses", "chat", "search-commands", "discover-commands", "manage-models", "manage-placeholders"],
      shortcut: {
        key: "n",
        modifiers: ["cmd", "shift"],
      },
    },
    EditAction: {
      enabled: ["saved-responses", "chat", "search-commands", "manage-models", "manage-placeholders"],
      shortcut: {
        key: "e",
        modifiers: ["cmd"],
      },
    },
    "CreatePlaceholderAction": {
      enabled: ["manage-placeholders"],
      shortcut: {
        key: "n",
        modifiers: ["cmd"],
      },
    },
    "CopyCurrentValueAction": {
      enabled: ["manage-placeholders"],
      shortcut: {
        key: "c",
        modifiers: ["cmd", "shift"],
      },
    }
  },
};
