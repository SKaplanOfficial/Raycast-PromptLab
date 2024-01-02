import { ActionPanel, Color, Icon, List } from "@raycast/api";
import CommandListDetail from "../../CommandListDetail";
import RunCommandAction from "../../actions/RunCommandAction";
import ViewPreviousRunsAction from "../../actions/ViewPreviousRunsAction";
import ShareCommandAction from "../../actions/ShareCommandAction";
import { CopyCommandActionsSection } from "../../actions/CopyCommandActions";
import { CommandControlsActionsSection } from "../../actions/CommandControlActions";
import { AdvancedActionSubmenu } from "../../../actions/AdvancedActionSubmenu";
import { Command } from "../../../../lib/commands/types";
import { AdvancedSettings } from "../../../../data/default-advanced-settings";
import { useCommandListContext } from "../../../../lib/contexts/commands";

type CommandListItemProps = {
  /**
   * The command to display.
   */
  command: Command;

  /**
   * The name of the previously executed command.
   */
  previousCommand: string;

  /**
   * The user's advanced settings.
   */
  settings: AdvancedSettings;
};

/**
 * A list item representing a PromptLab command.
 * @returns A {@link List.Item} component.
 */
export default function CommandListItem(props: CommandListItemProps) {
  const { command, previousCommand, settings } = props;
  const { commands, setCommands } = useCommandListContext();

  return (
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
        {
          icon: previousCommand == command.name ? { source: Icon.Clock, tintColor: Color.SecondaryText } : undefined,
          tooltip: previousCommand == command.name ? "Previous Command" : undefined,
        },
        {
          icon: command.showInMenuBar ? { source: Icon.AppWindowList, tintColor: Color.SecondaryText } : undefined,
          tooltip: command.showInMenuBar ? "Shown in Menu Bar" : undefined,
        },
      ]}
      detail={<CommandListDetail command={command} />}
      actions={
        <ActionPanel>
          <RunCommandAction command={command} setCommands={setCommands} settings={settings} />
          {command.runs?.length ? (
            <ViewPreviousRunsAction command={command} setCommands={setCommands} settings={settings} />
          ) : null}
          <ShareCommandAction command={command} settings={settings} />

          <ActionPanel.Submenu
            title="Copy Command Data..."
            icon={Icon.Clipboard}
            shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
          >
            <CopyCommandActionsSection command={command} showTitle={false} settings={settings} />
          </ActionPanel.Submenu>

          <CommandControlsActionsSection
            command={command}
            commands={commands}
            setCommands={setCommands}
            settings={settings}
          />

          <AdvancedActionSubmenu settings={settings} />
        </ActionPanel>
      }
    />
  );
}
