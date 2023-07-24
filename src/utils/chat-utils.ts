import { Color, Icon, LocalStorage, environment } from "@raycast/api";
import runModel from "./runModel";
import { Chat, ChatRef, ChatStatistics, MessageType } from "./types";
import * as fs from "fs";
import { ADVANCED_SETTINGS_FILENAME, CHATS_DIRECTORY } from "./constants";
import path from "path";
import crypto from "crypto";

/**
 * Generates a chat name based on the query. Maximum three words, 25 characters.
 * @param query The query to generate a chat name from.
 * @returns A promise resolving to the generated chat name.
 */
export const generateTitle = async (query: string) => {
  const namePrompt =
    "Come up with a title, in Title Case, for a conversation started with the following query. The title must summarize the intent of the query. The title must be three words or shorter. Output only the title without commentary or labels. For example, if the query is 'What are galaxies?', the title you output might be 'Question About Galaxies'. Here is the query: ";

  const nameComponent =
    (await runModel(
      namePrompt,
      namePrompt +
        `'''${query.match(/(?<=My next query is: ###)[\s\S]*(?=### <END OF QUERY>)/g)?.[0]?.trim() || ""}'''`,
      query
    )) || query.trim().split(" ").splice(0, 2).join(" ");
  const dateComponent = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });

  const newChatName = `${nameComponent.trim().substring(0, 25)} - ${dateComponent}`;
  return newChatName;
};

/**
 * Adds contextual information to a query.
 * @param query The query to add context to.
 * @param chat The current chat object.
 * @param chats The chat manager.
 * @param currentResponse The current response.
 * @param useFilesOverride Override for whether to use selected files as context.
 * @param useConversationOverride Override for whether to use the conversation history as context.
 * @param allowAutonomyOverride Override for whether to allow autonomous execution of PromptLab commands.
 * @param files The selected files.
 * @returns A promise resolving to the query with context inserted.
 */
export const addContextForQuery = async (
  query: string,
  chat: Chat | undefined,
  currentResponse: string,
  useFilesOverride: boolean,
  useConversationOverride: boolean,
  allowAutonomyOverride: boolean,
  files: {
    selectedFiles: {
      paths: string[];
      csv: string;
    };
    fileContents:
      | {
          [key: string]: string;
          contents: string;
        }
      | undefined;
  }
) => {
  const conversation = chat ? chat.conversation || [] : [];

  // Get command descriptions
  const commands = await LocalStorage.allItems();
  const commandDescriptions = Object.entries(commands)
    .filter(([key]) => !key.startsWith("--") && !key.startsWith("id-"))
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([, value], index) => `${index}:${JSON.parse(value)["description"]}`);

  // Meta prompt opening, same regardless of user settings
  let subbedQuery = `Use this base prompt for context as you consider my next input. It is currently ${new Date().toISOString()}. Here is the prompt: ###${
    chat?.basePrompt || ""
  }###`;

  // Add chat-specific context data, if any exists
  if (chat && chat.contextData.length > 0 && !conversation.join("\n").includes(chat.contextData[0].data)) {
    const contextData = chat.contextData.map((data) => `${data.source}:${data.data}`).join("\n\n");
    subbedQuery += `\n\nYou will also consider this information: ###${contextData}###`;
  }

  // Add file contents if necessary and if any files are selected
  if (((chat && chat.useSelectedFilesContext) || useFilesOverride) && files.selectedFiles?.paths?.length) {
    subbedQuery += `\n\nYou will also consider these files: ###${files.fileContents?.contents || ""}###`;
  }

  // Add conversation history if necessary and if any exists
  if (((chat && chat.useConversationContext) || useConversationOverride) && conversation.length) {
    const conversationData = conversation.map((entry) => `${entry.type}:${entry.text}`).join("\n");
    subbedQuery += `\n\nYou will also consider our conversation history. The history so far: ###${conversationData}###\n\n`;
  } else {
    subbedQuery += `\n\nYou will also consider your previous response. Your previous response was: ###${currentResponse.replaceAll(
      /{{cmd:(.*?):(.*?)}}/g,
      ""
    )}###`;
  }

  // Add command-calling instructions if necessary
  if ((chat && chat.allowAutonomy) || allowAutonomyOverride) {
    const commandDescriptionsStr = commandDescriptions.join(", ");
    subbedQuery += `\n\nTry to answer my next query, but only if it simple enough for an LLM with limited knowledge to answer. If you cannot fulfill the query, if the query requires new information, or if the query invokes an action such as searching, choose the command from the following list that is most likely to carry out the goal expressed in the query, then respond with the number of the command to run in the format {{cmd:commandNumber:input}}. Replace 'input' with a short string according to my query. For example, if I say 'search google for AI', the input would be 'AI'. Here are the commands: ###${commandDescriptionsStr}###\n\nTry to answer without using a command, unless the query asks for new information (e.g. latest news) or invokes an action (e.g. searching, opening apps). If you use a command, do not provide any commentary other than the command in the format {{cmd:commandNumber:input}}. Make sure the command is relevant to the current query.`;
  }

  // Meta prompt closing
  subbedQuery += `\n\nDo not repeat any of this message. My next query is: ###${query}### <END OF QUERY>`;

  return subbedQuery;
};

