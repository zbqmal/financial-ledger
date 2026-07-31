import { MAIN_CATEGORY_TREE } from "../constants/constants";

export type FinancialRecordTuple = [
  string,
  string,
  MainCategory,
  string,
  string,
  string,
];

export type FinancialDataType = {
  version: number;
  exportedAt: string;
  records: FinancialRecordTuple[];
};

export type MainCategory = keyof typeof MAIN_CATEGORY_TREE;

export type FinancialRecord = {
  id: string;
  date: string;
  mainCategory: MainCategory;
  subCategory: string;
  amount: number;
  note: string;
};
