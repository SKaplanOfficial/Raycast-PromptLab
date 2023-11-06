import { runAppleScript } from "@raycast/utils";
import { Browser } from "./types";
import { utils } from ".";

const name = "SigmaOS";

const version = async () => {
  return await runAppleScript(`tell application "SigmaOS" to return version`);
};

const bundleID = async () => {
  return await runAppleScript(`tell application "SigmaOS" to return id`);
};

const bundlePath = async () => {
  return await runAppleScript(`tell application "SigmaOS" to return POSIX path of (path to it)`);
};

const currentURL = async () => {
  return runAppleScript(`tell application "SigmaOS" to return URL of active tab of window 1`);
};

const currentTabText = async () => {
  const url = await currentURL();
  return await utils.getTextOfWebpage(url);
};

const runJSInActiveTab = async (script: string) => {
  // Cannot actually run JS in SigmaOS, so just execute JS on the HTML of the current tab.
  const url = await currentURL();
  const html = await utils.getURLHTML(url);
  return await utils.runJSAgainstHTML(script, html);
};

const SigmaOS: Browser = {
  name,
  version,
  bundleID,
  bundlePath,
  currentURL,
  currentTabText,
  runJSInActiveTab,
};

export default SigmaOS;
