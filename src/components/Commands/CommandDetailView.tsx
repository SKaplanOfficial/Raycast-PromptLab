import { Detail } from "@raycast/api";
import ResponseActions from "./actions/ResponseActions";
import { Command, CommandOptions, StoreCommand } from "../../utils/types";
import { useSpeech } from "../../hooks/useSpeech";

export default function CommandDetailView(props: {
  isLoading: boolean;
  command: Command | StoreCommand;
  options: CommandOptions;
  prompt: string;
  response: string;
  revalidate: () => void;
  cancel: () => void;
  selectedFiles: string[] | undefined;
}) {
  const { isLoading, command, options, prompt, response, revalidate, cancel, selectedFiles } = props;
  const { speaking, stopSpeech, restartSpeech } = useSpeech(options, isLoading, response);

  const lines = [];
  const parsedResponse = response.replaceAll("<", "\\<").split("\n");
  let inCodeBlock = false;
  for (const line of parsedResponse) {
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
    }

    if (!inCodeBlock) {
      lines.push(line + "\n");
    } else {
      lines.push(line);
    }
  }

  return (
    <Detail
      isLoading={isLoading}
      markdown={`# ${command.name}\n${lines.join("\n")}`}
      navigationTitle={command.name}
      actions={
        <ResponseActions
          command={command}
          options={options}
          commandSummary="Response"
          responseText={response}
          promptText={prompt}
          reattempt={revalidate}
          cancel={cancel}
          files={selectedFiles}
          speaking={speaking}
          stopSpeech={stopSpeech}
          restartSpeech={restartSpeech}
        />
      }
    />
  );
}
