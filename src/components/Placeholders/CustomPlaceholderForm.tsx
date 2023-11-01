import { Action, ActionPanel, Form, Icon, useNavigation } from "@raycast/api";
import { CustomPlaceholder } from "../../utils/types";
import { FormValidation, useForm } from "@raycast/utils";
import { Placeholders, createCustomPlaceholder, deleteCustomPlaceholder } from "../../utils/placeholders";
import { useState } from "react";

interface PlaceholderFormValues {
  name: string;
  description: string;
  regex: string;
  value: string;
  example: string;
  hintRepresentation: string;
}

export default function CustomPlaceholderForm(props: {
  revalidate: () => Promise<void>;
  oldData?: [string, CustomPlaceholder];
  duplicate?: boolean;
}) {
  const { revalidate, oldData, duplicate } = props;
  const { pop } = useNavigation();
  const [prompt, setPrompt] = useState<string>(oldData?.[1].value || "");

  const oldNameComponents = oldData?.[1].name.split(/(?=[A-Z])/);
  const oldName = oldNameComponents ? `${oldNameComponents[0][0].toUpperCase()}${oldNameComponents[0].slice(1)}${oldNameComponents.length > 1 ? ` ${oldNameComponents.slice(1).join(" ")}` : ""}` : "";

  const { handleSubmit, itemProps } = useForm<PlaceholderFormValues>({
    async onSubmit(values) {
      const nameComponents = values.name.split(" ");

      if (oldData && !duplicate) {
        await deleteCustomPlaceholder(oldData[0], oldData[1]);
      }

      await createCustomPlaceholder(values.regex, {
        name: `${nameComponents[0].toLowerCase()}${nameComponents.length > 1 ? nameComponents.slice(1).map((item) => item.charAt(0).toUpperCase() + item.slice(1)).join("") : ""}`,
        description: values.description,
        value: values.value,
        example: values.example,
        hintRepresentation: `${values.hintRepresentation.startsWith("{{") ? "" : "{{"}${values.hintRepresentation}${values.hintRepresentation.endsWith("}}") ? "" : "}}"}`,
        fullRepresentation: values.name,
        source: oldData?.[1].source
      })
      await revalidate();
      pop();
    },
    initialValues: oldData ? {
      name: oldName,
      description: oldData[1].description,
      regex: oldData[0].slice(2, -2),
      value: oldData[1].value,
      example: oldData[1].example,
      hintRepresentation: oldData[1].hintRepresentation.slice(2, -2),
    } : {
      name: "",
      description: "",
      regex: "",
      value: "",
      example: "",
    },
    validation: {
      name: FormValidation.Required,
      regex: FormValidation.Required,
      value: FormValidation.Required,
    }
  });

  return (
    <Form
      navigationTitle="Create Custom Placeholder"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title={oldData && !duplicate ? "Update Placeholder" : "Create Placeholder"}
            icon={Icon.PlusCircle}
            onSubmit={handleSubmit}
          />
          <ActionPanel.Submenu title="Add Placeholder..." icon={Icon.Plus}>
              {Object.values(Placeholders.allPlaceholders)
                .filter(
                  (placeholder) =>
                    !placeholder.name.startsWith("textfile:") &&
                    !placeholder.name.startsWith("video:") &&
                    !placeholder.name.startsWith("audio:") &&
                    !placeholder.name.startsWith("image:")
                )
                .sort((a, b) => (a.fullRepresentation > b.fullRepresentation ? 1 : -1))
                .map((placeholder) => (
                  <Action
                    title={placeholder.fullRepresentation || "empty"}
                    onAction={() => {
                      setPrompt(prompt + placeholder.hintRepresentation);
                    }}
                  />
                ))}
            </ActionPanel.Submenu>
        </ActionPanel>
      }
      >
        <Form.TextField
          title="Placeholder Name"
          placeholder="Simple name, e.g. 'My Placeholder'"
          info="The full name of the placeholder, including spaces, e.g. 'My Placeholder'. This is displayed in the list of available placeholders when using the 'Add Placeholder' action."
          {...itemProps.name}
        />
        
        <Form.TextField
          title="Regex"
          placeholder="Regex to match the placeholder, e.g. 'p[0-9]*'"
          info="The regex pattern to match the placeholder. The regex should be as specific as possible to avoid false positives. Do not include curly braces around the pattern -- they will be added automatically."
          {...itemProps.regex}
        />
        <Form.TextArea
          title="Value"
          placeholder="Value to replace the placeholder with"
          info="The value to replace the placeholder with. You can utilize other placeholders here as long as they have higher precedence."
          {...itemProps.value}
          value={prompt}
          onChange={(value) => {
            itemProps.value.onChange?.(value);
            setPrompt(value);
          }}
        />

        <Form.Separator />
        <Form.Description title="Optional Fields" text="These settings are optional and can be left blank, but you should fill them out if you want to share the placeholder with others." />

        <Form.TextArea
          title="Description"
          placeholder="Short description of what the placeholder is for"
          info="A description of what the placeholder is for. This is displayed in form info panels when the placeholder is detected. The description should be concise, but new lines are allowed."
          {...itemProps.description}
        />
        <Form.TextArea
          title="Example"
          placeholder="Example of the placeholder in use"
          info="A short example of the placeholder used in a command prompt. This is displayed in form info panels when the placeholder is detected. The example should be a valid prompt, i.e. if copied directly, it would work as a prompt."
          {...itemProps.example}
        />
        <Form.TextField
          title="Hint"
          placeholder="Hint representation, e.g. 'p1:...'"
          info="A short representation indicating how the placeholder should be used, i.e. what the user should put between the curly braces. This is displayed in form info panels when the placeholder is detected. Use common notations like '...' for arbitrary text and '[number]' for optional numbers."
          {...itemProps.hintRepresentation}
        />
      </Form>
  );
}