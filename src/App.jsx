import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'

const STORAGE_KEY = 'financial-ledger-data-v2'
const ALL_SUB_CATEGORY_VALUE = '__all__'
const MAIN_CATEGORY_TREE = {
  Housing: ['Loan/Rental', 'Electricity', 'Water', 'Gas', 'Internet', 'Etc'],
  Vehicle: ['Loan', 'Insurance', 'Gas/Charge', 'Maintenance', 'Etc'],
  Eat: ['Mart', 'EatOut', 'Dessert'],
  Shopping: ['Wearing', 'Furniture/Home', 'Entertainment', 'Etc'],
  Subscriptions: ['Phone', 'Entertainment', 'Education', 'Sports', 'Etc'],
  Entertainment: ['Sports', 'Events', 'Park/Game', 'Parking', 'Etc'],
  Trip: ['Hotel', 'Flight', 'Rental', 'Eat', 'Entertainment', 'Etc'],
  Health: ['Hospital', 'Dental', 'Medicine', 'Etc'],
  Etc: ['Gift', 'Etc'],
  Income: ['Salary', 'Bonus', 'TaxReturn', 'CashBack', 'Etc'],
}
const MAIN_CATEGORY_OPTIONS = Object.keys(MAIN_CATEGORY_TREE)
const DEFAULT_MAIN_CATEGORY = 'Housing'
const CATEGORY_KIND = {
  Housing: 'expense',
  Vehicle: 'expense',
  Eat: 'expense',
  Shopping: 'expense',
  Subscriptions: 'expense',
  Entertainment: 'expense',
  Trip: 'expense',
  Health: 'expense',
  Etc: 'expense',
  Income: 'income',
}
const MAIN_CATEGORY_HUES = {
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
}
const SUB_CATEGORY_PALETTES = {
  Housing: ['#2563eb', '#f97316', '#06b6d4', '#ef4444', '#22c55e', '#8b5cf6'],
  Vehicle: ['#dc2626', '#0ea5e9', '#f59e0b', '#14b8a6', '#7c3aed'],
  Eat: ['#16a34a', '#f97316', '#ec4899'],
  Shopping: ['#db2777', '#0f766e', '#f59e0b', '#6366f1'],
  Subscriptions: ['#0284c7', '#8b5cf6', '#f43f5e', '#16a34a', '#f59e0b'],
  Entertainment: ['#0ea5e9', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'],
  Trip: ['#2563eb', '#f97316', '#14b8a6', '#ef4444', '#a855f7', '#84cc16'],
  Health: ['#dc2626', '#06b6d4', '#84cc16', '#8b5cf6'],
  Etc: ['#f97316', '#64748b'],
  Income: ['#16a34a', '#f59e0b', '#0284c7', '#ec4899', '#6366f1'],
}
const MONTH_OPTIONS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

const today = new Date()
const defaultYear = String(today.getFullYear())
const defaultMonth = String(today.getMonth() + 1).padStart(2, '0')
const defaultDay = String(today.getDate()).padStart(2, '0')

const currency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value || 0)

const compactCurrency = (value) =>
  `$${new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0)}`

const formatUsDate = (isoDate) => {
  const [year, month, day] = isoDate.split('-')
  return `${month}/${day}/${year}`
}

const getDaysInMonth = (year, month) => new Date(Number(year), Number(month), 0).getDate()

const getSubCategoryOptions = (mainCategory) => MAIN_CATEGORY_TREE[mainCategory] || []

const getDefaultSubCategory = (mainCategory) => getSubCategoryOptions(mainCategory)[0] || ''

const getFallbackSubCategory = (mainCategory) => {
  const options = getSubCategoryOptions(mainCategory)
  return options.includes('Etc') ? 'Etc' : options[0] || ''
}

const isValidMainCategory = (value) => MAIN_CATEGORY_OPTIONS.includes(value)

const isValidSubCategory = (mainCategory, value) => getSubCategoryOptions(mainCategory).includes(value)

const getSubCategoryColor = (mainCategory, index) => {
  const palette = SUB_CATEGORY_PALETTES[mainCategory]
  if (palette?.[index]) return palette[index]

  const hue = MAIN_CATEGORY_HUES[mainCategory] ?? 210
  const fallbackHue = (hue + index * 57) % 360
  return `hsl(${fallbackHue} 72% 48%)`
}

const buildBackupPayload = (records) => ({
  version: 2,
  exportedAt: new Date().toISOString(),
  records: records.map((record) => [
    record.id,
    record.date,
    record.mainCategory,
    record.subCategory,
    record.amount,
    record.note,
  ]),
})

