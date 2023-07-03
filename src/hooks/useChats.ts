import { useEffect, useState } from "react";
import { ChatRef } from "../utils/types";
import * as fs from "fs";
import { environment } from "@raycast/api";
import { installDefaults } from "../utils/file-utils";
import { loadRefs } from "../utils/chat-utils";

/**
 * A hook that provides access to the chats.
 * @returns The chats and a function to reload them.
 */
export function useChats() {
  const [chatRefs, setChatRefs] = useState<ChatRef[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Create the chats directory if it doesn't exist
    const supportPath = environment.supportPath;
    const chatsDir = `${supportPath}/chats`;
    if (!fs.existsSync(chatsDir)) {
      fs.mkdirSync(chatsDir);
    }

    Promise.resolve(installDefaults()).then(() => {
      Promise.resolve(revalidate());
    });
  }, []);

  const revalidate = async () => {
    setIsLoading(true);
    const refs = await loadRefs();
    setChatRefs(refs);
    setIsLoading(false);
  };

  return {
    /**
     * The chat references that are currently loaded.
     */
    chatRefs: chatRefs,

    /**
     * True if the chats are currently loading, false otherwise.
     */
    isLoading: isLoading,

    /**
     * Reloads the chats.
     */
    revalidate: revalidate,
  };
}
