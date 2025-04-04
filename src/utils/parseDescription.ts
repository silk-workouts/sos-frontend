// src/utils/parseDescription.ts

// export function parseDescription(description: string) {
//   if (!description) return { title: "", intro: "", body: "" };

//   // Extract the quoted title (first quoted part)
//   const quoteMatch = description.match(/^“([^”]+)”\s*/);
//   const title = quoteMatch ? quoteMatch[1] : "";

//   // Remove the title from the description to get the rest
//   const remainingText = quoteMatch
//     ? description.slice(quoteMatch[0].length).trim()
//     : description;

//   // Split remaining text into paragraphs by period followed by space or newline
//   const paragraphs = remainingText.split(/(?<=\.)\s+/);

//   // Extract the first paragraph and the rest as the body
//   const intro = paragraphs.shift();
//   const body = paragraphs.join(" ");

//   return { title, intro, body };
// }

export function parseDescription(description: string) {
  if (!description) return { title: "", listItems: [] };

  // Extract the quoted title (first quoted part)
  const quoteMatch = description.match(/^“([^”]+)”\s*/);
  const title = quoteMatch ? quoteMatch[1] : "";

  // Remove the title from the description to get the rest
  const remainingText = quoteMatch
    ? description.slice(quoteMatch[0].length).trim()
    : description;

  // Split the remaining text into lines
  const lines = remainingText.split("\n");

  // Extract list items: lines that start with a dash
  const listItems = lines
    .map((line) => line.trim())
    .filter((line) => line.startsWith("-")) // Only keep lines starting with a dash
    .map((line) => line.replace(/^-+\s*/, "")); // Remove leading dash and spaces

  return { title, listItems };
}
