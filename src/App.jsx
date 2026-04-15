import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'financial-ledger-data-v1'

const CATEGORY_OPTIONS = {
  expense: {
    House: ['Loan', 'GA Power', 'Water', 'Internet', 'Gas', 'Subscription', 'Etc'],
    Car: ['Loan', 'Insurance', 'Gas', 'Etc'],
    Eat: ['Mart', 'Eat Out', 'Dessert'],
    Shopping: ['Wearing', 'House', 'Entertain', 'Etc'],
    Subscription: ['Phone', 'Entertain', 'Etc'],
    Entertain: ['Sports', 'Events', 'Park&Game', 'Parking', 'Etc'],
    Trip: ['Hotel', 'Flight', 'Car', 'Eat', 'Entertain', 'Etc'],
    Health: ['Hospital', 'Dental', 'Medicine', 'Gym', 'Etc'],
    Etc: ['Gift', 'Etc'],
  },
  income: {
    Income: ['Salary', 'Bonus', 'Tax Return', 'Cash Back', 'Etc'],
  },
}

const TODAY = new Date().toISOString().slice(0, 10)
const THIS_MONTH = TODAY.slice(0, 7)
const THIS_YEAR = TODAY.slice(0, 4)

const currency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value || 0)

const toNumber = (value) => Number.parseFloat(value || 0) || 0

const loadInitialData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      return {
        entries: [],
        budgets: {},
        plans: [],
      }
    }

    const parsed = JSON.parse(saved)
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      budgets: parsed.budgets && typeof parsed.budgets === 'object' ? parsed.budgets : {},
      plans: Array.isArray(parsed.plans) ? parsed.plans : [],
    }
  } catch {
    return {
      entries: [],
      budgets: {},
      plans: [],
    }
  }
}

