import { Detail } from "@raycast/api";
import ResponseActions from "../ResponseActions";

export default function CommandDetailView(props: {
  isLoading: boolean;
  commandName: string;
  prompt: string;
  response: string;
  revalidate: () => void;
  selectedFiles: string[] | undefined;
}) {
  const { isLoading, commandName, prompt, response, revalidate, selectedFiles } = props;

  return (
    <Detail
      isLoading={isLoading}
      markdown={response}
      navigationTitle={commandName}
      actions={
        <ResponseActions
          commandSummary="Response"
          responseText={response}
          promptText={prompt}
          reattempt={revalidate}
          files={selectedFiles}
        />
      }
    />
  );
}
