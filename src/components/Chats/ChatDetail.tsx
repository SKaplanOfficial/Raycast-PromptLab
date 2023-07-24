/**
 * @file Chats/ChatDetail.tsx
 *
 * @summary Detail view for a chat.
 * @author Stephen Kaplan <skaplanofficial@gmail.com>
 *
 * Created at     : 2023-07-11 23:03:12
 * Last modified  : 2023-07-12 00:40:26
 */

import { List } from "@raycast/api";

import { Chat, ChatRef, MessageType } from "../../utils/types";

/**
 * List item detail for a chat.
 *
 * @param props.chatRef A reference to a chat.
 * @param props.currentChat The currently active chat.
 * @returns The list item detail component, or null if the chat is not active.
 */
export default function ChatDetail(props: { chatRef: ChatRef; currentChat?: Chat; currentResponse: string }) {
  const { chatRef, currentChat, currentResponse } = props;
  
  if (currentChat?.id == chatRef.id) {
    // The conversation up to the current response
    const convo = currentChat.conversation
    .map((message, index) => {
      if (message.type == MessageType.RESPONSE && (index < currentChat.conversation.length - 1 || currentResponse.trim().length == 0)) {
        return `\t${message.text.match(/(?<!###).*?(?<=###)(.*?:)(.*?)(?=###).*(?!###)/)?.[2] || message.text}`
          .split("\n")
          .join("\n\t");
      } else if (message.type == MessageType.QUERY) {
        return `${
          message.text.match(/(?<!###).*(?<=###)(.*)(?=###).*?(?!###).*?(?=<END OF QUERY>)/)?.[1] || message.text
        }\n---\n`;
      } else {
        return "";
      }
    })
    .join("\n\n")

    // The current response, separated so that we can support streaming responses
    const lastResponse = currentResponse.trim().length > 0 ? `\t${currentResponse.trim().split("\n")
    .join("\n\t")}` : ""

    return (<List.Item.Detail
      markdown={
          convo + lastResponse
      }
    />)
    }

  return null;
}
