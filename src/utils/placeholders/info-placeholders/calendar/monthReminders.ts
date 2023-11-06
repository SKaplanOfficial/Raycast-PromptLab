import { filterString } from "../../../context-utils";
import { ScriptRunner } from "../../../scripts";
import { CalendarDuration, EventType } from "../../../types";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../../types";

/**
 * Placeholder for a comma-separated list of the name and due date/time of all reminders that are scheduled over the next 30 days.
 */
const MonthRemindersPlaceholder: Placeholder = {
  name: "monthReminders",
  regex: /{{(monthReminders|monthTasks|monthTodos)}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    if (context && "monthReminders" in context) {
      return { result: context["monthReminders"] as string, monthReminders: context["monthReminders"] };
    }

    const reminders = filterString(await ScriptRunner.Events(EventType.REMINDER, CalendarDuration.MONTH));
    return { result: reminders, monthReminders: reminders };
  },
  result_keys: ["monthReminders"],
  constant: true,
  fn: async () => (await MonthRemindersPlaceholder.apply("{{monthReminders}}")).result,
  example: "Tell me about my reminders this month based on the following list: {{monthReminders}}.",
  description:
    "Replaced with a list of the name and due date/time of all reminders that are scheduled over the next 30 days.",
  hintRepresentation: "{{monthReminders}}",
  fullRepresentation: "This Month's Reminders",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Calendar],
};

export default MonthRemindersPlaceholder;
