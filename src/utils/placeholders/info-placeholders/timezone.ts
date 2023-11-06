import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for the long name of the current timezone. Barring any issues, this should always be replaced.
 */
const TimezonePlaceholder: Placeholder = {
  name: "timezone",
  regex: /{{timezone}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    const time =
      context && "timezone" in context
        ? context["timezone"] as string
        : Intl.DateTimeFormat(undefined, { timeZoneName: "long" })
            .formatToParts(new Date())
            .filter((s) => s.type == "timeZoneName")?.[0]?.value || Intl.DateTimeFormat().resolvedOptions().timeZone;
    return { result: time, time: time };
  },
  result_keys: ["timezone"],
  constant: true,
  fn: async () => (await TimezonePlaceholder.apply(`{{timezone}}`)).result,
  example: "Convert {{time}} PST to {{timezone}}.",
  description: "Replaced with name of the current timezone.",
  hintRepresentation: "{{timezone}}",
  fullRepresentation: "Current Time Zone",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Location],
}

export default TimezonePlaceholder;