import {
  MAIN_CATEGORY_OPTIONS,
  MAIN_CATEGORY_TREE,
} from "../constants/categories";
import { STORAGE_KEY } from "../constants/keys";
import {
  FinancialDataType,
  FinancialRecord,
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

export const BACKUP_STORAGE_KEY = `${STORAGE_KEY}-unreadable-backup`;

/**
 * Reads records from localStorage.
 *
 * If the stored data cannot be parsed, or some records had to be dropped, the
 * raw stored string is copied to BACKUP_STORAGE_KEY first, so the next save
 * cannot silently destroy data the app failed to read.
 */
export const loadStoredRecords = (): {
  records: FinancialRecord[];
  backedUpRawData: boolean;
} => {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { records: [], backedUpRawData: false };
  }
  if (!saved) return { records: [], backedUpRawData: false };

  let records: FinancialRecord[] = [];
  let lostData = false;
  try {
    const payload = JSON.parse(saved);
    records = parseRecords(payload);
    lostData =
      !Array.isArray(payload?.records) ||
      records.length < payload.records.length;
  } catch {
    lostData = true;
  }

  if (!lostData) return { records, backedUpRawData: false };

  try {
    // Never overwrite an earlier backup; it may hold the only good copy.
    if (!localStorage.getItem(BACKUP_STORAGE_KEY)) {
      localStorage.setItem(BACKUP_STORAGE_KEY, saved);
    }
    return { records, backedUpRawData: true };
  } catch {
    return { records, backedUpRawData: false };
  }
};

export const loadInitialRecords = (): FinancialRecord[] =>
  loadStoredRecords().records;

/**
 * Writes records to localStorage. Returns false instead of throwing when the
 * browser refuses the write (for example, when the storage quota is full).
 */
export const saveRecords = (records: FinancialRecord[]): boolean => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(buildBackupPayload(records)),
    );
    return true;
  } catch {
    return false;
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

const normalizeRecord = (record: unknown): FinancialRecord | null => {
  if (!Array.isArray(record) || record.length < 6) return null;

  const [id, date, mainCategory, subCategory, rawAmount, note] = record;

  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }
  if (
    !isValidMainCategory(mainCategory) ||
    typeof subCategory !== "string" ||
    !isValidSubCategory(mainCategory, subCategory)
  ) {
    return null;
  }

  const amount =
    typeof rawAmount === "number" ? rawAmount : Number.parseFloat(rawAmount);
  if (!Number.isFinite(amount) || amount === 0) return null;

  return {
    // A missing id or note should not cost the user the whole record.
    id: typeof id === "string" && id ? id : crypto.randomUUID(),
    date,
    mainCategory,
    subCategory,
    amount,
    note: typeof note === "string" ? note.trim() : "",
  };
};

const isValidMainCategory = (value: unknown): value is MainCategory =>
  MAIN_CATEGORY_OPTIONS.some((category) => category === value);

const isValidSubCategory = (mainCategory: MainCategory, value: string) =>
  getSubCategoryOptions(mainCategory).includes(value);

export const getSubCategoryOptions = (mainCategory: MainCategory) =>
  MAIN_CATEGORY_TREE[mainCategory] || [];

export const truncateText = (value: string, maxLength = 52) => {
  if (!value) return "";
  if (value.length <= maxLength) return value;

  return `${value.slice(0, maxLength - 1)}…`;
};

export const isValidAmountInput = (value: string) =>
  /^-?\d+(?:\.\d{2})$/.test(value);

export const sanitizeAmountInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const isNegative = trimmed.startsWith("-");
  const digitOnlyValue = trimmed.replace(/[^\d]/g, "");

  if (!digitOnlyValue) {
    return isNegative ? "-" : "";
  }

  const normalizedDigits = digitOnlyValue.replace(/^0+(?=\d)/, "");
  const paddedDigits = normalizedDigits.padStart(3, "0");
  const wholePart = paddedDigits.slice(0, -2).replace(/^0+(?=\d)/, "");
  const decimalPart = paddedDigits.slice(-2);

  return `${isNegative ? "-" : ""}${wholePart}.${decimalPart}`;
};
