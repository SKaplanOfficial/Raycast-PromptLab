import { useEffect, useState } from "react";
import { ChatManager, ChatRef } from "../utils/types";
import { installDefaults } from "../utils/file-utils";
import { loadRefs } from "../utils/chat-utils";

/**
 * A hook that provides access to the chats.
 * @returns A {@link ChatManager} object containing references to the chats and a function to revalidate them.
 */
export function useChats() {
  const [chatRefs, setChatRefs] = useState<ChatRef[]>([]);
  const [loadingChats, setLoadingChats] = useState<boolean>(true);

  useEffect(() => {
    Promise.resolve(installDefaults()).then(() => {
      Promise.resolve(revalidateChats());
    });
  }, []);

  const revalidateChats = async () => {
    setLoadingChats(true);
    const refs = await loadRefs();
    setChatRefs(refs);
    setLoadingChats(false);
  };

  return {
    chatRefs,
    loadingChats,
    revalidateChats,
  } as ChatManager;
}
