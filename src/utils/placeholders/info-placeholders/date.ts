import { runAppleScript } from "@raycast/utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for the current date supporting an optional format argument. Defaults to "Month Day, Year". Barring any issues, this should always be replaced.
 */
const DatePlaceholder: Placeholder = {
  name: "date",
  regex: /{{(date|currentDate)( format=("|').*?("|'))?}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    const format = str.match(/(?<=format=("|')).*?(?=("|'))/)?.[0] || "MMMM d, yyyy";
    const dateStr =
      context && "date" in context
        ? (context["date"] as string)
        : await runAppleScript(`use framework "Foundation"
      set currentDate to current application's NSDate's alloc()'s init()
      try
        set formatter to current application's NSDateFormatter's alloc()'s init()
        set format to "${format}"
        formatter's setAMSymbol:"AM"
        formatter's setPMSymbol:"PM"
        formatter's setDateFormat:format
        return (formatter's stringFromDate:currentDate) as string
      end try`);
    return { result: dateStr, date: dateStr };
  },
  result_keys: ["date"],
  constant: false,
  fn: async (format: string) =>
    (await DatePlaceholder.apply(`{{date${format?.length ? ` format="${format}"` : ""}}`)).result,
  example: "What happened on {{date format='MMMM d'}} in history?",
  description: "Replaced with the current date in the specified format.",
  hintRepresentation: "{{date}}",
  fullRepresentation: "Current Date",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Calendar],
};

export default DatePlaceholder;
