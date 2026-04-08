/**
 * Convert a string to a URL-safe slug.
 * E.g. "Men's Clothing & Accessories" → "mens-clothing-accessories"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")  // remove non-word chars (except spaces and hyphens)
    .replace(/[\s_]+/g, "-")   // replace spaces/underscores with hyphens
    .replace(/-+/g, "-")       // collapse multiple hyphens
    .replace(/^-|-$/g, "")     // trim leading/trailing hyphens
}
