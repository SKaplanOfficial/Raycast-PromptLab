import { Action, ActionPanel } from "@raycast/api";
import { defaultAdvancedSettings } from "../../../data/default-advanced-settings";
import { anyActionsEnabled } from "../../../utils/action-utils";
import CopyIDAction from "../../actions/CopyIDAction";

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
      ["CopyChatResponseAction", "CopyChatQueryAction", "CopyChatBasePromptAction", "CopyIDAction"],
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
      <CopyIDAction id={chatId} objectType="Chat" settings={settings} />
    </ActionPanel.Section>
  );
};
