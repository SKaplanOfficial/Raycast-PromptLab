import { ActionPanel, Color, Icon, List } from "@raycast/api";
import CommandListDetail from "./CommandListDetail";
import RunCommandAction from "./actions/RunCommandAction";
import ShareCommandAction from "./actions/ShareCommandAction";
import { CopyCommandActionsSection } from "./actions/CopyCommandActions";
import { CommandControlsActionsSection } from "./actions/CommandControlActions";
import { AdvancedActionSubmenu } from "../actions/AdvancedActionSubmenu";
import { Command } from "../../utils/types";
import { defaultAdvancedSettings } from "../../data/default-advanced-settings";

export default function CommandListItem(props: {
  command: Command;
  previousCommand: string;
  commands: Command[];
  setCommands: React.Dispatch<React.SetStateAction<Command[]>>;
  settings: typeof defaultAdvancedSettings;
}) {
  const { command, previousCommand, commands, setCommands, settings } = props;
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
