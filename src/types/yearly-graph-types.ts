export type YearlyComparisonGraphType = {
  title: string;
  lines: {
    key: string;
    color: string;
  }[];
  monthlyTotals: {
    month: string;
    Income: number;
    Expense: number;
  }[];
  yearlyIncome: number;
  yearlyExpense: number;
} | null;

export type YearlyGraphType = {
  mainCategory:
    | "Housing"
    | "Etc"
    | "Entertainment"
    | "Eat"
    | "Vehicle"
    | "Shopping"
    | "Subscriptions"
    | "Trip"
    | "Health"
    | "Income";
  type: string;
  subCategories: string[];
  monthlyTotals: {
    month: string;
    [key: string]: string | number;
  }[];
  subCategoryTotals: Record<string, number>;
  yearlyTotal: number;
};