const normalizeRecord = (record) => {
  const source = Array.isArray(record)
    ? record.length >= 6
      ? {
          id: record[0],
          date: record[1],
          mainCategory: record[2],
          subCategory: record[3],
          amount: record[4],
          note: record[5],
        }
      : {
          id: record[0],
          date: record[1],
          category: record[2],
          amount: record[3],
          note: record[4],
        }
    : record

  if (!source || typeof source !== 'object') return null
  if (typeof source.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(source.date)) return null

  let mainCategory = null
  let subCategory = null

  if (isValidMainCategory(source.mainCategory) && isValidSubCategory(source.mainCategory, source.subCategory)) {
    mainCategory = source.mainCategory
    subCategory = source.subCategory
  } else if (isValidMainCategory(source.category)) {
    mainCategory = source.category
    subCategory = getFallbackSubCategory(mainCategory)
  } else {
    return null
  }

  const amount = Number.parseFloat(source.amount)
  if (!Number.isFinite(amount) || amount <= 0) return null

  return {
    id: typeof source.id === 'string' && source.id ? source.id : crypto.randomUUID(),
    date: source.date,
    mainCategory,
    subCategory,
    amount,
    note: typeof source.note === 'string' ? source.note.trim() : '',
  }
}

const parseRecords = (payload) => {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.records)) {
    return []
  }

  return payload.records.map(normalizeRecord).filter(Boolean)
}

const loadInitialRecords = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []
    return parseRecords(JSON.parse(saved))
  } catch {
    return []
  }
}

