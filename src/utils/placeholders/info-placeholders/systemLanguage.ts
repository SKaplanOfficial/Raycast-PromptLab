import { runAppleScript } from "@raycast/utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";

/**
 * Placeholder for the default language for the current user. Barring any issues, this should always be replaced.
 */
const SystemLanguagePlaceholder: Placeholder = {
  name: "systemLanguage",
  regex: /{{(systemLanguage|language)}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    const lang =
      context && "lang" in context
        ? (context["lang"] as string)
        : await runAppleScript(`use framework "Foundation"
              set locale to current application's NSLocale's autoupdatingCurrentLocale()
              set langCode to locale's languageCode()
              return (locale's localizedStringForLanguageCode:langCode) as text`);
    return { result: lang, systemLanguage: lang };
  },
  result_keys: ["systemLanguage"],
  constant: true,
  fn: async () => (await SystemLanguagePlaceholder.apply("{{systemLanguage}}")).result,
  example: 'Translate "Ciao" to {{systemLanguage}}',
  description: "Replaced with the name of the default language for the current user.",
  hintRepresentation: "{{systemLanguage}}",
  fullRepresentation: "System Language",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Device],
};

export default SystemLanguagePlaceholder;
