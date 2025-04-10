export function parseDescription(description: string) {
  if (!description) return { title: "", text: "" };

  // Normalize zero-width spaces or non-visible characters
  const cleanedDescription = description
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();

  // Match title in either “smart quotes” or "straight quotes"
  const quoteMatch = cleanedDescription.match(/[“"]([^”"]+)[”"]\s*/);
  const title = quoteMatch ? quoteMatch[1].trim() : "";

  // Remove the title portion from the rest of the description
  const remainingText = quoteMatch
    ? cleanedDescription.slice(quoteMatch[0].length).trim()
    : cleanedDescription;

  return { title, text: remainingText };
}
