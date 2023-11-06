import { runAppleScript } from "@raycast/utils";
import { Browser } from "./types";

const name = "Orion";

const version = async () => {
  return await runAppleScript(`tell application "Orion" to return version`);
};

const bundleID = async () => {
  return await runAppleScript(`tell application "Orion" to return id`);
};

const bundlePath = async () => {
  return await runAppleScript(`tell application "Orion" to return POSIX path of (path to it)`);
};

const currentURL = async () => {
  return runAppleScript(`try
    tell application "Orion"
      return URL of current tab of window 1
    end tell
  end try`);
};

const currentTabText = async () => {
  return await runJSInActiveTab(`document.body.innerText`);
};

const runJSInActiveTab = async (script: string) => {
  return await runAppleScript(`tell application "Orion"
    set theTab to current tab of window 1
    do JavaScript "try {
                ${script}
              } catch {
                '';
              }" in theTab
  end tell`);
};

const Orion: Browser = {
  name,
  version,
  bundleID,
  bundlePath,
  currentURL,
  currentTabText,
  runJSInActiveTab,
};

export default Orion;
