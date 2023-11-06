import * as vm from "vm";

import TimezonePlaceholder from "./info-placeholders/timezone";
import LocationPlaceholder from "./info-placeholders/location";
import TodayWeatherPlaceholder from "./info-placeholders/todayWeather";
import WeekWeatherPlaceholder from "./info-placeholders/weekWeather";
import {
  GetPersistentVariablePlaceholder,
  SetPersistentVariablePlaceholder,
  ResetPersistentVariablePlaceholder,
  DeletePersistentVariablePlaceholder,
  VarsPlaceholder,
  IncrementPersistentVariablePlaceholder,
  DecrementPersistentVariablePlaceholder,
} from "./directives/persistent-variables";
import ClipboardTextPlaceholder from "./info-placeholders/clipboardText";
import { runJSInActiveTab } from "../context-utils";
import JavaScriptPlaceholder from "./script-placeholders/javascript";
import IgnoreDirective from "./directives/ignore";
import CutoffDirective from "./directives/cutoff";
import ScreenContentPlaceholder from "./info-placeholders/screenContent";
import WindowContentPlaceholder from "./info-placeholders/windowContent";
import AppleScriptPlaceholder from "./script-placeholders/applescript";
import JXAPlaceholder from "./script-placeholders/jxa";
import ShellScriptPlaceholder from "./script-placeholders/shell";
import TextFileFlowDirective, { TextFileDirectives } from "./directives/flow-control/textfiles";
import ImageFlowDirective, { ImageDirectives } from "./directives/flow-control/images";
import VideoFlowDirective, { VideoDirectives } from "./directives/flow-control/videos";
import AudioFlowDirective, { AudioDirectives } from "./directives/flow-control/audio";
import PDFFlowDirective from "./directives/flow-control/pdf";
import URLPlaceholder from "./directives/url";
import FilePlaceholder from "./directives/file";
import FocusedElementPlaceholder from "./directives/focusedElement";
import ElementTextPlaceholder from "./directives/elementText";
import ElementHTMLPlaceholder from "./directives/elementHTML";
import NearbyLocationsPlaceholder from "./directives/nearbyLocations";
import SelectFileDirective from "./directives/selectFile";
import ShortcutPlaceholder from "./directives/shortcut";
import PromptPlaceholder from "./directives/prompt";
import CommandPlaceholder from "./directives/command";
import YouTubeTranscriptPlaceholder from "./directives/youtubeTranscript";
import CopyDirective from "./directives/copy";
import PasteDirective from "./directives/paste";
import TypeDirective from "./directives/type";
import ToastDirective from "./directives/alerts/toast";
import SayDirective from "./directives/alerts/say";
import DialogDirective from "./directives/alerts/dialog";
import AlertDirective from "./directives/alerts/alert";
import PreviousResponsePlaceholder from "./info-placeholders/previousResponse";
import PreviousPromptPlaceholder from "./info-placeholders/previousPrompt";
import PreviousCommandPlaceholder from "./info-placeholders/previousCommand";
import YearRemindersPlaceholder from "./info-placeholders/calendar/yearReminders";
import MonthRemindersPlaceholder from "./info-placeholders/calendar/monthReminders";
import WeekRemindersPlaceholder from "./info-placeholders/calendar/weekReminders";
import TodayRemindersPlaceholder from "./info-placeholders/calendar/todayReminders";
import YearEventsPlaceholder from "./info-placeholders/calendar/yearEvents";
import MonthEventsPlaceholder from "./info-placeholders/calendar/monthEvents";
import WeekEventsPlaceholder from "./info-placeholders/calendar/weekEvents";
import TodayEventsPlaceholder from "./info-placeholders/calendar/todayEvents";
import UsedUUIDsPlaceholder from "./info-placeholders/usedUUIDs";
import UUIDPlaceholder from "./info-placeholders/uuid";
import RunningApplicationsPlaceholder from "./info-placeholders/runningApplications";
import SafariBookmarksPlaceholder from "./info-placeholders/safariBookmarks";
import SafariTopSitesPlaceholder from "./info-placeholders/safariTopSites";
import CommandsPlaceholder from "./info-placeholders/commands";
import InstalledApplicationsPlaceholder from "./info-placeholders/installedApps";
import LastEmailPlaceholder from "./info-placeholders/lastEmail";
import LastNotePlaceholder from "./info-placeholders/lastNote";
import CurrentTrackPlaceholder from "./info-placeholders/currentTrack";
import MusicTracksPlaceholder from "./info-placeholders/musicTracks";
import SystemLanguagePlaceholder from "./info-placeholders/systemLanguage";
import TimePlaceholder from "./info-placeholders/time";
import DayPlaceholder from "./info-placeholders/day";
import DatePlaceholder from "./info-placeholders/date";
import ShortcutsPlaceholder from "./info-placeholders/shortcuts";
import ComputerNamePlaceholder from "./info-placeholders/computerName";
import HostnamePlaceholder from "./info-placeholders/hostname";
import HomeDirPlaceholder from "./info-placeholders/homedir";
import UserPlaceholder from "./info-placeholders/user";
import CurrentTabTextPlaceholder from "./info-placeholders/currentTabText";
import CurrentURLPlaceholder from "./info-placeholders/currentURL";
import CurrentDirectoryPlaceholder from "./info-placeholders/currentDirectory";
import CurrentAppPathPlaceholder from "./info-placeholders/currentAppPath";
import CurrentAppBundleIDPlaceholder from "./info-placeholders/currentAppBundleID";
import CurrentAppNamePlaceholder from "./info-placeholders/currentAppName";
import FileContentsPlaceholder from "./info-placeholders/contents";
import PDFOCRTextPlaceholder from "./info-placeholders/pdfOCRText";
import PDFRawTextPlaceholder from "./info-placeholders/pdfRawText";
import ImageRectanglesPlaceholder from "./info-placeholders/imageRectangles";
import ImageBarcodesPlaceholder from "./info-placeholders/imageBarcodes";
import ImagePOIPlaceholder from "./info-placeholders/imagePOI";
import ImageSubjectsPlaceholder from "./info-placeholders/imageSubjects";
import ImageAnimalsPlaceholder from "./info-placeholders/imageAnimals";
import ImageHorizonPlaceholder from "./info-placeholders/imageHorizon";
import ImageFacesPlaceholder from "./info-placeholders/imageFaces";
import ImageTextPlaceholder from "./info-placeholders/imageText";
import FileMetadataPlaceholder from "./info-placeholders/metadata";
import FileNamesPlaceholder from "./info-placeholders/fileNames";
import SelectedFilesPlaceholder from "./info-placeholders/selectedFiles";
import SelectedTextPlaceholder from "./info-placeholders/selectedText";
import InputPlaceholder from "./info-placeholders/input";

