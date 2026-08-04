import { render, screen } from "@testing-library/react";
import YearlyGraph from "../YearlyGraph";

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: ({ dataKey }: { dataKey: string }) => <div data-testid={`line-${dataKey}`} />,
  CartesianGrid: () => <div data-testid="grid" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

describe("YearlyGraph", () => {
  it("returns null when both graph inputs are null", () => {
    const { container } = render(
      <YearlyGraph
        title="Title"
        subheader="$0"
        chipText="expense"
        ariaLabelForGraphLegend="legend"
        ariaLabelForChartWrap="chart"
        yearlyComparisonGraph={null}
        yearlyGraph={null}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders comparison graph legend and lines", () => {
    render(
      <YearlyGraph
        title="Income & Expense"
        subheader="$100 vs $50"
        chipText="Income vs Expense"
        ariaLabelForGraphLegend="Income and expense totals"
        ariaLabelForChartWrap="Monthly income and expense totals"
        yearlyComparisonGraph={{
          title: "Income & Expense",
          lines: [
            { key: "Income", color: "green" },
            { key: "Expense", color: "red" },
          ],
          monthlyTotals: [{ month: "Jan", Income: 100, Expense: 50 }],
          yearlyIncome: 100,
          yearlyExpense: 50,
        }}
        yearlyGraph={null}
      />,
    );

    expect(screen.getByText("Income & Expense")).toBeInTheDocument();
    expect(screen.getByText("Income")).toBeInTheDocument();
    expect(screen.getByText("Expense")).toBeInTheDocument();
    expect(screen.getByTestId("line-Income")).toBeInTheDocument();
    expect(screen.getByTestId("line-Expense")).toBeInTheDocument();
  });

  it("renders category graph legend and lines", () => {
    render(
      <YearlyGraph
        title="Income"
        subheader="$200"
        chipText="income"
        ariaLabelForGraphLegend="Income sub-categories"
        ariaLabelForChartWrap="Income monthly sub-category totals"
        yearlyComparisonGraph={null}
        yearlyGraph={{
          mainCategory: "Income",
          type: "income",
          subCategories: ["Salary", "Bonus"],
          monthlyTotals: [
            { month: "Jan", Salary: 100, Bonus: 20 },
            { month: "Feb", Salary: 80, Bonus: 0 },
          ],
          subCategoryTotals: { Salary: 180, Bonus: 20 },
          yearlyTotal: 200,
        }}
      />,
    );

    expect(screen.getByText("Income")).toBeInTheDocument();
    expect(screen.getByText("Salary")).toBeInTheDocument();
    expect(screen.getByText("Bonus")).toBeInTheDocument();
    expect(screen.getByTestId("line-Salary")).toBeInTheDocument();
    expect(screen.getByTestId("line-Bonus")).toBeInTheDocument();
  });
});
