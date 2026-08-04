import {
  buildBackupPayload,
  getSubCategoryOptions,
  isValidAmountInput,
  loadInitialRecords,
  parseRecords,
  sanitizeAmountInput,
  truncateText,
} from "../record-utils";
import { STORAGE_KEY } from "../../constants/keys";

describe("record-utils", () => {
  const validPayload = {
    version: 2,
    exportedAt: "2025-01-01T00:00:00.000Z",
    records: [
      [
        "id-1",
        "2025-01-01",
        "Income",
        "Salary",
        "2500.00",
        " January ",
      ] as const,
      ["id-2", "2025-01-02", "Eat", "Mart", "-45.23", "groceries"] as const,
    ],
  };

  it("builds backup payload with tuples", () => {
    const payload = buildBackupPayload([
      {
        id: "id-1",
        date: "2025-01-01",
        mainCategory: "Income",
        subCategory: "Salary",
        amount: 2500,
        note: "salary",
      },
    ]);

    expect(payload.version).toBe(2);
    expect(payload.records).toEqual([
      ["id-1", "2025-01-01", "Income", "Salary", 2500, "salary"],
    ]);
    expect(typeof payload.exportedAt).toBe("string");
  });

  it("parses and normalizes valid records", () => {
    const parsed = parseRecords(validPayload as any);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toMatchObject({
      id: "id-1",
      mainCategory: "Income",
      subCategory: "Salary",
      amount: 2500,
      note: "January",
    });
  });

  it("drops invalid records", () => {
    const payload = {
      version: 2,
      exportedAt: "x",
      records: [
        ["id", "bad-date", "Income", "Salary", "100.00", "x"],
        ["id", "2025-01-01", "Bad", "Salary", "100.00", "x"],
        ["id", "2025-01-01", "Income", "Salary", "0", "x"],
      ],
    };

    expect(parseRecords(payload as any)).toEqual([]);
  });

  it("returns empty for invalid payload", () => {
    expect(parseRecords(null)).toEqual([]);
    expect(parseRecords({} as any)).toEqual([]);
  });

  it("loads initial records from localStorage", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validPayload));
    expect(loadInitialRecords()).toHaveLength(2);
  });

  it("returns empty when localStorage has no saved data", () => {
    localStorage.removeItem(STORAGE_KEY);
    expect(loadInitialRecords()).toEqual([]);
  });

  it("returns empty when localStorage has invalid json", () => {
    localStorage.setItem(STORAGE_KEY, "not-json");
    expect(loadInitialRecords()).toEqual([]);
  });

  it("returns sub category options", () => {
    expect(getSubCategoryOptions("Income")).toContain("Salary");
  });

  it("returns empty sub categories for unknown main category", () => {
    expect(getSubCategoryOptions("Unknown" as any)).toEqual([]);
  });

  it("truncates text with ellipsis", () => {
    expect(truncateText("short", 10)).toBe("short");
    expect(truncateText("abcdefghijklmnopqrstuvwxyz", 10)).toBe("abcdefghi…");
  });

  it("validates amount input format", () => {
    expect(isValidAmountInput("10.00")).toBe(true);
    expect(isValidAmountInput("-10.05")).toBe(true);
    expect(isValidAmountInput("10")).toBe(false);
    expect(isValidAmountInput("10.0")).toBe(false);
  });

  it("sanitizes amount input", () => {
    expect(sanitizeAmountInput("1234")).toBe("12.34");
    expect(sanitizeAmountInput("-1234")).toBe("-12.34");
    expect(sanitizeAmountInput("$001")).toBe("0.01");
    expect(sanitizeAmountInput("0000")).toBe("0.00");
    expect(sanitizeAmountInput("0")).toBe("0.00");
    expect(sanitizeAmountInput("-0")).toBe("-0.00");
    expect(sanitizeAmountInput("   ")).toBe("");
    expect(sanitizeAmountInput("-")).toBe("-");
    expect(sanitizeAmountInput("abc")).toBe("");
  });

  it("drops records with insufficient tuple length", () => {
    const payload = {
      version: 2,
      exportedAt: "x",
      records: [["id", "2025-01-01", "Income", "Salary", "10.00"]],
    };

    expect(parseRecords(payload as any)).toEqual([]);
  });
});
