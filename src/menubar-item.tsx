/**
 * @file menubar-item.tsx
 * 
 * @summary Menu bar item for the PromptLab extension.
 * @author Stephen Kaplan <skaplanofficial@gmail.com>
 *
 * Created at     : yyyy-07-dd 07:56:43 
 * Last modified  : yyyy-07-dd 07:56:43 
 */

import path from 'path';

import {
    environment, getPreferenceValues, Icon, launchCommand, LaunchType, MenuBarExtra, open,
    openCommandPreferences
} from '@raycast/api';

import { useCommands } from './hooks/useCommands';
import {
    ADVANCED_SETTINGS_FILENAME, COMMAND_CATEGORIES, CUSTOM_PLACEHOLDERS_FILENAME
} from './utils/constants';
import { Command } from './utils/types';

interface CommandPreferences {
  showNewChatShortcut: boolean;
  showAllCommandsShortcut: boolean;
  showSavedResponsesShortcut: boolean;
  showPromptLabStoreShortcut: boolean;
  showNewCommandShortcut: boolean;
  showCustomPlaceholdersShortcut: boolean;
  showAdvancedSettingsShortcut: boolean;
  displayIcons: boolean;
  displayColors: boolean;
  displayFavorites: boolean;
  displayCategories: boolean;
  displaySuggestions: boolean;
}

export default function PromptLabMenubar() {
  const { commands: allCommands } = useCommands();
  const preferences = getPreferenceValues<CommandPreferences>();

  /**
   * Converts a list of commands to a list of menubar items.
   * @param commands The commands to convert.
   * @returns The menubar items.
   */
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
            await launchCommand({
              name: "search-commands",
              type: LaunchType.UserInitiated,
              arguments: { commandName: cmd.name },
            });
          }
        }}
      />
    ));

  // Sort menubar-enabled commands into favorites and categories as needed
  const commands = allCommands.filter((cmd) => cmd.showInMenuBar);
  const menuItems = commandsToItems(commands.filter((cmd) => (preferences.displayFavorites ? !cmd.favorited : true)));
  const favorites = preferences.displayFavorites ? commandsToItems(commands.filter((cmd) => cmd.favorited)) : [];
  const categories = preferences.displayCategories
    ? commands
        .flatMap((cmd) => cmd.categories || ["Other"])
        .filter((category, index, arr) => arr.indexOf(category) == index)
        .sort()
        .map((category) => {
          const cmdCategory =
          COMMAND_CATEGORIES.find((cmdCategory) => cmdCategory.name == category) || COMMAND_CATEGORIES[0];

          return (
            <MenuBarExtra.Submenu
              title={category}
              icon={
                preferences.displayIcons
                  ? { source: cmdCategory.icon, tintColor: preferences.displayColors ? cmdCategory.color : undefined }
                  : undefined
              }
              key={category}
            >
              {commandsToItems(
                commands.filter(
                  (cmd) =>
                    !cmd.favorited &&
                    (cmd.categories?.includes(category) || (category == "Other" && !cmd.categories?.length))
                )
              )}
            </MenuBarExtra.Submenu>
          );
        })
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
        {preferences.showSavedResponsesShortcut ? (
          <MenuBarExtra.Item
            title="Saved Responses"
            icon={preferences.displayIcons ? Icon.SaveDocument : undefined}
            onAction={() => launchCommand({ name: "saved-responses", type: LaunchType.UserInitiated })}
          />
        ) : null}
        {preferences.showPromptLabStoreShortcut ? (
          <MenuBarExtra.Item
            title="PromptLab Store"
            icon={preferences.displayIcons ? Icon.Store : undefined}
            onAction={() => launchCommand({ name: "discover-commands", type: LaunchType.UserInitiated })}
          />
        ) : null}
        {preferences.showCustomPlaceholdersShortcut ? (
          <MenuBarExtra.Item
            title="Custom Placeholders"
            icon={preferences.displayIcons ? Icon.Underline : undefined}
            onAction={() => open(path.join(environment.supportPath, CUSTOM_PLACEHOLDERS_FILENAME))}
          />
        ) : null}
        {preferences.showAdvancedSettingsShortcut ? (
          <MenuBarExtra.Item
            title="Advanced Settings"
            icon={preferences.displayIcons ? Icon.WrenchScrewdriver : undefined}
            onAction={() => open(path.join(environment.supportPath, ADVANCED_SETTINGS_FILENAME))}
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
