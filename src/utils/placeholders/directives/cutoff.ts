import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Directive to cut off the provided content after the specified number of characters.
 */
const CutoffDirective: Placeholder = {
  name: "cutoff",
  regex: /{{cutoff [0-9]+:(([^{]|{(?!{)|{{[\s\S]*?}})*?)}}/g,
  apply: async (str: string) => {
    const matches = str.match(/(?<=(cutoff ))[0-9]+:(([^{]|{(?!{)|{{[\s\S]*?}})*?)}}/);
    if (!matches) return { result: "" };
    const cutoff = parseInt(matches[0]);
    const content = matches[2];
    return { result: content.slice(0, cutoff) };
  },
  constant: false,
  fn: async (cutoff: string, content: string) =>
    (await CutoffDirective.apply(`{{cutoff ${cutoff}:${content}}}`)).result,
  example: "{{cutoff 5:Hello World}}",
  description: "Cuts off the content after the specified number of characters.",
  hintRepresentation: "{{cutoff n:...}}",
  fullRepresentation: "Cutoff",
  type: PlaceholderType.StaticDirective,
  categories: [PlaceholderCategory.Meta],
};

export default CutoffDirective;
