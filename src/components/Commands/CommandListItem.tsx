import { Color, Icon, List } from "@raycast/api";
import CommandListDetail from "./CommandListDetail";
import { Command } from "../../utils/types";
import { defaultAdvancedSettings } from "../../data/default-advanced-settings";
import CommandActionPanel from "./actions/CommandActionPanel";

export default function CommandListItem(props: {
  command: Command;
  previousCommand: string;
  commands: Command[];
  templates: Command[];
  setCommands: React.Dispatch<React.SetStateAction<Command[]>>;
  setTemplates: React.Dispatch<React.SetStateAction<Command[]>>;
  settings: typeof defaultAdvancedSettings;
}) {
  const { command, previousCommand, commands, setCommands, setTemplates, templates, settings } = props;
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
        <CommandActionPanel
          command={command}
          commands={commands}
          setCommands={setCommands}
          templates={templates}
          setTemplates={setTemplates}
          settings={settings}
        />
      }
    />
  );
}
