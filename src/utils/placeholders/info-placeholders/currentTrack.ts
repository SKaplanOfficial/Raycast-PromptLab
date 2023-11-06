import { filterString, getCurrentTrack } from "../../context-utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for the name of the currently playing track in Music.app.
 */
const CurrentTrackPlaceholder: Placeholder = {
  name: "currentTrack",
  regex: /{{(currentTrack|currentSong)}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    if (context && "currentTrack" in context) {
      return { result: context["currentTrack"] as string, currentTrack: context["currentTrack"] as string };
    }

    const track = filterString(await getCurrentTrack());
    return { result: track, currentTrack: track };
  },
  result_keys: ["currentTrack"],
  constant: true,
  fn: async () => (await CurrentTrackPlaceholder.apply("{{currentTrack}}")).result,
  example: "What's the history behind {{currentTrack}}?",
  description: "Replaced with the name of the currently playing track in Music.app.",
  hintRepresentation: "{{currentTrack}}",
  fullRepresentation: "Name of Current Music Track",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Applications],
};

export default CurrentTrackPlaceholder;