export const HighPrecedenceDirectives = [
  GetPersistentVariablePlaceholder,
  ResetPersistentVariablePlaceholder,
  DeletePersistentVariablePlaceholder,
  VarsPlaceholder,
  IncrementPersistentVariablePlaceholder,
  DecrementPersistentVariablePlaceholder,
];

export const InfoPlaceholders = [
  InputPlaceholder,
  ClipboardTextPlaceholder,
  SelectedTextPlaceholder,
  ImageTextPlaceholder,
  ImageFacesPlaceholder,
  ImageHorizonPlaceholder,
  ImageAnimalsPlaceholder,
  ImageSubjectsPlaceholder,
  ImagePOIPlaceholder,
  ImageBarcodesPlaceholder,
  ImageRectanglesPlaceholder,
  PDFRawTextPlaceholder,
  PDFOCRTextPlaceholder,
  SelectedFilesPlaceholder,
  FileNamesPlaceholder,
  FileContentsPlaceholder,
  FileMetadataPlaceholder,
  CurrentAppNamePlaceholder,
  CurrentAppBundleIDPlaceholder,
  CurrentAppPathPlaceholder,
  CurrentDirectoryPlaceholder,
  CurrentURLPlaceholder,
  CurrentTabTextPlaceholder,
  UserPlaceholder,
  HomeDirPlaceholder,
  HostnamePlaceholder,
  ComputerNamePlaceholder,
  ShortcutsPlaceholder,
  DatePlaceholder,
  DayPlaceholder,
  TimePlaceholder,
  TimezonePlaceholder,
  TodayWeatherPlaceholder,
  WeekWeatherPlaceholder,
  SystemLanguagePlaceholder,
  MusicTracksPlaceholder,
  CurrentTrackPlaceholder,
  LastNotePlaceholder,
  LastEmailPlaceholder,
  CommandsPlaceholder,
  SafariTopSitesPlaceholder,
  SafariBookmarksPlaceholder,
  InstalledApplicationsPlaceholder,
  RunningApplicationsPlaceholder,
  UUIDPlaceholder,
  UsedUUIDsPlaceholder,
  TodayEventsPlaceholder,
  WeekEventsPlaceholder,
  MonthEventsPlaceholder,
  YearEventsPlaceholder,
  TodayRemindersPlaceholder,
  WeekRemindersPlaceholder,
  MonthRemindersPlaceholder,
  YearRemindersPlaceholder,
  PreviousCommandPlaceholder,
  PreviousPromptPlaceholder,
  PreviousResponsePlaceholder,
  LocationPlaceholder,
  WindowContentPlaceholder,
  ScreenContentPlaceholder,
];

