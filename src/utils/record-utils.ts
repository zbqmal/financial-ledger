import {
  MAIN_CATEGORY_OPTIONS,
  MAIN_CATEGORY_TREE,
} from "../constants/constants";
import { STORAGE_KEY } from "../constants/keys";
import {
  FinancialDataType,
  FinancialRecord,
  FinancialRecordTuple,
  MainCategory,
} from "../types/data-types";

export const buildBackupPayload = (records: FinancialRecord[]) => ({
  version: 2,
  exportedAt: new Date().toISOString(),
  records: records.map((record) => [
    record.id,
    record.date,
    record.mainCategory,
    record.subCategory,
    record.amount,
    record.note,
  ]),
});

export const loadInitialRecords = (): FinancialRecord[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    return parseRecords(JSON.parse(saved));
  } catch {
    return [];
  }
};

export const parseRecords = (
  payload: FinancialDataType | null,
): FinancialRecord[] => {
  if (
    !payload ||
    typeof payload !== "object" ||
    !Array.isArray(payload.records)
  ) {
    return [];
  }

  return payload.records
    .map(normalizeRecord)
    .filter((record): record is FinancialRecord => record !== null);
};

const normalizeRecord = (
  record: FinancialRecordTuple,
): FinancialRecord | null => {
  if (record.length < 6) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record[1])) return null;

  const source = {
    id: record[0],
    date: record[1],
    mainCategory: record[2],
    subCategory: record[3],
    amount: record[4],
    note: record[5],
  };

  let mainCategory = null;
  let subCategory = null;

  if (
    isValidMainCategory(source.mainCategory) &&
    isValidSubCategory(source.mainCategory, source.subCategory)
  ) {
    mainCategory = source.mainCategory;
    subCategory = source.subCategory;
  } else {
    return null;
  }

  const amount = Number.parseFloat(source.amount);
  if (!Number.isFinite(amount) || amount === 0) return null;

  return {
    id: source.id,
    date: source.date,
    mainCategory,
    subCategory,
    amount,
    note: source.note.trim(),
  };
};

const isValidMainCategory = (value: unknown): value is MainCategory =>
  MAIN_CATEGORY_OPTIONS.some((category) => category === value);

const isValidSubCategory = (mainCategory: MainCategory, value: string) =>
  getSubCategoryOptions(mainCategory).includes(value);

export const getSubCategoryOptions = (mainCategory: MainCategory) =>
  MAIN_CATEGORY_TREE[mainCategory] || [];
