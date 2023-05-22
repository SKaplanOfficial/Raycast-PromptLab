import { Icon, LaunchType, LocalStorage, MenuBarExtra, launchCommand, openExtensionPreferences } from "@raycast/api";
import { useEffect, useState } from "react";
import { Command } from "./utils/types";
import { useCachedState } from "@raycast/utils";
import { installDefaults } from "./utils/file-utils";

export default function PromptLabMenubar() {
    const [commands, setCommands] = useCachedState<Command[]>("--commands", []);

    useEffect(() => {
        /* Add default commands if necessary, then get all commands */
        Promise.resolve(installDefaults()).then(() => {
          Promise.resolve(LocalStorage.allItems()).then((commandData) => {
            const allCommands = Object.values(commandData).filter(
              (cmd, index) =>
                !Object.keys(commandData)[index].startsWith("--") && !Object.keys(commandData)[index].startsWith("id-")
            ).map((cmd) => JSON.parse(cmd) as Command);
            const menubarCommands = allCommands.filter((cmd) => cmd.showInMenuBar);
            setCommands(menubarCommands);
          });
        });
      }, []);

    const menuItems = commands?.map((cmd) => <MenuBarExtra.Item
      title={cmd.name}
      icon={{ source: cmd.icon, tintColor: cmd.iconColor }}
      tooltip={cmd.description}
      key={cmd.name}
      onAction={async (event) => {
        if (event.type == "left-click") {
         await launchCommand({ name: "search-commands", type: LaunchType.UserInitiated, arguments: { commandName: cmd.name } })
        }
      }}
    />)

    return <MenuBarExtra
        icon={Icon.Stars}
        isLoading={commands == undefined}
    >
        {menuItems.length == 0 ? <MenuBarExtra.Item title="No Commands Enabled" /> : menuItems}
        <MenuBarExtra.Section>
            <MenuBarExtra.Item title="New Chat" icon={Icon.Message} onAction={() => launchCommand({ name: "chat", type: LaunchType.UserInitiated })} />
            <MenuBarExtra.Item title="Preferences..." onAction={() => openExtensionPreferences()} />
        </MenuBarExtra.Section>
    </MenuBarExtra>
}