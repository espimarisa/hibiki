export interface SvelteMetadata {
  // Page title
  title?: string;

  // Page description
  description?: string;

  // Embed image
  image?: string;

  // Alt text for the image
  imageAlt?: string;

  // Metadata URL
  url?: string;

  // The type of content
  type?: string;

  // A Twitter card URL
  twitterCard?: string;

  // The color to theme browser UI in
  themeColor?: string;
}
