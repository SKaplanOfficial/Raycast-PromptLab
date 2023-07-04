import {
  Color,
  Icon,
  LaunchType,
  MenuBarExtra,
  getPreferenceValues,
  launchCommand,
  openCommandPreferences,
} from "@raycast/api";
import { useEffect } from "react";
import { Command } from "./utils/types";
import { useCachedState } from "@raycast/utils";
import SuggestedCommandsSection from "./components/Commands/SuggestedCommandsSection";
import * as Insights from "./utils/insights";
import { useCommands } from "./hooks/useCommands";
import { commandCategories } from "./utils/constants";

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

export default function PromptLabMenubar() {
  const { commands: allCommands } = useCommands();
  const [commands, setCommands] = useCachedState<Command[]>("--menubar-commands", []);

  const preferences = getPreferenceValues<CommandPreferences>();

  useEffect(() => {
    if (allCommands.length > 0) {
      return;
    }

    const menubarCommands = allCommands.filter((cmd) => cmd.showInMenuBar).sort((a, b) => a.name.localeCompare(b.name));
    setCommands(menubarCommands);
  }, [allCommands]);

  const commandsToItems = (commands: Command[]) =>
    commands.map((cmd) => (
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
            await Insights.add(
              `Command Execution`,
              `Executed command ${cmd.name} via the menubar`,
              ["commands", "menubar"],
              []
            );
            await launchCommand({
              name: "search-commands",
              type: LaunchType.UserInitiated,
              arguments: { commandName: cmd.name },
            });
          }
        }}
      />
    ));

  const menuItems = commandsToItems(commands.filter((cmd) => (preferences.displayFavorites ? !cmd.favorited : true)));
  const favorites = preferences.displayFavorites ? commandsToItems(commands?.filter((cmd) => cmd.favorited)) : [];
  const hasOtherCategory = commands?.some(
    (cmd) =>
      !cmd.favorited && (!cmd.categories?.length || (cmd.categories?.length == 1 && cmd.categories[0] == "Other"))
  );

  const categories = preferences.displayCategories
    ? commands
        ?.reduce(
          (acc, cmd) => {
            if (cmd.categories) {
              cmd.categories.forEach((category) => {
                if (!acc.includes(category)) {
                  acc.push(category);
                }
              });
            }
            return acc;
          },
          hasOtherCategory ? (["Other"] as string[]) : []
        )
        .map((category) => {
          const cmdCategory = commandCategories.find((cmdCategory) => cmdCategory.name == category) || commandCategories[0]

          return (
          <MenuBarExtra.Submenu title={category} icon={preferences.displayIcons ? { source: cmdCategory.icon, tintColor: preferences.displayColors ? cmdCategory.color : undefined } : undefined} key={category}>
            {commandsToItems(
              commands.filter(
                (cmd) =>
                  !cmd.favorited &&
                  (cmd.categories?.includes(category) || (category == "Other" && !cmd.categories?.length))
              )
            )}
          </MenuBarExtra.Submenu>
        )})
    : [];

  return (
    <MenuBarExtra
      icon={{ source: { light: "black-beaker-icon.svg", dark: "white-beaker-icon.svg" } }}
      isLoading={commands == undefined}
    >
      {favorites.length > 0 ? <MenuBarExtra.Section title="Favorites">{favorites}</MenuBarExtra.Section> : null}

      {categories.length > 0 ? (
        <MenuBarExtra.Section title="Categories">{categories as JSX.Element[]}</MenuBarExtra.Section>
      ) : favorites.length > 0 ? (
        <MenuBarExtra.Section>{menuItems}</MenuBarExtra.Section>
      ) : menuItems.length == 0 ? (
        <MenuBarExtra.Item
          title="No Commands Enabled"
          tooltip="To display commands in this menu, enable the 'Show In Menu Bar' checkbox in their settings."
        />
      ) : (
        menuItems
      )}

      <SuggestedCommandsSection />

      <MenuBarExtra.Section>
        {preferences.showAllCommandsShortcut ? (
          <MenuBarExtra.Item
            title="All Commands"
            icon={preferences.displayIcons ? Icon.PlusMinusDivideMultiply : undefined}
            onAction={() => launchCommand({ name: "search-commands", type: LaunchType.UserInitiated })}
          />
        ) : null}
        {preferences.showNewCommandShortcut ? (
          <MenuBarExtra.Item
            title="New Command"
            icon={preferences.displayIcons ? Icon.PlusSquare : undefined}
            onAction={() => launchCommand({ name: "create-command", type: LaunchType.UserInitiated })}
          />
        ) : null}
        {preferences.showNewChatShortcut ? (
          <MenuBarExtra.Item
            title="New Chat"
            icon={preferences.displayIcons ? Icon.Message : undefined}
            onAction={() => launchCommand({ name: "chat", type: LaunchType.UserInitiated })}
          />
        ) : null}
        {preferences.showPromptLabStoreShortcut ? (
          <MenuBarExtra.Item
            title="PromptLab Store"
            icon={preferences.displayIcons ? Icon.Store : undefined}
            onAction={() => launchCommand({ name: "discover-commands", type: LaunchType.UserInitiated })}
          />
        ) : null}
        <MenuBarExtra.Item
          title="Preferences..."
          icon={preferences.displayIcons ? Icon.Gear : undefined}
          onAction={() => openCommandPreferences()}
        />
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}
