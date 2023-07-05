import { useCachedState } from "@raycast/utils";
import { Command, ExtensionPreferences } from "../../utils/types";
import { useEffect } from "react";
import {
  LaunchType,
  List,
  LocalStorage,
  MenuBarExtra,
  environment,
  getPreferenceValues,
  launchCommand,
} from "@raycast/api";
import CommandListItem from "./CommandListItem";
import { defaultAdvancedSettings } from "../../data/default-advanced-settings";
import * as Insights from "../../utils/insights";

interface CommandPreferences {
  showNewChatShortcut: boolean;
  showAllCommandsShortcut: boolean;
  showPromptLabStoreShortcut: boolean;
  showNewCommandShortcut: boolean;
  displayIcons: boolean;
  displayColors: boolean;
  displayFavorites: boolean;
  displayCategories: boolean;
  displaySuggestions: boolean;
}

export default function SuggestedCommandsSection(props: {
  commands?: Command[];
  templates?: Command[];
  previousCommand?: string;
  setCommands?: React.Dispatch<React.SetStateAction<Command[]>>;
  setTemplates?: React.Dispatch<React.SetStateAction<Command[]>>;
  settings?: typeof defaultAdvancedSettings;
}) {
  const { commands, templates, previousCommand, setCommands, setTemplates, settings } = props;
  const [frequentlyUsedCommands, setFrequentlyUsedCommands] = useCachedState<Command[]>(
    "--frequently-used-commands",
    []
  );

  const preferences = getPreferenceValues<ExtensionPreferences & CommandPreferences>();

  useEffect(() => {
    if (!preferences.useCommandStatistics) {
      return;
    }

    Promise.resolve(LocalStorage.allItems()).then((commandData) => {
      const allCommands = Object.values(commandData)
        .filter(
          (cmd, index) =>
            !Object.keys(commandData)[index].startsWith("--") && !Object.keys(commandData)[index].startsWith("id-")
        )
        .map((cmd) => JSON.parse(cmd) as Command)
        .sort((a, b) => a.name.localeCompare(b.name));
      const menubarCommands = allCommands.filter((cmd) => cmd.showInMenuBar);
      if (environment.commandName == "menubar-item") {
        // Set up for menubar view
        Insights.objectsByFrequency("_executions", "name", 3, menubarCommands).then((mostFrequentCommands) => {
          setFrequentlyUsedCommands(
            mostFrequentCommands.map((c) => allCommands.find((cmd) => cmd.name == c) as Command)
          );
        });
      } else {
        // Set up for list view
        const favorites = allCommands.filter((cmd) => cmd.favorited);
        Insights.objectsByFrequency("_executions", "name", 3, [...favorites, ...menubarCommands]).then(
          (mostFrequentCommands) => {
            setFrequentlyUsedCommands(
              mostFrequentCommands.map((c) => allCommands.find((cmd) => cmd.name == c) as Command)
            );
          }
        );
      }
    });
  }, []);

  if (!commands?.length) {
    return null;
  }

  const listItems = preferences.useCommandStatistics
    ? frequentlyUsedCommands.map((cmd) =>
        environment.commandName == "menubar-item" ? (
          <MenuBarExtra.Item
            title={cmd.name}
            icon={
              preferences.displayIcons
                ? { source: cmd.icon, tintColor: preferences.displayColors ? cmd.iconColor : undefined }
                : undefined
            }
            tooltip={cmd.description}
            key={cmd.name}
            onAction={async (event) => {
              if (event.type == "left-click") {
                await launchCommand({
                  name: "search-commands",
                  type: LaunchType.UserInitiated,
                  arguments: { commandName: cmd.name },
                });
              }
            }}
          />
        ) : (
          <CommandListItem
            command={cmd}
            previousCommand={previousCommand || ""}
            commands={commands || []}
            setCommands={setCommands || (() => null)}
            settings={settings || defaultAdvancedSettings}
            key={cmd.id}
            templates={templates || []}
            setTemplates={setTemplates || (() => null)}
          />
        )
      )
    : [];

  return !preferences.displaySuggestions || listItems.length == 0 ? null : environment.commandName == "menubar-item" ? (
    <MenuBarExtra.Section title="Suggested Commands">{listItems}</MenuBarExtra.Section>
  ) : (
    <List.Section title="Suggested Commands">{listItems}</List.Section>
  );
}
