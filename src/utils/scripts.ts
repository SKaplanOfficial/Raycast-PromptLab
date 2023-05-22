import { spawn } from "child_process";
import { runAppleScript } from "run-applescript";
import * as util from "util";
import { DebugStyle, logDebug } from "./dev-utils";

/**
 * Executes an OSA script using the `osascript` command.
 * @param script The script to execute (either a path to a file or the script itself)
 * @param args The arguments to pass to the script
 * @param language The language of the script, defaults to AppleScript
 * @returns A promise that resolves to the output of the script.
 */
export const execScript = (
  script: string,
  args: (string | boolean | number)[],
  language = "AppleScript",
  stderrCallback?: (data: string) => void
): { data: Promise<string>; sendMessage: (msg: string) => void } => {
  let data = "";
  let sendMessage: (msg: string) => void = (msg: string) => {
    msg;
  };
  const proc = spawn("osascript", [
    ...(script.startsWith("/") ? [] : ["-e"]),
    script,
    "-l",
    language,
    ...args.map((x) => x.toString()),
  ]);

  logDebug(
    `Running shell command "osascript ${[
      ...(script.startsWith("/") ? [] : ["-e"]),
      script,
      "-l",
      language,
      ...args.map((x) => x.toString()),
    ].join(" ")}"`
  );

  proc.stdout?.on("data", (chunk) => {
    data += chunk.toString();
  });

  proc.stderr?.on("data", (chunk) => {
    if (stderrCallback) {
      stderrCallback(chunk.toString());
    }
  });

  proc.stdin.on("error", (err) => {
    logDebug(`Error writing to stdin: ${err}`, DebugStyle.Error);
  });

  sendMessage = async (message: string) => {
    if (message?.length > 0) {
      proc.stdin.cork();
      proc.stdin.write(`${message}\r\n`);
      proc.stdin.pipe(proc.stdin, { end: false });
      process.nextTick(() => proc.stdin.uncork());
    }
  };

  const waitForFinish = async () => {
    while (proc.stdout?.readable && proc.stderr?.readable && proc.stdin?.writable) {
      await util.promisify(setTimeout)(100);
    }
    return data;
  };

  return { data: waitForFinish(), sendMessage: sendMessage };
};

/** AppleScriptObjC framework and library imports */
export const objcImports = `use framework "AVFoundation"
use framework "CoreLocation"
use framework "CoreMedia"
use framework "EventKit"
use framework "Foundation"
use framework "GamePlayKit"
use framework "LatentSemanticMapping"
use framework "MapKit"
use framework "PDFKit"
use framework "Photos"
use framework "Quartz"
use framework "SafariServices"
use framework "ScreenCaptureKit"
use framework "ScreenSaver"
use framework "SoundAnalysis"
use framework "Speech"
use framework "Vision"
use framework "WebKit"
use scripting additions`;

/** AS handler to split text around the provided delimiter */
export const splitHandler = `on split(theText, theDelimiter)
    set oldDelimiters to AppleScript's text item delimiters
    set AppleScript's text item delimiters to theDelimiter
    set theArray to every text item of theText
    set AppleScript's text item delimiters to oldDelimiters
    return theArray
end split`;

/** AS handler to replace all occurrences of a string */
export const replaceAllHandler = `on replaceAll(theText, textToReplace, theReplacement)
    set theString to current application's NSString's stringWithString:theText
    set replacedString to theString's stringByReplacingOccurrencesOfString:textToReplace withString:theReplacement
    return replacedString as text
end replaceAll`;

/** AS handler to trim leading and trailing whitespace, including newlines */
export const trimHandler = `on trim(theText)
    set theString to current application's NSString's stringWithString:theText
    set spaces to current application's NSCharacterSet's whitespaceAndNewlineCharacterSet
    set trimmedString to theString's stringByTrimmingCharactersInSet:spaces
    return trimmedString as text
end trim`;

/** AS handler to randomly select items from a list */
export const rselectHandler = `on rselect(theList, numItems)
    set randomSource to current application's GKRandomSource's alloc()'s init()
    set shuffledArray to randomSource's arrayByShufflingObjectsInArray:theList
    return items 1 thru numItems of (shuffledArray as list)
end rselect`;

/**
 * Adds a file to the current Finder selection.
 * @param filePath The path of the file to add to the selection.
 * @returns A promise that resolves to void when the AppleScript has finished running.
 */
export const addFileToSelection = async (filePath: string) => {
  await runAppleScript(`tell application "Finder"
        set theSelection to selection as alias list
        set targetPath to POSIX file "${filePath}"
        copy targetPath to end of theSelection
        select theSelection
    end tell`);
};

/**
 * Searches for nearby locations matching the provided query.
 * @param query The query to search for.
 * @returns A promise that resolves to a new-line-separated list of addresses.
 */
export const searchNearbyLocations = async (query: string) => {
  return runAppleScript(`set jxa to "(() => {
        ObjC.import('MapKit');
      
        const searchRequest = $.MKLocalSearchRequest.alloc.init;
        searchRequest.naturalLanguageQuery = '${query}';
      
        const search = $.MKLocalSearch.alloc.initWithRequest(searchRequest);
        let addresses = [];
        search.startWithCompletionHandler((response, error) => {
          if (error.localizedDescription) {
            console.error(error.localizedDescription.js);
          } else {
            const numItems = response.mapItems.count > 10 ? 10 : response.mapItems.count;
            for (let i = 0; i < numItems; i++) {
              const item = response.mapItems.objectAtIndex(i);
              const placemark = item.placemark;
              addresses.push(\`\${item.name.js}, \${placemark.subThoroughfare.js} \${placemark.thoroughfare.js}, \${placemark.locality.js}, \${placemark.administrativeArea.js}\`);
            }
          }
        });
      
        const startDate = $.NSDate.date;
        while (startDate.timeIntervalSinceNow > -2) {
          runLoop = $.NSRunLoop.currentRunLoop;
          today = $.NSDate.dateWithTimeIntervalSinceNow(0.1);
          runLoop.runUntilDate(today);
        }

        return addresses.join(\`
        \`);
      })();"
      
      return run script jxa in "JavaScript"`);
};

/**
 * Gets the names of all currently running non-background applications.
 * @returns A promise that resolves to a comma-separated list of application names.
 */
export const getRunningApplications = async (): Promise<string> => {
  return runAppleScript(`tell application "System Events"
            return displayed name of every application process whose background only is false
        end tell`);
};

/**
 * Gets the name of the system's language.
 * @returns A promise that resolves to the name of the system language as a string.
 */
export const getSystemLanguage = async (): Promise<string> => {
  return runAppleScript(`use framework "Foundation"
        set locale to current application's NSLocale's autoupdatingCurrentLocale()
        set langCode to locale's languageCode()
        return locale's localizedStringForLanguageCode:langCode`);
};