export const LowPrecedenceDirectives = [
  SetPersistentVariablePlaceholder,
  ...TextFileDirectives,
  TextFileFlowDirective,
  ...ImageDirectives,
  ImageFlowDirective,
  ...VideoDirectives,
  VideoFlowDirective,
  ...AudioDirectives,
  AudioFlowDirective,
  PDFFlowDirective,
  NearbyLocationsPlaceholder,
  FilePlaceholder,
  SelectFileDirective,
  FocusedElementPlaceholder,
  ElementTextPlaceholder,
  ElementHTMLPlaceholder,
  URLPlaceholder,
  YouTubeTranscriptPlaceholder,
  CopyDirective,
  PasteDirective,
  TypeDirective,
  AlertDirective,
  DialogDirective,
  SayDirective,
  ToastDirective,
  ShortcutPlaceholder,
  PromptPlaceholder,
  CommandPlaceholder,
  AppleScriptPlaceholder,
  JXAPlaceholder,
  ShellScriptPlaceholder,
];

/**
 * The default placeholders available in PromptLab.
 */
const DefaultPlaceholders = [...HighPrecedenceDirectives, ...InfoPlaceholders, ...LowPrecedenceDirectives];

JavaScriptPlaceholder.apply = async (str: string) => {
  try {
    const script = str.match(/(?<=(js|JS))( target="(.*?)")?:(([^{]|{(?!{)|{{[\s\S]*?}})*?)}}/)?.[4];
    const target = str.match(/(?<=(js|JS))( target="(.*?)")?:(([^{]|{(?!{)|{{[\s\S]*?}})*?)}}/)?.[3];
    if (!script) return { result: "", js: "" };

    if (target) {
      // Run in active browser tab
      const res = await runJSInActiveTab(script.replaceAll(/(\n|\r|\t|\\|")/g, "\\$1"), target);
      return { result: res, js: res };
    }

    // Run in sandbox
    const sandbox = DefaultPlaceholders.reduce(
      (acc, placeholder) => {
        acc[placeholder.name] = placeholder.fn;
        return acc;
      },
      {} as { [key: string]: (...args: never[]) => Promise<string> },
    );
    sandbox["log"] = async (str: string) => {
      console.log(str); // Make logging available to JS scripts
      return "";
    };
    const res = await vm.runInNewContext(script, sandbox, { timeout: 1000, displayErrors: true });
    return { result: res, js: res };
  } catch (e) {
    return { result: "", js: "" };
  }
};

DefaultPlaceholders.push(JavaScriptPlaceholder, CutoffDirective, IgnoreDirective);
export { DefaultPlaceholders };
