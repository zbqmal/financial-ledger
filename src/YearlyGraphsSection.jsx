import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function YearlyGraphsSection({
  yearlyGraphs,
  comparisonGraph,
  selectedYear,
  onYearChange,
  yearOptions,
  currency,
  compactCurrency,
  getSubCategoryColor,
}) {
  return (
    <section className="card graph-section">
      <div className="section-heading">
        <div>
          <p className="section-label">YEARLY GRAPHS</p>
        </div>
        <label className="graph-year-control">
          Year
          <select value={selectedYear} onChange={(event) => onYearChange(event.target.value)}>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="graph-scroller">
        <div className="graph-strip" role="list" aria-label={`Main-category graphs for ${selectedYear}`}>
          {comparisonGraph ? (
            <article className="graph-card" role="listitem">
              <div className="graph-header">
                <div>
                  <h3>{comparisonGraph.title}</h3>
                  <p>{`${currency(comparisonGraph.yearlyIncome)} vs ${currency(comparisonGraph.yearlyExpense)}`}</p>
                </div>
                <span className="type-pill compare">Income vs Expense</span>
              </div>

              <div className="graph-legend" aria-label="Income and expense totals">
                {comparisonGraph.lines.map((line) => (
                  <span key={line.key} className="legend-chip">
                    <span className="legend-swatch" style={{ backgroundColor: line.color }} aria-hidden="true" />
                    {line.key}
                  </span>
                ))}
              </div>

              <div className="chart-wrap" aria-label="Monthly income and expense totals">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonGraph.monthlyTotals} margin={{ top: 8, right: 12, left: 2, bottom: 4 }}>
                    <CartesianGrid stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="4 4" />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      tickFormatter={compactCurrency}
                      tickLine={false}
                      axisLine={false}
                      width={58}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip formatter={(value, name) => [currency(Number(value)), name]} />
                    {comparisonGraph.lines.map((line) => (
                      <Line
                        key={line.key}
                        type="monotone"
                        dataKey={line.key}
                        stroke={line.color}
                        strokeWidth={2.8}
                        dot={{ r: 2.5, fill: line.color, strokeWidth: 0 }}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>
          ) : null}

          {yearlyGraphs.map((graph) => (
            <article key={graph.mainCategory} className="graph-card" role="listitem">
              <div className="graph-header">
                <div>
                  <h3>{graph.mainCategory}</h3>
                  <p>{currency(graph.yearlyTotal)}</p>
                </div>
                <span className={`type-pill ${graph.type}`}>{graph.type}</span>
              </div>

              <div className="graph-legend" aria-label={`${graph.mainCategory} sub-categories`}>
                {graph.subCategories.map((subCategory, index) => (
                  <span key={subCategory} className="legend-chip">
                    <span
                      className="legend-swatch"
                      style={{ backgroundColor: getSubCategoryColor(graph.mainCategory, index) }}
                      aria-hidden="true"
                    />
                    {subCategory}
                  </span>
                ))}
              </div>

              <div className="chart-wrap" aria-label={`${graph.mainCategory} monthly sub-category totals`}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graph.monthlyTotals} margin={{ top: 8, right: 12, left: 2, bottom: 4 }}>
                    <CartesianGrid stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="4 4" />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      tickFormatter={compactCurrency}
                      tickLine={false}
                      axisLine={false}
                      width={58}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip formatter={(value, name) => [currency(Number(value)), name]} />
                    {graph.subCategories.map((subCategory, index) => (
                      <Line
                        key={subCategory}
                        type="monotone"
                        dataKey={subCategory}
                        stroke={getSubCategoryColor(graph.mainCategory, index)}
                        strokeWidth={2.5}
                        dot={{ r: 2.5, fill: getSubCategoryColor(graph.mainCategory, index), strokeWidth: 0 }}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default YearlyGraphsSection