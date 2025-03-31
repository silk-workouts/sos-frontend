// src/utils/parseDescription.ts

export function parseDescription(description: string) {
  if (!description) return { title: "", intro: "", body: "" };

  // Extract the quoted title (first quoted part)
  const quoteMatch = description.match(/^“([^”]+)”\s*/);
  const title = quoteMatch ? quoteMatch[1] : "";

  // Remove the title from the description to get the rest
  const remainingText = quoteMatch
    ? description.slice(quoteMatch[0].length).trim()
    : description;

  // Split remaining text into paragraphs by period followed by space or newline
  const paragraphs = remainingText.split(/(?<=\.)\s+/);

  // Extract the first paragraph and the rest as the body
  const intro = paragraphs.shift();
  const body = paragraphs.join(" ");

  return { title, intro, body };
}
