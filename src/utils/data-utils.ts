import { FinancialRecord } from "../types/data-types";

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
