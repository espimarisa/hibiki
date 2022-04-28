/**
 * Replaces twitter tags with markdown links
 */
export function tagsToMarkdownLinks(text: string) {
  return text.replace(/\B@(\w+)/gi, (match, username) => {
    return `[@${username}](https://twitter.com/${username})`;
  });
}