function App() {
  const [initialData] = useState(() => loadInitialData())
  const [entries, setEntries] = useState(initialData.entries)
  const [budgets, setBudgets] = useState(initialData.budgets)
  const [plans, setPlans] = useState(initialData.plans)

  const [entryForm, setEntryForm] = useState({
    date: TODAY,
    type: 'expense',
    category: 'House',
    subcategory: 'Loan',
    amount: '',
    description: '',
  })

  const [planForm, setPlanForm] = useState({
    month: THIS_MONTH,
    plannedIncome: '',
    plannedExpense: '',
    note: '',
  })

  const [selectedMonth, setSelectedMonth] = useState(THIS_MONTH)
  const [selectedYear, setSelectedYear] = useState(THIS_YEAR)
  const [importError, setImportError] = useState('')

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        entries,
        budgets,
        plans,
      }),
    )
  }, [entries, budgets, plans])

  const typeCategories = useMemo(() => CATEGORY_OPTIONS[entryForm.type], [entryForm.type])
  const categoryNames = useMemo(() => Object.keys(typeCategories), [typeCategories])
  const selectedCategory = categoryNames.includes(entryForm.category)
    ? entryForm.category
    : categoryNames[0]
  const subcategoryNames = useMemo(
    () => typeCategories[selectedCategory] || [],
    [typeCategories, selectedCategory],
  )
  const selectedSubcategory = subcategoryNames.includes(entryForm.subcategory)
    ? entryForm.subcategory
    : subcategoryNames[0]

  const entriesForMonth = useMemo(
    () => entries.filter((entry) => entry.date.startsWith(selectedMonth)),
    [entries, selectedMonth],
  )

  const entriesForYear = useMemo(
    () => entries.filter((entry) => entry.date.startsWith(selectedYear)),
    [entries, selectedYear],
  )

  const summaryFor = (records) =>
    records.reduce(
      (acc, item) => {
        if (item.type === 'income') {
          acc.income += item.amount
        } else {
          acc.expense += item.amount
        }
        return acc
      },
      { income: 0, expense: 0 },
    )

  const daySummary = useMemo(() => {
    const todayRecords = entries.filter((entry) => entry.date === entryForm.date)
    return summaryFor(todayRecords)
  }, [entries, entryForm.date])

  const monthSummary = useMemo(() => summaryFor(entriesForMonth), [entriesForMonth])
  const yearSummary = useMemo(() => summaryFor(entriesForYear), [entriesForYear])

  const monthlyCategoryTotals = useMemo(() => {
    const totals = {}
    entriesForMonth.forEach((entry) => {
      totals[entry.category] = (totals[entry.category] || 0) + entry.amount
    })
    return totals
  }, [entriesForMonth])

  const yearlyCategoryTotals = useMemo(() => {
    const totals = {}
    entriesForYear.forEach((entry) => {
      totals[entry.category] = (totals[entry.category] || 0) + entry.amount
    })
    return totals
  }, [entriesForYear])

  const monthBudget = toNumber(budgets[selectedMonth])
  const spentInMonth = monthSummary.expense
  const budgetProgress = monthBudget > 0 ? Math.min((spentInMonth / monthBudget) * 100, 100) : 0

  const plannedTotals = useMemo(
    () =>
      plans.reduce(
        (acc, item) => {
          acc.income += item.plannedIncome
          acc.expense += item.plannedExpense
          return acc
        },
        { income: 0, expense: 0 },
      ),
    [plans],
  )

  const monthlyPlan = useMemo(
    () => plans.find((plan) => plan.month === selectedMonth),
    [plans, selectedMonth],
  )

  const saveEntry = (event) => {
    event.preventDefault()
    const amount = toNumber(entryForm.amount)
    if (!amount || amount <= 0) return

    setEntries((prev) => [
      {
        id: crypto.randomUUID(),
        ...entryForm,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        amount,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])

    setEntryForm((prev) => ({
      ...prev,
      amount: '',
      description: '',
    }))
  }

  const saveBudget = (value) => {
    setBudgets((prev) => ({
      ...prev,
      [selectedMonth]: value,
    }))
  }

  const savePlan = (event) => {
    event.preventDefault()
    const payload = {
      month: planForm.month,
      plannedIncome: toNumber(planForm.plannedIncome),
      plannedExpense: toNumber(planForm.plannedExpense),
      note: planForm.note.trim(),
    }

    setPlans((prev) => {
      const existingIndex = prev.findIndex((item) => item.month === payload.month)
      if (existingIndex === -1) return [payload, ...prev]
      const next = [...prev]
      next[existingIndex] = payload
      return next
    })
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ entries, budgets, plans }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `financial-ledger-${Date.now()}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const importData = (event) => {
    const file = event.target.files?.[0]
    setImportError('')
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'))
        setEntries(Array.isArray(parsed.entries) ? parsed.entries : [])
        setBudgets(parsed.budgets && typeof parsed.budgets === 'object' ? parsed.budgets : {})
        setPlans(Array.isArray(parsed.plans) ? parsed.plans : [])
      } catch {
        setImportError('Invalid JSON file. Please import a valid backup file.')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const recentEntries = useMemo(() => entries.slice(0, 15), [entries])

  return (
    <main className="app-shell">
      <header className="top-header">
        <div>
          <h1>My Financial Ledger</h1>
          <p>Track daily, monthly, yearly income and expenses with categories, plans, and budgets.</p>
        </div>
        <div className="storage-actions">
          <button type="button" onClick={exportData}>Export JSON</button>
          <label className="import-label" htmlFor="import-json">Import JSON</label>
          <input id="import-json" type="file" accept="application/json" onChange={importData} />
        </div>
      </header>

      {importError && <p className="error-text">{importError}</p>}

      <section className="card">
        <h2>Add Entry</h2>
        <form className="form-grid" onSubmit={saveEntry}>
          <label>
            Date
            <input
              type="date"
              value={entryForm.date}
              onChange={(event) => setEntryForm((prev) => ({ ...prev, date: event.target.value }))}
              required
            />
          </label>
          <label>
            Type
            <select
              value={entryForm.type}
              onChange={(event) => {
                const type = event.target.value
                const firstCategory = Object.keys(CATEGORY_OPTIONS[type])[0]
                const firstSubcategory = CATEGORY_OPTIONS[type][firstCategory][0]
                setEntryForm((prev) => ({
                  ...prev,
                  type,
                  category: firstCategory,
                  subcategory: firstSubcategory,
                }))
              }}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>
          <label>
            Category
            <select
              value={selectedCategory}
              onChange={(event) => {
                const category = event.target.value
                setEntryForm((prev) => ({
                  ...prev,
                  category,
                  subcategory: typeCategories[category][0],
                }))
              }}
            >
              {categoryNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            Subcategory
            <select
              value={selectedSubcategory}
              onChange={(event) => setEntryForm((prev) => ({ ...prev, subcategory: event.target.value }))}
            >
              {subcategoryNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            Amount
            <input
              type="number"
              min="0"
              step="0.01"
              value={entryForm.amount}
              onChange={(event) => setEntryForm((prev) => ({ ...prev, amount: event.target.value }))}
              placeholder="0.00"
              required
            />
          </label>
          <label className="wide">
            Description
            <input
              type="text"
              value={entryForm.description}
              onChange={(event) => setEntryForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="What was this for?"
            />
          </label>
          <button type="submit" className="primary">Save Entry</button>
        </form>
      </section>

      <section className="card controls-grid">
        <label>
          Month view
          <input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} />
        </label>
        <label>
          Year view
          <input type="number" min="2000" max="2100" value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)} />
        </label>
        <label>
          Monthly budget
          <input
            type="number"
            min="0"
            step="0.01"
            value={budgets[selectedMonth] || ''}
            onChange={(event) => saveBudget(event.target.value)}
            placeholder="Set budget"
          />
        </label>
      </section>

      <section className="stats-grid">
        <article className="card stat">
          <h3>Daily ({entryForm.date})</h3>
          <p>Income: {currency(daySummary.income)}</p>
          <p>Expense: {currency(daySummary.expense)}</p>
          <p>Balance: {currency(daySummary.income - daySummary.expense)}</p>
        </article>
        <article className="card stat">
          <h3>Monthly ({selectedMonth})</h3>
          <p>Income: {currency(monthSummary.income)}</p>
          <p>Expense: {currency(monthSummary.expense)}</p>
          <p>Balance: {currency(monthSummary.income - monthSummary.expense)}</p>
        </article>
        <article className="card stat">
          <h3>Yearly ({selectedYear})</h3>
          <p>Income: {currency(yearSummary.income)}</p>
          <p>Expense: {currency(yearSummary.expense)}</p>
          <p>Balance: {currency(yearSummary.income - yearSummary.expense)}</p>
        </article>
      </section>

      <section className="card">
        <h2>Budget Tracker ({selectedMonth})</h2>
        <p>Budget: {currency(monthBudget)}</p>
        <p>Spent: {currency(spentInMonth)}</p>
        <p>Remaining: {currency(monthBudget - spentInMonth)}</p>
        <div className="progress-track" role="img" aria-label="Budget usage progress">
          <div className="progress-fill" style={{ width: `${budgetProgress}%` }}></div>
        </div>
      </section>

      <section className="charts-grid">
        <article className="card">
          <h2>Monthly Category Chart ({selectedMonth})</h2>
          <CategoryBars totals={monthlyCategoryTotals} />
        </article>
        <article className="card">
          <h2>Yearly Category Chart ({selectedYear})</h2>
          <CategoryBars totals={yearlyCategoryTotals} />
        </article>
      </section>

      <section className="card">
        <h2>Plan (Past + Future)</h2>
        <form className="form-grid" onSubmit={savePlan}>
          <label>
            Plan month
            <input
              type="month"
              value={planForm.month}
              onChange={(event) => setPlanForm((prev) => ({ ...prev, month: event.target.value }))}
              required
            />
          </label>
          <label>
            Planned income
            <input
              type="number"
              min="0"
              step="0.01"
              value={planForm.plannedIncome}
              onChange={(event) => setPlanForm((prev) => ({ ...prev, plannedIncome: event.target.value }))}
            />
          </label>
          <label>
            Planned expense
            <input
              type="number"
              min="0"
              step="0.01"
              value={planForm.plannedExpense}
              onChange={(event) => setPlanForm((prev) => ({ ...prev, plannedExpense: event.target.value }))}
            />
          </label>
          <label className="wide">
            Note
            <input
              type="text"
              value={planForm.note}
              onChange={(event) => setPlanForm((prev) => ({ ...prev, note: event.target.value }))}
              placeholder="Monthly memo"
            />
          </label>
          <button type="submit" className="primary">Save Plan</button>
        </form>

        <div className="plan-summary">
          <p>Total planned income: {currency(plannedTotals.income)}</p>
          <p>Total planned expense: {currency(plannedTotals.expense)}</p>
          <p>Planned remaining: {currency(plannedTotals.income - plannedTotals.expense)}</p>
          {monthlyPlan && (
            <p>
              {selectedMonth} plan: {currency(monthlyPlan.plannedIncome)} income / {currency(monthlyPlan.plannedExpense)} expense / {currency(monthlyPlan.plannedIncome - monthlyPlan.plannedExpense)} remaining
            </p>
          )}
        </div>
      </section>

      <section className="card">
        <h2>Recent Records</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentEntries.length === 0 ? (
                <tr>
                  <td colSpan="6">No records yet.</td>
                </tr>
              ) : (
                recentEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.date}</td>
                    <td>{entry.type}</td>
                    <td>{entry.category}</td>
                    <td>{entry.subcategory}</td>
                    <td>{entry.description || '-'}</td>
                    <td>{currency(entry.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

function CategoryBars({ totals }) {
  const rows = Object.entries(totals).sort((a, b) => b[1] - a[1])
  const max = rows[0]?.[1] || 0

  if (rows.length === 0) {
    return <p className="muted">No data yet.</p>
  }

  return (
    <div className="bars">
      {rows.map(([category, amount]) => (
        <div key={category} className="bar-row">
          <div className="bar-label">
            <span>{category}</span>
            <strong>{currency(amount)}</strong>
          </div>
          <div className="bar-track" role="img" aria-label={`${category} total`}>
            <div className="bar-fill" style={{ width: `${max === 0 ? 0 : (amount / max) * 100}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default App
