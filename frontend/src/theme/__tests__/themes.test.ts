import { allThemes, defaultTheme } from "../index";
import { BRAND_HEX } from "../types";

const channelToLinear = (channel: number): number => {
  const value = channel / 255;
  return value <= 0.04045
    ? value / 12.92
    : Math.pow((value + 0.055) / 1.055, 2.4);
};

const luminance = (hex: string): number => {
  const normalized = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map(offset =>
    Number.parseInt(normalized.slice(offset, offset + 2), 16),
  );

  return (
    0.2126 * channelToLinear(r ?? 0) +
    0.7152 * channelToLinear(g ?? 0) +
    0.0722 * channelToLinear(b ?? 0)
  );
};

const contrastRatio = (a: string, b: string): number => {
  const lighter = Math.max(luminance(a), luminance(b));
  const darker = Math.min(luminance(a), luminance(b));
  return (lighter + 0.05) / (darker + 0.05);
};

describe("theme system", () => {
  it("keeps the default and second themes anchored to the Konnaxion brand", () => {
    expect(defaultTheme).toBe(allThemes[0]);
    expect(allThemes[0]?.isDark).toBe(false);
    expect(allThemes[0]?.colors.primary.toLowerCase()).toBe(BRAND_HEX);

    expect(allThemes[1]?.isDark).toBe(true);
    expect(allThemes[1]?.colors.primary.toLowerCase()).toBe(BRAND_HEX);
  });

  it.each(allThemes)("maintains readable contrast in $label", theme => {
    const { colors } = theme;

    // Normal body text and secondary text meet WCAG AA on core surfaces.
    expect(contrastRatio(colors.text, colors.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.text, colors.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.textMuted, colors.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.textMuted, colors.background)).toBeGreaterThanOrEqual(4.5);

    // Primary solid controls remain readable in default, hover and active states.
    expect(contrastRatio(colors.textOnBrand, colors.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.textOnBrand, colors.primaryHover)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.textOnBrand, colors.primaryActive)).toBeGreaterThanOrEqual(4.5);

    // Controls use borderStrong through ThemeContext; target 3:1 non-text contrast.
    expect(contrastRatio(colors.borderStrong, colors.surface)).toBeGreaterThanOrEqual(3);

    if (colors.menuSelectedBg && colors.menuSelectedText) {
      expect(
        contrastRatio(colors.menuSelectedText, colors.menuSelectedBg),
      ).toBeGreaterThanOrEqual(4.5);
    }

    for (const status of [
      colors.success,
      colors.warning,
      colors.danger,
      colors.info,
    ]) {
      expect(contrastRatio(status, colors.surface)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
