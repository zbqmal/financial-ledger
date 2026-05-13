import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import './App.css'

const YearlyGraphsSection = lazy(() => import('./YearlyGraphsSection.jsx'))

const STORAGE_KEY = 'financial-ledger-data-v2'
const ALL_SUB_CATEGORY_VALUE = '__all__'
const MAIN_CATEGORY_TREE = {
  Housing: ['Loan/Rental', 'Electricity', 'Water', 'Gas', 'Internet', 'Etc'],
  Vehicle: ['Loan', 'Insurance', 'Gas/Charge', 'Maintenance', 'Etc'],
  Eat: ['Mart', 'EatOut', 'Dessert'],
  Shopping: ['Wearing', 'Furniture/Home', 'Entertainment', 'Etc'],
  Subscriptions: ['Phone', 'Entertainment', 'Education', 'Sports', 'Etc'],
  Entertainment: ['Sports', 'Events', 'Park/Game', 'Parking', 'Etc'],
  Trip: ['Hotel', 'Flight', 'Car', 'Eat', 'Entertainment', 'Etc'],
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
const YEAR_OPTIONS = Array.from({ length: 101 }, (_, index) => String(2100 - index))
const SUB_CATEGORY_ALIASES = {
  Trip: {
    Rental: 'Car',
  },
}

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

const truncateText = (value, maxLength = 52) => {
  if (!value) return ''
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength - 1)}…`
}

const sanitizeAmountInput = (value) => {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const isNegative = trimmed.startsWith('-')
  const digitOnlyValue = trimmed.replace(/[^\d]/g, '')

  if (!digitOnlyValue) {
    return isNegative ? '-' : ''
  }

  const normalizedDigits = digitOnlyValue.replace(/^0+(?=\d)/, '') || '0'
  const paddedDigits = normalizedDigits.padStart(3, '0')
  const wholePart = paddedDigits.slice(0, -2).replace(/^0+(?=\d)/, '') || '0'
  const decimalPart = paddedDigits.slice(-2)

  return `${isNegative ? '-' : ''}${wholePart}.${decimalPart}`
}

const isValidAmountInput = (value) => /^-?\d+(?:\.\d{2})$/.test(value)

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

const normalizeSubCategoryAlias = (mainCategory, value) => {
  if (typeof value !== 'string') return value
  return SUB_CATEGORY_ALIASES[mainCategory]?.[value] || value
}

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
  const normalizedMainCategory = typeof source.mainCategory === 'string' ? source.mainCategory : null
  const normalizedSubCategory = normalizeSubCategoryAlias(normalizedMainCategory, source.subCategory)

  if (isValidMainCategory(normalizedMainCategory) && isValidSubCategory(normalizedMainCategory, normalizedSubCategory)) {
    mainCategory = normalizedMainCategory
    subCategory = normalizedSubCategory
  } else if (isValidMainCategory(source.category)) {
    mainCategory = source.category
    subCategory = getFallbackSubCategory(mainCategory)
  } else {
    return null
  }

  const amount = Number.parseFloat(source.amount)
  if (!Number.isFinite(amount) || amount === 0) return null

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
  const [graphYear, setGraphYear] = useState(defaultYear)
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth)
  const [selectedMainCategory, setSelectedMainCategory] = useState(DEFAULT_MAIN_CATEGORY)
  const [importError, setImportError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [addDraft, setAddDraft] = useState(null)
  const [editDraft, setEditDraft] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildBackupPayload(records)))
  }, [records])

  const selectedMainSubCategories = useMemo(
    () => getSubCategoryOptions(selectedMainCategory),
    [selectedMainCategory],
  )

  const filteredRecords = useMemo(
    () =>
      records.filter(
        (record) =>
          (!selectedYear || record.date.startsWith(selectedYear)) &&
          record.date.slice(5, 7) === selectedMonth &&
          record.mainCategory === selectedMainCategory,
      ),
    [records, selectedYear, selectedMonth, selectedMainCategory],
  )

  const tableRows = useMemo(() => {
    if (!selectedYear) return []

    return Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, index) => {
      const day = String(index + 1).padStart(2, '0')
      const date = `${selectedYear}-${selectedMonth}-${day}`
      const dayRecords = filteredRecords.filter((record) => record.date === date)
      const totals = Object.fromEntries(selectedMainSubCategories.map((subCategory) => [subCategory, 0]))
      const noteLines = dayRecords.map((record) => {
          totals[record.subCategory] += record.amount
          return record.note
            ? `${record.subCategory}: ${currency(record.amount)} ${record.note}`
            : `${record.subCategory}: ${currency(record.amount)}`
        })
      const notes = noteLines.join(' · ')

      return {
        date,
        totals,
        dayRecords,
        notes,
        notesPreview: truncateText(notes),
      }
    })
  }, [filteredRecords, selectedMainSubCategories, selectedMonth, selectedYear])

  const yearlyGraphs = useMemo(() => {
    if (!graphYear) return []

    return MAIN_CATEGORY_OPTIONS.map((mainCategory) => {
      const subCategories = getSubCategoryOptions(mainCategory)
      const monthlyTotals = MONTH_OPTIONS.map((month) => {
        const totals = Object.fromEntries(subCategories.map((subCategory) => [subCategory, 0]))

        records.forEach((record) => {
          if (
            record.mainCategory === mainCategory &&
            record.date.startsWith(graphYear) &&
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
  }, [graphYear, records])

  const yearlyComparisonGraph = useMemo(() => {
    if (!graphYear) return null

    const monthlyTotals = MONTH_OPTIONS.map((month) => {
      let income = 0
      let expense = 0

      records.forEach((record) => {
        if (record.date.startsWith(graphYear) && record.date.slice(5, 7) === month.value) {
          if (CATEGORY_KIND[record.mainCategory] === 'income') {
            income += record.amount
          } else {
            expense += record.amount
          }
        }
      })

      return {
        month: month.label.slice(0, 3),
        Income: income,
        Expense: expense,
      }
    })

    return {
      title: 'Income & Expense',
      lines: [
        { key: 'Income', color: '#16a34a' },
        { key: 'Expense', color: '#dc2626' },
      ],
      monthlyTotals,
      yearlyIncome: monthlyTotals.reduce((sum, item) => sum + item.Income, 0),
      yearlyExpense: monthlyTotals.reduce((sum, item) => sum + item.Expense, 0),
    }
  }, [graphYear, records])

  const openAddRecord = (date, subCategory) => {
    setAddDraft({
      date,
      mainCategory: selectedMainCategory,
      subCategory,
      amount: '',
      note: '',
    })
  }

  const updateAddDraft = (field, value) => {
    setAddDraft((previous) => {
      if (!previous) return previous

      if (field === 'amount') {
        const nextAmount = sanitizeAmountInput(value)
        if (nextAmount === null) return previous
        return { ...previous, amount: nextAmount }
      }

      return { ...previous, [field]: value }
    })
  }

  const saveRecord = (event) => {
    event.preventDefault()
    if (!addDraft || !isValidAmountInput(addDraft.amount)) {
      setStatusMessage('Enter a valid amount. Typed digits will be formatted to 2 decimals automatically.')
      return
    }

    const amount = Number.parseFloat(addDraft.amount)

    if (!Number.isFinite(amount) || amount === 0) {
      setStatusMessage('Enter an amount other than 0.')
      return
    }

    setRecords((previous) => [
      {
        id: crypto.randomUUID(),
        date: addDraft.date,
        mainCategory: addDraft.mainCategory,
        subCategory: addDraft.subCategory,
        amount,
        note: addDraft.note.trim(),
      },
      ...previous,
    ])

    setAddDraft(null)
    setStatusMessage(`${addDraft.mainCategory} / ${addDraft.subCategory} record saved locally.`)
    setImportError('')
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

  const deleteRecord = (recordId) => {
    setRecords((previous) => previous.filter((record) => record.id !== recordId))
    setStatusMessage('Record deleted.')
    setImportError('')
  }

  const resetData = () => {
    if (!records.length) {
      setStatusMessage('No data to reset.')
      setImportError('')
      return
    }

    setResetDialogOpen(true)
  }

  const confirmResetData = () => {
    setRecords([])
    setResetDialogOpen(false)
    setStatusMessage('All data reset.')
    setImportError('')
  }

  const openEditRecord = (record) => {
    setEditDraft({
      id: record.id,
      date: record.date,
      mainCategory: record.mainCategory,
      subCategory: record.subCategory,
      amount: record.amount.toFixed(2),
      note: record.note,
    })
  }

  const updateEditDraft = (field, value) => {
    setEditDraft((previous) => {
      if (!previous) return previous

      if (field === 'amount') {
        const nextAmount = sanitizeAmountInput(value)
        if (nextAmount === null) return previous
        return { ...previous, amount: nextAmount }
      }

      return { ...previous, [field]: value }
    })
  }

  const saveEditedRecord = (event) => {
    event.preventDefault()
    if (!editDraft) return

    if (!isValidAmountInput(editDraft.amount)) {
      setStatusMessage('Enter a valid edited amount. Typed digits will be formatted to 2 decimals automatically.')
      return
    }

    const amount = Number.parseFloat(editDraft.amount)
    if (!Number.isFinite(amount) || amount === 0) {
      setStatusMessage('Enter an amount other than 0.')
      return
    }

    setRecords((previous) =>
      previous.map((record) =>
        record.id === editDraft.id
          ? {
              ...record,
              amount,
              note: editDraft.note.trim(),
            }
          : record,
      ),
    )

    setEditDraft(null)
    setStatusMessage('Record updated.')
    setImportError('')
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
          <button type="button" className="secondary" onClick={resetData}>
            Reset
          </button>
          <input id="import-backup" type="file" accept="application/json" onChange={importData} />
        </div>
      </section>

      {graphYear ? (
        <Suspense
          fallback={
            <section className="card graph-section graph-loading">
              <div className="section-heading">
                <div>
                  <p className="section-label">Yearly graphs</p>
                </div>
              </div>
              <p className="status-text">Loading yearly graphs...</p>
            </section>
          }
        >
          <YearlyGraphsSection
            yearlyGraphs={yearlyGraphs}
            comparisonGraph={yearlyComparisonGraph}
            selectedYear={graphYear}
            onYearChange={setGraphYear}
            yearOptions={YEAR_OPTIONS}
            currency={currency}
            compactCurrency={compactCurrency}
            getSubCategoryColor={getSubCategoryColor}
          />
        </Suspense>
      ) : null}

      <article className="card table-card">
        <div className="section-heading">
          <div>
            <p className="section-label">Monthly table</p>
          </div>
        </div>

        <div className="table-controls">
          <label>
            Year
            <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
              <option value="">Select year</option>
              {YEAR_OPTIONS.map((year) => (
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
                        <button
                          type="button"
                          className="amount-cell-button"
                          onClick={() => openAddRecord(row.date, subCategory)}
                          aria-label={`Add ${subCategory} record on ${formatUsDate(row.date)}`}
                        >
                          {currency(row.totals[subCategory])}
                        </button>
                      </td>
                    ))}
                    <td className="notes-cell">
                      {row.dayRecords.length ? (
                        <div className="notes-popover">
                          <button
                            type="button"
                            className="notes-icon-button"
                            title={`View ${row.dayRecords.length} record detail${row.dayRecords.length === 1 ? '' : 's'}`}
                            aria-label={`Show ${row.dayRecords.length} record details for ${formatUsDate(row.date)}`}
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                              <path
                                d="M10.5 4a6.5 6.5 0 1 0 4.143 11.509l4.174 4.174 1.414-1.414-4.174-4.174A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"
                                fill="currentColor"
                              />
                            </svg>
                            <span>{row.dayRecords.length}</span>
                          </button>
                          <div className="notes-details" role="tooltip">
                            <div className="notes-details-header">
                              <strong>{formatUsDate(row.date)}</strong>
                              <span>{row.dayRecords.length} record{row.dayRecords.length === 1 ? '' : 's'}</span>
                            </div>
                            <ul className="notes-record-list">
                              {row.dayRecords.map((record) => (
                                <li key={record.id} className="notes-record-item">
                                  <div className="notes-record-copy">
                                    <strong>{record.subCategory}</strong>
                                    <span>{currency(record.amount)}</span>
                                    <span>{record.note || 'No note'}</span>
                                  </div>
                                  <div className="notes-record-actions">
                                    <button
                                      type="button"
                                      className="notes-edit"
                                      onClick={() => openEditRecord(record)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="notes-delete"
                                      onClick={() => deleteRecord(record.id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <span className="notes-preview notes-empty">—</span>
                      )}
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

      {(importError || statusMessage) && (
        <section className="feedback-row">
          {statusMessage ? <p className="status-text">{statusMessage}</p> : null}
          {importError ? <p className="error-text">{importError}</p> : null}
        </section>
      )}

      {resetDialogOpen ? (
        <ModalShell title="Reset all data" onClose={() => setResetDialogOpen(false)}>
          <p className="modal-copy">This will delete all imported and locally saved records.</p>
          <div className="modal-actions">
            <button type="button" className="secondary" onClick={() => setResetDialogOpen(false)}>
              Cancel
            </button>
            <button type="button" className="primary" onClick={confirmResetData}>
              Reset all data
            </button>
          </div>
        </ModalShell>
      ) : null}

      {addDraft ? (
        <ModalShell title="Add record" onClose={() => setAddDraft(null)}>
          <form className="edit-form" onSubmit={saveRecord}>
            <div className="record-meta-grid">
              <div className="record-meta-card">
                <span className="record-meta-label">Date</span>
                <strong>{formatUsDate(addDraft.date)}</strong>
              </div>
              <div className="record-meta-card">
                <span className="record-meta-label">Category</span>
                <strong>{`${addDraft.mainCategory} / ${addDraft.subCategory}`}</strong>
              </div>
            </div>
            <label>
              Amount
              <input
                type="text"
                inputMode="decimal"
                value={addDraft.amount}
                onChange={(event) => updateAddDraft('amount', event.target.value)}
                placeholder="0.00"
                required
              />
            </label>
            <label className="edit-note-field">
              Note
              <input
                type="text"
                value={addDraft.note}
                onChange={(event) => updateAddDraft('note', event.target.value)}
                placeholder="What was this about?"
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="secondary" onClick={() => setAddDraft(null)}>
                Cancel
              </button>
              <button type="submit" className="primary">
                Save record
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {editDraft ? (
        <ModalShell title="Edit record" onClose={() => setEditDraft(null)}>
          <form className="edit-form" onSubmit={saveEditedRecord}>
            <div className="record-meta-grid">
              <div className="record-meta-card">
                <span className="record-meta-label">Date</span>
                <strong>{formatUsDate(editDraft.date)}</strong>
              </div>
              <div className="record-meta-card">
                <span className="record-meta-label">Category</span>
                <strong>{`${editDraft.mainCategory} / ${editDraft.subCategory}`}</strong>
              </div>
            </div>
            <label>
              Amount
              <input
                type="text"
                inputMode="decimal"
                value={editDraft.amount}
                onChange={(event) => updateEditDraft('amount', event.target.value)}
                placeholder="0.00"
                required
              />
            </label>
            <label className="edit-note-field">
              Note
              <input
                type="text"
                value={editDraft.note}
                onChange={(event) => updateEditDraft('note', event.target.value)}
                placeholder="What was this about?"
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="secondary" onClick={() => setEditDraft(null)}>
                Cancel
              </button>
              <button type="submit" className="primary">
                Save changes
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}
    </main>
  )
}

function ModalShell({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        {children}
      </section>
    </div>
  )
}

export default App
