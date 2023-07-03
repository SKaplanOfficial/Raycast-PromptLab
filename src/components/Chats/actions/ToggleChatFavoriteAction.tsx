import { Chat } from "../../../utils/types";
import { updateChat } from "../../../utils/chat-utils";
import ToggleFavoriteAction from "../../actions/ToggleFavoriteAction";
import { defaultAdvancedSettings } from "../../../data/default-advanced-settings";

/**
 * Action to toggle a chat's favorite status.
 * @param props.chat The chat to toggle.
 * @param props.chats The chat manager object.
 * @param props.setCurrentChat The function to update the current chat.
 * @returns An action component.
 */
export const ToggleChatFavoriteAction = (props: {
  chat: Chat | undefined;
  revalidateChats: () => Promise<void>;
  setCurrentChat: (value: React.SetStateAction<Chat | undefined>) => void;
  settings: typeof defaultAdvancedSettings;
}) => {
  const { chat, revalidateChats, setCurrentChat, settings } = props;

  if (!chat) {
    return null;
  }

  return (
    <ToggleFavoriteAction
      toggleMethod={async () => {
        const newChatData = { ...chat, favorited: !chat.favorited };
        updateChat(newChatData);
        await revalidateChats();
        setCurrentChat(newChatData);
      }}
      currentStatus={chat.favorited}
      settings={settings}
    />
  );
};
