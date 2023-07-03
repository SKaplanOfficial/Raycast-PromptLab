import { Action, ActionPanel, Form, Icon } from "@raycast/api";
import { ToggleChatFavoriteAction } from "./ToggleChatFavoriteAction";
import { ExportChatAction } from "./ExportChatAction";
import { DeleteAllChatsAction, DeleteChatAction } from "./DeleteChatActions";
import { defaultAdvancedSettings } from "../../../data/default-advanced-settings";
import ChatSettingsForm from "../ChatSettingsForm";
import { CopyChatActionsSection } from "./CopyChatActions";
import { anyActionsEnabled, isActionEnabled } from "../../../utils/action-utils";
import { AdvancedActionSubmenu } from "../../actions/AdvancedActionSubmenu";
import ContextSettingsActionSection from "./ContextSettingsActionSection";
import { Chat, ChatRef } from "../../../utils/types";

/**
 * Actions panel for the Chat command.
 */
export const ChatActionPanel = (props: {
  isLoading: boolean;
  chat: Chat | undefined;
  chatRefs: ChatRef[];
  revalidateChats: () => Promise<void>;
  useFileContext: boolean;
  useConversationContext: boolean;
  useAutonomousFeatures: boolean;
  setCurrentChat: (value: React.SetStateAction<Chat | undefined>) => void;
  setSentQuery: React.Dispatch<React.SetStateAction<string>>;
  setUseFileContext: React.Dispatch<React.SetStateAction<boolean>>;
  setUseConversationContext: React.Dispatch<React.SetStateAction<boolean>>;
  setUseAutonomousFeatures: React.Dispatch<React.SetStateAction<boolean>>;
  response: string;
  previousResponse: string;
  query: string;
  basePrompt: string;
  onSubmit: (values: Form.Values) => void;
  onCancel: () => void;
  settings: typeof defaultAdvancedSettings;
  revalidate: () => void;
}) => {
  const {
    isLoading,
    settings,
    chat,
    chatRefs,
    revalidateChats,
    useFileContext,
    useConversationContext,
    useAutonomousFeatures,
    setCurrentChat,
    setSentQuery,
    setUseFileContext,
    setUseConversationContext,
    setUseAutonomousFeatures,
    response,
    previousResponse,
    query,
    basePrompt,
    onSubmit,
    onCancel,
    revalidate,
  } = props;
  return (
    <ActionPanel>
      {isLoading ? (
        <Action title="Cancel" onAction={onCancel} />
      ) : (
        <Action.SubmitForm title="Submit Query" onSubmit={onSubmit} />
      )}

      <ContextSettingsActionSection
        chat={chat}
        revalidateChats={revalidateChats}
        useFileContext={useFileContext}
        useConversationContext={useConversationContext}
        useAutonomousFeatures={useAutonomousFeatures}
        setUseFileContext={setUseFileContext}
        setUseConversationContext={setUseConversationContext}
        setUseAutonomousFeatures={setUseAutonomousFeatures}
      />

      {anyActionsEnabled(
        [
          "ChatSettingsAction",
          "ToggleChatFavoriteAction",
          "ExportChatAction",
          "DeleteChatAction",
          "DeleteAllChatsAction",
        ],
        settings
      ) ? (
        <ActionPanel.Section title="Chat Actions">
          {chat && isActionEnabled("ChatSettingsAction", settings) ? (
            <Action.Push
              title="Edit Chat Settings..."
              icon={Icon.Gear}
              target={
                <ChatSettingsForm
                  oldData={chat}
                  revalidateChats={revalidateChats}
                  setCurrentChat={setCurrentChat}
                  settings={settings}
                />
              }
              shortcut={{ modifiers: ["cmd", "shift"], key: "," }}
            />
          ) : null}

          <ToggleChatFavoriteAction
            chat={chat}
            revalidateChats={revalidateChats}
            setCurrentChat={setCurrentChat}
            settings={settings}
          />

          {chat && isActionEnabled("ExportChatAction", settings) ? <ExportChatAction chat={chat} /> : null}

          {chat ? (
            <DeleteChatAction
              chat={chat}
              revalidateChats={revalidateChats}
              setCurrentChat={setCurrentChat}
              settings={settings}
            />
          ) : null}
          {chatRefs.length > 0 ? (
            <DeleteAllChatsAction
              chatRefs={chatRefs}
              revalidateChats={revalidateChats}
              setCurrentChat={setCurrentChat}
              settings={settings}
            />
          ) : null}
        </ActionPanel.Section>
      ) : null}

      {isActionEnabled("RegenerateChatAction", settings) ? (
        <Action
          title="Regenerate"
          icon={Icon.ArrowClockwise}
          onAction={previousResponse?.length ? () => setSentQuery(query + " ") : revalidate}
          shortcut={{ modifiers: ["cmd"], key: "r" }}
        />
      ) : null}

      <CopyChatActionsSection
        chatId={chat?.id || ""}
        response={response}
        query={query}
        basePrompt={basePrompt}
        settings={settings}
      />

      <AdvancedActionSubmenu settings={settings} />
    </ActionPanel>
  );
};
