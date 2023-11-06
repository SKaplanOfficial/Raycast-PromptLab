import { execSync } from "child_process";
import { filterString } from "../../context-utils";
import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";
import { loadAdvancedSettingsSync } from "../../storage-utils";

/**
   * Placeholder for output of a shell script. If the script fails, this placeholder will be replaced with an empty string. No sanitization is done on the script input; the expectation is that users will only use this placeholder with trusted scripts.
   */
const ShellScriptPlaceholder: Placeholder = {
  name: "shell",
  regex: /{{shell( .*)?:(.|[ \\n\\r\\s])*?}}/g,
  apply: async (str: string) => {
    try {
      const settings = loadAdvancedSettingsSync().placeholderSettings;
      const bin = str.match(/(?<=shell)( .*)?(?=:(.|[ \n\r\s])*?}})/)?.[0]?.trim() || "/bin/zsh";
      const pathScript = settings.useUserShellEnvironment ? `export PATH=$(${bin} -ilc "echo -n \\$PATH") &&` : "";
      const script = pathScript + str.match(/(?<=shell( .*)?:)(.|[ \n\r\s])*?(?=}})/)?.[0];
      if (!script) return { result: "", shell: "" };
      const res = filterString(execSync(script, { encoding: "ascii", shell: bin }).toString());
      return { result: res, shell: res };
    } catch (e) {
      return { result: "", shell: "" };
    }
  },
  constant: false,
  fn: async (script: string, bin = "/bin/zsh") =>
    (await ShellScriptPlaceholder.apply(`{{shell ${bin}:${script}}}`))
      .result,
  example: '{{shell:echo "Hello World"}}',
  description:
    "Placeholder for output of a shell script. If the script fails, this placeholder will be replaced with an empty string.",
  hintRepresentation: "{{shell:...}}",
  fullRepresentation: "Run Shell Script",
  type: PlaceholderType.Script,
  categories: [PlaceholderCategory.Custom],
}

export default ShellScriptPlaceholder;