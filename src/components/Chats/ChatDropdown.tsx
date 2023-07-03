import { Color, Form, Icon } from "@raycast/api";
import { Chat, ChatRef } from "../../utils/types";

export default function ChatDropdown(props: {
  currentChat: Chat | undefined;
  chatRefs: ChatRef[];
  onChange: (value: string) => void;
}) {
  const { currentChat, chatRefs, onChange } = props;
  return (
    <Form.Dropdown
      title="Current Chat"
      id="currentChatField"
      value={currentChat ? currentChat.name : "new"}
      onChange={onChange}
    >
      {currentChat ? <Form.Dropdown.Item title="New Chat" value="" /> : null}
      {!currentChat ? <Form.Dropdown.Item title="New Chat" value="new" /> : null}

      {chatRefs.filter((ref) => ref.favorited).length > 0 ? (
        <Form.Dropdown.Section title="Favorites">
          {chatRefs
            .filter((ref) => ref.favorited)
            .map((ref) => (
              <Form.Dropdown.Item
                title={ref.name}
                value={ref.name}
                key={ref.name}
                icon={
                  ref.favorited
                    ? { source: Icon.StarCircle, tintColor: Color.Yellow }
                    : { source: ref.icon, tintColor: ref.iconColor }
                }
              />
            ))}
        </Form.Dropdown.Section>
      ) : null}

      {chatRefs
        .filter((ref) => !ref.favorited)
        .map((ref) => (
          <Form.Dropdown.Item
            title={ref.name}
            value={ref.name}
            key={ref.name}
            icon={{ source: ref.icon, tintColor: ref.iconColor }}
          />
        ))}
    </Form.Dropdown>
  );
}