/**
 * Calculates statistics for a chat.
 * @param chat The chat to calculate statistics for.
 * @returns The statistics for the chat.
 */
export const calculateStats = async (chat: Chat): Promise<ChatStatistics> => {
  const convo = chat.conversation;

  const stats: ChatStatistics = {
    totalQueries: "0",
    totalResponses: "0",
    totalPlaceholdersUsedByUser: "0",
    totalCommandsRunByAI: "0",
    mostCommonQueryWords: [],
    mostCommonResponseWords: [],
    totalLengthOfContextData: "0",
    lengthOfBasePrompt: "0",
    averageQueryLength: "0",
    averageResponseLength: "0",
    mostUsedPlaceholder: "None",
    mostUsedCommand: "None",
    mostUsedEmojis: [],
  };

  stats.lengthOfBasePrompt = `${chat.basePrompt.length} characters`;

  if (convo) {
    const queries = convo.filter((entry) => entry.type == MessageType.QUERY).map((entry) => entry.text);
    const responses = convo.filter((entry) => entry.type == MessageType.RESPONSE).map((entry) => entry.text);
    const placeholders = queries.filter((entry) => entry.match(/.*{{.*}}.*/g) != undefined);
    const commands = responses.filter((entry) => entry.match(/.*{{cmd:.*}}.*/g) != undefined);
    const emojis = responses
      .map((entry) => entry.match(/(\p{Extended_Pictographic}){1}/gu) || "")
      .flat()
      .filter((entry) => entry.trim().length > 0);

    stats.totalQueries = `${queries.length} queries`;
    stats.totalResponses = `${responses.length} responses`;
    stats.totalPlaceholdersUsedByUser = `${placeholders.length} placeholders`;
    stats.totalCommandsRunByAI = `${commands.length} commands`;

    stats.averageQueryLength = `${queries.reduce((acc, cv) => acc + cv.length, 0) / queries.length} characters`;
    stats.averageResponseLength = `${responses.reduce((acc, cv) => acc + cv.length, 0) / responses.length} characters`;

    const queryWords = queries
      .map((query) => query.split(" "))
      .flat()
      .map((entry) => entry.trim());
    const responseWords = responses.map((response) => response.split(" ")).flat();

    const getFrequencyHistogram = (arr: string[]) => {
      const freqs: { [key: string]: number } = {};
      arr.forEach((word) => {
        if (freqs[word]) {
          freqs[word] += 1;
        } else {
          freqs[word] = 1;
        }
      });
      return freqs;
    };

    const queryWordCounts = getFrequencyHistogram(queryWords);
    const responseWordCounts = getFrequencyHistogram(responseWords);
    const placeholderCounts = getFrequencyHistogram(placeholders);
    const commandCounts = getFrequencyHistogram(commands);
    const emojiCounts = getFrequencyHistogram(emojis);

    const queryWordsByFreq = Object.entries(queryWordCounts).sort((a, b) => b[1] - a[1]);

    stats.mostCommonQueryWords = queryWordsByFreq.slice(0, 5).map((word) => `${word[0]} - ${word[1]} times`);

    const responseWordsByFreq = Object.entries(responseWordCounts).sort((a, b) => b[1] - a[1]);
    stats.mostCommonResponseWords = responseWordsByFreq.slice(0, 5).map((word) => `${word[0]} - ${word[1]} times`);

    const placeholdersByFreq = Object.entries(placeholderCounts).sort((a, b) => b[1] - a[1]);
    stats.mostUsedPlaceholder = placeholdersByFreq.length
      ? `${placeholdersByFreq[0][0]} - ${placeholdersByFreq[0][1]} times`
      : "None";

    const commandsByFreq = Object.entries(commandCounts).sort((a, b) => b[1] - a[1]);
    stats.mostUsedCommand = commandsByFreq.length ? `${commandsByFreq[0][0]} - ${commandsByFreq[0][1]} times` : "None";

    const emojisByFreq = Object.entries(emojiCounts).sort((a, b) => b[1] - a[1]);
    stats.mostUsedEmojis = emojisByFreq.slice(0, 5).map((word) => `${word[0]} - ${word[1]} times`);
  }

  let contextDataLength = 0;
  chat.contextData.forEach((context) => {
    contextDataLength += context.data.length;
  });
  stats.totalLengthOfContextData = contextDataLength + " characters";
  return stats;
};

