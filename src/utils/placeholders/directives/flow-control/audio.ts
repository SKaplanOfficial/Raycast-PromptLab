import { audioFileExtensions } from "../../../../data/file-extensions";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../../types";

export const AudioDirectives = audioFileExtensions.map((ext) => {
  const newPlaceholder: Placeholder = {
    name: `audio:${ext}`,
    regex: new RegExp(`{{${ext}:(([^{]|{(?!{)|{{[\\s\\S]*?}})*?)(:(([^{]|{(?!{)|{{[\\s\\S]*?}})*?))?}}`, "g"),
    apply: async (str: string, context?: { [key: string]: unknown }) => {
      if (!context) return { result: "", [`audio:${ext}`]: "" };
      if (!context["selectedFiles"]) return { result: "", [`audio:${ext}`]: "" };

      const onSuccess =
        str.match(new RegExp(`{{${ext}:(([^{]|{(?!{)|{{[\\s\\S]*?}})*?)(:(([^{]|{(?!{)|{{[\\s\\S]*?}})*?))?}}`))?.[1] ||
        "";
      const onFailure =
        str.match(new RegExp(`{{${ext}:(([^{]|{(?!{)|{{[\\s\\S]*?}})*?)(:(([^{]|{(?!{)|{{[\\s\\S]*?}})*?))?}}`))?.[4] ||
        "";

      const files = (context["selectedFiles"] as string).split(",");
      const containsImage = files.some((file) => file.toLowerCase().endsWith(ext));
      if (!containsImage) return { result: onFailure, [`image:${ext}`]: onFailure };
      return { result: onSuccess, [`image:${ext}`]: onSuccess };
    },
    result_keys: [`audio:${ext}`],
    constant: true,
    fn: async (content: string) => (await newPlaceholder.apply(`{{${ext}:${content}}}`)).result,
    example: `{{${ext}:This one if any ${ext} file is selected:This one if no ${ext} file is selected}}`,
    description: `Flow control directive to include some content if any ${ext} file is selected and some other content if no ${ext} file is selected.`,
    hintRepresentation: `{{${ext}:...:...}}`,
    fullRepresentation: `${ext.toUpperCase()} Condition`,
    type: PlaceholderType.InteractiveDirective,
    categories: [PlaceholderCategory.Logic, PlaceholderCategory.Meta],
  };
  return newPlaceholder;
});

/**
 * Directive for directions that will only be included in the prompt if any audio files are selected.
 */
const AudioFlowDirective: Placeholder = {
  name: "contentForAudio",
  regex: /{{audio:(([^{]|{(?!{)|{{[\s\S]*?}})*?)(:(([^{]|{(?!{)|{{[\s\S]*?}})*?))?}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    if (!context) return { result: "", contentForAudio: "" };
    if (!context["selectedFiles"]) return { result: "", contentForAudio: "" };

    const onSuccess =
      str.match(/{{audio:(([^{]|{(?!{)|{{[\s\S]*?}})*?)(:(([^{]|{(?!{)|{{[\s\S]*?}})*?))?}}/)?.[1] || "";
    const onFailure =
      str.match(/{{audio:(([^{]|{(?!{)|{{[\s\S]*?}})*?)(:(([^{]|{(?!{)|{{[\s\S]*?}})*?))?}}/)?.[4] || "";

    const files = (context["selectedFiles"] as string).split(",");
    const containsAudioFile = files.some((file) => audioFileExtensions.some((ext) => file.toLowerCase().endsWith(ext)));
    if (!containsAudioFile) return { result: onFailure, contentForAudio: onFailure };
    return { result: onSuccess, contentForAudio: onSuccess };
  },
  result_keys: ["contentForAudio"],
  constant: true,
  fn: async (content: string) => (await AudioFlowDirective.apply(`{{audio:${content}}}`)).result,
  example: "{{audio:This one if any audio file is selected:This one if no audio file is selected}}",
  description:
    "Flow control directive to include some content if any audio file is selected and some other content if no audio file is selected.",
  hintRepresentation: "{{audio:...:...}}",
  fullRepresentation: "Audio File Condition",
  type: PlaceholderType.InteractiveDirective,
  categories: [PlaceholderCategory.Logic, PlaceholderCategory.Meta],
};

export default AudioFlowDirective;
