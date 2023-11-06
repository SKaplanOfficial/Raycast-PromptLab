import { Placeholder, PlaceholderCategory, PlaceholderType } from "../types";
import os from "os";

/**
 * Placeholder for the username of the currently logged-in user. Barring any issues, this should always be replaced.
 */
const UserPlaceholder: Placeholder = {
  name: "user",
  regex: /{{(user|username)}}/g,
  apply: async () => {
    const user = os.userInfo().username;
    return { result: user, user: user };
  },
  result_keys: ["user"],
  constant: true,
  fn: async () => (await UserPlaceholder.apply("{{user}}")).result,
  example: "Come up with nicknames for {{user}}",
  description: "Replaced with the username of the currently logged-in user.",
  hintRepresentation: "{{user}}",
  fullRepresentation: "User Name",
  type: PlaceholderType.Informational,
  categories: [PlaceholderCategory.Device],
};

export default UserPlaceholder;
