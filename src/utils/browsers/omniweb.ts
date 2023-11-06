import { runAppleScript } from "@raycast/utils";
import { Browser } from "./types";

const name = "OmniWeb";

const version = async () => {
  return await runAppleScript(`tell application "OmniWeb" to return version`);
};

const bundleID = async () => {
  return await runAppleScript(`tell application "OmniWeb" to return id`);
};

const bundlePath = async () => {
  return await runAppleScript(`tell application "OmniWeb" to return POSIX path of (path to it)`);
};

const currentURL = async () => {
  return runAppleScript(`tell application "OmniWeb" to return address of active tab of browser 1`);
};

const currentTabText = async () => {
  return await runJSInActiveTab(`document.body.innerText`);
};

const runJSInActiveTab = async (script: string) => {
  return await runAppleScript(`tell application "OmniWeb"
    do script "try {
      ${script}
    } catch {
      '';
    }" window browser 1
  end tell`);
};

const OmniWeb: Browser = {
  name,
  version,
  bundleID,
  bundlePath,
  currentURL,
  currentTabText,
  runJSInActiveTab,
};

export default OmniWeb;
