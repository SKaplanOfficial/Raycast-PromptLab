import { Color, Icon } from "@raycast/api";
import { Model } from "../utils/types";

export const defaultModels: { [key: string]: Model } = {
  "--model-GPT-3.5-Turbo via Raycast AI": {
    name: "GPT-3.5-Turbo via Raycast AI",
    description: "Most capable GPT-3.5 model and optimized for chat.",
    endpoint: "Raycast AI 3.5",
    authType: "",
    apiKey: "",
    inputSchema: "",
    outputKeyPath: "",
    outputTiming: "async",
    lengthLimit: "2500",
    favorited: false,
    id: "",
    icon: Icon.Rocket,
    iconColor: Color.Red,
    notes: "",
    isDefault: false,
    temperature: "1.0",
  },
  "--model-Text-Davinci-003 Via Raycast AI": {
    name: "Text-Davinci-003 Via Raycast AI",
    description:
      "Can do any language task with better quality, longer output, and consistent instruction-following than the curie, babbage, or ada models.",
    endpoint: "Raycast AI",
    authType: "",
    apiKey: "",
    inputSchema: "",
    outputKeyPath: "",
    outputTiming: "async",
    lengthLimit: "2500",
    favorited: false,
    id: "",
    icon: Icon.TextInput,
    iconColor: Color.Blue,
    notes: "",
    isDefault: true,
    temperature: "1.0",
  },
};
