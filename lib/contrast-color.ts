/**
 * Readable foreground colour for an admin-chosen platform brand colour.
 *
 * The approval form lets an admin type any hex into `brand_color`. Rendering
 * the preview swatch with a fixed white foreground meant a light brand colour
 * (e.g. #1ED760 at 1.92:1 against white) looked fine in the preview and then
 * shipped illegible initials to every app screen. The preview must show the
 * same contrast-picked foreground the mobile app uses.
 *
 * Mirrors lib/contrastColor.ts in the mobile repo. Keep the two in sync.
 */

export const CONTRAST_DARK_INK = "#102622";
export const CONTRAST_LIGHT_INK = "#FFFFFF";

function parseHexColor(
  value: string,
): { r: number; g: number; b: number } | null {
  const hex = value.trim().replace(/^#/, "");
  const expanded =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;

  if (expanded.length !== 6 && expanded.length !== 8) return null;
  if (!/^[0-9a-fA-F]+$/.test(expanded)) return null;

  return {
    r: parseInt(expanded.slice(0, 2), 16),
    g: parseInt(expanded.slice(2, 4), 16),
    b: parseInt(expanded.slice(4, 6), 16),
  };
}

/** WCAG 2.1 relative luminance, or null when the colour cannot be parsed. */
export function relativeLuminance(color: string): number | null {
  const rgb = parseHexColor(color);
  if (!rgb) return null;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b]
    .map((channel) => channel / 255)
    .map((channel) =>
      channel <= 0.03928
        ? channel / 12.92
        : Math.pow((channel + 0.055) / 1.055, 2.4),
    );

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.1 contrast ratio between two hex colours, or null if unparseable. */
export function contrastRatio(a: string, b: string): number | null {
  const lumA = relativeLuminance(a);
  const lumB = relativeLuminance(b);
  if (lumA === null || lumB === null) return null;

  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Foreground that stays legible on `background`; white when unmeasurable. */
export function readableTextOn(background: string): string {
  const onWhite = contrastRatio(background, CONTRAST_LIGHT_INK);
  const onDark = contrastRatio(background, CONTRAST_DARK_INK);

  if (onWhite === null || onDark === null) return CONTRAST_LIGHT_INK;
  return onDark > onWhite ? CONTRAST_DARK_INK : CONTRAST_LIGHT_INK;
}

/**
 * True when white text on this background clears the WCAG AA 4.5:1 threshold.
 * Used to warn the admin before they approve a hard-to-read brand colour.
 */
export function passesAAOnWhiteText(background: string): boolean {
  const ratio = contrastRatio(background, CONTRAST_LIGHT_INK);
  return ratio === null ? true : ratio >= 4.5;
}
