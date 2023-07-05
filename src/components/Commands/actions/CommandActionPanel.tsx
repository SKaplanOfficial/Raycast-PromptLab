/**
 * @file CommandActionPanel.tsx
 * @summary Action panel for command list views.
 * @author Stephen Kaplan <skaplanofficial@gmail.com>
 *
 * Created at     : 2023-07-05 00:08:19
 * Last modified  : yyyy-07-dd 09:49:48
 */

import { Fragment } from "react";

import { ActionPanel, Icon } from "@raycast/api";

import { defaultAdvancedSettings } from "../../../data/default-advanced-settings";
import { Command, StoreCommand, isCommand, isStoreCommand } from "../../../utils/types";
import AdvancedActionSubmenu from "../../actions/AdvancedActionSubmenu";
import { CommandControlsActionsSection, CreateFromTemplateMenu } from "./CommandControlActions";
import { CopyCommandActionsSection } from "./CopyCommandActions";
import NewCommandAction from "./NewCommandAction";
import RunCommandAction from "./RunCommandAction";
import ShareCommandAction from "./ShareCommandAction";
import InstallCommandAction from "./InstallCommandAction";

/**
 * Action panel for command list views.
 * @param props.command The command to display the action panel for, optional.
 * @param props.commands The list of commands.
 * @param props.setCommands The function to update the list of commands.
 * @param props.templates The list of templates.
 * @param props.setTemplates The function to update the list of templates.
 * @param props.settings The advanced settings.
 * @returns The action panel component.
 */
export default function CommandActionPanel(props: {
  command?: Command | StoreCommand;
  commands: Command[];
  setCommands: React.Dispatch<React.SetStateAction<Command[]>>;
  availableCommands?: StoreCommand[];
  templates?: Command[];
  setTemplates: React.Dispatch<React.SetStateAction<Command[]>>;
  settings: typeof defaultAdvancedSettings;
}) {
  const { command, commands, setCommands, availableCommands, templates, setTemplates, settings } = props;
  return (
    <ActionPanel>
      {command && !isStoreCommand(command) ? (
        <RunCommandAction command={command} setCommands={setCommands} settings={settings} />
      ) : null}
      {!command || !isStoreCommand(command) ? (
        <NewCommandAction setCommands={setCommands} setTemplates={setTemplates} />
      ) : null}

      {command && isStoreCommand(command) ? (
        <Fragment>
          <InstallCommandAction command={command} commands={commands} setCommands={setCommands} settings={settings} />
          {command.setupConfig?.length && command.setupConfig != "None" ? null : (
            <RunCommandAction command={command} settings={settings} />
          )}
          <CopyCommandActionsSection command={command} settings={settings} />
          <CommandControlsActionsSection
            command={command}
            availableCommands={availableCommands}
            commands={commands}
            setCommands={setCommands}
            settings={settings}
            setTemplates={setTemplates}
          />
        </Fragment>
      ) : null}

      {templates ? (
        <CreateFromTemplateMenu
          commands={commands}
          setCommands={setCommands}
          templates={templates}
          setTemplates={setTemplates}
        />
      ) : null}

      {command && isCommand(command) ? (
        <Fragment>
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
            setTemplates={setTemplates}
            settings={settings}
          />
        </Fragment>
      ) : null}

      <AdvancedActionSubmenu settings={settings} />
    </ActionPanel>
  );
}
