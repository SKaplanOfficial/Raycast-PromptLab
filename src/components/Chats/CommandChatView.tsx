import { Form, LocalStorage, Toast, getPreferenceValues, showToast } from "@raycast/api";
import { useEffect, useState } from "react";
import useModel from "../../hooks/useModel";
import {
  Chat,
  ChatRef,
  Command,
  CommandOptions,
  ExtensionPreferences,
  MessageType,
  StoreCommand,
} from "../../utils/types";
import { runActionScript, runReplacements } from "../../utils/command-utils";
import { useChats } from "../../hooks/useChats";
import { useFiles as useFileContents } from "../../hooks/useFiles";
import { useAdvancedSettings } from "../../hooks/useAdvancedSettings";
import { ChatActionPanel } from "./actions/ChatActionPanel";
import { checkForPlaceholders } from "../../utils/placeholders";
import { useCachedState } from "@raycast/utils";
import ChatDropdown from "./ChatDropdown";
import * as Insights from "../../utils/insights";
import {
  addContextForQuery,
  addQuery,
  addResponse,
  addSystemMessage,
  checkExists,
  createChat,
  deleteChat,
  generateTitle,
  loadChat,
} from "../../utils/chat-utils";

interface CommandPreferences {
  useSelectedFiles: boolean;
  useConversationHistory: boolean;
  autonomousFeatures: boolean;
  basePrompt: string;
}

const defaultPromptInfo =
  "This is the query that will be sent to the AI model. You can use placeholders to add dynamic content.";

