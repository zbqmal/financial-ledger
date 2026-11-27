import { memo } from "react";
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

const tooltipContent = <YearlyGraphTooltip currency={currency} />;

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

  // Normalize both graph kinds into one list of series so the legend and the
  // chart lines are built from the same data.
  const series = yearlyComparisonGraph
    ? yearlyComparisonGraph.lines.map((line) => ({
        key: line.key,
        color: line.color,
        strokeWidth: 2.8,
      }))
    : (yearlyGraph as YearlyGraphType).subCategories.map(
        (subCategory, index) => ({
          key: subCategory,
          color: getSubCategoryColor(
            (yearlyGraph as YearlyGraphType).mainCategory,
            index,
          ),
          strokeWidth: 2.5,
        }),
      );

  const headerClassName = yearlyComparisonGraph
    ? "compare"
    : (yearlyGraph as YearlyGraphType).type;

  const graphData = yearlyComparisonGraph
    ? yearlyComparisonGraph.monthlyTotals
    : (yearlyGraph as YearlyGraphType).monthlyTotals;

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
        {series.map((line) => (
          <span key={line.key} className="legend-chip">
            <span
              className="legend-swatch"
              style={{ backgroundColor: line.color }}
              aria-hidden="true"
            />
            {line.key}
          </span>
        ))}
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
            <Tooltip content={tooltipContent} />
            {series.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                dot={{ r: 2.5, fill: line.color, strokeWidth: 0 }}
                activeDot={{ r: 4 }}
                // The default 1.5s draw animation replays on every data change,
                // which made the page stutter after each saved record.
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
};

/**
 * The section rebuilds every graph object whenever records change, but adding
 * one record usually changes only one or two graphs. Compare by value so the
 * unchanged charts skip their (expensive) re-render.
 */
const arePropsEqual = (
  previous: YearlyGraphProps,
  next: YearlyGraphProps,
): boolean =>
  previous.title === next.title &&
  previous.subheader === next.subheader &&
  previous.chipText === next.chipText &&
  previous.ariaLabelForGraphLegend === next.ariaLabelForGraphLegend &&
  previous.ariaLabelForChartWrap === next.ariaLabelForChartWrap &&
  JSON.stringify(previous.yearlyComparisonGraph) ===
    JSON.stringify(next.yearlyComparisonGraph) &&
  JSON.stringify(previous.yearlyGraph) === JSON.stringify(next.yearlyGraph);

export default memo(YearlyGraph, arePropsEqual);
