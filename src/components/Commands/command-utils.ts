// Replace insight placeholders
if (subbedPrompt.match(/{{IN.*?}}/g)) {
  const id = subbedPrompt.match(/{{(IN.*?)}}/)?.[1];
  if (id != undefined) {
    const insight = await Insights.read(id);
    if (insight != undefined) {
      subbedPrompt = subbedPrompt.replaceAll(`{{${id}}}`, `${insight.date}:${insight.description}`);
    }
  }
}






await fs.promises.writeFile(savedResponsePath, JSON.stringify(savedResponse));
    if (preferences.useCommandStatistics) {
      await Insights.add(
        "Saved a Response",
        `Saved a response for command ${command.name}`,
        ["commands", "saved-responses"],
        []
      );
    }