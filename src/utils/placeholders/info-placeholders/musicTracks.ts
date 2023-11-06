import { filterString, getTrackNames } from "../../context-utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for the comma-separated list of track names in Music.app.
 */
const MusicTracksPlaceholder: Placeholder = {
  name: "musicTracks",
  regex: /{{musicTracks}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    if (context && "musicTracks" in context) {
      return { result: context["musicTracks"] as string, musicTracks: context["musicTracks"] as string };
    }

    const tracks = filterString(await getTrackNames());
    return { result: tracks, musicTracks: tracks };
  },
  result_keys: ["musicTracks"],
  constant: true,
  fn: async () => (await MusicTracksPlaceholder.apply("{{musicTracks}}")).result,
  example: "Recommend some new songs based on the themes of these songs: {{musicTracks}}",
  description: "Replaced with a comma-separated list of track names in Music.app.",
  hintRepresentation: "{{musicTracks}}",
  fullRepresentation: "List of Music Tracks",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Applications],
};

export default MusicTracksPlaceholder;