/**
 * Creates a new chat.
 * @param name The name of the chat.
 * @param basePrompt The base prompt for the chat.
 * @param options The options for the chat.
 * @returns The new chat.
 */
export const createChat = async (name: string, basePrompt: string, options: object) => {
  const chatsDir = path.join(environment.supportPath, CHATS_DIRECTORY);

  let id = `CH${crypto.randomUUID()}`;
  while (fs.existsSync(`${chatsDir}/${id}.json`)) {
    id = `CH${crypto.randomUUID()}`;
  }

  let newChat: Chat = {
    id: id,
    name: name,
    icon: Icon.Message,
    iconColor: Color.Red,
    basePrompt: basePrompt,
    favorited: false,
    conversation: [],
    contextData: [],
    condensingStrategy: "summarize",
    summaryLength: "100",
    showBasePrompt: true,
    useSelectedFilesContext: false,
    useConversationContext: true,
    allowAutonomy: false,
    ...options,
  };

  try {
    const advancedSettingsValues = JSON.parse(
      fs.readFileSync(path.join(environment.supportPath, ADVANCED_SETTINGS_FILENAME), "utf-8")
    );
    if ("chatDefaults" in advancedSettingsValues) {
      newChat = {
        ...advancedSettingsValues.chatDefaults,
        name: name,
        basePrompt: basePrompt,
        contextData: [],
        id: id,
        conversation: [],
      };
    }
  } catch (error) {
    console.error(error);
  }
  await fs.promises.writeFile(`${chatsDir}/${id}.json`, JSON.stringify(newChat, null, 2));
  return newChat;
};

/**
 * Loads all chat references from the chats directory.
 * @returns A promise that resolves to an array of chat references.
 */
export const loadRefs = async (): Promise<ChatRef[]> => {
  const chatsDir = path.join(environment.supportPath, CHATS_DIRECTORY);


  // Load chats from local storage
  const chatObjs: ChatRef[] = [];

  // Load chats from the chats directory
  const chatFiles = fs
    .readdirSync(chatsDir)
    .sort((a, b) => (fs.statSync(`${chatsDir}/${b}`).mtimeMs - fs.statSync(`${chatsDir}/${a}`).mtimeMs > 0 ? 1 : -1));

  for (const chatFile of chatFiles) {
    const chatID = chatFile.replace(".json", "");
    if (chatID.length == 0 || chatID.startsWith(".")) continue;
    if (chatObjs.find((chat) => chat.id === chatID)) continue;
    const chatContents = await fs.promises.readFile(`${chatsDir}/${chatFile}`, "utf-8");
    const chat = JSON.parse(chatContents) as Chat;
    const ref = {
      id: chat.id,
      name: chat.name,
      file: `${chatsDir}/${chatFile}`,
      icon: chat.icon,
      iconColor: chat.iconColor,
      favorited: chat.favorited,
    };
    chatObjs.push(ref);
  }
  return chatObjs;
};

