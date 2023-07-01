import { Color, Form, Icon } from "@raycast/api";
import { Chat, ChatManager } from "../../utils/types";

export default function ChatDropdown(props: {
  currentChat: Chat | undefined;
  chats: ChatManager;
  onChange: (value: string) => void;
}) {
  const { currentChat, chats, onChange } = props;
  return (
    <Form.Dropdown
      title="Current Chat"
      id="currentChatField"
      value={currentChat ? currentChat.name : "new"}
      onChange={onChange}
    >
      {currentChat ? <Form.Dropdown.Item title="New Chat" value="" /> : null}
      {!currentChat ? <Form.Dropdown.Item title="New Chat" value="new" /> : null}

      {chats.favorites().length > 0 ? (
        <Form.Dropdown.Section title="Favorites">
          {chats.favorites().map((chat) => (
            <Form.Dropdown.Item
              title={chat.name}
              value={chat.name}
              key={chat.name}
              icon={
                chat.favorited
                  ? { source: Icon.StarCircle, tintColor: Color.Yellow }
                  : { source: chat.icon, tintColor: chat.iconColor }
              }
            />
          ))}
        </Form.Dropdown.Section>
      ) : null}

      {chats.chats
        .filter((chat) => !chat.favorited)
        .map((chat) => (
          <Form.Dropdown.Item
            title={chat.name}
            value={chat.name}
            key={chat.name}
            icon={{ source: chat.icon, tintColor: chat.iconColor }}
          />
        ))}
    </Form.Dropdown>
  );
}
