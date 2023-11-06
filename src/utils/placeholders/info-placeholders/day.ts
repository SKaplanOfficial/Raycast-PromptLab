import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for the current day of the week, e.g. "Monday", using en-US as the default locale. Supports an optional locale argument. Barring any issues, this should always be replaced.
 */
const DayPlaceholder: Placeholder = {
  name: "day",
  regex: /{{(day|dayName|currentDay|currentDayName)( locale=("|').*?("|'))?}}/g,
  apply: async (str: string) => {
    const locale = str.match(/(?<=locale=("|')).*?(?=("|'))/)?.[0] || "en-US";
    const day = new Date().toLocaleDateString(locale, { weekday: "long" });
    return { result: day, day: day };
  },
  result_keys: ["day"],
  constant: false,
  fn: async (locale: string) =>
    (await DayPlaceholder.apply(`{{day${locale?.length ? ` locale="${locale}"` : ""}}}`)).result,
  example: "Write a generic agenda for {{day locale='en-GB'}}",
  description: "Replaced with the name of the current day of the week in the specified locale.",
  hintRepresentation: "{{day}}",
  fullRepresentation: "Day of Week",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Calendar],
};

export default DayPlaceholder;
