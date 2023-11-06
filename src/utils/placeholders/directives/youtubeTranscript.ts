import {
  filterString,
  getMatchingYouTubeVideoID,
  getYouTubeVideoTranscriptById,
  getYouTubeVideoTranscriptByURL,
} from "../../context-utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Replaces YouTube placeholders with the transcript of the corresponding YouTube video.
 */
const YouTubeTranscriptPlaceholder: Placeholder = {
  name: "youtube",
  regex: /{{(youtube|yt):[\s\S]*?}}/g,
  apply: async (str: string) => {
    const specifier = str.match(/(?<=(youtube|yt):)[\s\S]*?(?=}})/)?.[0] || "";
    if (specifier.trim().length == 0) {
      return { result: "No video specified" };
    }

    const transcriptText = specifier.startsWith("http")
      ? await getYouTubeVideoTranscriptByURL(specifier)
      : await getYouTubeVideoTranscriptById(await getMatchingYouTubeVideoID(specifier));
    return { result: filterString(transcriptText) };
  },
  constant: false,
  fn: async (idOrURL: string) => (await YouTubeTranscriptPlaceholder.apply(`{{youtube:${idOrURL}}}`)).result,
  example: "{{youtube:https://www.youtube.com/watch?v=dQw4w9WgXcQ}}",
  description: "Replaced with the transcript of the corresponding YouTube video.",
  hintRepresentation: "{{youtube:...}}",
  fullRepresentation: "Transcription of YouTube Video",
  type: PlaceholderType.InteractiveDirective,
  categories: [PlaceholderCategory.Internet],
};

export default YouTubeTranscriptPlaceholder;
