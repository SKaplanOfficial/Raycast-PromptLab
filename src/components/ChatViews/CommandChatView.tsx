import {
  Action,
  ActionPanel,
  Alert,
  Form,
  Icon,
  LocalStorage,
  Toast,
  confirmAlert,
  getPreferenceValues,
  open,
  showToast,
} from "@raycast/api";
import { useEffect, useState } from "react";
import useModel from "../../hooks/useModel";
import { Chat, CommandOptions, ExtensionPreferences } from "../../utils/types";
import { useFileContents } from "../../utils/file-utils";
import { useReplacements } from "../../hooks/useReplacements";
import { runActionScript, runReplacements } from "../../utils/command-utils";
import ChatSettingsForm from "./ChatSettingsForm";
import { useChats } from "../../hooks/useChats";
import runModel from "../../utils/runModel";
import path from "path";
import * as fs from "fs";
import { useModels } from "../../hooks/useModels";

interface CommandPreferences {
  useSelectedFiles: boolean;
  useConversationHistory: boolean;
  autonomousFeatures: boolean;
  basePrompt: string;
}

export default function CommandChatView(props: {
  isLoading: boolean;
  commandName: string;
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
  const { isLoading, commandName, options, prompt, response, revalidate, cancel, initialQuery } = props;
  const [query, setQuery] = useState<string>(initialQuery || "");
  const [sentQuery, setSentQuery] = useState<string>("");
  const [currentResponse, setCurrentResponse] = useState<string>(response);
  const [previousResponse, setPreviousResponse] = useState<string>("");
  const [enableModel, setEnableModel] = useState<boolean>(false);
  const [forceStop, setForceStop] = useState<boolean>(false);
  const [input, setInput] = useState<string>();
  const [currentChat, setCurrentChat] = useState<Chat>();
  const [runningCommand, setRunningCommand] = useState<boolean>(false);
  const preferences = getPreferenceValues<ExtensionPreferences & CommandPreferences>();
  const [useFiles, setUseFiles] = useState<boolean>(props.useFiles || preferences.useSelectedFiles || false);
  const [useConversation, setUseConversation] = useState<boolean>(
    props.useConversation || preferences.useConversationHistory || false
  );
  const [useAutonomousFeatures, setUseAutonomousFeatures] = useState<boolean>(preferences.autonomousFeatures || false);
  const [basePrompt, setBasePrompt] = useState<string>(preferences.basePrompt || prompt);
  const models = useModels();
  const chats = useChats();
  const {
    selectedFiles,
    contentPrompts,
    loading: loadingSelectedFiles,
    revalidate: revalidateFiles,
  } = useFileContents(options);
  const replacements = useReplacements(input, selectedFiles);
  const targetModel = options.model ? models.models.find((model) => model.id == options.model) : undefined;
  const {
    data,
    isLoading: loadingData,
    dataTag,
  } = useModel(basePrompt, sentQuery, sentQuery, "1.0", enableModel, targetModel);

  const submitQuery = async (newQuery: string, sender = "USER_QUERY") => {
    if (newQuery.trim() == "" && query == undefined) {
      return;
    }

    setForceStop(false);
    setRunningCommand(false);
    setEnableModel(false);

    if (currentChat == undefined) {
      setPreviousResponse(currentResponse);
      setCurrentResponse("Loading...");
      const subbedQuery = await applyReplacements(newQuery || query);

      const namePrompt =
        "Come up with a title, in Title Case, for a conversation started with the following query. The title must summarize the intent of the query. The title must be three words or shorter. Output only the title without commentary or labels. For example, if the query is 'What are galaxies?', the title you output might be 'Question About Galaxies'. Here is the query: ";
      const nameComponent =
        (await runModel(namePrompt, namePrompt + `'''${newQuery || query}'''`, newQuery || query)) ||
        query.trim().split(" ").splice(0, 2).join(" ");
      const dateComponent = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      });
      const newChatName = `${nameComponent.trim()} - ${dateComponent}`;

      chats.createChat(newChatName, basePrompt).then((chat) => {
        chats.revalidate().then(() => {
          setCurrentChat(chat);
          setSentQuery(subbedQuery);
          setEnableModel(true);
          const cmdMatch = (newQuery || query).match(/.*{{cmd:(.*?):(.*?)}}.*/);
          if (cmdMatch) {
            setRunningCommand(true);
          }

          if (chat) {
            chats.appendToChat(chat, `\n[${sender}]:${newQuery || query}\n`);
          }
        });
      });
    } else {
      setPreviousResponse(currentResponse);
      const subbedQuery = await applyReplacements(newQuery);
      setCurrentResponse("Loading...");
      setSentQuery(subbedQuery);
      setEnableModel(true);
      chats.appendToChat(currentChat, `\n[${sender}]:${newQuery}\n`);
    }
  };

  const applyReplacements = async (query: string) => {
    let subbedQuery = await runReplacements(query, replacements, [commandName]);

    const cmdMatch = data.match(/.*{{cmd:(.*?):(.*?)}}.*/);
    if (cmdMatch) {
      return subbedQuery + `\nIgnore this in your response: ${new Date().toISOString()}.`;
    }

    const conversation = currentChat ? chats.loadConversation(currentChat.name) || [] : [];

    // Get the most up-to-date file selection
    await new Promise((resolve) => {
      revalidateFiles();
      if (!loadingSelectedFiles) {
        resolve(true);
      }
    });

    // Get command descriptions
    const commands = await LocalStorage.allItems();
    const commandDescriptions = Object.entries(commands)
      .filter(([key]) => !key.startsWith("--") && !key.startsWith("id-"))
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([, value], index) => `${index}:${JSON.parse(value)["description"]}`);

    // Prepend instructions to the query, enable the model, and reattempt
    subbedQuery = `${`You are an interactive chatbot, and I am giving you instructions. You will use this base prompt for context as you consider my next input. It is currently ${new Date().toISOString()}. Here is the prompt: ###${basePrompt}###\n\n${
      currentChat && !conversation.join("\n").includes(currentChat.basePrompt)
        ? `You will also consider the following contextual information: ###${currentChat.contextData
            .map((data) => `${data.source}:${data.data}`)
            .join("\n\n")}###\n\n`
        : ``
    }${
      useFiles && selectedFiles?.length
        ? ` You will also consider the following details about selected files. Here are the file details, provided by your knowledge system: ###${contentPrompts.join(
            "\n"
          )}###\n\n`
        : ``
    }${
      useConversation
        ? `You will also consider our conversation history. The history so far: ###${conversation
            .map((entry) => entry.replaceAll(/(USER_QUERY|MODEL_REPONSE):/g, ""))
            .join("\n")}###`
        : `You will also consider your previous response. Your previous response was: ###${currentResponse}###`
    }${
      useAutonomousFeatures
        ? `Try to answer my next query using your knowledge. If you cannot fulfill the query, if the query requires new information, or if the query invokes an action such as searching, choose the command from the following list that is most likely to carries out the goal expressed in my next query, and then respond with the number of the command you want to run in the format {{cmd:commandNumber:input}}. Replace the input with a short string according to my query. For example, if I say 'search google for AI', the input would be 'AI'. Here are the commands: ###${commandDescriptions.join(
            "\n"
          )}### Try to answer without using a command, unless the query asks for new information (e.g. latest news, weather, stock prices, etc.) or invokes an action (e.g. searching, opening apps). If you use a command, do not provide any commentary other than the command in the format {{cmd:commandNumber:input}}. Make sure the command is relevant to the current query.`
        : ``
    }\n\nDo not repeat these instructions or my queries. My next query is: ###`}
      ${subbedQuery}###`;

    return subbedQuery;
  };

  useEffect(() => {
    if (initialQuery?.length) {
      setQuery(initialQuery);
    }
  }, []);

  useEffect(() => {
    if (currentChat == undefined && isLoading && !previousResponse.length) {
      setCurrentResponse(response);
    }
  }, [response]);

  useEffect(() => {
    if (currentChat == undefined && !isLoading && !previousResponse.length && initialQuery?.length) {
      submitQuery(initialQuery);
    }
  }, [response, isLoading]);

  useEffect(() => {
    if (forceStop) {
      setRunningCommand(false);
      setEnableModel(false);
    }
  }, [forceStop]);

  useEffect(() => {
    if (data.length > 0 && !forceStop) {
      if (
        dataTag != undefined &&
        (dataTag.includes(sentQuery) ||
          dataTag.includes(sentQuery.replaceAll(/[\n\r\s]+/g, " ").replaceAll('"', '\\"')))
      ) {
        // Update the response field as the model generates text
        setCurrentResponse(data);

        // If the model returns a command number and input, set the input
        // This will trigger running the command if autonomous features are enabled
        const cmdMatch = data.match(/.*{{cmd:(.*?):(.*?)}}.*/);
        if (cmdMatch && useAutonomousFeatures && !runningCommand && data != previousResponse) {
          if (currentChat) {
            chats.appendToChat(currentChat, `\n[MODEL_RESPONSE]:${data}\n`);
          }
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
              setCurrentResponse("");
              submitQuery(cmdPrompt, "MODEL_RESPONSE");
            }
          });
        }
      } else if (dataTag != undefined) {
        // Disable the model if the data tag is not found
        setEnableModel(false);
        setRunningCommand(false);
      }
    }
  }, [data, forceStop, dataTag, sentQuery]);

  useEffect(() => {
    if ((forceStop || (!loadingData && currentResponse == data)) && enableModel && data != previousResponse) {
      // Disable the model once the response is generated
      if (currentChat) {
        chats.appendToChat(currentChat, `\n[MODEL_RESPONSE]:${currentResponse}\n`);
      }

      if (
        dataTag &&
        dataTag.includes(sentQuery) &&
        dataTag.includes(sentQuery.replaceAll(/[\n\r\s]+/g, " ").replaceAll('"', '\\"'))
      ) {
        setEnableModel(false);
      }
    }

    const cmdMatchPrevious = previousResponse.match(/.*{{cmd:(.*?):(.*?)}}.*/);
    if (cmdMatchPrevious && useAutonomousFeatures && !loadingData && runningCommand && data != previousResponse) {
      setEnableModel(false);
      setRunningCommand(false);
      if (currentChat) {
        chats.appendToChat(currentChat, `\n[MODEL_RESPONSE]:${currentResponse}\n`);
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
  }, [data, loadingData, forceStop, dataTag]);

  useEffect(() => {
    if (currentChat == undefined) {
      setQuery("");
      setForceStop(true);
      setCurrentResponse("Ready for your query.");
    } else if (currentChat != undefined) {
      const convo = chats.loadConversation(currentChat.name) || [];
      const lastQuery = convo.reverse().find((entry) => entry.startsWith("USER_QUERY"));
      const lastResponse = convo.find((entry) => entry.startsWith("MODEL_RESPONSE"));

      if (lastQuery) {
        setQuery(lastQuery.split(/(?:USER_QUERY):/g)[1].trim());
      }

      if (lastResponse) {
        setCurrentResponse(lastResponse.split(/(?:MODEL_RESPONSE):/g)[1].trim());
      }
    }
  }, [currentChat]);

  const activateChat = (chat: Chat | undefined) => {
    chats.revalidate().then(() => {
      setPreviousResponse("");
      if (chat && !chats.checkExists(chat)) {
        chats.deleteChat(chat.name);
        setCurrentChat(undefined);
        showToast({ title: "Chat Doesn't Exist", style: Toast.Style.Failure });
        chats.revalidate();
      } else {
        setCurrentChat(chat);
        if (chat) {
          setBasePrompt(chat.basePrompt);
        } else {
          setBasePrompt(prompt);
        }
      }
    });
  };

  return (
    <Form
      isLoading={isLoading || (loadingData && enableModel) || loadingSelectedFiles || runningCommand}
      actions={
        <ActionPanel>
          {isLoading || (loadingData && enableModel) || runningCommand ? (
            <Action
              title="Cancel"
              onAction={() => {
                if (previousResponse.length > 0 || typeof cancel !== "function") {
                  setForceStop(true);
                } else {
                  Function.call(cancel);
                }
              }}
            />
          ) : (
            <Action.SubmitForm
              title="Submit Query"
              onSubmit={(values) => {
                setInput(undefined);
                setRunningCommand(false);
                submitQuery(values.queryField);
              }}
            />
          )}

          <ActionPanel.Section title="Chat Actions">
            {currentChat ? (
              <Action.Push
                title="Chat Settings..."
                icon={Icon.Gear}
                target={<ChatSettingsForm oldData={currentChat} chats={chats} setCurrentChat={setCurrentChat} />}
              />
            ) : null}
            {currentChat && !currentChat.favorited ? (
              <Action
                title="Add To Favorites"
                icon={Icon.Star}
                onAction={async () => {
                  if (currentChat) {
                    const newChatData = { ...currentChat, favorited: true };
                    chats.updateChat(currentChat.name, newChatData);
                    chats.revalidate();
                    setCurrentChat(newChatData);
                  }
                }}
              />
            ) : null}
            {currentChat && currentChat.favorited ? (
              <Action
                title="Remove From Favorites"
                icon={Icon.StarDisabled}
                onAction={async () => {
                  if (currentChat) {
                    const newChatData = { ...currentChat, favorited: false };
                    chats.updateChat(currentChat.name, newChatData);
                    chats.revalidate();
                    setCurrentChat(newChatData);
                  }
                }}
              />
            ) : null}
            {currentChat ? (
              <Action
                title="Export Chat"
                icon={Icon.Download}
                onAction={async () => {
                  const toast = await showToast({ title: "Exporting Chat", style: Toast.Style.Animated });

                  const includeContext =
                    currentChat.contextData.length &&
                    (await confirmAlert({
                      title: "Include Context Data & Stats?",
                      message: "Do you want context data and statistics included in the export?",
                      primaryAction: { title: "Yes" },
                      dismissAction: { title: "No" },
                    }));

                  const chatContents = chats.getChatContents(currentChat);

                  const failedExports: string[] = [];
                  if (includeContext && currentChat.contextData.length > 0) {
                    let dirPath = path.resolve(preferences.exportLocation, currentChat.name);
                    let i = 2;
                    while (fs.existsSync(dirPath)) {
                      dirPath = path.resolve(preferences.exportLocation, currentChat.name + "-" + i);
                      i += 1;
                    }
                    const contextPath = path.resolve(dirPath, "context");
                    fs.mkdirSync(contextPath, { recursive: true });

                    currentChat.contextData.forEach((data, index) => {
                      const jsonString = JSON.stringify(data);
                      try {
                        fs.writeFileSync(
                          path.resolve(contextPath, encodeURIComponent(data.source + ".json")),
                          jsonString
                        );
                      } catch (error) {
                        console.error(error);
                        failedExports.push(`Context Data ${index}`);
                      }
                    });

                    fs.writeFile(path.resolve(dirPath, "chat.txt"), chatContents, (err) => {
                      if (err) {
                        failedExports.push("Main Chat");
                      }
                    });

                    const statsJSON = JSON.stringify(chats.calculateStats(currentChat.name));
                    fs.writeFile(path.resolve(dirPath, "stats.json"), statsJSON, (err) => {
                      if (err) {
                        failedExports.push("Stats");
                      }
                    });

                    if (failedExports.length == currentChat.contextData.length + 2) {
                      toast.style = Toast.Style.Failure;
                      toast.title = "Failed Export";
                      toast.message = "Couldn't export chat or context data";
                    } else if (!failedExports.includes("Main Chat") && failedExports.length > 0) {
                      toast.style = Toast.Style.Failure;
                      toast.title = "Export Partially Successful";
                      toast.message = dirPath;
                      toast.primaryAction = {
                        title: "Open In Finder",
                        onAction: async () => {
                          await open(dirPath, "Finder");
                        },
                      };
                    } else if (failedExports.length == 0) {
                      toast.style = Toast.Style.Success;
                      toast.title = "Chat Exported Successfully";
                      toast.message = dirPath;
                      toast.primaryAction = {
                        title: "Open In Finder",
                        onAction: async () => {
                          await open(dirPath, "Finder");
                        },
                      };
                    }
                  } else {
                    let filePath = path.resolve(preferences.exportLocation, currentChat.name);

                    let i = 2;
                    while (fs.existsSync(filePath + ".txt")) {
                      filePath = path.resolve(preferences.exportLocation, currentChat.name + "-" + i);
                      i += 1;
                    }

                    fs.writeFile(filePath + ".txt", chatContents, (err) => {
                      if (err) {
                        toast.style = Toast.Style.Failure;
                        toast.title = "Error";
                        toast.message = "Couldn't export chat";
                        throw err;
                      }

                      toast.style = Toast.Style.Success;
                      toast.title = "Chat Exported Successfully";
                      toast.message = filePath + ".txt";
                      toast.primaryAction = {
                        title: "Open In Finder",
                        onAction: async () => {
                          await open(filePath + ".txt", "TextEdit");
                        },
                      };
                    });
                  }
                }}
              />
            ) : null}
            {currentChat ? (
              <Action
                title="Delete Chat"
                icon={Icon.Trash}
                style={Action.Style.Destructive}
                onAction={async () => {
                  if (
                    await confirmAlert({
                      title: "Delete Chat",
                      message: "Are you sure?",
                      primaryAction: { title: "Delete", style: Alert.ActionStyle.Destructive },
                    })
                  ) {
                    setCurrentChat(undefined);
                    await chats.deleteChat(currentChat.name);
                    chats.revalidate();
                    await showToast({ title: "Chat Deleted" });
                  }
                }}
              />
            ) : null}
            <Action
              title="Delete All Chats"
              icon={Icon.Trash}
              style={Action.Style.Destructive}
              onAction={async () => {
                if (
                  await confirmAlert({
                    title: `Delete ${chats.chats.length} Chat`,
                    message: "Are you sure?",
                    primaryAction: { title: "Delete", style: Alert.ActionStyle.Destructive },
                  })
                ) {
                  const toast = await showToast({ title: "Deleting Chats...", style: Toast.Style.Animated });
                  const totalCount = chats.chats.length;
                  setCurrentChat(undefined);
                  chats.chats.forEach(async (chat, index) => {
                    await chats.deleteChat(chat.name);
                    toast.message = `${index + 1} of ${totalCount}`;
                  });
                  chats.revalidate();
                  toast.title = `${totalCount} Chats Deleted`;
                  toast.message = "";
                  toast.style = Toast.Style.Success;
                }
              }}
            />
          </ActionPanel.Section>

          <Action
            title="Regenerate"
            icon={Icon.ArrowClockwise}
            onAction={previousResponse.length > 0 ? () => setSentQuery(sentQuery + " ") : revalidate}
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
              content={basePrompt}
              shortcut={{ modifiers: ["cmd", "shift"], key: "p" }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    >
      <Form.Dropdown
        title="Current Chat"
        id="currentChatField"
        value={currentChat ? currentChat.name : "new"}
        onChange={(value) => activateChat(chats.chats.find((chat) => chat.name == value))}
      >
        {currentChat ? <Form.Dropdown.Item title="New Chat" value="" /> : null}
        {!currentChat ? <Form.Dropdown.Item title="New Chat" value="new" /> : null}

        {chats.favorites().length > 0 ? (
          <Form.Dropdown.Section title="Favorites">
            {chats.favorites().map((chat) => (
              <Form.Dropdown.Item
                title={chat.favorited ? `⭐️ ${chat.name}` : chat.name}
                value={chat.name}
                key={chat.name}
              />
            ))}
          </Form.Dropdown.Section>
        ) : null}

        {chats.chats
          .filter((chat) => !chat.favorited)
          .map((chat) => (
            <Form.Dropdown.Item title={chat.name} value={chat.name} key={chat.name} />
          ))}
      </Form.Dropdown>

      <Form.TextArea
        title="Query"
        id="queryField"
        value={query}
        onChange={(value) => setQuery(value)}
        autoFocus={true}
      />

      <Form.TextArea
        title="Response"
        id="responseField"
        value={currentResponse.trim()}
        onChange={(value) => setCurrentResponse(value)}
        enableMarkdown={true}
      />

      <Form.Checkbox
        label="Use Selected Files As Context"
        id="useFilesCheckbox"
        value={useFiles}
        onChange={(value) => setUseFiles(value)}
      />

      <Form.Checkbox
        label="Use Conversation As Context"
        id="useConversationCheckbox"
        value={useConversation}
        onChange={(value) => setUseConversation(value)}
      />

      <Form.Checkbox
        label="Allow AI To Run Commands (Experimental)"
        id="useAICommandsCheckbox"
        value={useAutonomousFeatures}
        onChange={(value) => setUseAutonomousFeatures(value)}
      />

      <Form.Description title="Base Prompt" text={basePrompt} />

      {currentChat && currentChat.contextData.length ? <Form.Separator /> : null}
      {currentChat && currentChat.contextData.length ? (
        <Form.Description title="Context Data" text="Information provided as context for your conversation." />
      ) : null}
      {currentChat?.contextData.map((data) => {
        return <Form.Description title={data.source} key={data.source + data.data.substring(0, 20)} text={data.data} />;
      })}
    </Form>
  );
}
