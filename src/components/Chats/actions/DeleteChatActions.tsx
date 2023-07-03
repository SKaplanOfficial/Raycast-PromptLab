import { Chat, ChatRef } from "../../../utils/types";
import { deleteChat } from "../../../utils/chat-utils";
import DeleteAllAction from "../../actions/DeleteAllAction";
import DeleteAction from "../../actions/DeleteAction";
import { defaultAdvancedSettings } from "../../../data/default-advanced-settings";

/**
 * Action to delete a chat.
 * @param props.chat The chat to delete.
 * @param props.chats The chat manager object.
 * @param props.setCurrentChat The function to update the current chat.
 * @returns An action component.
 */
export const DeleteChatAction = (props: {
  chat: Chat;
  revalidateChats: () => Promise<void>;
  setCurrentChat: (value: React.SetStateAction<Chat | undefined>) => void;
  settings: typeof defaultAdvancedSettings;
}) => {
  return (
    <DeleteAction
      deleteMethod={async () => {
        props.setCurrentChat(undefined);
        await deleteChat(props.chat.id);
        await props.revalidateChats();
      }}
      objectType="Chat"
      settings={props.settings}
    />
  );
};

/**
 * Action to delete all chats.
 * @param props.chatRefs The list of chat references.
 * @param props.setCurrentChat The function to update the current chat.
 * @returns An action component.
 */
export const DeleteAllChatsAction = (props: {
  chatRefs: ChatRef[];
  revalidateChats: () => Promise<void>;
  setCurrentChat: (value: React.SetStateAction<Chat | undefined>) => void;
  settings: typeof defaultAdvancedSettings;
}) => {
  return (
    <DeleteAllAction
      deleteMethod={async () => {
        props.setCurrentChat(undefined);
        for (let i = 0; i < props.chatRefs.length; i++) {
          const ref = props.chatRefs[i];
          await deleteChat(ref);
        }
        await props.revalidateChats();
      }}
      objectType="Chats"
      settings={props.settings}
    />
  );
};
