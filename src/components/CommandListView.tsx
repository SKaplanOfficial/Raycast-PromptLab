import { List } from "@raycast/api";
import ResponseActions from "../ResponseActions";

export default function CommandListView(props: {
  isLoading: boolean;
  commandName: string;
  prompt: string;
  response: string;
  revalidate: () => void;
  selectedFiles: string[] | undefined;
}) {
  const { isLoading, commandName, prompt, response, revalidate, selectedFiles } = props;

  return (
    <List
      isLoading={isLoading}
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
    >
      {response
        .split("~~~")
        .filter((item) => {
          return item.match(/^[\S]*.*$/g) != undefined;
        })
        .map((item, index) => (
          <List.Item
            title={item.trim()}
            key={`item${index}`}
            actions={
              <ResponseActions
                commandSummary="Response"
                responseText={response}
                promptText={prompt}
                reattempt={revalidate}
                files={selectedFiles}
                listItem={item.trim()}
              />
            }
          />
        ))}
    </List>
  );
}
