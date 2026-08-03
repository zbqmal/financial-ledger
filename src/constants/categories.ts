export const MAIN_CATEGORY_TREE = {
  Housing: ["Loan/Rental", "Electricity", "Water", "Gas", "Internet", "Etc"],
  Vehicle: ["Loan", "Insurance", "Gas/Charge", "Maintenance", "Etc"],
  Eat: ["Mart", "EatOut", "Dessert"],
  Shopping: ["Wearing", "Furniture/Home", "Entertainment", "Etc"],
  Subscriptions: ["Phone", "Entertainment", "Education", "Sports", "Etc"],
  Entertainment: ["Sports", "Events", "Park/Game", "Parking", "Etc"],
  Trip: ["Hotel", "Flight", "Car", "Eat", "Entertainment", "Etc"],
  Health: ["Hospital", "Dental", "Medicine", "Etc"],
  Etc: ["Gift", "Etc"],
  Income: ["Salary", "Bonus", "TaxReturn", "CashBack", "Etc"],
};

export const MAIN_CATEGORY_OPTIONS = Object.keys(
  MAIN_CATEGORY_TREE,
) as (keyof typeof MAIN_CATEGORY_TREE)[];

export const CATEGORY_KIND = {
  Housing: "expense",
  Vehicle: "expense",
  Eat: "expense",
  Shopping: "expense",
  Subscriptions: "expense",
  Entertainment: "expense",
  Trip: "expense",
  Health: "expense",
  Etc: "expense",
  Income: "income",
};

export const SUB_CATEGORY_PALETTES = {
  Housing: ["#2563eb", "#f97316", "#06b6d4", "#ef4444", "#22c55e", "#8b5cf6"],
  Vehicle: ["#dc2626", "#0ea5e9", "#f59e0b", "#14b8a6", "#7c3aed"],
  Eat: ["#16a34a", "#f97316", "#ec4899"],
  Shopping: ["#db2777", "#0f766e", "#f59e0b", "#6366f1"],
  Subscriptions: ["#0284c7", "#8b5cf6", "#f43f5e", "#16a34a", "#f59e0b"],
  Entertainment: ["#0ea5e9", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6"],
  Trip: ["#2563eb", "#f97316", "#14b8a6", "#ef4444", "#a855f7", "#84cc16"],
  Health: ["#dc2626", "#06b6d4", "#84cc16", "#8b5cf6"],
  Etc: ["#f97316", "#64748b"],
  Income: ["#16a34a", "#f59e0b", "#0284c7", "#ec4899", "#6366f1"],
};

export const MAIN_CATEGORY_HUES = {
  Housing: 220,
  Vehicle: 16,
  Eat: 142,
  Shopping: 336,
  Subscriptions: 268,
  Entertainment: 192,
  Trip: 42,
  Health: 158,
  Etc: 210,
  Income: 126,
};
