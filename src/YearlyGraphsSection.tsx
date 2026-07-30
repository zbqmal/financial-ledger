import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function YearlyGraphTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) {
    return null
  }

  const visibleItems = payload.filter((entry) => Number.isFinite(Number(entry.value)))

  if (!visibleItems.length) {
    return null
  }

  const total = visibleItems.reduce((sum, entry) => sum + Number(entry.value), 0)

  return (
    <div
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.96)',
        border: '1px solid rgba(148, 163, 184, 0.35)',
        borderRadius: '14px',
        boxShadow: '0 18px 45px rgba(15, 23, 42, 0.28)',
        color: '#f8fafc',
        padding: '0.75rem 0.9rem',
      }}
    >
      <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700 }}>{label}</p>
      <div style={{ display: 'grid', gap: '0.3rem', marginTop: '0.45rem' }}>
        {visibleItems.map((entry) => (
          <div
            key={entry.dataKey}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              fontSize: '0.8rem',
            }}
          >
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span>{currency(Number(entry.value))}</span>
          </div>
        ))}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            borderTop: '1px solid rgba(148, 163, 184, 0.28)',
            marginTop: '0.15rem',
            paddingTop: '0.4rem',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}
        >
          <span>Total</span>
          <span>{currency(total)}</span>
        </div>
      </div>
    </div>
  )
}

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
                    <Tooltip content={<YearlyGraphTooltip currency={currency} />} />
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
                    <Tooltip content={<YearlyGraphTooltip currency={currency} />} />
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