import { filterString } from "../../../context-utils";
import { ScriptRunner } from "../../../scripts";
import { CalendarDuration, EventType } from "../../../types";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../../types";

/**
 * Placeholder for a comma-separated list of the name and due date/time of all reminders that are scheduled over the next 7 days.
 */
const WeekRemindersPlaceholder: Placeholder = {
  name: "weekReminders",
  regex: /{{(weekReminders|weekTasks|weekTodos)}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    if (context && "weekReminders" in context) {
      return { result: context["weekReminders"] as string, weekReminders: context["weekReminders"] };
    }

    const reminders = filterString(await ScriptRunner.Events(EventType.REMINDER, CalendarDuration.WEEK));
    return { result: reminders, weekReminders: reminders };
  },
  result_keys: ["weekReminders"],
  constant: true,
  fn: async () => (await WeekRemindersPlaceholder.apply("{{weekReminders}}")).result,
  example: "Tell me about my reminders this week based on the following list: {{weekReminders}}.",
  description:
    "Replaced with a list of the name and due date/time of all reminders that are scheduled over the next 7 days.",
  hintRepresentation: "{{weekReminders}}",
  fullRepresentation: "This Week's Reminders",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Calendar],
};

export default WeekRemindersPlaceholder;
