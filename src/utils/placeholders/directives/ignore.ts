import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Directive to ignore all content within the directive. Allows placeholders and directives to run without influencing the output.
 */
const IgnoreDirective: Placeholder = {
  name: "ignore",
  regex: /{{(ignore|IGNORE):[^}]*?}}/g,
  apply: async () => {
    return { result: "" };
  },
  constant: false,
  fn: async (content: string) => (await IgnoreDirective.apply(`{{ignore:${content}}}`)).result,
  example: '{{ignore:{{jxa:Application("Safari").activate()}}}}',
  description:
    "Directive to ignore all content within the directive. Allows placeholders and directives to run without influencing the output.",
  hintRepresentation: "{{ignore:...}}",
  fullRepresentation: "Ignore",
  type: PlaceholderType.StaticDirective,
  categories: [PlaceholderCategory.Meta],
};

export default IgnoreDirective;
