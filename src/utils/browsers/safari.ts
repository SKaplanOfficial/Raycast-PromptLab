import { runAppleScript } from "@raycast/utils";
import { Browser } from "./types";
import * as os from "os";

const name = "Safari";

const version = async () => {
  return await runAppleScript(`tell application "Safari" to return version`);
};

const bundleID = async () => {
  return await runAppleScript(`tell application "Safari" to return id`);
};

const bundlePath = async () => {
  return await runAppleScript(`tell application "Safari" to return POSIX path of (path to it)`);
};

const currentURL = async () => {
  return await runAppleScript(`try
    tell application "Safari"
        return URL of document 1
    end tell
  end try`);
};

const currentTabText = async () => {
  return await runAppleScript(`try
    tell application "Safari" to return text of current tab of window 1
  end try`);
};

const runJSInActiveTab = async (script: string) => {
  return await runAppleScript(`tell application "Safari"
    set theTab to current tab of window 1
    tell theTab
      return do JavaScript "try {
        ${script}
      } catch {
        '';
      }"
    end tell
  end tell`);
};

const topSites = async () => {
  return (
    await runAppleScript(`use framework "Foundation"
  property ca : current application
  
  on plist for thePath
    set plistData to ca's NSData's dataWithContentsOfFile:thePath
    set plist to ca's NSPropertyListSerialization's propertyListWithData:plistData options:(ca's NSPropertyListImmutable) format:(missing value) |error|:(missing value)
  end plist
  
  set topSitesPlist to plist for "${os.homedir()}/Library/Safari/TopSites.plist"
  
  set siteSummaries to {}
  set sites to TopSites of topSitesPlist as list
  repeat with site in sites
    set siteTitle to TopSiteTitle of site
    set siteURL to TopSiteURLString of site
    copy siteTitle & ": " & siteURL to end of siteSummaries
  end repeat
  return siteSummaries`)
  ).split(", ");
};

const bookmarks = async (count = 100) => {
  return (
    await runAppleScript(`use framework "Foundation"

  on plist for thePath
    set plistData to current application's NSData's dataWithContentsOfFile:thePath
    set plist to current application's NSPropertyListSerialization's propertyListWithData:plistData options:(current application's NSPropertyListImmutable) format:(missing value) |error|:(missing value)
  end plist
  
  set bookmarksPlist to (plist for "/Users/steven/Library/Safari/Bookmarks.plist") as record
  
  on getChildBookmarks(node)
    set internalBookmarks to {}
    if WebBookmarkType of node is "WebBookmarkTypeLeaf" then
      set maxLength to 50
      set theURL to URLString of node as text
      if length of theURL < maxLength then
        set maxLength to length of theURL
      end if
      copy text 1 thru maxLength of theURL to end of internalBookmarks
    else if WebBookmarkType of node is "WebBookmarkTypeProxy" then
      -- Ignore
    else
      try
        repeat with theChild in Children of node
          set internalBookmarks to internalBookmarks & my getChildBookmarks(theChild)
        end repeat
      on error err
        log err
      end try
    end if
    return internalBookmarks
  end getChildBookmarks
  
  set bookmarks to {}
  repeat with theChild in Children of bookmarksPlist
    if WebBookmarkType of theChild is "WebBookmarkTypeLeaf" then
      set maxLength to 50
      set theURL to URLString of theChild as text
      if length of theURL < maxLength then
        set maxLength to length of theURL
      end if
      copy text 1 thru maxLength of theURL to end of bookmarks
    else
      set bookmarks to bookmarks & getChildBookmarks(theChild)
    end if
  end repeat
  
  set maxBookmarks to ${count}
  if (count of bookmarks) < maxBookmarks then
    set maxBookmarks to count of bookmarks
  end if

  set finalBookmarks to {}
  repeat maxBookmarks times
    copy some item of bookmarks to end of finalBookmarks
  end repeat
  return finalBookmarks`)
  ).split(", ");
};

export interface SafariBrowser extends Browser {
  topSites: () => Promise<string[]>;
  bookmarks: (count: number) => Promise<string[]>;
}

const Safari: SafariBrowser = {
  name,
  version,
  bundleID,
  bundlePath,
  currentURL,
  currentTabText,
  runJSInActiveTab,
  topSites,
  bookmarks,
};

export default Safari;
