/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** General Settings - If checked, PromptLab will use OCR to extract text from PDFs. This takes longer but enables analysis of more PDF content types. */
  "pdfOCR": boolean,
  /** Export Location - The folder where exported commands and chats will be saved. */
  "exportLocation": string,
  /** Custom Placeholder Files - A comma-separated list of JSON files containing custom placeholders. These files must follow the format of the original custom_placeholders.json file. See the documentation for more information. */
  "customPlaceholderFiles": string,
  /** Primary Command Action - The top action of the actions menu in command response views. */
  "primaryAction": "copy-response-to-clipboard" | "paste-to-active-app" | "copy-prompt-to-clipboard" | "open-chat" | "regenerate" | "save-response",
  /** Level of Automatic Input Condensing - The amount of automatic input condensing to apply to the input text. Higher levels will remove more characters and cut out excess verbiage, resulting in far fewer tokens. However, this may result in less accurate results. Adjust this value according to the model's token limit. For Raycast AI, use 'Medium' or 'High'. */
  "condenseAmount": "high" | "medium" | "low" | "none",
  /** Prompt Prefix - Text to prepend at the start of every prompt. This can be used to set context for all commands. */
  "promptPrefix": string,
  /** Prompt Suffix - Text to append and the end of every prompt. This can be used to set context for all commands. */
  "promptSuffix": string,
  /** Insights Settings - If checked, PromptLab will track your usage of placeholders and use this data to generate more accurate placeholder suggestions. This data is stored locally on your computer and is not sent to any external servers. */
  "usePlaceholderStatistics": boolean,
  /**  - If checked, PromptLab will track your usage of commands and use this data to deliver command suggestions and inferences. This data is stored locally on your computer and is not sent to any external servers. */
  "useCommandStatistics": boolean,
  /**  - If checked, PromptLab will track the creation of and switching between chats, along with chat titles, and will use this data to deliver chat suggestions and inferences. This data is stored locally on your computer and is not sent to any external servers. */
  "useChatStatistics": boolean
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `create-command` command */
  export type CreateCommand = ExtensionPreferences & {}
  /** Preferences accessible in the `search-commands` command */
  export type SearchCommands = ExtensionPreferences & {
  /** Search Settings - If checked, each command category will have its own section in the search results. */
  "groupByCategory": boolean,
  /**  - Whether to display suggested commands based on your usage. Requires 'Command Insights' to be enabled. */
  "displaySuggestions": boolean
}
  /** Preferences accessible in the `chat` command */
  export type Chat = ExtensionPreferences & {
  /** Default Chat Settings - If checked, the selected files will be used as context for conversations by default. */
  "useSelectedFiles": boolean,
  /**  - If checked, the conversation history will be used as context for conversations by default. */
  "useConversationHistory": boolean,
  /**  - If checked, autonomous agent features such as 'Allow AI To Run Commands' will be enabled by default. */
  "autonomousFeatures": boolean,
  /** Base Prompt - The base prompt that provides the initial context for conversations. */
  "basePrompt": string
}
  /** Preferences accessible in the `import-commands` command */
  export type ImportCommands = ExtensionPreferences & {}
  /** Preferences accessible in the `discover-commands` command */
  export type DiscoverCommands = ExtensionPreferences & {}
  /** Preferences accessible in the `manage-models` command */
  export type ManageModels = ExtensionPreferences & {}
  /** Preferences accessible in the `manage-placeholders` command */
  export type ManagePlaceholders = ExtensionPreferences & {}
  /** Preferences accessible in the `menubar-item` command */
  export type MenubarItem = ExtensionPreferences & {
  /** Shortcuts To Show - Whether to show the 'New Chat' shortcut in the menu. */
  "showNewChatShortcut": boolean,
  /**  - Whether to show the 'All Commands' shortcut in the menu. */
  "showAllCommandsShortcut": boolean,
  /**  - Whether to show the 'Saved Responses' shortcut in the menu. */
  "showSavedResponsesShortcut": boolean,
  /**  - Whether to show the 'PromptLab Store' shortcut in the menu. */
  "showPromptLabStoreShortcut": boolean,
  /**  - Whether to show the 'New Command' shortcut in the menu. */
  "showNewCommandShortcut": boolean,
  /**  - Whether to show the 'Custom Placeholders' shortcut in the menu. */
  "showCustomPlaceholdersShortcut": boolean,
  /**  - Whether to show the 'Advanced Settings' shortcut in the menu. */
  "showAdvancedSettingsShortcut": boolean,
  /** Display Settings - Whether to display icons next to the menu items. */
  "displayIcons": boolean,
  /**  - Whether to display colors in the menu item icons. */
  "displayColors": boolean,
  /**  - Whether to separate favorite commands from the rest of the menu items. */
  "displayFavorites": boolean,
  /**  - Whether to separate commands by category. */
  "displayCategories": boolean,
  /**  - Whether to display suggested commands based on your usage. Requires 'Command Insights' to be enabled. */
  "displaySuggestions": boolean
}
  /** Preferences accessible in the `saved-responses` command */
  export type SavedResponses = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `create-command` command */
  export type CreateCommand = {}
  /** Arguments passed to the `search-commands` command */
  export type SearchCommands = {
  /** Command Name */
  "commandName": string
}
  /** Arguments passed to the `chat` command */
  export type Chat = {
  /** Initial Query */
  "initialQuery": string
}
  /** Arguments passed to the `import-commands` command */
  export type ImportCommands = {}
  /** Arguments passed to the `discover-commands` command */
  export type DiscoverCommands = {}
  /** Arguments passed to the `manage-models` command */
  export type ManageModels = {}
  /** Arguments passed to the `manage-placeholders` command */
  export type ManagePlaceholders = {}
  /** Arguments passed to the `menubar-item` command */
  export type MenubarItem = {}
  /** Arguments passed to the `saved-responses` command */
  export type SavedResponses = {}
}