export default function CommandChatView(props: {
  isLoading: boolean;
  command?: Command | StoreCommand;
  options: CommandOptions;
  prompt: string;
  response: string;
  revalidate: () => void;
  cancel: null | (() => void);
  initialQuery?: string;
  useFiles?: boolean;
  useConversation?: boolean;
  autonomousFeatures?: boolean;
}) {
  const { isLoading, command, options, prompt, response, revalidate, cancel, initialQuery } = props;
  const [query, setQuery] = useState<string>(initialQuery || "");
  const [sentQuery, setSentQuery] = useState<string>("");
  const [currentResponse, setCurrentResponse] = useState<string>(response);
  const [previousResponse, setPreviousResponse] = useState<string>("");
  const [enableModel, setEnableModel] = useState<boolean>(false);
  const [input, setInput] = useState<string>();
  const [currentChat, setCurrentChat] = useState<Chat>();
  const [runningCommand, setRunningCommand] = useState<boolean>(false);
  const [promptInfo, setPromptInfo] = useState<string>("");

  // Preferences
  const preferences = getPreferenceValues<ExtensionPreferences & CommandPreferences>();
  const [useFiles, setUseFiles] = useState<boolean>(props.useFiles || preferences.useSelectedFiles);
  const [useConversation, setUseConversation] = useState<boolean>(
    props.useConversation || preferences.useConversationHistory
  );
  const [autonomousFeatures, setAutonomousFeatures] = useState<boolean>(
    props.autonomousFeatures || preferences.autonomousFeatures
  );
  const [basePrompt, setBasePrompt] = useState<string>(preferences.basePrompt || prompt);

  // Previous PromptLab command
  const [previousCommand] = useCachedState<string>("promptlab-previous-command", "");
  const [previousCommandResponse] = useCachedState<string>("promptlab-previous-response", "");
  const [previousPrompt] = useCachedState<string>("promptlab-previous-prompt", "");

  const { advancedSettings } = useAdvancedSettings();
  const { chatRefs, revalidate: revalidateChats } = useChats();
  const {
    selectedFiles,
    fileContents,
    isLoading: loadingSelectedFiles,
    revalidate: revalidateFiles,
  } = useFileContents({ ...options, minNumFiles: options.minNumFiles && query != "" ? 1 : 0 });
  const {
    data,
    isLoading: loadingData,
    dataTag,
    stopModel,
    revalidate: reQuery,
  } = useModel(basePrompt, sentQuery, sentQuery, "1.0", enableModel);

  /**
   * Begins a new chat after the user submits their first query.
   * @param userQuery The query to start the chat with.
   */
  const startNewChat = async (userQuery: string) => {
    const subbedQuery = await applyReplacements(userQuery);
    setSentQuery(subbedQuery);
    setEnableModel(true);
    reQuery();

    const newChatName = await generateTitle(subbedQuery);
    const options = {
      useSelectedFilesContext: useFiles,
      useConversationContext: useConversation,
      allowAutonomy: autonomousFeatures,
    };

    const chat = await createChat(newChatName, basePrompt, options);
    await revalidateChats();
    setCurrentChat(chat);
    if (chat) {
      if (preferences.useChatStatistics) {
        Insights.add("Create Chat", `Created chat: ${newChatName}`, ["chats"], []);
      }
      await addQuery(chat, userQuery);
    }
  };

  /**
   * Submits a query to the AI model, creating a new chat if necessary.
   * @param newQuery The query to submit.
   * @param sender The sender of the query, either "USER_QUERY" or "MODEL_RESPONSE".
   */
  const submitQuery = async (newQuery: string) => {
    if (newQuery.trim() == "" && query == undefined) {
      return;
    }

    setEnableModel(false);
    setPreviousResponse(currentResponse);
    setCurrentResponse("Loading...");

    if (currentChat == undefined) {
      startNewChat(newQuery || query);
    } else {
      const subbedQuery = await applyReplacements(newQuery);
      setSentQuery(subbedQuery);
      setEnableModel(true);
    }
  };

  /**
   * Applies placeholders to the query and adds context information.
   * @param query The query to apply placeholders to.
   * @returns A promise resolving to the query with all placeholders applied, plus additional context information.
   */
  const applyReplacements = async (query: string) => {
    const context = {
      ...fileContents,
      input: input || "",
      selectedFiles: selectedFiles?.csv || "",
      previousCommand: previousCommand,
      previousResponse: previousCommandResponse,
      previousPrompt: previousPrompt,
    };
    // Apply placeholders to the query
    const subbedQuery = await runReplacements(query, context, [command?.name || "PromptLab Chat"]);

    // Check for command placeholders
    const cmdMatch = data.match(/.*{{cmd:(.*?):(.*?)}}.*/);
    if (cmdMatch) {
      // Add a date timestamp to the query to prevent duplicate responses
      return subbedQuery + `\nIgnore this in your response: ${new Date().toISOString()}.`;
    }

    // Get the most up-to-date file selection
    const files = await revalidateFiles();

    // Add context to the query
    const queryWithContext = await addContextForQuery(
      subbedQuery,
      currentChat,
      currentResponse,
      useFiles,
      useConversation,
      autonomousFeatures,
      files
    );

    if (currentChat) {
      await addQuery(currentChat, queryWithContext);
    }
    return queryWithContext;
  };

  useEffect(() => {
    if (initialQuery?.length) {
      setQuery(initialQuery);
    }
  }, []);

  useEffect(() => {
    if (currentChat == undefined && isLoading && !previousResponse?.length) {
      setCurrentResponse(response);
    }
  }, [response]);

  useEffect(() => {
    if (currentChat == undefined && !isLoading && !previousResponse?.length && initialQuery?.length) {
      submitQuery(initialQuery);
    }
  }, [response, isLoading]);

  useEffect(() => {
    if (data?.length > 0 && enableModel) {
      if (dataTag != undefined && dataTag.includes(sentQuery)) {
        // Update the response field as the model generates text
        if (!data.includes(previousResponse)) {
          setCurrentResponse(data.replaceAll("MODEL_RESPONSE:", "").replaceAll("USER_QUERY:", ""));
        }

        // If the model returns a command number and input, set the input
        // This will trigger running the command if autonomous features are enabled
        const cmdMatch = currentResponse.match(/.*{{cmd:(.*?):(.*?)}}.*/);
        const cmdMatchPrevious = previousResponse.match(/.*{{cmd:(.*?):(.*?)\}{0,2}.*/);
        if (
          cmdMatch &&
          ((currentChat && currentChat.allowAutonomy) ||
            autonomousFeatures ||
            (currentChat == undefined && autonomousFeatures == undefined)) &&
          !runningCommand &&
          data != previousResponse &&
          enableModel &&
          data.includes(currentResponse) &&
          !cmdMatchPrevious
        ) {
          if (!currentChat) {
            return;
          }
          setRunningCommand(true);
          addResponse(currentChat, data);
          const commandInput = cmdMatch[2];
          setInput(commandInput);
          // Get the command prompt
          LocalStorage.allItems().then((commands) => {
            const commandPrompts = Object.entries(commands)
              .filter(([key]) => !key.startsWith("--") && !key.startsWith("id-"))
              .sort(([a], [b]) => (a > b ? 1 : -1))
              .map(([, value], index) => `${index}:${JSON.parse(value)["prompt"]}`);
            const nameIndex = parseInt(cmdMatch[1]);
            if (nameIndex != undefined && nameIndex < commandPrompts.length) {
              // Run the command
              const cmdPrompt = commandPrompts[nameIndex];
              setEnableModel(false);
              addSystemMessage(currentChat, `Running command: ${cmdPrompt}`);
              submitQuery(cmdPrompt);
            }
          });
        }
      }
    }
  }, [data, dataTag, sentQuery, runningCommand, enableModel, previousResponse, currentResponse, currentChat]);

  useEffect(() => {
    if (!loadingData && data.includes(currentResponse) && dataTag?.includes(sentQuery)) {
      // Disable the model once the response is generated
      if (currentChat) {
        addResponse(currentChat, currentResponse);
      }
    }

    const cmdMatchPrevious = previousResponse.match(/.*{{cmd:(.*?):(.*?)\}{0,2}.*/);
    if (
      cmdMatchPrevious &&
      ((currentChat && currentChat.allowAutonomy) ||
        autonomousFeatures ||
        (currentChat == undefined && autonomousFeatures == undefined)) &&
      !loadingData &&
      runningCommand &&
      data != previousResponse
    ) {
      setPreviousResponse(data);
      setEnableModel(false);
      setRunningCommand(false);
      if (currentChat) {
        addResponse(currentChat, currentResponse);
      }
      // Get the command prompt
      LocalStorage.allItems().then((commands) => {
        const commandPrompts = Object.entries(commands)
          .filter(([key]) => !key.startsWith("--") && !key.startsWith("id-"))
          .sort(([a], [b]) => (a > b ? 1 : -1))
          .map(([, value], index) => `${index}:${JSON.parse(value)["prompt"]}`);
        const nameIndex = parseInt(cmdMatchPrevious[1]);
        if (nameIndex != undefined && nameIndex < commandPrompts.length) {
          const cmdObj = Object.entries(commands)
            .filter(([key]) => !key.startsWith("--") && !key.startsWith("id-"))
            .find(([, cmd]) => cmd.prompt == commandPrompts[nameIndex]);
          const currentCommand = cmdObj ? JSON.parse(cmdObj[1]) : undefined;

          if (currentCommand != undefined) {
            if (
              currentCommand.actionScript != undefined &&
              currentCommand.actionScript.trim().length > 0 &&
              currentCommand.actionScript != "None"
            ) {
              Promise.resolve(
                runActionScript(
                  currentCommand.actionScript,
                  currentCommand.prompt,
                  input || "",
                  currentResponse,
                  currentCommand.scriptKind
                )
              );
            }
          }
        }
      });
    }
  }, [data, loadingData, dataTag, runningCommand, previousResponse]);

  useEffect(() => {
    if (currentChat == undefined) {
      setQuery("");
      setCurrentResponse("Ready for your query.");
    } else if (currentChat != undefined) {
      const convo = currentChat.conversation || [];
      const lastQuery = convo.reverse().find((entry) => entry.type == MessageType.QUERY);
      const lastResponse = convo.find((entry) => entry.type == MessageType.RESPONSE);

      if (lastQuery) {
        setQuery(lastQuery.text.trim());
      }

      if (lastResponse) {
        setCurrentResponse(lastResponse.text.trim());
      }
    }
  }, [currentChat]);

  const activateChat = async (chat: ChatRef | undefined) => {
    await revalidateChats();
    setPreviousResponse("");
    if (chat && !checkExists(chat)) {
      // If the chat file doesn't exist, delete it from the list and open a new chat
      deleteChat(chat);
      setCurrentChat(undefined);
      showToast({ title: "Chat Doesn't Exist", style: Toast.Style.Failure });
      await revalidateChats();
    } else {
      // Otherwise, set the current chat
      if (chat) {
        const chatObj = await loadChat(chat);
        setCurrentChat(chatObj);
        if (preferences.useChatStatistics) {
          Insights.add("Switch Chat", `Switched to chat ${chat.name}`, ["chats"], []);
        }
        setBasePrompt(chatObj.basePrompt);
        setUseFiles(chatObj.useSelectedFilesContext);
        setUseConversation(chatObj.useConversationContext);
        setAutonomousFeatures(chatObj.allowAutonomy);
      } else {
        setCurrentChat(undefined);
        setBasePrompt(prompt);
      }
    }
  };

  /**
   * Checks if the query contains any placeholders and updates the query's info panel accordingly.
   * @param query The query to check for placeholders.
   */
  const updatePlaceholderInfo = async (query: string) => {
    const includedPlaceholders = await checkForPlaceholders(query);
    let newPromptInfo = defaultPromptInfo + (includedPlaceholders.length > 0 ? "\n\nDetected Placeholders:" : "");
    includedPlaceholders.forEach((placeholder) => {
      newPromptInfo =
        newPromptInfo +
        `\n\n${placeholder.hintRepresentation || ""}: ${placeholder.description}\nExample: ${placeholder.example}`;
    });
    setPromptInfo(newPromptInfo);
  };

  return (
    <Form
      isLoading={isLoading || loadingData || loadingSelectedFiles || runningCommand}
      actions={
        <ChatActionPanel
          isLoading={isLoading || loadingData || runningCommand}
          settings={advancedSettings}
          chat={currentChat}
          chatRefs={chatRefs}
          revalidateChats={revalidateChats}
          useFileContext={useFiles}
          useConversationContext={useConversation}
          useAutonomousFeatures={autonomousFeatures}
          setCurrentChat={setCurrentChat}
          setSentQuery={setSentQuery}
          setUseFileContext={setUseFiles}
          setUseConversationContext={setUseConversation}
          setUseAutonomousFeatures={setAutonomousFeatures}
          revalidate={revalidate}
          response={currentResponse}
          previousResponse={previousResponse}
          query={sentQuery}
          basePrompt={basePrompt}
          onSubmit={(values) => {
            setEnableModel(false);
            stopModel();
            setInput("");
            setRunningCommand(false);
            submitQuery(values.queryField);
          }}
          onCancel={() => {
            if (previousResponse?.length > 0 || typeof cancel !== "function") {
              setEnableModel(false);
              setRunningCommand(false);
              stopModel();
            } else {
              Function.call(cancel);
            }
          }}
        />
      }
    >
      <ChatDropdown
        currentChat={currentChat}
        chatRefs={chatRefs}
        onChange={(value) => activateChat(chatRefs.find((ref) => ref.name == value))}
      />

      <Form.TextArea
        title="Query"
        id="queryField"
        value={query}
        info={promptInfo}
        onChange={async (value) => {
          setQuery(value);
          await updatePlaceholderInfo(value);
        }}
        autoFocus={true}
      />

      <Form.TextArea
        title="Response"
        id="responseField"
        value={currentResponse.trim()}
        onChange={(value) => setCurrentResponse(value)}
        enableMarkdown={true}
      />

      {!currentChat || (currentChat && currentChat.showBasePrompt) ? (
        <Form.Description title="Base Prompt" text={basePrompt} />
      ) : null}

      {currentChat && currentChat.contextData?.length ? <Form.Separator /> : null}
      {currentChat && currentChat.contextData?.length ? (
        <Form.Description title="Context Data" text="Information provided as context for your conversation." />
      ) : null}
      {currentChat?.contextData?.map((data) => {
        return <Form.Description title={data.source} key={data.source + data.data.substring(0, 20)} text={data.data} />;
      })}
    </Form>
  );
}