function App() {
  const [records, setRecords] = useState(() => loadInitialRecords())
  const [selectedYear, setSelectedYear] = useState(defaultYear)
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth)
  const [selectedMainCategory, setSelectedMainCategory] = useState(DEFAULT_MAIN_CATEGORY)
  const [selectedSubCategory, setSelectedSubCategory] = useState(ALL_SUB_CATEGORY_VALUE)
  const [entryMainCategory, setEntryMainCategory] = useState(DEFAULT_MAIN_CATEGORY)
  const [entrySubCategory, setEntrySubCategory] = useState(getDefaultSubCategory(DEFAULT_MAIN_CATEGORY))
  const [entryDay, setEntryDay] = useState(defaultDay)
  const [entryAmount, setEntryAmount] = useState('')
  const [entryNote, setEntryNote] = useState('')
  const [importError, setImportError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildBackupPayload(records)))
  }, [records])

  useEffect(() => {
    if (!isValidSubCategory(entryMainCategory, entrySubCategory)) {
      setEntrySubCategory(getDefaultSubCategory(entryMainCategory))
    }
  }, [entryMainCategory, entrySubCategory])

  useEffect(() => {
    if (selectedSubCategory !== ALL_SUB_CATEGORY_VALUE && !isValidSubCategory(selectedMainCategory, selectedSubCategory)) {
      setSelectedSubCategory(ALL_SUB_CATEGORY_VALUE)
    }
  }, [selectedMainCategory, selectedSubCategory])

  const availableYears = useMemo(() => {
    const years = new Set(records.map((record) => record.date.slice(0, 4)))
    years.add(defaultYear)
    return [...years].sort((left, right) => Number(right) - Number(left))
  }, [records])

  const formYear = selectedYear || defaultYear
  const formDate = `${formYear}-${selectedMonth}-${entryDay}`
  const daysInSelectedMonth = useMemo(
    () => getDaysInMonth(formYear, selectedMonth),
    [formYear, selectedMonth],
  )
  const selectedMainSubCategories = useMemo(
    () => getSubCategoryOptions(selectedMainCategory),
    [selectedMainCategory],
  )
  const entryMainSubCategories = useMemo(
    () => getSubCategoryOptions(entryMainCategory),
    [entryMainCategory],
  )

  useEffect(() => {
    if (Number(entryDay) > daysInSelectedMonth) {
      setEntryDay(String(daysInSelectedMonth).padStart(2, '0'))
    }
  }, [daysInSelectedMonth, entryDay])

  const filteredRecords = useMemo(
    () =>
      records.filter(
        (record) =>
          (!selectedYear || record.date.startsWith(selectedYear)) &&
          record.date.slice(5, 7) === selectedMonth &&
          record.mainCategory === selectedMainCategory &&
          (selectedSubCategory === ALL_SUB_CATEGORY_VALUE || record.subCategory === selectedSubCategory),
      ),
    [records, selectedYear, selectedMonth, selectedMainCategory, selectedSubCategory],
  )

  const tableRows = useMemo(() => {
    if (!selectedYear) return []

    return Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, index) => {
      const day = String(index + 1).padStart(2, '0')
      const date = `${selectedYear}-${selectedMonth}-${day}`
      const dayRecords = filteredRecords.filter((record) => record.date === date)
      const totals = Object.fromEntries(selectedMainSubCategories.map((subCategory) => [subCategory, 0]))
      const notes = dayRecords
        .map((record) => {
          totals[record.subCategory] += record.amount
          return record.note
            ? `${record.subCategory}: ${currency(record.amount)} ${record.note}`
            : `${record.subCategory}: ${currency(record.amount)}`
        })
        .join(' · ')

      return {
        date,
        totals,
        notes,
      }
    })
  }, [filteredRecords, selectedMainSubCategories, selectedMonth, selectedYear])

  const yearlyGraphs = useMemo(() => {
    if (!selectedYear) return []

    return MAIN_CATEGORY_OPTIONS.map((mainCategory) => {
      const subCategories = getSubCategoryOptions(mainCategory)
      const monthlyTotals = MONTH_OPTIONS.map((month) => {
        const totals = Object.fromEntries(subCategories.map((subCategory) => [subCategory, 0]))

        records.forEach((record) => {
          if (
            record.mainCategory === mainCategory &&
            record.date.startsWith(selectedYear) &&
            record.date.slice(5, 7) === month.value
          ) {
            totals[record.subCategory] += record.amount
          }
        })

        return {
          month: month.label.slice(0, 3),
          ...totals,
        }
      })

      const subCategoryTotals = Object.fromEntries(
        subCategories.map((subCategory) => [
          subCategory,
          monthlyTotals.reduce((sum, item) => sum + item[subCategory], 0),
        ]),
      )

      return {
        mainCategory,
        type: CATEGORY_KIND[mainCategory],
        subCategories,
        monthlyTotals,
        subCategoryTotals,
        yearlyTotal: Object.values(subCategoryTotals).reduce((sum, value) => sum + value, 0),
      }
    })
  }, [records, selectedYear])

  const saveRecord = (event) => {
    event.preventDefault()
    const amount = Number.parseFloat(entryAmount)

    if (!Number.isFinite(amount) || amount <= 0) {
      setStatusMessage('Enter an amount greater than 0.')
      return
    }

    setRecords((previous) => [
      {
        id: crypto.randomUUID(),
        date: formDate,
        mainCategory: entryMainCategory,
        subCategory: entrySubCategory,
        amount,
        note: entryNote.trim(),
      },
      ...previous,
    ])

    setEntryAmount('')
    setEntryNote('')
    setStatusMessage(`${entryMainCategory} / ${entrySubCategory} record saved locally.`)
  }

  const exportData = () => {
    const payload = buildBackupPayload(records)
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `financial-ledger-${Date.now()}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setStatusMessage('Backup exported.')
  }

  const importData = (event) => {
    const file = event.target.files?.[0]
    setImportError('')
    setStatusMessage('')

    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'))
        const nextRecords = parseRecords(parsed)

        if (!Array.isArray(parsed.records)) {
          throw new Error('invalid')
        }

        setRecords(nextRecords)
        setStatusMessage(`Imported ${nextRecords.length} record${nextRecords.length === 1 ? '' : 's'}.`)
      } catch {
        setImportError('Import failed. Please use a valid financial-ledger backup file.')
      }
    }

    reader.readAsText(file)
    event.target.value = ''
  }

  return (
    <main className="app-shell">
      <section className="hero card">
        <div>
          <p className="eyebrow">Personal finance ledger</p>
          <h1>Simple, modern money tracking for your own monthly flow.</h1>
          <p className="hero-copy">
            Pick a year, month, main-category, and sub-category to review your history, then add one
            transaction at a time and keep everything backed up locally.
          </p>
        </div>
        <div className="hero-actions">
          <button type="button" className="primary" onClick={exportData}>
            Export data
          </button>
          <label className="secondary import-label" htmlFor="import-backup">
            Import data
          </label>
          <input id="import-backup" type="file" accept="application/json" onChange={importData} />
        </div>
      </section>

      <section className="filters card">
        <div className="section-heading">
          <div>
            <p className="section-label">Filters</p>
            <h2>Year / Month / Main / Sub</h2>
          </div>
          <span className={`type-pill ${CATEGORY_KIND[selectedMainCategory]}`}>
            {CATEGORY_KIND[selectedMainCategory]}
          </span>
        </div>
        <div className="filter-grid">
          <label>
            Year
            <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
              <option value="">Select year</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <label>
            Month
            <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
              {MONTH_OPTIONS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Main-Category
            <select value={selectedMainCategory} onChange={(event) => setSelectedMainCategory(event.target.value)}>
              {MAIN_CATEGORY_OPTIONS.map((mainCategory) => (
                <option key={mainCategory} value={mainCategory}>
                  {mainCategory}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sub-Category
            <select value={selectedSubCategory} onChange={(event) => setSelectedSubCategory(event.target.value)}>
              <option value={ALL_SUB_CATEGORY_VALUE}>All sub-categories</option>
              {selectedMainSubCategories.map((subCategory) => (
                <option key={subCategory} value={subCategory}>
                  {subCategory}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <article className="card form-card">
        <div className="section-heading">
          <div>
            <p className="section-label">Add record</p>
            <h2>Save a new transaction</h2>
          </div>
        </div>
        <form className="entry-form" onSubmit={saveRecord}>
          <label>
            Main-Category
            <select value={entryMainCategory} onChange={(event) => setEntryMainCategory(event.target.value)}>
              {MAIN_CATEGORY_OPTIONS.map((mainCategory) => (
                <option key={mainCategory} value={mainCategory}>
                  {mainCategory}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sub-Category
            <select value={entrySubCategory} onChange={(event) => setEntrySubCategory(event.target.value)}>
              {entryMainSubCategories.map((subCategory) => (
                <option key={subCategory} value={subCategory}>
                  {subCategory}
                </option>
              ))}
            </select>
          </label>
          <label>
            Day
            <select value={entryDay} onChange={(event) => setEntryDay(event.target.value)}>
              {Array.from({ length: daysInSelectedMonth }, (_, index) => {
                const value = String(index + 1).padStart(2, '0')
                return (
                  <option key={value} value={value}>
                    {value}
                  </option>
                )
              })}
            </select>
          </label>
          <label>
            Amount
            <input
              type="number"
              min="0"
              step="0.01"
              value={entryAmount}
              onChange={(event) => setEntryAmount(event.target.value)}
              placeholder="0.00"
              required
            />
          </label>
          <label className="entry-note-field">
            Note
            <input
              type="text"
              value={entryNote}
              onChange={(event) => setEntryNote(event.target.value)}
              placeholder="What was this about?"
            />
          </label>
          <div className="form-meta">
            <span>{formatUsDate(formDate)}</span>
            <span>{`${entryMainCategory} / ${entrySubCategory}`}</span>
          </div>
          <button type="submit" className="primary">
            Add record
          </button>
        </form>
      </article>

      <article className="card table-card">
        <div className="section-heading">
          <div>
            <p className="section-label">Monthly table</p>
            <h2>
              {selectedYear
                ? `${selectedMainCategory}${selectedSubCategory === ALL_SUB_CATEGORY_VALUE ? '' : ` / ${selectedSubCategory}`} in ${selectedYear}/${selectedMonth}`
                : 'Select a year to view the table'}
            </h2>
          </div>
        </div>

        {selectedYear ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  {selectedMainSubCategories.map((subCategory) => (
                    <th key={subCategory}>{subCategory}</th>
                  ))}
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.date}>
                    <td>{formatUsDate(row.date)}</td>
                    {selectedMainSubCategories.map((subCategory) => (
                      <td key={subCategory} className="amount-cell">
                        {currency(row.totals[subCategory])}
                      </td>
                    ))}
                    <td className="notes-cell" title={row.notes || 'No notes'}>
                      <span>{row.notes || '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">Choose a year to render the daily table.</p>
        )}
      </article>

      {selectedYear ? (
        <section className="card graph-section">
          <div className="section-heading graph-heading">
            <div>
              <p className="section-label">Yearly graphs</p>
              <h2>Monthly sub-category totals for every main-category in {selectedYear}</h2>
              <p className="graph-hint">Scroll sideways to browse all main-categories.</p>
            </div>
          </div>
          <div className="graph-scroller">
            <div className="graph-strip" role="list" aria-label={`Main-category graphs for ${selectedYear}`}>
              {yearlyGraphs.map((graph) => (
                <CategoryGraph key={graph.mainCategory} graph={graph} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {(importError || statusMessage) && (
        <section className="feedback-row">
          {statusMessage ? <p className="status-text">{statusMessage}</p> : null}
          {importError ? <p className="error-text">{importError}</p> : null}
        </section>
      )}
    </main>
  )
}

function CategoryGraph({ graph }) {
  return (
    <article className="graph-card" role="listitem">
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
          <LineChart data={graph.monthlyTotals} margin={{ top: 8, right: 8, left: -18, bottom: 4 }}>
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
              width={42}
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
  )
}

export default App
