import { useEffect, useState } from "react";
import { Command } from "./types";
import { installDefaults } from "../files/file-utils";
import { loadCommands } from "./Command";

/**
 * Returns a stateful list of commands.
 * @returns An object containing the list of commands, a function to set the list of commands, and some utility functions.
 */
export function useCommands() {
  const [commands, setCommands] = useState<Command[]>([]);
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

  const revalidate = async () => {
    return loadCommands();
  };

  const names = () => {
    return commands.map((command) => command.name);
  };

  const favorites = () => {
    return commands.filter((command) => command.favorited);
  };

  return {
    /**
     * The list of commands.
     */
    commands: commands,

    /**
     * Force-sets the list of commands. Use with caution.
     */
    setCommands: setCommands,

    /**
     * True if the commands are still loading, false otherwise.
     */
    isLoading: isLoading,

    /**
     * Revalidates the list of commands.
     * @returns A promise that resolves onces the commands are revalidated.
     */
    revalidate: revalidate,

    /**
     * Gets the names of all commands.
     * @returns An array of command names.
     */
    names,

    /**
     * Gets all favorited commands.
     * @returns An array of favorited commands.
     */
    favorites: favorites,
  };
}
