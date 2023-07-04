import {
  Action,
  ActionPanel,
  Icon,
  Keyboard,
  LaunchType,
  Toast,
  getPreferenceValues,
  launchCommand,
  showToast,
} from "@raycast/api";
import CommandChatView from "../../Chats/CommandChatView";
import { Command, CommandOptions, ExtensionPreferences, StoreCommand } from "../../../utils/types";
import { getMenubarOwningApplication } from "../../../utils/context";
import { useEffect, useState } from "react";
import { logDebug } from "../../../utils/dev-utils";
import { saveResponse } from "../../../utils/command-utils";

/**
 * A command action that pastes the provided text into the current application.
 * @param props.content The text to paste.
 * @param props.commandSummary The summary of the command that is being pasted.
 * @returns A Paste action component.
 */
function PasteAction(props: { content: string; commandSummary: string }) {
  const { content, commandSummary } = props;
  const [currentApp, setCurrentApp] = useState<{ name: string; path: string }>();

  /**
   * Gets the active application and sets the current app state. The timeout will repeat until the component is unmounted by Raycast.
   */
  const getActiveApp = async (iter = 0) => {
    if (iter > 10) {
      return;
    }

    Promise.resolve(getMenubarOwningApplication(true) as Promise<{ name: string; path: string }>)
      .then((app) => {
        setCurrentApp(app);
      })
      .then(() => {
        setTimeout(() => {
          logDebug("Getting active app...");
          getActiveApp(iter + 1);
        }, 1000);
      });
  };

  useEffect(() => {
    Promise.resolve(getActiveApp());
  }, []);

  return (
    <Action.Paste
      title={`Paste ${commandSummary}${currentApp ? ` To ${currentApp.name}` : ``}`}
      content={content}
      shortcut={{ modifiers: ["cmd"], key: "p" }}
      icon={currentApp ? { fileIcon: currentApp.path } : Icon.Clipboard}
    />
  );
}

function SaveResponseAction(props: {
  command: Command | StoreCommand;
  options: CommandOptions;
  responseText: string;
  promptText: string;
  files: string[];
}) {
  const { command, options, responseText, promptText, files } = props;
  return (
    <Action
      title="Save Response"
      icon={Icon.SaveDocument}
      shortcut={{ modifiers: ["cmd"], key: "s" }}
      onAction={async () => {
        const toast = await showToast({ title: "Saving Response...", style: Toast.Style.Animated });
        const { status, outputPath, id } = await saveResponse(command, options, promptText, responseText, files);
        if (status) {
          toast.title = "Response Saved";
          toast.message = `The response was saved to: ${outputPath}`;
          toast.primaryAction = {
            title: "View Saved Response",
            onAction: () =>
              launchCommand({ name: "saved-responses", type: LaunchType.UserInitiated, fallbackText: id }),
          };
          toast.style = Toast.Style.Success;
        } else {
          toast.title = "Failed to Save Response";
          toast.style = Toast.Style.Failure;
        }
      }}
    />
  );
}

export default function ResponseActions(props: {
  command: Command | StoreCommand;
  commandSummary: string;
  options: CommandOptions;
  responseText: string;
  promptText: string;
  reattempt: () => void;
  files?: string[];
  listItem?: string;
  cancel: () => void;
  speaking?: boolean;
  stopSpeech?: () => void;
  restartSpeech?: () => void;
}) {
  const {
    command,
    commandSummary,
    options,
    responseText,
    promptText,
    reattempt,
    files,
    listItem,
    cancel,
    stopSpeech,
    speaking,
    restartSpeech,
  } = props;
  const preferences = getPreferenceValues<ExtensionPreferences>();

  const actions = [
    "copy-response-to-clipboard",
    "paste-to-active-app",
    "copy-prompt-to-clipboard",
    "open-chat",
    "regenerate",
    "save-response",
  ];

  actions.splice(actions.indexOf(preferences.primaryAction), 1);
  actions.unshift(preferences.primaryAction);

  const actionComponents = actions.map((action) => {
    switch (action) {
      case "copy-response-to-clipboard":
        return (
          <Action.CopyToClipboard
            key="copy-response-to-clipboard"
            title={`Copy ${commandSummary} To Clipboard`}
            content={responseText.trim()}
            shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
          />
        );
      case "paste-to-active-app":
        return <PasteAction key="paste-to-active-app" content={responseText} commandSummary={commandSummary} />;
      case "copy-prompt-to-clipboard":
        return (
          <Action.CopyToClipboard
            key="copy-prompt-to-clipboard"
            title={`Copy Prompt To Clipboard`}
            content={promptText.trim()}
            shortcut={{ modifiers: ["cmd", "shift"], key: "p" }}
          />
        );
      case "regenerate":
        return (
          <Action
            key="regenerate"
            title="Regenerate"
            onAction={reattempt}
            icon={Icon.ArrowClockwise}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
          />
        );
      case "open-chat":
        return (
          <Action.Push
            key="open-chat"
            title="Open Chat"
            target={
              <CommandChatView
                isLoading={false}
                command={command}
                options={options}
                prompt={promptText}
                response={responseText}
                revalidate={reattempt}
                cancel={cancel}
                useFiles={options.minNumFiles != undefined && options.minNumFiles > 0 ? true : false}
              />
            }
            icon={Icon.Message}
            shortcut={{ modifiers: ["cmd", "opt"], key: "c" }}
          />
        );
      case "save-response":
        return (
          <SaveResponseAction
            key="save-response"
            command={command}
            options={options}
            responseText={responseText}
            promptText={promptText}
            files={files || []}
          />
        );
    }
  });

  return (
    <ActionPanel>
      {listItem?.length ? (
        <ActionPanel.Section title="Item Actions">
          <Action.CopyToClipboard title="Copy Item" content={listItem} />
        </ActionPanel.Section>
      ) : null}

      {options.speakResponse ? (
        <ActionPanel.Section title="Speech Actions">
          {speaking ? (
            <Action
              title="Stop Speech"
              icon={Icon.SpeakerOff}
              onAction={() => stopSpeech?.()}
              shortcut={{ modifiers: ["cmd", "shift"], key: "s" }}
            />
          ) : (
            <Action
              title="Restart Speech"
              icon={Icon.SpeakerOff}
              onAction={() => restartSpeech?.()}
              shortcut={{ modifiers: ["cmd", "shift"], key: "r" }}
            />
          )}
        </ActionPanel.Section>
      ) : null}

      <ActionPanel.Section title="Prompt Actions">{actionComponents}</ActionPanel.Section>

      {files?.length ? (
        <ActionPanel.Section title="File Actions">
          {files?.map((file, index) => (
            <Action.Open
              title={`Open ${file.split("/").at(-1)}`}
              target={file}
              shortcut={{ modifiers: ["cmd", "shift"], key: (index + 1).toString() as Keyboard.KeyEquivalent }}
              key={file}
            />
          ))}
        </ActionPanel.Section>
      ) : null}
    </ActionPanel>
  );
}
