import { filterString } from "../../../context-utils";
import { ScriptRunner } from "../../../scripts";
import { CalendarDuration, EventType } from "../../../types";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../../types";

/**
 * Placeholder for a comma-separated list of the name and due date/time of all reminders that are scheduled over the next 365 days.
 */
const YearRemindersPlaceholder: Placeholder = {
  name: "yearReminders",
  regex: /{{(yearReminders|yearTasks|yearTodos)}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    if (context && "yearReminders" in context) {
      return { result: context["yearReminders"] as string, yearReminders: context["yearReminders"] };
    }

    const reminders = filterString(await ScriptRunner.Events(EventType.REMINDER, CalendarDuration.YEAR));
    return { result: reminders, yearReminders: reminders };
  },
  result_keys: ["yearReminders"],
  constant: true,
  fn: async () => (await YearRemindersPlaceholder.apply("{{yearReminders}}")).result,
  example: "Tell me about my reminders this year based on the following list: {{yearReminders}}.",
  description:
    "Replaced with a list of the name and due date/time of all reminders that are scheduled over the next 365 days.",
  hintRepresentation: "{{yearReminders}}",
  fullRepresentation: "This Year's Reminders",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Calendar],
};

export default YearRemindersPlaceholder;
