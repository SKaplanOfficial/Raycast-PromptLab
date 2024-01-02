import { createContext, useContext, useEffect, useState } from "react";
import { Command } from "../../commands/types";
import { installDefaults } from "../../files/file-utils";
import { loadCommands } from "../../commands/Command";
import { CommandCategory } from "../../types";
import { useCachedState } from "@raycast/utils";

type CommandListContextState = {
  /**
   * The list of all commands.
   */
  commands: Command[];

  /**
   * Updates the list of commands.
   * @param commands The new list of commands.
   */
  setCommands: (commands: Command[]) => void;

  /**
   * The list of all command names.
   */
  commandNames: string[];

  /**
   * The list of favorited commands.
   */
  favoriteCommands: Command[];

  /**
   * The list of non-favorited commands.
   */
  nonfavoriteCommands: Command[];

  /**
   * Whether the commands are loading.
   */
  isLoading: boolean;

  /**
   * Revalidates the list of commands from local storage.
   * @returns A promise resolving to the updated list of commands.
   */
  revalidateCommands: () => Promise<Command[]>;

  /**
   * Returns a list of commands matching the given category.
   * @param category The category to match.
   * @returns The list of matching commands.
   */
  commandsMatchingCategory: (category: string | CommandCategory) => Command[];
};

const CommandListContextDefaultState: CommandListContextState = {
  commands: [],
  setCommands: () => {},
  commandNames: [],
  favoriteCommands: [],
  nonfavoriteCommands: [],
  isLoading: true,
  revalidateCommands: async () => [],
  commandsMatchingCategory: () => [],
};

export const CommandListContext = createContext<CommandListContextState>(CommandListContextDefaultState);

export function useCommandListContextState() {
  const [commands, setCommands] = useCachedState<Command[]>("promptlab-commands", []);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.resolve(installDefaults()).then(() => {
      setIsLoading(true);
      Promise.resolve(loadCommands()).then((newCommands) => {
        setCommands(newCommands);
        setIsLoading(false);
      });
    });
  }, []);

  async function revalidateCommands() {
    const newCommands = await loadCommands();
    updateCommands(newCommands);
    return newCommands;
  }

  function updateCommands(newCommands: Command[]) {
    setCommands(newCommands);
  }

  function commandsMatchingCategory(category: string | CommandCategory) {
    const categoryName = typeof category === "string" ? category : category.name;
    return commands?.filter((command) => command.categories?.includes(categoryName) || categoryName == "All") || [];
  }

  return {
    commands,
    setCommands: updateCommands,
    commandNames: commands?.map((command) => command.name) || [],
    favoriteCommands: commands?.filter((command) => command.favorited) || [],
    nonfavoriteCommands: commands?.filter((command) => !command.favorited) || [],
    isLoading,
    revalidateCommands,
    commandsMatchingCategory,
  };
}

export function useCommandListContext() {
  return useContext(CommandListContext);
}

export default CommandListContext;
