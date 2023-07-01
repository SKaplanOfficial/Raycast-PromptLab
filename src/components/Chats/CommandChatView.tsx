import { useState } from "react";
import useModel from "../../hooks/useModel";
import { Chat, CommandOptions, ExtensionPreferences } from "../../utils/types";
import { List, getPreferenceValues } from "@raycast/api";
import { useChats } from "../../hooks/useChats";
import ChatListItem from "./ChatListItem";

export default function CommandChatView(props: {
  isLoading: boolean;
  commandName: string;
  options: CommandOptions;
  prompt: string;
  response: string;
  revalidate: () => void;
  cancel: null | (() => void);
  initialQuery?: string;
  useFiles?: boolean;
  useConversation?: boolean;
  autonomousFeatures?: boolean;
}) {
    const { isLoading, commandName, options, prompt, response, revalidate, cancel, initialQuery, useFiles, useConversation, autonomousFeatures } = props;

    const [query, setQuery] = useState<string>(initialQuery || "");
    const [input, setInput] = useState<string>("");
    const [sentQuery, setSentQuery] = useState<string>("");

    const [currentResponse, setCurrentResponse] = useState<string>(response);
    const [previousResponse, setPreviousResponse] = useState<string>("");

    const [currentChat, setCurrentChat] = useState<Chat>();
    const [previousChat, setPreviousChat] = useState<Chat>();

    const preferences = getPreferenceValues<ExtensionPreferences>();

    const [runningModel, setRunningModel] = useState<boolean>(false);
    const [runningCommand, setRunningCommand] = useState<boolean>(false);
    const model = useModel("", sentQuery, sentQuery, "1.0", runningModel)
    const chats = useChats();

    return (
        <List
            isLoading={isLoading}
            isShowingDetail={true}
            searchBarPlaceholder="Enter a query"
            onSearchTextChange={setQuery}
            filtering={false}
            
        >
            <List.EmptyView title="No Chats Yet" />
            {chats.chats.map((chat) => (
                <ChatListItem
                    chat={chat}
                    chats={chats}
                    key={chat.name}
                />
            ))}
        </List>
    )
}
