/**
 * @file search-commands.tsx
 *
 * @summary Raycast command to search for commands in the PromptLab extension.
 * @author Stephen Kaplan <skaplanofficial@gmail.com>
 *
 * Created at     : 2023-07-05 00:01:04
 * Last modified  : yyyy-07-dd 02:44:58
 */

import { useState } from "react";

import { getPreferenceValues, List } from "@raycast/api";
import { useCachedState } from "@raycast/utils";

import CategoryDropdown from "./components/CategoryDropdown";
import CommandListItem from "./components/Commands/CommandListItem";
import CommandResponse from "./components/Commands/CommandResponse";
import SuggestedCommandsSection from "./components/Commands/SuggestedCommandsSection";
import { useAdvancedSettings } from "./hooks/useAdvancedSettings";
import { useCommands } from "./hooks/useCommands";
import { commandCategories } from "./utils/constants";
import { Command, ExtensionPreferences, searchPreferences } from "./utils/types";
import CommandActionPanel from "./components/Commands/actions/CommandActionPanel";

export default function SearchCommand(props: { arguments: { commandName: string; queryInput: string } }) {
  const { commandName, queryInput } = props.arguments;
  const { commands, templates, setCommands, setTemplates, isLoading: loadingCommands } = useCommands();
  const [previousCommand] = useCachedState<string>("promptlab-previous-command", "");
  const [targetCategory, setTargetCategory] = useState<string>("All");
  const [searchText, setSearchText] = useState<string | undefined>(
    commandName == undefined || queryInput ? undefined : commandName.trim()
  );
  const { advancedSettings } = useAdvancedSettings();
  const preferences = getPreferenceValues<searchPreferences & ExtensionPreferences>();

  const command = commands.find((cmd) => cmd.id == commandName || cmd.name == commandName);
  if (command) {
    return (
      <CommandResponse
        command={command}
        prompt={command.prompt}
        input={queryInput}
        options={{
          ...command,
          minNumFiles: parseInt(command.minNumFiles || "0"),
          acceptedFileExtensions:
            command.acceptedFileExtensions?.length && command.acceptedFileExtensions !== "None"
              ? command.acceptedFileExtensions?.split(",").map((item) => item.trim())
              : undefined,
        }}
        setCommands={setCommands}
      />
    );
  }

  let listItems =
    commands
      .filter((command) => command.categories?.includes(targetCategory) || targetCategory == "All")
      .map((command) => (
        <CommandListItem
          command={command}
          previousCommand={previousCommand}
          commands={commands}
          templates={templates}
          setCommands={setCommands}
          settings={advancedSettings}
          key={command.id}
          setTemplates={setTemplates}
        />
      )) || [];

  // Group commands by category, if enabled
  if (preferences.groupByCategory && targetCategory == "All") {
    listItems = commandCategories
      .reduce((acc, category) => {
        const categoryCommands = commands.filter((command) => {
          // If a command has no categories, it is considered to be in the "Other" category
          return (!command.categories?.length && category.name == "Other") || command.categories?.[0] == category.name;
        });
        const categoryListItems = listItems.filter((item) => {
          // Add list items for commands in the current category
          return categoryCommands.map((command) => command.name).includes(item.props.title);
        });

        // Only add a section if there are commands in the current category
        if (categoryListItems.length) {
          acc.push(
            <List.Section title={category.name} key={category.name}>
              {categoryListItems}
            </List.Section>
          );
        }
        return acc;
      }, [] as JSX.Element[])
      .sort((a, b) => a.props.title.localeCompare(b.props.title));
  }

  const shownCommands =
    commands.filter((command) => command.categories?.includes(targetCategory) || targetCategory == "All") || [];

  const [favorites, otherCommands] = shownCommands.reduce(
    (acc, command) => {
      command.favorited ? acc[0].push(command) : acc[1].push(command);
      return acc;
    },
    [[], []] as [Command[], Command[]]
  );

  return (
    <List
      isLoading={loadingCommands}
      searchText={loadingCommands ? "" : searchText}
      onSearchTextChange={(text) => setSearchText(text)}
      filtering={true}
      isShowingDetail={!loadingCommands && commands.length > 0}
      searchBarPlaceholder={`Search ${
        !shownCommands.length
          ? "commands..."
          : `${shownCommands.length} command${shownCommands.length > 1 ? "s" : ""}...`
      }`}
      searchBarAccessory={loadingCommands ? null : <CategoryDropdown onSelection={setTargetCategory} />}
      actions={
        <CommandActionPanel
          commands={commands}
          setCommands={setCommands}
          templates={templates}
          setTemplates={setTemplates}
          settings={advancedSettings}
        />
      }
    >
      <List.EmptyView
        title="No Custom Commands"
        description="Create a command to get started."
        icon={{ source: "no-view.png" }}
      />

      {favorites.length && !preferences.groupByCategory ? (
        <List.Section title="Favorites">
          {listItems.filter((item) => favorites.map((command) => command.name).includes(item.props.command.name))}
        </List.Section>
      ) : null}

      <SuggestedCommandsSection
        commands={commands}
        templates={templates}
        setCommands={setCommands}
        setTemplates={setTemplates}
        previousCommand={previousCommand}
        settings={advancedSettings}
      />

      {otherCommands.length && !preferences.groupByCategory ? (
        <List.Section title={favorites.length ? `Other Commands` : `All Commands`}>
          {listItems.filter((item) => otherCommands.map((command) => command.name).includes(item.props.command.name))}
        </List.Section>
      ) : null}
      {preferences.groupByCategory ? listItems : null}
    </List>
  );
}
