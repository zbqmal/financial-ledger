import { getSubCategoryColor } from "../category-utils";
import { SUB_CATEGORY_PALETTES } from "../../constants/categories";

describe("category-utils", () => {
  it("uses palette color when index exists", () => {
    expect(getSubCategoryColor("Income", 0)).toBe(
      SUB_CATEGORY_PALETTES.Income[0],
    );
  });

  it("falls back to generated color when index exceeds palette", () => {
    expect(getSubCategoryColor("Income", 999)).toMatch(/^hsl\(\d+ 72% 48%\)$/);
  });

  it("uses default hue fallback when main category is unknown", () => {
    expect(getSubCategoryColor("Unknown" as any, 1)).toBe("hsl(267 72% 48%)");
  });
});
