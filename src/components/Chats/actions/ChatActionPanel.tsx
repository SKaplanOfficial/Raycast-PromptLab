import { Action, ActionPanel, Icon } from "@raycast/api";
import { ToggleChatFavoriteAction } from "./ToggleChatFavoriteAction";
import { ExportChatAction } from "./ExportChatAction";
import { DeleteAllChatsAction, DeleteChatAction } from "./DeleteChatActions";
import { defaultAdvancedSettings } from "../../../data/default-advanced-settings";
import ChatSettingsForm from "../ChatSettingsForm";
import { CopyChatActionsSection } from "./CopyChatActions";
import { anyActionsEnabled, getActionShortcut, isActionEnabled } from "../../../utils/action-utils";
import ContextSettingsActionSection from "./ContextSettingsActionSection";
import { Chat, ChatRef } from "../../../utils/types";
import EditAction from "../../actions/EditAction";
import AdvancedActionSubmenu from "../../actions/AdvancedActionSubmenu";

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
  onCancel: () => void;
  settings: typeof defaultAdvancedSettings;
  revalidate: () => void;
  setEnableModel: React.Dispatch<React.SetStateAction<boolean>>;
  stopModel: () => void;
  setInput: React.Dispatch<React.SetStateAction<string | undefined>>;
  setRunningCommand: React.Dispatch<React.SetStateAction<boolean>>;
  submitQuery: (query: string) => void;
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
    onCancel,
    revalidate,
    setEnableModel,
    stopModel,
    setInput,
    setRunningCommand,
    submitQuery,
  } = props;

  return (
    <ActionPanel>
      {isLoading ? (
        <Action title="Cancel" onAction={onCancel} />
      ) : (
        <Action
          title="Submit Query"
          onAction={() => {
            setEnableModel(false);
            stopModel();
            setInput("");
            setRunningCommand(false);
            submitQuery(query);
          }}
        />
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
        ["EditAction", "ToggleFavoriteAction", "ExportChatAction", "DeleteAction", "DeleteAllAction"],
        settings
      ) ? (
        <ActionPanel.Section title="Chat Actions">
          {chat ? (
            <EditAction
              objectType="Chat Settings"
              settings={settings}
              target={
                <ChatSettingsForm
                  oldData={chat}
                  revalidateChats={revalidateChats}
                  setCurrentChat={setCurrentChat}
                  settings={settings}
                />
              }
            />
          ) : null}

          <ToggleChatFavoriteAction
            chat={chat}
            revalidateChats={revalidateChats}
            setCurrentChat={setCurrentChat}
            settings={settings}
          />

          {chat && isActionEnabled("ExportChatAction", settings) ? <ExportChatAction chat={chat} settings={settings} /> : null}

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
          shortcut={getActionShortcut("RegenerateChatAction", settings)}
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
