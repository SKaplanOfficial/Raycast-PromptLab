import { runAppleScript } from "@raycast/utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
   * Placeholder for the current time supporting an optional format argument. Defaults to "Hour:Minute:Second AM/PM". Barring any issues, this should always be replaced.
   */
const TimePlaceholder: Placeholder = {
  name: "time",
  regex: /{{(time|currentTime)( format=("|').*?("|'))?}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    const format = str.match(/(?<=format=("|')).*?(?=("|'))/)?.[0] || "HH:mm:s a";
    const time =
      context && "time" in context
        ? context["time"] as string
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
    return { result: time, time: time };
  },
  result_keys: ["time"],
  constant: false,
  fn: async (format?: string) =>
    (
      await TimePlaceholder.apply(
        `{{time${format?.length ? ` format="${format}"` : ""}}}`
      )
    ).result,
  example: "It's currently {{time format='HH:mm'}}. How long until dinner?",
  description: "Replaced with the current time in the specified format.",
  hintRepresentation: "{{time}}",
  fullRepresentation: "Current Time",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Calendar],
}

export default TimePlaceholder;