import { FinancialRecord } from "./data-types";

export type MonthlyTableRowType = {
  date: string;
  totals: {
    [k: string]: number;
  };
  dayRecords: FinancialRecord[];
  notes: string;
  notesPreview: string;
};
