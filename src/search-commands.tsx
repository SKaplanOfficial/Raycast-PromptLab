import { ActionPanel, Color, getPreferenceValues, Icon, List } from "@raycast/api";
import { useEffect, useState } from "react";
import CommandResponse from "./components/CommandResponse";
import { categories, ExtensionPreferences, searchPreferences } from "./utils/types";
import CategoryDropdown from "./components/CategoryDropdown";
import { useCommands } from "./hooks/useCommands";
import CommandListDetail from "./components/CommandListDetail";
import RunCommandAction from "./components/actions/RunCommandAction";
import ShareCommandAction from "./components/actions/ShareCommandAction";
import { CopyCommandActionsSection } from "./components/actions/CopyCommandActions";
import { CommandControlsActionsSection } from "./components/actions/CommandControlActions";

export default function SearchCommand(props: { arguments: { commandName: string; queryInput: string } }) {
  const { commandName, queryInput } = props.arguments;
  const { commands, setCommands, commandNames, isLoading: loadingCommands } = useCommands();
  const [targetCategory, setTargetCategory] = useState<string>("All");
  const [searchText, setSearchText] = useState<string | undefined>(
    commandName == undefined || queryInput ? undefined : commandName.trim()
  );

  const preferences = getPreferenceValues<searchPreferences & ExtensionPreferences>();

  useEffect(() => {
    /* Add default commands if necessary, then get all commands */
    if (!loadingCommands) {
      if (searchText == undefined && !commandNames.includes(commandName)) {
        setSearchText(commandName);
      }
    }
  }, [loadingCommands]);

  if (commands && commandNames.includes(commandName)) {
    const command = commands[commandNames.indexOf(commandName)];
    return (
      <CommandResponse
        commandName={command.name}
        prompt={command.prompt}
        input={queryInput}
        options={{
          minNumFiles: parseInt(command.minNumFiles as unknown as string),
          acceptedFileExtensions:
            command.acceptedFileExtensions?.length && command.acceptedFileExtensions !== "None"
              ? command.acceptedFileExtensions?.split(",").map((item) => item.trim())
              : undefined,
          useMetadata: command.useMetadata,
          useSoundClassification: command.useSoundClassification,
          useAudioDetails: command.useAudioDetails,
          useBarcodeDetection: command.useBarcodeDetection,
          useFaceDetection: command.useFaceDetection,
          useRectangleDetection: command.useRectangleDetection,
          useSubjectClassification: command.useSubjectClassification,
          outputKind: command.outputKind,
          actionScript: command.actionScript,
          showResponse: command.showResponse,
          useSaliencyAnalysis: command.useSaliencyAnalysis,
          temperature: command.temperature,
          model: command.model,
          setupConfig: command.setupConfig,
          useSpeech: command.useSpeech,
          speakResponse: command.speakResponse,
        }}
        setCommands={setCommands}
      />
    );
  }

  let listItems =
    commands
      ?.filter((command) => command.categories?.includes(targetCategory) || targetCategory == "All")
      .sort((a, b) => (a.name > b.name ? 1 : -1))
      .map((command) => (
        <List.Item
          title={command.name}
          icon={{
            source: command.icon,
            tintColor: command.iconColor == undefined ? Color.PrimaryText : command.iconColor,
          }}
          key={command.name}
          accessories={[
            {
              icon: command.favorited ? { source: Icon.StarCircle, tintColor: Color.Yellow } : undefined,
              tooltip: command.favorited ? "Favorited" : undefined,
            },
          ]}
          detail={<CommandListDetail command={command} />}
          actions={
            <ActionPanel>
              <RunCommandAction command={command} />
              <ShareCommandAction command={command} />
              <CopyCommandActionsSection command={command} />
              <CommandControlsActionsSection command={command} commands={commands} setCommands={setCommands} />
            </ActionPanel>
          }
        />
      )) || [];

  // Group commands by category, if enabled
  if (preferences.groupByCategory && targetCategory == "All") {
    const sections: JSX.Element[] = [];
    categories.forEach((category) => {
      const categoryCommands = commands?.filter((command) => {
        // If a command has no categories, it is considered to be in the "Other" category
        return (!command.categories?.length && category == "Other") || command.categories?.includes(category);
      });
      const categoryListItems = listItems.filter((item) => {
        // Add list items for commands in the current category
        return categoryCommands?.map((command) => command.name).includes(item.props.title);
      });

      // Only add a section if there are commands in the current category
      if (categoryListItems.length) {
        sections.push(
          <List.Section title={category} key={category}>
            {categoryListItems}
          </List.Section>
        );
      }
    });
    listItems = sections;
  }

  const shownCommands =
    commands?.filter((command) => command.categories?.includes(targetCategory) || targetCategory == "All") || [];

  const favorites = shownCommands.filter((command) => command.favorited);
  const otherCommands = shownCommands.filter((command) => !command.favorited);

  return (
    <List
      isLoading={loadingCommands}
      searchText={loadingCommands ? "" : searchText}
      onSearchTextChange={(text) => setSearchText(text)}
      filtering={true}
      isShowingDetail={!loadingCommands}
      searchBarPlaceholder={`Search ${
        !commands || commands.length == 1
          ? "commands..."
          : `${shownCommands.length} command${shownCommands.length > 1 ? "s" : ""}...`
      }`}
      searchBarAccessory={loadingCommands ? null : <CategoryDropdown onSelection={setTargetCategory} />}
    >
      <List.EmptyView title="No Custom Commands" />
      {favorites.length ? (
        <List.Section title="Favorites">
          {listItems.filter((item) => favorites.map((command) => command.name).includes(item.props.title))}
        </List.Section>
      ) : null}
      {otherCommands.length ? (
        <List.Section title={favorites.length ? `Other Commands` : `All Commands`}>
          {listItems.filter((item) => otherCommands.map((command) => command.name).includes(item.props.title))}
        </List.Section>
      ) : null}
    </List>
  );
}