/**
 * Loads a chat from a chat reference.
 * @param ref A reference to the chat to load.
 */
export const loadChat = async (ref: ChatRef | string): Promise<Chat> => {
  if (typeof ref === "string") {
    // Load chat from ID string
    const chatFile = path.join(environment.supportPath, CHATS_DIRECTORY, `${ref}.json`);

    const chatContents = await fs.promises.readFile(chatFile, "utf-8");
    const chat = JSON.parse(chatContents) as Chat;
    return chat;
  }
  // Load chat from chat reference
  const chatContents = await fs.promises.readFile(ref.file, "utf-8");
  const chat = JSON.parse(chatContents) as Chat;
  return chat;
};

/**
 * Deletes a chat.
 * @param ref A reference to the chat to delete.
 * @returns A promise that resolves when the chat has been deleted.
 */
export const deleteChat = async (ref: ChatRef | string) => {
  if (typeof ref === "string") {
    // Delete chat from ID string
    const chatFile = path.join(environment.supportPath, CHATS_DIRECTORY, `${ref}.json`);

    if (fs.existsSync(chatFile)) {
      await fs.promises.rm(chatFile);
    }
  } else if (fs.existsSync(ref.file)) {
    await fs.promises.rm(ref.file);
  }
};

/**
 * Updates the value of a single property in a chat's settings.
 * @param chat The chat to update.
 * @param property The name of the property to update.
 * @param value The new value of the property.
 * @returns A promise that resolves when the property has been updated.
 */
export const setChatProperty = async (chat: Chat, property: string, value: string | boolean) => {
  const newChat = { ...chat, [property]: value };
  const chatFile = path.join(environment.supportPath, CHATS_DIRECTORY, `${chat.id}.json`);
  await fs.promises.writeFile(chatFile, JSON.stringify(newChat));
};

/**
 * Updates a chat's settings.
 * @param chatData The new chat data.
 * @returns A promise that resolves when the chat has been updated.
 */
export const updateChat = async (chatData: Chat) => {
  const chatFile = path.join(environment.supportPath, CHATS_DIRECTORY, `${chatData.id}.json`);
  await fs.promises.writeFile(chatFile, JSON.stringify(chatData));
};

/**
 * Checks whether a chat currently exists (i.e. whether it has an associated file).
 * @param ref A reference to the chat to check.
 * @returns True if the chat exists, false otherwise.
 */
export const checkExists = (ref: ChatRef) => {
  if (!fs.existsSync(ref.file)) {
    return false;
  }
  return true;
};

export const addQuery = async (chat: Chat, query: string) => {
  chat.conversation.push({
    text: query,
    type: MessageType.QUERY,
    date: new Date().toISOString(),
  });
  const chatFile = path.join(environment.supportPath, CHATS_DIRECTORY, `${chat.id}.json`);
  await fs.promises.writeFile(chatFile, JSON.stringify(chat));
};

export const addResponse = async (chat: Chat, response: string) => {
  chat.conversation.push({
    text: response,
    type: MessageType.RESPONSE,
    date: new Date().toISOString(),
  });
  const chatFile = path.join(environment.supportPath, CHATS_DIRECTORY, `${chat.id}.json`);
  await fs.promises.writeFile(chatFile, JSON.stringify(chat));
};

export const addSystemMessage = async (chat: Chat, message: string) => {
  chat.conversation.push({
    text: message,
    type: MessageType.SYSTEM,
    date: new Date().toISOString(),
  });
  const chatFile = path.join(environment.supportPath, CHATS_DIRECTORY, `${chat.id}.json`);
  await fs.promises.writeFile(chatFile, JSON.stringify(chat));
};
