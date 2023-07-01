import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { Chat, ChatManager } from "../../utils/types";

export default function ChatListItem(props: {
    chat: Chat;
    chats: ChatManager;
}) {
    const { chat, chats } = props;



    return (
        <List.Item
            title={chat.name}
            icon={{ source: chat.icon, tintColor: chat.iconColor }}
            detail={
                <List.Item.Detail
                    markdown={chats.loadConversation(chat.name)?.join("\n\n")}
                />
            }
            actions={
                <ActionPanel>
                    <Action
                        title="Delete Chat"
                        icon={{ source: Icon.Trash }}
                        style={Action.Style.Destructive}
                        shortcut={{ modifiers: ["cmd", "shift"], key: "d" }}
                        onAction={async () => {
                            await chats.deleteChat(chat.name)
                            await chats.revalidate()
                        }}
                    />
                </ActionPanel>
            }
        />
    )
}