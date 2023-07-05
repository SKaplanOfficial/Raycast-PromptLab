import { Action, ActionPanel } from "@raycast/api";
import { defaultAdvancedSettings } from "../../../data/default-advanced-settings";
import { anyActionsEnabled } from "../../../utils/action-utils";
import CopyIDAction from "../../actions/CopyIDAction";
import CopyJSONAction from "../../actions/CopyJSONAction";
import { loadChat } from "../../../utils/chat-utils";
import { getObjectJSON } from "../../../utils/command-utils";
import CopyNameAction from "../../actions/CopyNameAction";

export const CopyChatActionsSection = (props: {
  chatId: string;
  response: string;
  query: string;
  basePrompt: string;
  settings: typeof defaultAdvancedSettings;
}) => {
  const { chatId, response, query, basePrompt, settings } = props;

  if (
    !anyActionsEnabled(
      ["CopyChatResponseAction", "CopyChatQueryAction", "CopyChatBasePromptAction", "CopyIDAction", "CopyJSONAction", "CopyNameAction"],
      settings
    )
  ) {
    return null;
  }

  return (
    <ActionPanel.Section title="Clipboard Actions">
      <Action.CopyToClipboard title="Copy Response" content={response} shortcut={{ modifiers: ["cmd"], key: "c" }} />
      <Action.CopyToClipboard
        title="Copy Sent Query"
        content={query}
        shortcut={{ modifiers: ["cmd", "shift"], key: "s" }}
      />
      <Action.CopyToClipboard
        title="Copy Base Prompt"
        content={basePrompt}
        shortcut={{ modifiers: ["cmd", "shift"], key: "p" }}
      />
      <CopyNameAction
        name={async () => {
          const chat = await loadChat(chatId);
          return chat.name;
        }}
        objectType="Chat"
        settings={settings}
      />
      <CopyIDAction id={chatId} objectType="Chat" settings={settings} />
      <CopyJSONAction
        content={async () => {
          const chat = await loadChat(chatId);
          return getObjectJSON(chat);
        }}
        objectType="Chat"
        settings={settings}
      />
    </ActionPanel.Section>
  );
};
