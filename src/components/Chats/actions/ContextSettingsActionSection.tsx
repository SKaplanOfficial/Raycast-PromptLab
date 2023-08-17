import { Action, ActionPanel, Color, Icon } from "@raycast/api";
import { Chat } from "../../../utils/types";
import { setChatProperty } from "../../../utils/chat-utils";

/**
 * Actions section for enabling/disabling chat context settings.
 * @returns An ActionPanel.Section component.
 */
export default function ContextSettingsActionSection(props: {
  chat: Chat | undefined;
  revalidateChats: () => Promise<void>;
  useFileContext: boolean;
  useConversationContext: boolean;
  useAutonomousFeatures: boolean;
  setUseFileContext: React.Dispatch<React.SetStateAction<boolean>>;
  setUseConversationContext: React.Dispatch<React.SetStateAction<boolean>>;
  setUseAutonomousFeatures: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    chat,
    revalidateChats,
    useFileContext,
    useConversationContext,
    useAutonomousFeatures,
    setUseFileContext,
    setUseConversationContext,
    setUseAutonomousFeatures,
  } = props;
  return (
    <ActionPanel.Section title="Context Settings">
      <Action
        title="Use File Selection"
        icon={
          useFileContext
            ? { source: Icon.CheckCircle, tintColor: Color.Green }
            : { source: Icon.XMarkCircle, tintColor: Color.Red }
        }
        onAction={async () => {
          if (chat) {
            await setChatProperty(chat, "useSelectedFilesContext", !useFileContext);
            await revalidateChats();
          }
          setUseFileContext(!useFileContext);
        }}
        shortcut={{ modifiers: ["cmd", "shift"], key: "f" }}
      />

      <Action
        title="Use Conversation History"
        icon={
          useConversationContext
            ? { source: Icon.CheckCircle, tintColor: Color.Green }
            : { source: Icon.XMarkCircle, tintColor: Color.Red }
        }
        onAction={async () => {
          if (chat) {
            await setChatProperty(chat, "useConversationContext", !useConversationContext);
            await revalidateChats();
          }
          setUseConversationContext(!useConversationContext);
        }}
        shortcut={{ modifiers: ["cmd", "shift"], key: "h" }}
      />

      <Action
        title="Allow AI To Run Commands"
        icon={
          useAutonomousFeatures
            ? { source: Icon.CheckCircle, tintColor: Color.Green }
            : { source: Icon.XMarkCircle, tintColor: Color.Red }
        }
        onAction={async () => {
          if (chat) {
            await setChatProperty(chat, "allowAutonomy", !useAutonomousFeatures);
            await revalidateChats();
          }
          setUseAutonomousFeatures(!useAutonomousFeatures);
        }}
        shortcut={{ modifiers: ["cmd", "shift"], key: "r" }}
      />
    </ActionPanel.Section>
  );
}
