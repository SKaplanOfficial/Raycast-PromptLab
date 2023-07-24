import {
  Action,
  ActionPanel,
  Icon,
  List,
  LocalStorage,
  environment,
  getPreferenceValues,
} from "@raycast/api";
import { Chat, Command, CommandOptions, ExtensionPreferences } from "../../utils/types";
import { useChats } from "../../hooks/useChats";
import { useEffect, useState } from "react";
import {
  addContextForQuery,
  addQuery,
  addResponse,
  addSystemMessage,
  createChat,
  generateTitle,
  loadChat,
} from "../../utils/chat-utils";
import { ChatActionPanel } from "./actions/ChatActionPanel";
import { useAdvancedSettings } from "../../hooks/useAdvancedSettings";
import useModel from "../../hooks/useModel";
import path from "path";
import ChatDetail from "./ChatDetail";
import { usePreviousCommand } from "../../hooks/usePreviousCommand";
import { runActionScript, runReplacements } from "../../utils/command-utils";
import { useFiles } from "../../hooks/useFiles";
import { Insights } from "../../utils";

export default function ChatList(props: {
  isLoading: boolean;
  options: CommandOptions;
  prompt: string;
  initialQuery: string;
  response?: string;
  revalidate?: () => void;
  cancel?: () => void;
  useFileContext: boolean;
  useConversation: boolean;
  useAutonomousFeatures: boolean;
  command?: Command;
}) {
  const { options, prompt, isLoading: loadingParent, initialQuery, response, revalidate, cancel, command } = props;

  const [currentChat, setCurrentChat] = useState<Chat | undefined>();
  const [input, setInput] = useState<string>();
  const [query, setQuery] = useState<string>("");
  const [currentResponse, setCurrentResponse] = useState<string>(response || "");
  const [previousResponse, setPreviousResponse] = useState<string>("");
  const [enableModel, setEnableModel] = useState<boolean>(false);

  const [basePrompt, setBasePrompt] = useState<string>(prompt);
  const [useSelectedFilesContext, setUseSelectedFilesContext] = useState<boolean>(props.useFileContext || false);
  const [useConversationContext, setUseConversationContext] = useState<boolean>(props.useConversation || false);
  const [autonomousFeatures, setAutonomousFeatures] = useState<boolean>(props.useAutonomousFeatures || false);

  const [sentQuery, setSentQuery] = useState<string>(initialQuery);
  const [temperature, setTemperature] = useState<string>("1.0");
  const [runningCommand, setRunningCommand] = useState<boolean>(false);

  const preferences = getPreferenceValues<ExtensionPreferences>();
  const { advancedSettings } = useAdvancedSettings();
  const { chatRefs, loadingChats, revalidateChats } = useChats();
  const {
    selectedFiles,
    fileContents,
    isLoading: loadingSelectedFiles,
    revalidate: revalidateFiles,
  } = useFiles({ ...options, minNumFiles: options.minNumFiles && initialQuery != "" ? 1 : 0 });
  const {
    data,
    isLoading: loadingData,
    dataTag,
    stopModel,
    revalidate: reQuery,
  } = useModel(basePrompt, sentQuery, sentQuery, temperature, enableModel);
  const { previousCommand, previousCommandResponse, previousPrompt } = usePreviousCommand();

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
      "currentResponse",
      useSelectedFilesContext,
      useConversationContext,
      autonomousFeatures,
      files
    );

    if (currentChat) {
      await addQuery(currentChat, query);
      await addSystemMessage(currentChat, queryWithContext);
    }
    return queryWithContext;
  };

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
      useConversationContext: useConversationContext,
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
    if (!newQuery.trim().length) {
      return;
    }

    setEnableModel(false);
    setPreviousResponse(currentResponse);
    setCurrentResponse("Loading...");

    if (currentChat == undefined) {
      startNewChat(newQuery);
    } else {
      const subbedQuery = await applyReplacements(newQuery);
      setSentQuery(subbedQuery);
      setEnableModel(true);
    }

    setQuery("");
  };

  useEffect(() => {
    if (currentChat == undefined && isLoading && !previousResponse?.length && response?.length) {
      setCurrentResponse(response);
    }
  }, [response]);

  useEffect(() => {
    if (currentChat == undefined && !isLoading && !previousResponse?.length && initialQuery?.length) {
      submitQuery(initialQuery);
    }
  }, [response, loadingParent]);

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

  const isLoading = props.isLoading || loadingChats || loadingData;
  const listItems = chatRefs.map((chatRef) => {
    return (
      <List.Item
        key={chatRef.id}
        id={chatRef.id}
        title={chatRef.name}
        icon={{ source: chatRef.icon, tintColor: chatRef.iconColor }}
        detail={<ChatDetail chatRef={chatRef} currentChat={currentChat} currentResponse={currentResponse} />}
        actions={
          <ChatActionPanel
            isLoading={isLoading}
            chat={currentChat}
            revalidate={() => null}
            chatRefs={chatRefs}
            revalidateChats={revalidateChats}
            response={currentResponse}
            useAutonomousFeatures={autonomousFeatures}
            useConversationContext={useConversationContext}
            useFileContext={useSelectedFilesContext}
            setUseAutonomousFeatures={setAutonomousFeatures}
            setUseConversationContext={setUseConversationContext}
            setUseFileContext={setUseSelectedFilesContext}
            setCurrentChat={setCurrentChat}
            setSentQuery={setSentQuery}
            query={query}
            onCancel={() => cancel?.()}
            previousResponse={""}
            basePrompt={prompt}
            settings={advancedSettings}
            setEnableModel={setEnableModel}
            stopModel={stopModel}
            setInput={setInput}
            setRunningCommand={setRunningCommand}
            submitQuery={submitQuery}
          />
        }
      />
    );
  });

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Type a query..."
      filtering={false}
      isShowingDetail={true}
      searchText={query}
      onSearchTextChange={(value) => {
        setQuery(value);
      }}
      selectedItemId={currentChat ? currentChat.id : undefined}
      onSelectionChange={async (id) => {
        if (id === "new-chat") {
          setCurrentChat(undefined);
          return;
        }

        const chatRef = chatRefs.find((chatRef) => chatRef.id === id);
        if (chatRef) {
          const chat = await loadChat(chatRef);
          setCurrentChat(chat);
          setUseSelectedFilesContext(chat.useSelectedFilesContext);
          setUseConversationContext(chat.useConversationContext);
          setAutonomousFeatures(chat.allowAutonomy);
        }
      }}
    >
      <List.Item
        title="New Chat"
        id="new-chat"
        icon={Icon.PlusCircle}
        detail={
          <List.Item.Detail
            markdown={`![Placeholder](${path.join(
              environment.assetsPath,
              "no-view.png"
            )})\n_Type a prompt and press enter to start a new chat._`}
          />
        }
        actions={
          <ActionPanel>
            <Action
              title="Submit Query"
              onAction={() => {
                setEnableModel(false);
                stopModel();
                setInput("");
                setRunningCommand(false);
                submitQuery(query);
              }}
            />
          </ActionPanel>
        }
      />

      <List.Section title="Previous Chats">{listItems}</List.Section>
    </List>
  );
}
