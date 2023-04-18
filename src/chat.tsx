import {
  Action,
  ActionPanel,
  Clipboard,
  Form,
  popToRoot,
  showToast,
  Toast,
  unstable_AI,
  useUnstableAI,
} from "@raycast/api";
import { useState } from "react";
import { ERRORTYPE, useFileContents } from "./utils/file-utils";
import { useReplacements } from "./useReplacements";
import {
  replaceAppleScriptPlaceholders,
  replaceFileSelectionPlaceholders,
  replaceOldAppleScriptPlaceholders,
  replaceShellScriptPlaceholders,
  replaceURLPlaceholders,
} from "./utils/command-utils";

export default function Command(props: { arguments: { initialQuery: string } }) {
  const { initialQuery } = props.arguments;
  const { selectedFiles, contentPrompts, errorType } = useFileContents({
    minNumFiles: 0,
    acceptedFileExtensions: undefined,
    useMetadata: true,
    useAudioDetails: true,
    useSubjectClassification: true,
    useRectangleDetection: true,
    useBarcodeDetection: true,
    useFaceDetection: true,
  });
  const [query, setQuery] = useState<string>();
  const [response, setResponse] = useState<string>();
  const [previousResponse, setPreviousResponse] = useState<string>();
  const [creativity, setCreativity] = useState<number>(0.7);
  const [creativityError, setCreativityError] = useState<string>();
  const [useFiles, setUseFiles] = useState<boolean>(initialQuery?.length > 0);

  // Set up ground rules for the chat
  const basePrompt = useFiles
    ? `I want you to act as an interactive information engine. I will provide information about the content of files, and then I will ask questions about those files. When I supply a question, you will respond with an answer based on the information I've provided and your own inferences. Respond in non-technical terms unless otherwise instructed. Limit your responses to 200 words. Here are the files:\n"""`
    : `I want you to act as an interactive information engine. When I supply a question, you will respond with an answer based on any information I've provided and your own inferences. `;

  // Input the file data
  let fullPrompt = basePrompt + (useFiles ? contentPrompts.join("\n") : "");

  // Set up for first query, or append the already provided one
  if (initialQuery == "" && !query?.length) {
    fullPrompt = fullPrompt + `""" Reply to this indicating that you are ready for my questions.`;
  } else {
    if (initialQuery.includes("Your last response:")) {
      fullPrompt = basePrompt + initialQuery.replace("\nMy input: ", "");
    } else if (query == undefined) {
      fullPrompt = fullPrompt + `"""\nMy input: ${initialQuery}`;
      setQuery(initialQuery);
    }
  }

  const replacements = useReplacements(undefined, selectedFiles);
  const runReplacements = async (prompt: string): Promise<string> => {
    let subbedPrompt = prompt;
    for (const key in replacements) {
      if (prompt.includes(key)) {
        subbedPrompt = subbedPrompt.replaceAll(key, await replacements[key]());
      }
    }

    // Replace complex placeholders (i.e. shell scripts, AppleScripts, etc.)
    subbedPrompt = await replaceOldAppleScriptPlaceholders(subbedPrompt);
    subbedPrompt = await replaceAppleScriptPlaceholders(subbedPrompt);
    subbedPrompt = await replaceShellScriptPlaceholders(subbedPrompt);
    subbedPrompt = await replaceURLPlaceholders(subbedPrompt);
    subbedPrompt = await replaceFileSelectionPlaceholders(subbedPrompt);
    return subbedPrompt;
  };

  // Run the first prompt
  const { data, isLoading } = useUnstableAI(fullPrompt, {
    execute: contentPrompts.length > 0 && (!query?.length || (initialQuery.length > 0 && !previousResponse?.length)),
    creativity: creativity,
  });

  // Report errors in starting up
  if (errorType) {
    let errorMessage = "";
    if (errorType == ERRORTYPE.FINDER_INACTIVE) {
      errorMessage = "Can't get selected files";
    } else if (errorType == ERRORTYPE.MIN_SELECTION_NOT_MET) {
      errorMessage = "Must select at least 1 file";
    } else if (errorType == ERRORTYPE.INPUT_TOO_LONG) {
      errorMessage = "Input too large";
    }

    showToast({
      title: "Couldn't Start PromptLab Chat",
      message: errorMessage,
      style: Toast.Style.Failure,
    });
    popToRoot();
  }

  return (
    <Form
      isLoading={isLoading || response == ""}
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Form Actions">
            <Action.SubmitForm
              title="Submit Query"
              onSubmit={async (values) => {
                const prevResponse = !values.responseField.length ? "" : values.responseField;
                setPreviousResponse(prevResponse);
                setResponse("");
                const queryIncludingInitialData =
                  fullPrompt +
                  (prevResponse.trim().length > 0
                    ? `\nYour last response: "${prevResponse.substring(0, 3996 - fullPrompt.length)}"`
                    : "") +
                  `\nNext input: ${values.userQueryField}\nYour response:`;

                const stream = unstable_AI.ask(await runReplacements(queryIncludingInitialData), {
                  creativity: creativity,
                });
                stream.on("data", (theData) => {
                  setResponse((x: string | undefined) => (x == undefined ? theData : x + theData));
                });
                await stream;
              }}
            />

            <Action
              title="Retry"
              onAction={async () => {
                setResponse("");
                const prevResponse = previousResponse == undefined ? "" : previousResponse;
                const queryIncludingInitialData =
                  fullPrompt +
                  (prevResponse.trim().length > 0
                    ? `\nYour last response: "${prevResponse.substring(0, 3996 - fullPrompt.length)}"}`
                    : "") +
                  `\nNext input: ${query}\nYour response:`;

                const stream = unstable_AI.ask(await runReplacements(queryIncludingInitialData), {
                  creativity: creativity,
                });
                stream.on("data", (theData) => {
                  setResponse((x: string | undefined) => (x == undefined ? theData : x + theData));
                });
                await stream;
              }}
            />
          </ActionPanel.Section>

          <ActionPanel.Section title="Clipboard Actions">
            <Action
              title="Paste From Clipboard"
              onAction={async () => {
                const clipboardText = await Clipboard.readText();
                setQuery(query == undefined ? clipboardText : query + clipboardText);
              }}
            />

            <Action.CopyToClipboard
              title="Copy Response"
              content={response == undefined ? data.trim() : response.trim()}
            />

            <Action.CopyToClipboard title="Copy Base Prompt" content={fullPrompt} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    >
      <Form.Description title="PromptLab Chat" text={selectedFiles ? selectedFiles.join(", ") : ""} />

      <Form.Checkbox
        label="Use Selected Files As Context"
        id="useFilesCheckbox"
        defaultValue={useFiles}
        onChange={setUseFiles}
      />

      <Form.TextArea id="userQueryField" title="Query" value={query || ""} onChange={(value) => setQuery(value)} />

      <Form.TextArea
        id="responseField"
        title="Response"
        value={
          response != undefined
            ? response.trim()
            : data
            ? data.trim() == ""
              ? "Ready for your questions."
              : data.trim()
            : "Loading response..."
        }
        onChange={() => null}
      />

      <Form.TextField
        id="creativityField"
        title="Creativity"
        defaultValue={creativity.toString()}
        onChange={(value) => {
          const floatVal = parseFloat(value);
          if (!floatVal || floatVal < 0 || floatVal > 1) {
            setCreativityError("Must be a nonnegative value between 0 and 1");
          } else {
            setCreativityError(undefined);
            setCreativity(floatVal);
          }
        }}
        error={creativityError}
        storeValue={true}
      />
    </Form>
  );
}
