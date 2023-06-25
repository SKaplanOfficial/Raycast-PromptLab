import { Action, environment } from "@raycast/api";
import { CUSTOM_PLACEHOLDERS_FILENAME, PLACEHOLDERS_GUIDE_FILENAME } from "../../utils/constants";
import path from "path";

/**
 * Action to open the placeholders guide in the default markdown text editor.
 * @returns {JSX.Element} The action component.
 */
export function OpenPlaceholdersGuideAction(): JSX.Element {
    const placeholdersGuidePath = path.join(environment.assetsPath, PLACEHOLDERS_GUIDE_FILENAME);
    return <Action.Open title="Open Placeholders Guide" target={placeholdersGuidePath} />;
}

/**
 * Action to open the custom placeholders file in the default JSON text editor.
 * @returns {JSX.Element} The action component.
 */
export function OpenCustomPlaceholdersAction(): JSX.Element {
    const customPlaceholdersPath = path.join(environment.supportPath, CUSTOM_PLACEHOLDERS_FILENAME);
    return <Action.Open title="Edit Custom Placeholders" target={customPlaceholdersPath} />;
}