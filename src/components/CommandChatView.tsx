import { Action, ActionPanel, Form, Icon } from "@raycast/api";
import { useEffect, useState } from "react";
import useModel from "../utils/useModel";
import { CommandOptions } from "../utils/types";
import { useFileContents } from "../utils/file-utils";
import { useReplacements } from "../hooks/useReplacements";
import {
  replaceAppleScriptPlaceholders,
  replaceFileSelectionPlaceholders,
  replaceShellScriptPlaceholders,
  replaceURLPlaceholders,
} from "../utils/command-utils";
import { runAppleScript } from "run-applescript";

export default function CommandChatView(props: {
  isLoading: boolean;
  commandName: string;
  options: CommandOptions;
  prompt: string;
  response: string;
  revalidate: () => void;
  cancel: () => void;
  initialQuery?: string;
  useFiles?: boolean;
  useConversation?: boolean;
  useAIControl?: boolean;
}) {
  const {
    isLoading,
    commandName,
    options,
    prompt,
    response,
    revalidate,
    cancel,
    initialQuery,
    useFiles,
    useConversation,
    useAIControl,
  } = props;
  const [query, setQuery] = useState<string>(initialQuery || "");
  const [sentQuery, setSentQuery] = useState<string>("");
  const [currentResponse, setCurrentResponse] = useState<string>(response);
  const [previousResponse, setPreviousResponse] = useState<string>("");
  const [enableModel, setEnableModel] = useState<boolean>(false);
  const [queryError, setQueryError] = useState<string>();
  const [conversation, setConversation] = useState<string[]>([prompt]);
  const [aiControl, setAIControl] = useState<boolean>(false);

  useEffect(() => {
    if (initialQuery?.length) {
      setPreviousResponse(response);
      setCurrentResponse("");
      setConversation([prompt, response]);
      setSentQuery(initialQuery);
      setEnableModel(true);
    }
  }, []);

  useEffect(() => {
    setCurrentResponse(response);
  }, [response]);

  const {
    selectedFiles,
    contentPrompts,
    loading: contentIsLoading,
    revalidate: revalidateFiles,
  } = useFileContents(options);

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

  useEffect(() => {
    if (aiControl && !loading && currentResponse == data && enableModel == false) {
      try {
        runAppleScript(`use scripting additions
        try
        ${currentResponse.trim()}
        on error err
          display dialog "Error: " & err
        end try`);
      } catch (error) {
        console.log(error);
      }
    }
  }, [currentResponse]);

  const replacements = useReplacements(undefined, selectedFiles);
  const runReplacements = async (): Promise<string> => {
    let subbedPrompt = query;
    for (const key in replacements) {
      if (query.includes(key)) {
        subbedPrompt = subbedPrompt.replaceAll(key, await replacements[key]());
      }
    }

    // Replace complex placeholders (i.e. shell scripts, AppleScripts, etc.)
    subbedPrompt = await replaceAppleScriptPlaceholders(subbedPrompt);
    subbedPrompt = await replaceShellScriptPlaceholders(subbedPrompt);
    subbedPrompt = await replaceURLPlaceholders(subbedPrompt);
    subbedPrompt = await replaceFileSelectionPlaceholders(subbedPrompt);
    return subbedPrompt;
  };

  return (
    <Form
      isLoading={isLoading || loading || contentIsLoading}
      navigationTitle={commandName}
      actions={
        <ActionPanel>
          {isLoading || loading ? (
            <Action
              title="Cancel"
              onAction={() => {
                previousResponse.length > 0 ? setEnableModel(false) : cancel();
              }}
            />
          ) : (
            <Action.SubmitForm
              title="Submit Query"
              onSubmit={async (values) => {
                // Ensure query is not empty
                if (!values.queryField.length) {
                  setQueryError("Query cannot be empty");
                  return;
                }
                setQueryError(undefined);
                setAIControl(values.useAIControlCheckbox);

                // Store the previous response and clear the response field
                setPreviousResponse(values.responseField);
                setCurrentResponse("");

                const convo = [...conversation];
                convo.push(values.responseField);
                convo.push(values.queryField);
                while (values.queryField + convo.join("\n").length > 3900) {
                  convo.shift();
                }
                setConversation(convo);

                await (async () => {
                  revalidateFiles();
                  if (!contentIsLoading) {
                    return true;
                  }
                });

                // Enable the model, prepend instructions to the query, and reattempt
                const subbedPrompt = await runReplacements();
                setEnableModel(true);
                setSentQuery(
                  `${
                    values.responseField.length > 0
                      ? `You are an interactive chatbot, and I am giving you instructions. You will use this base prompt for context as you consider my next input. Here is the prompt: ###${prompt}###\n\n${
                          values.useFilesCheckbox && selectedFiles?.length
                            ? ` You will also consider the following details about selected files. Here are the file details: ###${contentPrompts.join(
                                "\n"
                              )}###\n\n`
                            : ``
                        }${
                          values.useConversationCheckbox
                            ? `You will also consider our conversation history. The history so far: ###${conversation.join(
                                "\n"
                              )}###`
                            : `You will also consider your previous response. Your previous response was: ###${values.responseField}###`
                        }${
                          values.useAIControlCheckbox
                            ? `You will use all of this context to generate an AppleScript which carries out the goal expressed in my next input. Your response must be a valid, complete AppleScript script. Do not provide any commentary or discussion other than the code.`
                            : ``
                        }\n\nMy next input is: ###`
                      : ""
                  }
                  ${subbedPrompt}###`
                );
                reattempt();
              }}
            />
          )}

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
      <Form.TextArea
        id="queryField"
        title="Query"
        value={query || ""}
        onChange={(value) => setQuery(value)}
        error={queryError}
        autoFocus={true}
      />

      <Form.Description title="" text="Tip: You can use placeholders in your query." />

      <Form.TextArea id="responseField" title="Response" value={currentResponse.trim()} onChange={() => null} />

      <Form.Checkbox
        label="Use Selected Files As Context"
        id="useFilesCheckbox"
        defaultValue={useFiles == undefined ? false : useFiles}
      />
      <Form.Checkbox
        label="Use Conversation As Context"
        id="useConversationCheckbox"
        defaultValue={useConversation == undefined ? true : useConversation}
      />
      <Form.Checkbox
        label="Allow AI To Control Computer (Experimental)"
        id="useAIControlCheckbox"
        defaultValue={useAIControl == undefined ? false : useAIControl}
      />

      <Form.Description title="Base Prompt" text={prompt} />
    </Form>
  );
}
