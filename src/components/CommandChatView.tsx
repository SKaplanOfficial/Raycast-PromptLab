import {
  Action,
  ActionPanel,
  Alert,
  Color,
  Form,
  Icon,
  LocalStorage,
  Toast,
  confirmAlert,
  environment,
  getPreferenceValues,
  showToast,
} from "@raycast/api";
import { useEffect, useState } from "react";
import useModel from "../hooks/useModel";
import { Chat, Command, CommandOptions, ExtensionPreferences } from "../utils/types";
import { useFileContents } from "../utils/file-utils";
import { useReplacements } from "../hooks/useReplacements";
import { runActionScript, runReplacements } from "../utils/command-utils";
import * as fs from "fs";
import path from "path";
import ChatSettingsForm from "./ChatSettingsForm";

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
  } = props;
  const [query, setQuery] = useState<string>(initialQuery || "");
  const [sentQuery, setSentQuery] = useState<string>("");
  const [currentResponse, setCurrentResponse] = useState<string>(response);
  const [previousResponse, setPreviousResponse] = useState<string>("");
  const [enableModel, setEnableModel] = useState<boolean>(false);
  const [queryError, setQueryError] = useState<string>();
  const [conversation, setConversation] = useState<string[]>([prompt]);
  const [useAutonomousFeatures, setUseAutonomousFeatures] = useState<boolean>(props.autonomousFeatures || false);
  const [input, setInput] = useState<string>();
  const [currentCommand, setCurrentCommand] = useState<Command>();
  const [previousChat, setPreviousChat] = useState<string>("");
  const [selectedChat, setSelectedChat] = useState<string>("new");
  const [currentChatSettings, setCurrentChatSettings] = useState<Chat>();
  const [updatingFile, setUpdatingFile] = useState<boolean>(false);
  const [chats, setChats] = useState<string[]>([]);
  const [chatSettings, setChatSettings] = useState<Chat[]>([]);

  const preferences = getPreferenceValues<ExtensionPreferences>();
  const supportPath = environment.supportPath;
  const chatsDir = `${supportPath}/chats`;

  const favoriteChats = chatSettings.filter((chat) => chat.favorited);

  useEffect(() => {
    // Create the chats directory if it doesn't exist
    if (!fs.existsSync(chatsDir)) {
      fs.mkdirSync(chatsDir);
    } else {
      // Get the chats
      fs.readdir(chatsDir, (err, files) => {
        if (err) throw err;
        setChats(files.filter((file) => !file.startsWith(".")).map((file) => file.replace(".txt", "")));
      });
    }

    // Get the chat settings
    LocalStorage.allItems().then((items) => {
      const chatSettings = Object.entries(items)
        .filter(([key]) => key.startsWith("--chat-"))
        .map(([, value]) => JSON.parse(value));
      setChatSettings(chatSettings);
    });
  }, []);

  const loadConversation = (chatFile: string) => {
    const convo: string[] = [];
    const chatContents = fs.readFileSync(chatFile, "utf8");
    const entries = chatContents.split(/\[(?=USER_QUERY|MODEL_RESPONSE\]:)/g);
    entries.forEach((entry) => {
      if (entry.startsWith("USER_QUERY")) {
        convo.push(entry.replace("USER_QUERY]:", "").trim());
      } else {
        convo.push(entry.replace("MODEL_RESPONSE]:", "").trim());
      }
    });

    while (convo.join("\n").length > 3900) {
      convo.shift();
    }

    setConversation(convo);
  };

  const deleteChat = (chatName: string) => {
    // Delete the chat file and remove it from the active list of chats
    const chatFile = `${chatsDir}/${chatName}.txt`;
    fs.unlink(chatFile, (err) => {
      if (err) throw err;
      const newChats = [...chats];
      newChats.splice(chats.indexOf(chatName), 1);
      setChats(newChats);

      // Return to the new chat default
      setSelectedChat("new");
      setCurrentChatSettings(undefined);
    });

    // Remove the chat's settings entry
    LocalStorage.removeItem(`--chat-${chatName}`).then(() => {
      const newChatSettings = [...chatSettings.map((chat) => ({ ...chat }))];
      newChatSettings.splice(
        chatSettings.findIndex((chat) => chat.name == chatName),
        1
      );
      setChatSettings(newChatSettings);
    });
  };

  const logQuery = (query: string, chatName: string, attemptNumber?: number): string => {
    let newChatName = chatName;
    if (chatName == "new") {
      newChatName =
        query.trim().substring(0, 20).split("\n")[0] +
        " - " +
        new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        });

      const newChats = [...chats];
      newChats.push(newChatName);
      setChats(newChats);

      const newChatSettingsEntry = {
        name: newChatName,
        icon: Icon.Message,
        iconColor: Color.PrimaryText,
        basePrompt: prompt,
        favorited: false,
        contextData: [],
      };
      setChatSettings([...chatSettings.map((chat) => ({ ...chat })), newChatSettingsEntry]);
      setCurrentChatSettings(newChatSettingsEntry);
      setSelectedChat(newChatName);
    }

    if (updatingFile) {
      setTimeout(() => logQuery(query, newChatName, attemptNumber == undefined ? 2 : attemptNumber + 1), 1000);
    }

    setUpdatingFile(true);
    const chatFile = `${chatsDir}/${newChatName}.txt`;

    fs.appendFile(chatFile, `\n[USER_QUERY]:${query}\n`, (err) => {
      if (err) throw err;
      setUpdatingFile(false);
    });

    return newChatName;
  };

  const logResponse = (response: string, chatName: string, attemptNumber?: number): string => {
    let newChatName = chatName;
    if (chatName == "new") {
      newChatName =
        response.trim().substring(0, 20).split("\n")[0] +
        " - " +
        new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        });

      const newChats = [...chats];
      newChats.push(newChatName);
      setChats(newChats);

      const newChatSettingsEntry = {
        name: newChatName,
        icon: Icon.Message,
        iconColor: Color.PrimaryText,
        basePrompt: prompt,
        favorited: false,
        contextData: [],
      };
      setChatSettings([...chatSettings.map((chat) => ({ ...chat })), newChatSettingsEntry]);
      setCurrentChatSettings(newChatSettingsEntry);
      setSelectedChat(newChatName);
    }

    if (updatingFile) {
      setTimeout(() => logResponse(response, newChatName, attemptNumber == undefined ? 2 : attemptNumber + 1), 1000);
    }

    setUpdatingFile(true);
    const chatFile = `${chatsDir}/${newChatName}.txt`;

    fs.appendFile(chatFile, `\n[MODEL_RESPONSE]:${response}\n`, (err) => {
      if (err) throw err;
      setUpdatingFile(false);
    });

    return newChatName;
  };

  useEffect(() => {
    if (selectedChat == "new") {
      if (initialQuery?.length && previousResponse.length == 0) {
        setQuery(initialQuery);
        setConversation([prompt, response]);
        setSentQuery(initialQuery);
        logResponse(response, logQuery(initialQuery, selectedChat));
        setEnableModel(true);
      } else {
        setEnableModel(false);
        setQuery("");
        setConversation([]);
      }
    } else {
      const chatFile = `${chatsDir}/${selectedChat}.txt`;

      if (!fs.existsSync(chatFile)) {
        showToast({ title: "Chat File Not Found", style: Toast.Style.Failure });
        const newChats = [...chats];
        newChats.splice(chats.indexOf(selectedChat), 1);
        setChats(newChats);
        setSelectedChat("new");
        setCurrentChatSettings(undefined);
        return;
      }

      const chatContents = fs.readFileSync(chatFile, "utf8");
      const chatContentsReversed = chatContents.split("").reverse().join("");
      loadConversation(chatFile);
      if (chatContents.includes("[USER_QUERY]:") && chatContents.includes("[MODEL_RESPONSE]:")) {
        const lastQuery = chatContents
          .matchAll(
            /(?<!\[USER_QUERY\]:)(?:(?:.|[\n\r\t])*)\[USER_QUERY\]:((.(?!\[MODEL_RESPONSE\]:)|[\n\r\t](?!\[MODEL_RESPONSE\]:))*(?!\[USER_QUERY\]:))/g
          )
          .next().value[1];
        const lastResponse = chatContents
          .matchAll(
            /(?<!\[MODEL_RESPONSE\]:)(?:(?:.|[\n\r\t])*)\[MODEL_RESPONSE\]:((.(?!\[USER_QUERY\]:)|[\n\r\t](?!\[USER_QUERY\]:))*(?!\[MODEL_RESPONSE\]:))/g
          )
          .next().value[1];
        setQuery(lastQuery);
        setCurrentResponse(lastResponse);
      } else if (chatContents.includes("[MODEL_RESPONSE]:")) {
        const lastResponse = chatContents
          .matchAll(
            /(?<!\[MODEL_RESPONSE\]:)(?:(?:.|[\n\r\t])*)\[MODEL_RESPONSE\]:((.|[\n\r\t])*(?!\[MODEL_RESPONSE\]:))/g
          )
          .next().value[1];
        setQuery("");
        setCurrentResponse(lastResponse);
      } else if (chatContents.includes("[USER_QUERY]:")) {
        const lastQuery = chatContentsReversed
          .matchAll(/((.|[\n\r])*?):\]YREUQ_RESU\[/g)
          .next()
          .value[1].split("")
          .reverse()
          .join("");
        setQuery(lastQuery);
        setCurrentResponse("");
      }
    }
  }, [selectedChat, response]);

  useEffect(() => {
    // Update the response field if the response from props changes
    if (currentResponse != response && response.length > 0 && previousResponse.length == 0) {
      logResponse(response, selectedChat);
      setCurrentResponse(response);
    }
  }, [response, selectedChat, previousResponse]);

  // Get files, set up prompt replacements, and run the model
  const {
    selectedFiles,
    contentPrompts,
    loading: contentIsLoading,
    revalidate: revalidateFiles,
  } = useFileContents(options);
  const replacements = useReplacements(input, selectedFiles);
  const { data, isLoading: loading, revalidate: reattempt } = useModel(prompt, sentQuery, "", enableModel);

  useEffect(() => {
    if (data.length > 0) {
      // Update the response field as the model generates text
      setCurrentResponse(data);
    }

    // If the model returns a command number and input, set the input
    // This will trigger running the command if autonomous features are enabled
    const cmdMatch = data.match(/.*{{cmd:(.*?):(.*?)}}.*/);
    if (cmdMatch && useAutonomousFeatures) {
      const commandInput = cmdMatch[2];
      setInput(commandInput);
    }
  }, [data]);

  useEffect(() => {
    if (input == undefined || !data.includes("}}")) {
      return;
    }

    // When the input changes, run specified command if autonomous features are enabled
    const cmdMatch = data.match(/.*{{cmd:(.*?):(.*?)}}.*/);
    if (cmdMatch && useAutonomousFeatures) {
      // Get the command prompt
      LocalStorage.allItems().then((commands) => {
        const commandPrompts = Object.entries(commands)
          .filter(([key]) => !key.startsWith("--") && !key.startsWith("id-"))
          .sort(([a], [b]) => (a > b ? 1 : -1))
          .map(([, value], index) => `${index}:${JSON.parse(value)["prompt"]}`);
        const nameIndex = parseInt(cmdMatch[1]);
        if (nameIndex != undefined && nameIndex < commandPrompts.length) {
          // Run the command
          setCurrentResponse("");
          setEnableModel(false);
          const prompt = commandPrompts[nameIndex];
          runReplacements(prompt, replacements, []).then((subbedPrompt) => {
            // Run the model again
            setSentQuery(subbedPrompt);
            logQuery(subbedPrompt, selectedChat);
            setEnableModel(true);
            setCurrentCommand(
              JSON.parse(
                Object.entries(commands)
                  .filter(([key]) => !key.startsWith("--") && !key.startsWith("id-"))
                  .filter(([, cmd]) => cmd.prompt == undefined)[0][1]
              )
            );
          });
        }
      });
    }
  }, [input, data]);

  useEffect(() => {
    if (!loading && enableModel == true && currentResponse == data) {
      // Run action script of the command specified by the AI, if one exists
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
          ).then(() => {
            setCurrentCommand(undefined);
          });
        }
      }

      // Disable the model once the response is generated
      setEnableModel(false);

      // Log the response to the chat file
      logResponse(data, selectedChat);
    }
  }, [enableModel, loading, currentResponse, data, currentCommand, input, selectedChat]);

  return (
    <Form
      isLoading={isLoading || (loading && enableModel) || contentIsLoading}
      navigationTitle={commandName}
      actions={
        <ActionPanel>
          {isLoading || (loading && enableModel) ? (
            <Action
              title="Cancel"
              onAction={() => {
                if (previousResponse.length > 0 || typeof cancel !== "function") {
                  setEnableModel(false);
                  logResponse(currentResponse, selectedChat);
                } else {
                  Function.call(cancel);
                }
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

                // Store the previous response and clear the response field
                setPreviousResponse(values.responseField);
                setCurrentResponse("");

                // Log the conversation
                const convo = [...conversation];
                convo.push(values.responseField);
                convo.push(values.queryField);
                while (values.queryField + convo.join("\n").length > 3900) {
                  convo.shift();
                }
                setConversation(convo);

                // Get the most up-to-date file selection
                await (async () => {
                  revalidateFiles();
                  if (!contentIsLoading) {
                    return true;
                  }
                });

                // Get command descriptions
                const commands = await LocalStorage.allItems();
                const commandDescriptions = Object.entries(commands)
                  .filter(([key]) => !key.startsWith("--") && !key.startsWith("id-"))
                  .sort(([a], [b]) => (a > b ? 1 : -1))
                  .map(([, value], index) => `${index}:${JSON.parse(value)["description"]}`);

                // Prepend instructions to the query, enable the model, and reattempt
                const subbedPrompt = await runReplacements(values.queryField, replacements, []);
                setSentQuery(
                  `${
                    values.responseField.length > 0
                      ? `You are an interactive chatbot, and I am giving you instructions. You will use this base prompt for context as you consider my next input. Here is the prompt: ###${prompt}###\n\n${
                          currentChatSettings && !conversation.join("\n").includes(currentChatSettings.basePrompt)
                            ? `You will also consider the following contextual information: ###${currentChatSettings.contextData
                                .map((data) => `${data.source}:${data.data}`)
                                .join("\n\n")}###\n\n`
                            : ``
                        }\n\n${
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
                          values.useAICommandsCheckbox
                            ? `Try to answer my next query using your knowledge. If you cannot fulfill the query, if the query requires new information, or if the query invokes an action such as searching, choose the command from the following list that is most likely to carries out the goal expressed in my next query, and then respond with the number of the command you want to run in the format {{cmd:commandNumber:input}}. Replace the input with a short string according to my query. For example, if I say 'search google for AI', the input would be 'AI'. Here are the commands: ###${commandDescriptions.join(
                                "\n"
                              )}### Try to answer without using a command, unless the query asks for new information (e.g. latest news, weather, stock prices, etc.) or invokes an action (e.g. searching, opening apps). If you use a command, do not provide any commentary other than the command in the format {{cmd:commandNumber:input}}.`
                            : ``
                        }\n\nMy next query is: ###`
                      : ""
                  }
                  ${subbedPrompt}###`
                );
                logQuery(subbedPrompt, selectedChat);
                setEnableModel(true);
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

          {selectedChat == "new" ? null : (
            <ActionPanel.Section title="Chat Actions">
              <Action.Push
                title="Chat Settings..."
                icon={Icon.Gear}
                target={
                  <ChatSettingsForm
                    oldData={currentChatSettings}
                    chats={chats}
                    setChats={setChats}
                    setSelectedChat={setSelectedChat}
                    setChatSettings={setChatSettings}
                    setCurrentChatSettings={setCurrentChatSettings}
                  />
                }
              />
              <Action
                title="Export Chat"
                icon={Icon.Download}
                onAction={async () => {
                  const toast = await showToast({ title: "Exporting Chat", style: Toast.Style.Animated });

                  const chatFile = `${chatsDir}/${selectedChat}.txt`;
                  const chatContents = fs.readFileSync(chatFile, "utf8");

                  let filePath = path.resolve(preferences.exportLocation, selectedChat);
                  let i = 2;
                  while (fs.existsSync(filePath + ".json")) {
                    filePath = path.resolve(preferences.exportLocation, selectedChat + "-" + i);
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
                    toast.title = "Successfully Exported Chat";
                  });
                }}
              />
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
                    deleteChat(selectedChat);
                  }
                }}
              />
            </ActionPanel.Section>
          )}

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
      <Form.Dropdown
        id="selectedChat"
        title="Current Chat"
        value={selectedChat}
        onChange={(value) => {
          if (value !== "new" && selectedChat == "new" && !chats.includes(value)) {
            const newChats = [...chats];
            newChats.push(value);
            setChats(newChats);
          }

          setPreviousChat(selectedChat);
          setSelectedChat(value);
          if (value !== "new") {
            setCurrentChatSettings(
              chatSettings.find((chat) => chat.name == value) || {
                name: value,
                icon: Icon.Message,
                iconColor: Color.PrimaryText,
                basePrompt: prompt,
                favorited: false,
                contextData: [],
              }
            );
          }
        }}
      >
        <Form.Dropdown.Item key="new" value="new" title="New Chat" />

        {favoriteChats.length > 0 ? (
          <Form.Dropdown.Section title="Favorite Chats">
            {favoriteChats.map((chat) => (
              <Form.Dropdown.Item key={chat.name} value={chat.name} title={chat.name} />
            ))}
          </Form.Dropdown.Section>
        ) : null}

        <Form.Dropdown.Section title={favoriteChats.length > 0 ? "Other Chats" : "Existing Chats"}>
          {chats
            .filter((chat) => !favoriteChats.find((favChat) => favChat.name == chat)?.favorited)
            .map((chat) => (
              <Form.Dropdown.Item key={chat} value={chat} title={chat} />
            ))}
        </Form.Dropdown.Section>
      </Form.Dropdown>

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
        label="Allow AI To Run Commands (Experimental)"
        id="useAICommandsCheckbox"
        value={useAutonomousFeatures}
        onChange={(value) => setUseAutonomousFeatures(value)}
      />

      <Form.Description title="Base Prompt" text={prompt} />

      {currentChatSettings && currentChatSettings.contextData.length ? <Form.Separator /> : null}
      {currentChatSettings && currentChatSettings.contextData.length ? (
        <Form.Description title="Context Data" text="Information provided as context for your conversation." />
      ) : null}
      {currentChatSettings?.contextData.map((data) => {
        return <Form.Description title={data.source} key={data.source + data.data.substring(0, 20)} text={data.data} />;
      })}
    </Form>
  );
}
