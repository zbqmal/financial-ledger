import { memo, useDeferredValue, useMemo, useState } from "react";
import YearlyGraphsSectionHeader from "./YearlyGraphSectionHeader";
import { FinancialRecord } from "../../types/data-types";
import { MONTH_OPTIONS } from "../../constants/dates";
import {
  CATEGORY_KIND,
  MAIN_CATEGORY_OPTIONS,
} from "../../constants/categories";
import { getSubCategoryOptions } from "../../utils/record-utils";
import YearlyGraph from "./YearlyGraph";
import { currency } from "../../utils/currency-utils";

type YearlyGraphsSectionProps = {
  records: FinancialRecord[];
};

const YearlyGraphsSection: React.FC<YearlyGraphsSectionProps> = ({
  records: latestRecords,
}) => {
  // Chart updates are the most expensive part of saving a record. Deferring
  // them lets the modal close and the table update first; the charts catch up
  // in a non-blocking background render.
  const records = useDeferredValue(latestRecords);
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString(),
  );

  const { yearlyComparisonGraph, yearlyGraphs } = useMemo(() => {
    const monthIndexByValue = Object.fromEntries(
      MONTH_OPTIONS.map((month, index) => [month.value, index]),
    ) as Record<string, number>;

    const comparisonMonthlyTotals = MONTH_OPTIONS.map((month) => ({
      month: month.label.slice(0, 3),
      Income: 0,
      Expense: 0,
    }));

    const categoryGraphs = MAIN_CATEGORY_OPTIONS.map((mainCategory) => {
      const subCategories = getSubCategoryOptions(mainCategory);
      const monthlySubCategoryTotals = MONTH_OPTIONS.map(
        () =>
          Object.fromEntries(
            subCategories.map((subCategory) => [subCategory, 0]),
          ) as Record<string, number>,
      );
      const subCategoryTotals = Object.fromEntries(
        subCategories.map((subCategory) => [subCategory, 0]),
      ) as Record<string, number>;

      return {
        mainCategory,
        type: CATEGORY_KIND[mainCategory],
        subCategories,
        monthlySubCategoryTotals,
        subCategoryTotals,
      };
    });

    const categoryGraphByMain = Object.fromEntries(
      categoryGraphs.map((graph) => [graph.mainCategory, graph]),
    ) as Record<string, (typeof categoryGraphs)[number]>;

    records.forEach((record) => {
      if (!record.date.startsWith(selectedYear)) return;

      const monthValue = record.date.slice(5, 7);
      const monthIndex = monthIndexByValue[monthValue];
      if (monthIndex === undefined) return;

      if (CATEGORY_KIND[record.mainCategory] === "income") {
        comparisonMonthlyTotals[monthIndex].Income += record.amount;
      } else {
        comparisonMonthlyTotals[monthIndex].Expense += record.amount;
      }

      const graph = categoryGraphByMain[record.mainCategory];
      if (!graph) return;

      if (record.subCategory in graph.subCategoryTotals) {
        graph.subCategoryTotals[record.subCategory] += record.amount;
        graph.monthlySubCategoryTotals[monthIndex][record.subCategory] +=
          record.amount;
      }
    });

    const yearlyComparisonGraph = {
      title: "Income & Expense",
      lines: [
        { key: "Income", color: "#16a34a" },
        { key: "Expense", color: "#dc2626" },
      ],
      monthlyTotals: comparisonMonthlyTotals,
      yearlyIncome: comparisonMonthlyTotals.reduce(
        (sum, item) => sum + item.Income,
        0,
      ),
      yearlyExpense: comparisonMonthlyTotals.reduce(
        (sum, item) => sum + item.Expense,
        0,
      ),
    };

    const yearlyGraphs = categoryGraphs.map((graph) => ({
      mainCategory: graph.mainCategory,
      type: graph.type,
      subCategories: graph.subCategories,
      monthlyTotals: MONTH_OPTIONS.map((month, index) => ({
        month: month.label.slice(0, 3),
        ...graph.monthlySubCategoryTotals[index],
      })),
      subCategoryTotals: graph.subCategoryTotals,
      yearlyTotal: Object.values(graph.subCategoryTotals).reduce(
        (sum, value) => sum + value,
        0,
      ),
    }));

    return {
      yearlyComparisonGraph,
      yearlyGraphs,
    };
  }, [selectedYear, records]);

  return (
    <section className="card graph-section">
      <YearlyGraphsSectionHeader
        selectedYear={selectedYear}
        onYearChange={(event) => setSelectedYear(event.target.value)}
      />
      <div className="graph-scroller">
        <div
          className="graph-strip"
          role="list"
          aria-label={`Main-category graphs for ${selectedYear}`}
        >
          <YearlyGraph
            key="yearly-comparison-graph"
            title={yearlyComparisonGraph.title}
            subheader={`${currency(yearlyComparisonGraph.yearlyIncome)} vs ${currency(yearlyComparisonGraph.yearlyExpense)}`}
            chipText="Income vs Expense"
            ariaLabelForGraphLegend="Income and expense totals"
            ariaLabelForChartWrap="Monthly income and expense totals"
            yearlyComparisonGraph={yearlyComparisonGraph}
            yearlyGraph={null}
          />

          {yearlyGraphs.map((graph) => (
            <YearlyGraph
              key={graph.mainCategory}
              title={graph.mainCategory}
              subheader={currency(graph.yearlyTotal)}
              chipText={graph.type}
              ariaLabelForGraphLegend={`${graph.mainCategory} sub-categories`}
              ariaLabelForChartWrap={`${graph.mainCategory} monthly sub-category totals`}
              yearlyComparisonGraph={null}
              yearlyGraph={graph}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(YearlyGraphsSection);
