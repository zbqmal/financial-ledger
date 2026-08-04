import { useMemo } from "react";
import {
  YearlyComparisonGraphType,
  YearlyGraphType,
} from "../../types/yearly-graph-types";
import { compactCurrency, currency } from "../../utils/currency-utils";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import YearlyGraphTooltip from "./YearlyGraphToolTip";
import { getSubCategoryColor } from "../../utils/category-utils";

type YearlyGraphProps = {
  title: string;
  subheader: string;
  chipText: string;
  ariaLabelForGraphLegend: string;
  ariaLabelForChartWrap: string;
  yearlyComparisonGraph: YearlyComparisonGraphType | null;
  yearlyGraph: YearlyGraphType | null;
};

const YearlyGraph: React.FC<YearlyGraphProps> = ({
  title,
  subheader,
  chipText,
  ariaLabelForGraphLegend,
  ariaLabelForChartWrap,
  yearlyComparisonGraph,
  yearlyGraph,
}) => {
  if (!yearlyComparisonGraph && !yearlyGraph) {
    return null;
  }

  const isComparisonGraph = Boolean(yearlyComparisonGraph);
  const activeYearlyGraph = yearlyGraph as YearlyGraphType;
  const comparisonGraph = yearlyComparisonGraph as Exclude<
    YearlyComparisonGraphType,
    null
  >;

  const headerClassName = isComparisonGraph
    ? "compare"
    : activeYearlyGraph.type;

  const graphLegend = useMemo(
    () => {
      if (isComparisonGraph) {
        return comparisonGraph.lines.map((line) => (
          <span key={line.key} className="legend-chip">
            <span
              className="legend-swatch"
              style={{ backgroundColor: line.color }}
              aria-hidden="true"
            />
            {line.key}
          </span>
        ));
      }

      return activeYearlyGraph.subCategories.map((subCategory, index) => (
        <span key={subCategory} className="legend-chip">
          <span
            className="legend-swatch"
            style={{
              backgroundColor: getSubCategoryColor(
                activeYearlyGraph.mainCategory,
                index,
              ),
            }}
            aria-hidden="true"
          />
          {subCategory}
        </span>
      ));
    },
    [activeYearlyGraph, comparisonGraph, isComparisonGraph],
  );

  const graphData = isComparisonGraph
    ? comparisonGraph.monthlyTotals
    : activeYearlyGraph.monthlyTotals;

  const graphLine = useMemo(
    () => {
      if (isComparisonGraph) {
        return comparisonGraph.lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            stroke={line.color}
            strokeWidth={2.8}
            dot={{ r: 2.5, fill: line.color, strokeWidth: 0 }}
            activeDot={{ r: 4 }}
          />
        ));
      }

      return activeYearlyGraph.subCategories.map((subCategory, index) => (
        <Line
          key={subCategory}
          type="monotone"
          dataKey={subCategory}
          stroke={getSubCategoryColor(activeYearlyGraph.mainCategory, index)}
          strokeWidth={2.5}
          dot={{
            r: 2.5,
            fill: getSubCategoryColor(activeYearlyGraph.mainCategory, index),
            strokeWidth: 0,
          }}
          activeDot={{ r: 4 }}
        />
      ));
    },
    [activeYearlyGraph, comparisonGraph, isComparisonGraph],
  );

  return (
    <article className="graph-card" role="listitem">
      <div className="graph-header">
        <div>
          <h3>{title}</h3>
          <p>{subheader}</p>
        </div>
        <span className={`type-pill ${headerClassName}`}>{chipText}</span>
      </div>

      <div className="graph-legend" aria-label={ariaLabelForGraphLegend}>
        {graphLegend}
      </div>

      <div className="chart-wrap" aria-label={ariaLabelForChartWrap}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={graphData}
            margin={{ top: 8, right: 12, left: 2, bottom: 4 }}
          >
            <CartesianGrid
              stroke="rgba(148, 163, 184, 0.2)"
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <YAxis
              tickFormatter={compactCurrency}
              tickLine={false}
              axisLine={false}
              width={58}
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <Tooltip content={<YearlyGraphTooltip currency={currency} />} />
            {graphLine}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
};

export default YearlyGraph;
