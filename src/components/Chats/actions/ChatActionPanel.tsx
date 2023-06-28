import { Action, ActionPanel, Form, Icon } from "@raycast/api";
import { ToggleChatFavoriteAction } from "./ToggleChatFavoriteAction";
import { ExportChatAction } from "./ExportChatAction";
import { DeleteAllChatsAction, DeleteChatAction } from "./DeleteChatActions";
import { ChatManager } from "../../../hooks/useChats";
import { Chat } from "../../../utils/types";
import { defaultAdvancedSettings } from "../../../data/default-advanced-settings";
import ChatSettingsForm from "../ChatSettingsForm";
import { CopyChatActionsSection } from "./CopyChatActions";
import { anyActionsEnabled, isActionEnabled } from "../../actions/action-utils";
import { AdvancedActionSubmenu } from "../../actions/AdvancedActionSubmenu";

/**
 * Actions panel for the Chat command. 
 */
export const ChatActionPanel = (props: {
  isLoading: boolean;
  chat: Chat | undefined;
  chats: ChatManager;
  setCurrentChat: (value: React.SetStateAction<Chat | undefined>) => void;
  response: string;
  previousResponse: string;
  query: string;
  basePrompt: string;
  onSubmit: (values: Form.Values) => void;
  onCancel: () => void;
  settings: typeof defaultAdvancedSettings;
  setSentQuery: React.Dispatch<React.SetStateAction<string>>;
  revalidate: () => void;
}) => {
  const {
    isLoading,
    settings,
    chat,
    chats,
    setCurrentChat,
    setSentQuery,
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

      {anyActionsEnabled(["ChatSettingsAction", "ToggleChatFavoriteAction", "ExportChatAction", "DeleteChatAction", "DeleteAllChatsAction"], settings) ?
      <ActionPanel.Section title="Chat Actions">
        {chat && isActionEnabled("ChatSettingsAction", settings) ? (
          <Action.Push
            title="Chat Settings..."
            icon={Icon.Gear}
            target={<ChatSettingsForm oldData={chat} chats={chats} setCurrentChat={setCurrentChat} settings={settings} />}
            shortcut={{ modifiers: ["cmd", "shift"], key: "," }}
          />
        ) : null}

        {isActionEnabled("ToggleChatFavoriteAction", settings) ? <ToggleChatFavoriteAction chat={chat} chats={chats} setCurrentChat={setCurrentChat} /> : null}

        {chat && isActionEnabled("ExportChatAction", settings) ? <ExportChatAction chat={chat} chats={chats} /> : null}

        {chat && isActionEnabled("DeleteChatAction", settings) ? <DeleteChatAction chat={chat} chats={chats} setCurrentChat={setCurrentChat} /> : null}
        {isActionEnabled("DeleteAllChatsAction", settings) ? <DeleteAllChatsAction chats={chats} setCurrentChat={setCurrentChat} /> : null}
      </ActionPanel.Section> : null}

      {isActionEnabled("RegenerateChatAction", settings) ? <Action
        title="Regenerate"
        icon={Icon.ArrowClockwise}
        onAction={previousResponse?.length ? () => setSentQuery(query + " ") : revalidate}
        shortcut={{ modifiers: ["cmd"], key: "r" }}
      /> : null}

      <CopyChatActionsSection response={response} query={query} basePrompt={basePrompt} settings={settings} />

      <AdvancedActionSubmenu settings={settings} />
    </ActionPanel>
  );
};
