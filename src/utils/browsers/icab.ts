import { runAppleScript } from "@raycast/utils";
import { Browser } from "./types";
import { utils } from ".";

const name = "iCab";

const version = async () => {
  return await runAppleScript(`tell application "iCab" to return version`);
};

const bundleID = async () => {
  return await runAppleScript(`tell application "iCab" to return id`);
};

const bundlePath = async () => {
  return await runAppleScript(`tell application "iCab" to return POSIX path of (path to it)`);
};

const currentURL = async () => {
  return runAppleScript(`try
    tell application "iCab"
        return url of document 1
    end tell
  end try`);
};

const currentTabText = async () => {
  const url = await currentURL();
  return await utils.getTextOfWebpage(url);
};

const runJSInActiveTab = async (script: string) => {
  // Cannot actually run JS in iCab, so just execute JS on the HTML of the current tab.
  const url = await currentURL();
  const html = await utils.getURLHTML(url);
  return await utils.runJSAgainstHTML(script, html);
};

const iCab: Browser = {
  name,
  version,
  bundleID,
  bundlePath,
  currentURL,
  currentTabText,
  runJSInActiveTab,
};

export default iCab;
