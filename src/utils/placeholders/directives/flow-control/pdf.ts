import { Placeholder, PlaceholderCategory, PlaceholderType } from "../../types";

/**
 * Directive for directions that will only be included in the prompt if any PDF files are selected.
 */
const PDFFlowDirective: Placeholder = {
  name: "contentForPDFs",
  regex: /{{(pdf|PDF):(([^{]|{(?!{)|{{[\s\S]*?}})*?)(:(([^{]|{(?!{)|{{[\s\S]*?}})*?))?}}/g,
  apply: async (str: string, context?: { [key: string]: unknown }) => {
    if (!context) return { result: "", ["image:pdf"]: "" };
    if (!context["selectedFiles"]) return { result: "", ["image:pdf"]: "" };

    const onSuccess =
      str.match(new RegExp(`{{pdf:(([^{]|{(?!{)|{{[\\s\\S]*?}})*?)(:(([^{]|{(?!{)|{{[\\s\\S]*?}})*?))?}}`))?.[1] || "";
    const onFailure =
      str.match(new RegExp(`{{pdf:(([^{]|{(?!{)|{{[\\s\\S]*?}})*?)(:(([^{]|{(?!{)|{{[\\s\\S]*?}})*?))?}}`))?.[4] || "";

    const files = (context["selectedFiles"] as string).split(",");
    const containsImage = files.some((file) => file.toLowerCase().endsWith("pdf"));
    if (!containsImage) return { result: onFailure, ["image:pdf"]: onFailure };
    return { result: onSuccess, ["image:pdf"]: onSuccess };
  },
  result_keys: ["contentForPDFs"],
  constant: true,
  fn: async (content: string) => (await PDFFlowDirective.apply(`{{pdf:${content}}}`)).result,
  example: "{{pdf:This one if any PDF file is selected:This one if no PDF file is selected}}",
  description:
    "Flow control directive to include some content if any PDF file is selected and some other content if no PDF file is selected.",
  hintRepresentation: "{{pdf:...:...}}",
  fullRepresentation: "PDF File Condition",
  type: PlaceholderType.InteractiveDirective,
  categories: [PlaceholderCategory.Logic, PlaceholderCategory.Meta],
};

export default PDFFlowDirective;
