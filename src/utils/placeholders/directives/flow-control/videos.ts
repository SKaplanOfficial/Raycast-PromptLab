import { videoFileExtensions } from "../../../../data/file-extensions";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../../types";

export const VideoDirectives = videoFileExtensions.map((ext) => {
  const newPlaceholder: Placeholder = {
    name: `video:${ext}`,
    regex: new RegExp(`{{${ext}:(([^{]|{(?!{)|{{[\\s\\S]*?}})*?)(:(([^{]|{(?!{)|{{[\\s\\S]*?}})*?))?}}`, "g"),
    apply: async (str: string, context?: { [key: string]: unknown }) => {
      if (!context) return { result: "", [`video:${ext}`]: "" };
      if (!context["selectedFiles"]) return { result: "", [`video:${ext}`]: "" };

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
    result_keys: [`video:${ext}`],
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
 * Directive for directions that will only be included in the prompt if any video files are selected.
 */
const VideoFlowDirective: Placeholder = {
  name: "contentForVideos",
  regex: /{{videos:(([^{]|{(?!{)|{{[\s\S]*?}})*?)(:(([^{]|{(?!{)|{{[\s\S]*?}})*?))?}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    if (!context) return { result: "", contentForVideos: "" };
    if (!context["selectedFiles"]) return { result: "", contentForVideos: "" };

    const onSuccess =
      str.match(/{{videos:(([^{]|{(?!{)|{{[\s\S]*?}})*?)(:(([^{]|{(?!{)|{{[\s\S]*?}})*?))?}}/)?.[1] || "";
    const onFailure =
      str.match(/{{videos:(([^{]|{(?!{)|{{[\s\S]*?}})*?)(:(([^{]|{(?!{)|{{[\s\S]*?}})*?))?}}/)?.[4] || "";

    const files = (context["selectedFiles"] as string).split(",");
    const contentForVideos = files.some((file) => videoFileExtensions.some((ext) => file.toLowerCase().endsWith(ext)));
    if (!contentForVideos) return { result: onFailure, contentForVideos: onFailure };
    return { result: onSuccess, contentForVideos: onSuccess };
  },
  result_keys: ["contentForVideos"],
  constant: true,
  fn: async (content: string) => (await VideoFlowDirective.apply(`{{videos:${content}}}`)).result,
  example: "{{videos:This one if any video file is selected:This one if no video file is selected}}",
  description:
    "Flow control directive to include some content if any video file is selected and some other content if no video file is selected.",
  hintRepresentation: "{{videos:...:...}}",
  fullRepresentation: "Video File Condition",
  type: PlaceholderType.InteractiveDirective,
  categories: [PlaceholderCategory.Logic, PlaceholderCategory.Meta],
};

export default VideoFlowDirective;
