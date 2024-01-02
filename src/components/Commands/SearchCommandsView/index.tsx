import { List, getPreferenceValues } from "@raycast/api";
import { ExtensionPreferences, searchPreferences } from "../../../lib/types";
import { useCachedState } from "@raycast/utils";
import { useEffect, useState } from "react";
import { COMMAND_CATEGORIES } from "../../../lib/constants";
import { useCommandListContext } from "../../../lib/contexts/commands";
import CategoryDropdown from "../../CategoryDropdown";
import CommandResponse from "../CommandResponse";
import FavoriteCommandsSection from "./FavoriteCommandsSection";
import NonFavoriteCommandsSection from "./NonFavoriteCommandsSection";
import CommandCategoryList from "./CommandCategoryList";

type SearchCommandsViewProps = {
  /**
   * A command name or ID to search for.
   */
  commandName: string;

  /**
   * Input to the command.
   */
  queryInput: string;
};

/**
 * Main view for the 'My PromptLab Commands' command.
 * @returns Either a list of commands or a command response.
 */
export default function SearchCommandsView(props: SearchCommandsViewProps) {
  const { commandName, queryInput } = props;
  const [searchText, setSearchText] = useState<string | undefined>(
    commandName == undefined || queryInput ? undefined : commandName.trim(),
  );
  const [previousCommand] = useCachedState<string>("promptlab-previous-command", "");
  const [targetCategory, setTargetCategory] = useState<string>("All");
  const preferences = getPreferenceValues<searchPreferences & ExtensionPreferences>();
  const {
    commands,
    setCommands,
    commandNames,
    isLoading: loadingCommands,
    commandsMatchingCategory,
  } = useCommandListContext();

  useEffect(() => {
    if (!loadingCommands) {
      if (searchText == undefined && !commandNames.includes(commandName)) {
        setSearchText(commandName);
      }
    }
  }, [loadingCommands]);

  if (commandNames.includes(commandName) || commands.map((cmd) => cmd.id).includes(commandName)) {
    const command = commands.find((cmd) => cmd.id == commandName || cmd.name == commandName);
    if (!command) {
      return null;
    }
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

  const shownCommands = commandsMatchingCategory(targetCategory);
  const sortedCommands = shownCommands.sort((a, b) => a.name.localeCompare(b.name));
  const sortedFavorites = sortedCommands.filter((command) => command.favorited);
  const sortedNonFavorites = sortedCommands.filter((command) => !command.favorited);
  const visibleCategories = preferences.groupByCategory
    ? COMMAND_CATEGORIES.filter((category) => {
        const commandsInCategory = shownCommands?.filter((command) => {
          return (!command.categories?.length && category.name == "Other") || command.categories?.[0] == category.name;
        });
        return commandsInCategory?.length;
      })
    : [];

  let searchBarPlaceholder = "Search ";
  if (shownCommands.length == 1) {
    searchBarPlaceholder += "commands...";
  } else if (shownCommands.length) {
    searchBarPlaceholder += `${shownCommands.length} command${shownCommands.length > 1 ? "s" : ""}...`;
  }

  return (
    <List
      isLoading={loadingCommands}
      searchText={loadingCommands ? "" : searchText}
      onSearchTextChange={setSearchText}
      filtering={true}
      isShowingDetail={!loadingCommands}
      searchBarPlaceholder={searchBarPlaceholder}
      searchBarAccessory={<CategoryDropdown isLoading={loadingCommands} onSelection={setTargetCategory} />}
    >
      <List.EmptyView title="No Custom Commands" />
      <FavoriteCommandsSection
        favoriteCommands={sortedFavorites}
        previousCommand={previousCommand}
        visible={!!sortedFavorites.length && !preferences.groupByCategory}
      />
      <NonFavoriteCommandsSection
        nonfavoriteCommands={sortedNonFavorites}
        previousCommand={previousCommand}
        visible={!!sortedNonFavorites.length && !preferences.groupByCategory}
      />
      <CommandCategoryList visibleCategories={visibleCategories} />
    </List>
  );
}
