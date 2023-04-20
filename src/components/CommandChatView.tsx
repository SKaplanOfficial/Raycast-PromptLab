import { Action, ActionPanel, Form, Icon } from "@raycast/api";
import { useEffect, useState } from "react";
import useModel from "../utils/useModel";
import { CommandOptions } from "../utils/types";
import { useFileContents } from "../utils/file-utils";

export default function CommandChatView(props: {
  isLoading: boolean;
  commandName: string;
  options: CommandOptions;
  prompt: string;
  response: string;
  revalidate: () => void;
}) {
  const { isLoading, commandName, options, prompt, response, revalidate } = props;
  const [query, setQuery] = useState<string>(prompt);
  const [sentQuery, setSentQuery] = useState<string>("");
  const [currentResponse, setCurrentResponse] = useState<string>(response);
  const [previousResponse, setPreviousResponse] = useState<string>("");
  const [enableModel, setEnableModel] = useState<boolean>(false);
  const [queryError, setQueryError] = useState<string>();

  useEffect(() => {
    setCurrentResponse(response);
  }, [response]);

  const { selectedFiles, contentPrompts, loading: contentIsLoading } = useFileContents(options);

  const { data, isLoading: loading, revalidate: reattempt } = useModel(prompt, sentQuery, "", enableModel);

  useEffect(() => {
    if (data.length > 0) {
      setCurrentResponse(data);
    }
  }, [data]);

  useEffect(() => {
    if (!loading && enableModel == true) {
      setEnableModel(false);
    }
  }, [enableModel, loading]);

  return (
    <Form
      isLoading={isLoading || loading || contentIsLoading}
      navigationTitle={commandName}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Submit Query"
            onSubmit={async (values) => {
              // Ensure query is not empty
              if (!values.queryField.length) {
                setQueryError("Query cannot be empty");
                return;
              }
              setQueryError(undefined);

              // Store the previous response and clear the response field
              setPreviousResponse(values.responseField);
              setCurrentResponse("");

              // Enable the model, prepend instructions to the query, and reattempt
              setEnableModel(true);
              setSentQuery(
                `${
                  values.responseField.length > 0
                    ? `You are an interactive chatbot, and I am giving you instructions. ${
                        values.useFilesCheckbox && selectedFiles?.length
                          ? `You will use the following details about selected files as context as you consider my input. Here are the file details: ###${contentPrompts.join(
                              "\n"
                            )}###\n\n`
                          : ``
                      }You will also use your previous response as context. Your previous response was: ###${
                        values.responseField
                      }###\nMy next input is: ###`
                    : ""
                }${values.queryField}###`
              );
              reattempt();
            }}
          />

          <Action
            title="Regenerate"
            icon={Icon.ArrowClockwise}
            onAction={previousResponse.length > 0 ? reattempt : revalidate}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
          />

          <ActionPanel.Section title="Clipboard Actions">
            <Action.CopyToClipboard
              title="Copy Response"
              content={currentResponse}
              shortcut={{ modifiers: ["cmd"], key: "c" }}
            />
            <Action.CopyToClipboard
              title="Copy Previous Response"
              content={previousResponse}
              shortcut={{ modifiers: ["cmd", "opt"], key: "p" }}
            />
            <Action.CopyToClipboard
              title="Copy Sent Prompt"
              content={sentQuery}
              shortcut={{ modifiers: ["cmd", "shift"], key: "s" }}
            />
            <Action.CopyToClipboard
              title="Copy Base Prompt"
              content={prompt}
              shortcut={{ modifiers: ["cmd", "shift"], key: "p" }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    >
      <Form.Checkbox label="Use Selected Files As Context" id="useFilesCheckbox" defaultValue={false} />

      <Form.TextArea
        id="queryField"
        title="Query"
        value={query || ""}
        onChange={(value) => setQuery(value)}
        error={queryError}
      />

      <Form.TextArea id="responseField" title="Response" value={currentResponse.trim()} onChange={() => null} />
    </Form>
  );
}
