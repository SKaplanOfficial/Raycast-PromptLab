import { Action, Icon, useNavigation } from "@raycast/api";
import CommandForm from "../CommandForm";
import { Command } from "../../../utils/types";

export default function NewCommandAction(props: {
    setCommands?: React.Dispatch<React.SetStateAction<Command[]>>;
}) {
    const { setCommands } = props;
    const { push } = useNavigation();
    return (
        <Action
            title="Create New Command"
            icon={Icon.PlusSquare}
            shortcut={{ modifiers: ["cmd"], key: "n" }}
            onAction={() => push(<CommandForm setCommands={setCommands} />)}
        />
    )   
}