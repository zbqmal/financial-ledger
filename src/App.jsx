import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'financial-ledger-data-v2'
const CATEGORY_OPTIONS = [
  'Housing',
  'Shopping',
  'Health',
  'Vehicle',
  'Subscriptions',
  'Entertainment',
  'Trip',
  'Income',
]
const CATEGORY_KIND = {
  Housing: 'expense',
  Shopping: 'expense',
  Health: 'expense',
  Vehicle: 'expense',
  Subscriptions: 'expense',
  Entertainment: 'expense',
  Trip: 'expense',
  Income: 'income',
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

const formatUsDate = (isoDate) => {
  const [year, month, day] = isoDate.split('-')
  return `${month}/${day}/${year}`
}

const getDaysInMonth = (year, month) => new Date(Number(year), Number(month), 0).getDate()

const buildBackupPayload = (records) => ({
  version: 1,
  exportedAt: new Date().toISOString(),
  records: records.map((record) => [record.id, record.date, record.category, record.amount, record.note]),
})

const normalizeRecord = (record) => {
  const source = Array.isArray(record)
    ? {
        id: record[0],
        date: record[1],
        category: record[2],
        amount: record[3],
        note: record[4],
      }
    : record

  if (!source || typeof source !== 'object') return null
  if (typeof source.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(source.date)) return null
  if (!CATEGORY_OPTIONS.includes(source.category)) return null

  const amount = Number.parseFloat(source.amount)
  if (!Number.isFinite(amount) || amount <= 0) return null

  return {
    id: typeof source.id === 'string' && source.id ? source.id : crypto.randomUUID(),
    date: source.date,
    category: source.category,
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
  const [selectedCategory, setSelectedCategory] = useState('Housing')
  const [entryDay, setEntryDay] = useState(defaultDay)
  const [entryAmount, setEntryAmount] = useState('')
  const [entryNote, setEntryNote] = useState('')
  const [importError, setImportError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildBackupPayload(records)))
  }, [records])

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
          record.category === selectedCategory,
      ),
    [records, selectedYear, selectedMonth, selectedCategory],
  )

  const selectedMonthTotal = useMemo(
    () => filteredRecords.reduce((total, record) => total + record.amount, 0),
    [filteredRecords],
  )

  const selectedYearTotal = useMemo(() => {
    if (!selectedYear) return 0
    return records.reduce((total, record) => {
      if (record.date.startsWith(selectedYear) && record.category === selectedCategory) {
        return total + record.amount
      }
      return total
    }, 0)
  }, [records, selectedCategory, selectedYear])

  const latestRecord = records[0] || null

  const tableRows = useMemo(() => {
    if (!selectedYear) return []

    return Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, index) => {
      const day = String(index + 1).padStart(2, '0')
      const date = `${selectedYear}-${selectedMonth}-${day}`
      const dayRecords = filteredRecords.filter((record) => record.date === date)
      const amount = dayRecords.reduce((total, record) => total + record.amount, 0)
      const notes = dayRecords
        .map((record) => (record.note ? `${currency(record.amount)} ${record.note}` : currency(record.amount)))
        .join(' · ')

      return {
        date,
        amount,
        notes,
      }
    })
  }, [filteredRecords, selectedMonth, selectedYear])

  const yearlyGraphs = useMemo(() => {
    if (!selectedYear) return []

    return CATEGORY_OPTIONS.map((category) => {
      const monthlyTotals = MONTH_OPTIONS.map((month) => {
        const total = records.reduce((sum, record) => {
          if (
            record.category === category &&
            record.date.startsWith(selectedYear) &&
            record.date.slice(5, 7) === month.value
          ) {
            return sum + record.amount
          }
          return sum
        }, 0)

        return {
          month: month.label.slice(0, 3),
          total,
        }
      })

      return {
        category,
        type: CATEGORY_KIND[category],
        monthlyTotals,
        yearlyTotal: monthlyTotals.reduce((sum, item) => sum + item.total, 0),
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
        category: selectedCategory,
        amount,
        note: entryNote.trim(),
      },
      ...previous,
    ])

    setEntryAmount('')
    setEntryNote('')
    setStatusMessage('Record saved locally.')
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
            Pick a year, month, and category to review your history, then add one record at a time and keep
            everything backed up locally.
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
            <h2>Year / Month / Category</h2>
          </div>
          <span className={`type-pill ${CATEGORY_KIND[selectedCategory]}`}>{CATEGORY_KIND[selectedCategory]}</span>
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
            Category
            <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="summary-grid">
        <article className="card summary-card">
          <p className="section-label">Selected month</p>
          <strong>{currency(selectedMonthTotal)}</strong>
          <span>
            {selectedYear || formYear} / {selectedMonth} / {selectedCategory}
          </span>
        </article>
        <article className="card summary-card">
          <p className="section-label">Selected year</p>
          <strong>{selectedYear ? currency(selectedYearTotal) : '—'}</strong>
          <span>{selectedYear ? `${selectedYear} total` : 'Choose a year to see totals'}</span>
        </article>
        <article className="card summary-card">
          <p className="section-label">Latest record</p>
          <strong>{latestRecord ? currency(latestRecord.amount) : '—'}</strong>
          <span>
            {latestRecord
              ? `${formatUsDate(latestRecord.date)} · ${latestRecord.category}`
              : 'No records saved yet'}
          </span>
        </article>
      </section>

      {selectedYear ? (
        <section className="card">
          <div className="section-heading">
            <div>
              <p className="section-label">Yearly graphs</p>
              <h2>Monthly totals for every category in {selectedYear}</h2>
            </div>
          </div>
          <div className="graph-strip" role="list" aria-label={`Category graphs for ${selectedYear}`}>
            {yearlyGraphs.map((graph) => (
              <CategoryGraph key={graph.category} graph={graph} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="content-grid">
        <article className="card table-card">
          <div className="section-heading">
            <div>
              <p className="section-label">Monthly table</p>
              <h2>
                {selectedYear ? `${selectedCategory} in ${selectedYear}/${selectedMonth}` : 'Select a year to view the table'}
              </h2>
            </div>
          </div>

          {selectedYear ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <tr key={row.date}>
                      <td>{formatUsDate(row.date)}</td>
                      <td>{currency(row.amount)}</td>
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

        <article className="card form-card">
          <div className="section-heading">
            <div>
              <p className="section-label">Add record</p>
              <h2>Save one {selectedCategory.toLowerCase()} record</h2>
            </div>
          </div>
          <form className="entry-form" onSubmit={saveRecord}>
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
            <label>
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
              <span>{selectedCategory}</span>
            </div>
            <button type="submit" className="primary">
              Add record
            </button>
          </form>
        </article>
      </section>

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
  const peak = Math.max(...graph.monthlyTotals.map((item) => item.total), 0)

  return (
    <article className="graph-card" role="listitem">
      <div className="graph-header">
        <div>
          <h3>{graph.category}</h3>
          <p>{currency(graph.yearlyTotal)}</p>
        </div>
        <span className={`type-pill ${graph.type}`}>{graph.type}</span>
      </div>
      <div className="mini-chart" aria-label={`${graph.category} monthly totals`}>
        {graph.monthlyTotals.map((item) => {
          const ratio = peak === 0 ? 0 : item.total / peak
          return (
            <div key={item.month} className="mini-bar-group">
              <div className="mini-bar-track">
                <div className="mini-bar-fill" style={{ height: `${Math.max(ratio * 100, item.total ? 8 : 0)}%` }} />
              </div>
              <span>{item.month}</span>
            </div>
          )
        })}
      </div>
    </article>
  )
}

export default App
