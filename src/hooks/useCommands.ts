import { useEffect, useState } from "react";
import { Command } from "../utils/types";
import { Color, Icon, LocalStorage } from "@raycast/api";
import { installDefaults } from "../utils/file-utils";
import crypto from "crypto";
import { useCachedState } from "@raycast/utils";

export function useCommands() {
  const [commands, setCommands] = useCachedState<Command[]>("--commands", []);
  const [templates, setTemplates] = useCachedState<Command[]>("--command-templates", []);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadCommands = async () => {
    // Get the command settings
    setIsLoading(true);
    const items = await LocalStorage.allItems();

    const commandObjs = Object.entries(items)
      .filter(([key]) => !key.startsWith("--") && !key.startsWith("id-"))
      .map(([, value]) => JSON.parse(value));
    const existingIDs = commandObjs.map((command) => command.id);

    // Ensure that all commands have a unique ID
    const newCommands: Command[] = [];
    const newTemplates: Command[] = [];
    for (const command of commandObjs) {
      const newCommand = { ...command };
      if (!command.id || (command.id && command.id.trim().length == 0)) {
        let newID = `CM${crypto.randomUUID()}`;
        while (existingIDs.includes(newID)) {
          newID = `CM${crypto.randomUUID()}`;
        }
        newCommand.id = newID;
        await LocalStorage.setItem(newCommand.name, JSON.stringify(newCommand));
      }

      if (command.template) {
        newTemplates.push(newCommand);
      } else {
        newCommands.push(newCommand);
      }
    }
    setCommands(newCommands.sort((a, b) => (a.name > b.name ? 1 : -1)));
    setTemplates(newTemplates.sort((a, b) => (a.name > b.name ? 1 : -1)));

    // Get the command names
    setIsLoading(false);
  };

  useEffect(() => {
    Promise.resolve(installDefaults()).then(() => {
      Promise.resolve(loadCommands());
    });
  }, []);

  const revalidate = async () => {
    return await loadCommands();
  };

  return {
    commands: commands,
    templates: templates,
    setCommands: setCommands,
    setTemplates: setTemplates,
    isLoading: isLoading,
    revalidate: revalidate,
  };
}

/**
 * Creates a new command.
 * @param newData The data for the new command.
 * @returns The new command object.
 */
export const createCommand = async (newData: Command & { [key: string]: string | boolean }) => {
  // Check if the name is empty
  if (!newData.name) {
    return false;
  }

  // Create the command object
  const newCommand: Command = {
    id: `CM${crypto.randomUUID()}`,
    name: newData.name,
    description: newData.description || "",
    icon: newData.icon || Icon.Gear,
    iconColor: newData.iconColor || Color.PrimaryText,
    favorited: newData.favorited || false,
    prompt: newData.prompt || "",
    model: newData.model || "",
    minNumFiles: newData.minNumFiles || "0",
    acceptedFileExtensions: newData.acceptedFileExtensions || "",
    useMetadata: newData.useMetadata || false,
    useSoundClassification: newData.useSoundClassification || false,
    useAudioDetails: newData.useAudioDetails || false,
    useSubjectClassification: newData.useSubjectClassification || false,
    useRectangleDetection: newData.useRectangleDetection || false,
    useBarcodeDetection: newData.useBarcodeDetection || false,
    useFaceDetection: newData.useFaceDetection || false,
    useHorizonDetection: newData.useHorizonDetection || false,
    useSaliencyAnalysis: newData.useSaliencyAnalysis || false,
    outputKind: newData.outputKind || "detail",
    showResponse: newData.showResponse || true,
    speakResponse: newData.speakResponse || false,
    useSpeech: newData.useSpeech || false,
    showInMenuBar: newData.showInMenuBar || false,
    actionScript: newData.actionScript || "",
    scriptKind: newData.scriptKind || "AppleScript",
    setupConfig: newData.setupConfig || undefined,
    installedFromStore: newData.installedFromStore || false,
    setupLocked: newData.setupLocked || false,
    temperature: newData.temperature || "1.0",
    categories: newData.categories || [],
    author: newData.author || "",
    website: newData.website || "",
    version: newData.version || "1.0.0",
    requirements: newData.requirements || "",
    template: newData.template || false,
  };

  // Save the command
  await LocalStorage.setItem(newData.name, JSON.stringify(newCommand));
  return newCommand;
};

/**
 * Updates a command.
 * @param command The command to update.
 * @param newData The new data for the command.
 * @returns A promise that resolves once the command is updated.
 */
export const updateCommand = async (command: Command, newData: Command) => {
  if (command.name !== newData.name) {
    await LocalStorage.removeItem(command.name);
  }
  await LocalStorage.setItem(newData.name, JSON.stringify(newData));
};

/**
 * Deletes a command.
 * @param command The command to delete.
 * @returns A promise that resolves once the command is deleted.
 */
export const deleteCommand = async (command: Command) => {
  await LocalStorage.removeItem(command.name);
};

/**
 * Obtains a dummy command object without actually creating a new command.
 * @returns A command object with placeholder values.
 */
export const dummyCommand = (): Command => {
  return {
    id: `CM${crypto.randomUUID()}`,
    name: "",
    description: "",
    icon: Icon.Gear,
    iconColor: Color.Red,
    favorited: false,
    prompt: "",
    model: "",
    minNumFiles: "0",
    acceptedFileExtensions: "",
    useMetadata: false,
    useSoundClassification: false,
    useAudioDetails: false,
    useSubjectClassification: false,
    useRectangleDetection: false,
    useBarcodeDetection: false,
    useFaceDetection: false,
    useHorizonDetection: false,
    useSaliencyAnalysis: false,
    outputKind: "detail",
    showResponse: true,
    speakResponse: false,
    useSpeech: false,
    showInMenuBar: false,
    actionScript: "",
    scriptKind: "AppleScript",
    setupConfig: undefined,
    installedFromStore: false,
    setupLocked: false,
    temperature: "1.0",
    categories: [],
    author: "",
    website: "",
    version: "1.0.0",
    requirements: "",
    template: false,
  };
};