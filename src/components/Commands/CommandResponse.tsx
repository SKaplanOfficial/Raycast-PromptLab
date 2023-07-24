import {
  closeMainWindow,
  getPreferenceValues,
  LocalStorage,
  showHUD,
  showToast,
  Toast,
  useNavigation,
} from "@raycast/api";
import { useEffect, useState } from "react";
import { Command, CommandOptions, ERRORTYPE, ExtensionPreferences, StoreCommand } from "../../utils/types";
import { runActionScript, runReplacements } from "../../utils/command-utils";
import useModel from "../../hooks/useModel";
import CommandDetailView from "./CommandDetailView";
import CommandListView from "./CommandListView";
import CommandGridView from "./CommandGridView";
import { useCachedState } from "@raycast/utils";
import { useModels } from "../../hooks/useModels";
import CommandSetupForm from "./CommandSetupForm";
import SpeechInputView from "./SpeechInputView";
import { useFiles } from "../../hooks/useFiles";
import runModel from "../../utils/runModel";
import * as Insights from "../../utils/insights";

export default function CommandResponse(props: {
  command: Command | StoreCommand;
  prompt: string;
  input?: string;
  options: CommandOptions;
  setCommands?: React.Dispatch<React.SetStateAction<Command[]>>;
}) {
  const { command, prompt, input, setCommands } = props;
  const [substitutedPrompt, setSubstitutedPrompt] = useState<string>(prompt);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [shouldCancel, setShouldCancel] = useState<boolean>(false);
  const [previousCommand, setPreviousCommand] = useCachedState<string>("promptlab-previous-command", "");
  const [previousResponse, setPreviousResponse] = useCachedState<string>("promptlab-previous-response", "");
  const [previousPrompt, setPreviousPrompt] = useCachedState<string>("promptlab-previous-prompt", "");
  const [speechInput, setSpeechInput] = useState<string>();
  const [options, setOptions] = useState<CommandOptions>({ ...props.options });
  const { pop } = useNavigation();

  const models = useModels();
  const { selectedFiles, fileContents, isLoading: loading, error: errorType } = useFiles(options);

  const preferences = getPreferenceValues<ExtensionPreferences>();

  useEffect(() => {
    if (!preferences.useCommandStatistics) {
      return;
    }

    LocalStorage.allItems().then((items) => {
      const commands = Object.entries(items)
        .filter(([key]) => !key.startsWith("--") && !key.startsWith("id-"))
        .map(([, value]) => JSON.parse(value) as Command)
        .filter((cmd) => !cmd.template)
        .map((cmd) => cmd.name);

      Insights.objectsByFrequency("_executions", "name", 5).then((mostFrequentCommands) => {
        const modelInput = `I want you to recommend commands for me to use based on the following information. First, here are the commands that I most frequently use:\n\n${mostFrequentCommands.join(
          ", "
        )}\n\nNext, here are all of the other commands that I have installed:\n\n${commands
          .filter((c) => !mostFrequentCommands.includes(c))
          .join(
            "\n"
          )}\n\nFrom the second list, which commands are most complimentary to the ones that I use most frequently? Output the names of 3 complimentary commands, separated by commas. Do not output any other text.`;

        runModel(modelInput, modelInput, "").then((response) =>
          Insights.add(
            "Command Suggestions",
            `Your most frequently used PromptLab commands are: ${mostFrequentCommands.join(
              ", "
            )}.\n\nBased on those, consider using these commands, too: ${response}`,
            ["commands"],
            []
          )
        );
      });
    });
  }, []);

  useEffect(() => {
    if (
      loading ||
      (!loadingData && !(options.useSpeech == undefined || speechInput?.length)) ||
      ((!fileContents || !fileContents.contents.length) && options.minNumFiles)
    ) {
      return;
    }

    if (options.showResponse == false) {
      closeMainWindow();
    }

    const context = {
      ...fileContents,
      input: options.useSpeech != undefined || speechInput?.length ? speechInput || "" : input || "",
      selectedFiles: selectedFiles?.csv || "",
      previousCommand: previousCommand,
      previousResponse: previousResponse,
      previousPrompt: previousPrompt,
    };

    Promise.resolve(runReplacements(prompt, context, [command.name], options)).then((subbedPrompt) => {
      if (options.outputKind == "list" && subbedPrompt.trim().length > 0) {
        subbedPrompt +=
          "<Format the output as a single list with each item separated by '~~~'. Do not provide any other commentary, headings, or data.>";
      } else if (options.outputKind == "grid" && subbedPrompt.trim().length > 0) {
        subbedPrompt +=
          "<Format the output as a single list with each item separated by '~~~'. At the start of each item, put an object emoji or person emoji that represents that item followed by '$$$'. Do not provide any other commentary, headings, or data.>";
      }

      setSubstitutedPrompt(subbedPrompt);
      setLoadingData(false);
    });
  }, [loading, speechInput, fileContents]);

  const contentPromptString = fileContents?.contents || "";
  const fullPrompt = (substitutedPrompt.replaceAll("{{contents}}", contentPromptString) + contentPromptString).replace(
    /{{END}}(\n|.)*/,
    ""
  );

  const { data, isLoading, revalidate, error } = useModel(
    substitutedPrompt || "No prompt",
    fullPrompt,
    input || contentPromptString,
    options.temperature == undefined ? "1.0" : options.temperature,
    substitutedPrompt.trim().length > 0 &&
      !loadingData &&
      (!options.minNumFiles || (fileContents?.contents?.length != undefined && fileContents.contents.length > 0)) &&
      !shouldCancel &&
      (!options.useSpeech || (speechInput != "" && speechInput != undefined)),
    models.models.find((model) => model.id == options.model)
  );

  useEffect(() => {
    // Run post-response action script if one is defined
    if (
      data &&
      !isLoading &&
      options.actionScript != undefined &&
      options.actionScript.trim().length > 0 &&
      options.actionScript != "None"
    ) {
      Promise.resolve(
        runActionScript(
          options.actionScript,
          substitutedPrompt.replaceAll("{{contents}}", contentPromptString),
          input || contentPromptString,
          data,
          options.scriptKind
        )
      );
    }

    // Update previous command placeholders
    if (!loadingData && !loading && !isLoading && data.length) {
      setPreviousCommand(command.name);
      setPreviousResponse(text);
      setPreviousPrompt(fullPrompt);
    }
  }, [data, isLoading, loadingData]);

  // Report errors related to getting data from the model
  if (error) {
    showToast({
      title: error.toString(),
      style: Toast.Style.Failure,
    });
    return null;
  }

  // Report errors related to getting selected file contents
  if (errorType) {
    let errorMessage = "";
    if (errorType == ERRORTYPE.FINDER_INACTIVE) {
      errorMessage = "Can't get selected files";
    } else if (errorType == ERRORTYPE.MIN_SELECTION_NOT_MET) {
      errorMessage = `Must select at least ${options.minNumFiles} file${options.minNumFiles == 1 ? "" : "s"}`;
    } else if (errorType == ERRORTYPE.INPUT_TOO_LONG) {
      errorMessage = "Input too large";
    }

    showToast({
      title: "Failed Error Detection",
      message: errorMessage,
      style: Toast.Style.Failure,
    });
    return null;
  }

  // Get the text output for the response
  const text = `${data ? data : options.minNumFiles == 0 ? "Loading response..." : "Analyzing files..."}`;

  if (
    options.setupConfig &&
    !options.setupConfig.fields.every((field) => field.value != undefined && field.value.toString().length > 0)
  ) {
    return (
      <CommandSetupForm
        commandName={command.name}
        options={options}
        setCommands={setCommands}
        setOptions={setOptions}
      />
    );
  }

  // Don't show the response if the user has disabled it
  if (options.showResponse == false || (!loadingData && substitutedPrompt == "")) {
    if (options.showResponse == false) {
      Promise.resolve(showHUD(`Running '${command.name}'...`));
    }

    if (!loadingData && !loading && !isLoading && data.length) {
      if (options.showResponse == false) {
        Promise.resolve(showHUD("Done!"));
      }
      pop();
    }
    return null;
  }

  if (options.useSpeech && !speechInput) {
    return <SpeechInputView prompt={prompt} setSpeechInput={setSpeechInput} />;
  }

  if (options.outputKind == "list") {
    return (
      <CommandListView
        isLoading={
          loading ||
          isLoading ||
          loadingData ||
          (options.minNumFiles != undefined && options.minNumFiles != 0 && fileContents?.contents.length == 0)
        }
        command={command}
        options={options}
        prompt={fullPrompt}
        response={text}
        revalidate={revalidate}
        cancel={() => setShouldCancel(true)}
        selectedFiles={selectedFiles?.paths}
      />
    );
  } else if (options.outputKind == "grid") {
    return (
      <CommandGridView
        isLoading={
          loading ||
          isLoading ||
          loadingData ||
          (options.minNumFiles != undefined && options.minNumFiles != 0 && fileContents?.contents.length == 0)
        }
        command={command}
        options={options}
        prompt={fullPrompt}
        response={text}
        revalidate={revalidate}
        cancel={() => setShouldCancel(true)}
        selectedFiles={selectedFiles?.paths}
      />
    );
  } else if (options.outputKind == "chat") {
    return (
      null
      // <CommandChatView
      //   isLoading={
      //     loading ||
      //     isLoading ||
      //     loadingData ||
      //     (options.minNumFiles != undefined && options.minNumFiles != 0 && fileContents?.contents.length == 0)
      //   }
      //   command={command}
      //   options={options}
      //   prompt={fullPrompt}
      //   response={text}
      //   revalidate={revalidate}
      //   cancel={() => setShouldCancel(true)}
      // />
    );
  }

  return (
    <CommandDetailView
      isLoading={
        loading ||
        isLoading ||
        loadingData ||
        (options.minNumFiles != undefined && options.minNumFiles != 0 && fileContents?.contents.length == 0)
      }
      command={command}
      options={options}
      prompt={fullPrompt}
      response={text}
      revalidate={revalidate}
      cancel={() => setShouldCancel(true)}
      selectedFiles={selectedFiles?.paths}
    />
  );
}
