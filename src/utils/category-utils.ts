import {
  MAIN_CATEGORY_HUES,
  SUB_CATEGORY_PALETTES,
} from "../constants/categories";
import { MainCategory } from "../types/data-types";

export const getSubCategoryColor = (
  mainCategory: MainCategory,
  index: number,
): string => {
  const palette = SUB_CATEGORY_PALETTES[mainCategory];
  if (palette?.[index]) return palette[index];

  const hue = MAIN_CATEGORY_HUES[mainCategory] ?? 210;
  const fallbackHue = (hue + index * 57) % 360;
  return `hsl(${fallbackHue} 72% 48%)`;
};
