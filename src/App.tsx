import { lazy, useEffect, useMemo, useState } from "react";
import "./App.css";
import DataManagementSection from "./features/HeroSection/DataManagementSection";
import toast, { Toaster } from "react-hot-toast";
import ResetRecordsDialog from "./features/HeroSection/ResetRecordsDialog";
import {
  getSubCategoryOptions,
  loadInitialRecords,
} from "./utils/record-utils";
import { FinancialRecord } from "./types/data-types";
import { STORAGE_KEY } from "./constants/keys";
import { MAIN_CATEGORY_OPTIONS } from "./constants/categories";
import IntroSection from "./features/HeroSection/IntroSection";
import { MONTH_OPTIONS, YEAR_OPTIONS } from "./constants/dates";
import Modal from "./components/Modal/Modal";
import { currency } from "./utils/currency-utils";

const YearlyGraphsSection = lazy(
  () => import("./features/YearlyGraphsSection/YearlyGraphsSection.js"),
);

const DEFAULT_MAIN_CATEGORY = "Housing";

const today = new Date();
const defaultYear = String(today.getFullYear());
const defaultMonth = String(today.getMonth() + 1).padStart(2, "0");

const truncateText = (value, maxLength = 52) => {
  if (!value) return "";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
};

const sanitizeAmountInput = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const isNegative = trimmed.startsWith("-");
  const digitOnlyValue = trimmed.replace(/[^\d]/g, "");

  if (!digitOnlyValue) {
    return isNegative ? "-" : "";
  }

  const normalizedDigits = digitOnlyValue.replace(/^0+(?=\d)/, "") || "0";
  const paddedDigits = normalizedDigits.padStart(3, "0");
  const wholePart = paddedDigits.slice(0, -2).replace(/^0+(?=\d)/, "") || "0";
  const decimalPart = paddedDigits.slice(-2);

  return `${isNegative ? "-" : ""}${wholePart}.${decimalPart}`;
};

const isValidAmountInput = (value) => /^-?\d+(?:\.\d{2})$/.test(value);

const formatUsDate = (isoDate) => {
  const [year, month, day] = isoDate.split("-");
  return `${month}/${day}/${year}`;
};

const getDaysInMonth = (year, month) =>
  new Date(Number(year), Number(month), 0).getDate();

const getDefaultSubCategory = (mainCategory) =>
  getSubCategoryOptions(mainCategory)[0] || "";

const getFallbackSubCategory = (mainCategory) => {
  const options = getSubCategoryOptions(mainCategory);
  return options.includes("Etc") ? "Etc" : options[0] || "";
};

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
});

export const App: React.FC = () => {
  const [records, setRecords] = useState<FinancialRecord[]>(() =>
    loadInitialRecords(),
  );
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedMainCategory, setSelectedMainCategory] = useState(
    DEFAULT_MAIN_CATEGORY,
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [addDraft, setAddDraft] = useState(null);
  const [editDraft, setEditDraft] = useState(null);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(buildBackupPayload(records)),
    );
  }, [records]);

  const selectedMainSubCategories = useMemo(
    () => getSubCategoryOptions(selectedMainCategory),
    [selectedMainCategory],
  );

  const filteredRecords = useMemo(
    () =>
      records.filter(
        (record) =>
          (!selectedYear || record.date.startsWith(selectedYear)) &&
          record.date.slice(5, 7) === selectedMonth &&
          record.mainCategory === selectedMainCategory,
      ),
    [records, selectedYear, selectedMonth, selectedMainCategory],
  );

  const tableRows = useMemo(() => {
    if (!selectedYear) return [];

    return Array.from(
      { length: getDaysInMonth(selectedYear, selectedMonth) },
      (_, index) => {
        const day = String(index + 1).padStart(2, "0");
        const date = `${selectedYear}-${selectedMonth}-${day}`;
        const dayRecords = filteredRecords.filter(
          (record) => record.date === date,
        );
        const totals = Object.fromEntries(
          selectedMainSubCategories.map((subCategory) => [subCategory, 0]),
        );
        const noteLines = dayRecords.map((record) => {
          totals[record.subCategory] += record.amount;
          return record.note
            ? `${record.subCategory}: ${currency(record.amount)} ${record.note}`
            : `${record.subCategory}: ${currency(record.amount)}`;
        });
        const notes = noteLines.join(" · ");

        return {
          date,
          totals,
          dayRecords,
          notes,
          notesPreview: truncateText(notes),
        };
      },
    );
  }, [filteredRecords, selectedMainSubCategories, selectedMonth, selectedYear]);

  const openAddRecord = (date, subCategory) => {
    setAddDraft({
      date,
      mainCategory: selectedMainCategory,
      subCategory,
      amount: "",
      note: "",
    });
  };

  const updateAddDraft = (field, value) => {
    setAddDraft((previous) => {
      if (!previous) return previous;

      if (field === "amount") {
        const nextAmount = sanitizeAmountInput(value);
        if (nextAmount === null) return previous;
        return { ...previous, amount: nextAmount };
      }

      return { ...previous, [field]: value };
    });
  };

  const saveRecord = (event) => {
    event.preventDefault();
    if (!addDraft || !isValidAmountInput(addDraft.amount)) {
      setStatusMessage(
        "Enter a valid amount. Typed digits will be formatted to 2 decimals automatically.",
      );
      return;
    }

    const amount = Number.parseFloat(addDraft.amount);

    if (!Number.isFinite(amount) || amount === 0) {
      setStatusMessage("Enter an amount other than 0.");
      return;
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
    ]);

    setAddDraft(null);
    setStatusMessage(
      `${addDraft.mainCategory} / ${addDraft.subCategory} record saved locally.`,
    );
  };

  const deleteRecord = (recordId) => {
    setRecords((previous) =>
      previous.filter((record) => record.id !== recordId),
    );
    setStatusMessage("Record deleted.");
  };

  const confirmResetData = () => {
    setRecords([]);
    setResetDialogOpen(false);
    toast.success("All data reset.");
  };

  const openEditRecord = (record) => {
    setEditDraft({
      id: record.id,
      date: record.date,
      mainCategory: record.mainCategory,
      subCategory: record.subCategory,
      amount: record.amount.toFixed(2),
      note: record.note,
    });
  };

  const updateEditDraft = (field, value) => {
    setEditDraft((previous) => {
      if (!previous) return previous;

      if (field === "amount") {
        const nextAmount = sanitizeAmountInput(value);
        if (nextAmount === null) return previous;
        return { ...previous, amount: nextAmount };
      }

      return { ...previous, [field]: value };
    });
  };

  const saveEditedRecord = (event) => {
    event.preventDefault();
    if (!editDraft) return;

    if (!isValidAmountInput(editDraft.amount)) {
      setStatusMessage(
        "Enter a valid edited amount. Typed digits will be formatted to 2 decimals automatically.",
      );
      return;
    }

    const amount = Number.parseFloat(editDraft.amount);
    if (!Number.isFinite(amount) || amount === 0) {
      setStatusMessage("Enter an amount other than 0.");
      return;
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
    );

    setEditDraft(null);
    setStatusMessage("Record updated.");
  };

  return (
    <main className="app-shell">
      <Toaster position="top-center" reverseOrder={false} />

      <section className="hero card">
        <IntroSection />
        <DataManagementSection
          records={records}
          openResetDialog={(open: boolean) => setResetDialogOpen(open)}
          updateRecords={(record: FinancialRecord[]) => setRecords(record)}
        />
      </section>

      <YearlyGraphsSection records={records} />

      <article className="card table-card">
        <div className="section-heading">
          <div>
            <p className="section-label">Monthly table</p>
          </div>
        </div>

        <div className="table-controls">
          <label>
            Year
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
            >
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
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
            >
              {MONTH_OPTIONS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Main-Category
            <select
              value={selectedMainCategory}
              onChange={(event) => setSelectedMainCategory(event.target.value)}
            >
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
                            title={`View ${row.dayRecords.length} record detail${row.dayRecords.length === 1 ? "" : "s"}`}
                            aria-label={`Show ${row.dayRecords.length} record details for ${formatUsDate(row.date)}`}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                              focusable="false"
                            >
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
                              <span>
                                {row.dayRecords.length} record
                                {row.dayRecords.length === 1 ? "" : "s"}
                              </span>
                            </div>
                            <ul className="notes-record-list">
                              {row.dayRecords.map((record) => (
                                <li
                                  key={record.id}
                                  className="notes-record-item"
                                >
                                  <div className="notes-record-copy">
                                    <strong>{record.subCategory}</strong>
                                    <span>{currency(record.amount)}</span>
                                    <span>{record.note || "No note"}</span>
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
          <p className="empty-state">
            Choose a year to render the daily table.
          </p>
        )}
      </article>

      {resetDialogOpen && (
        <ResetRecordsDialog
          openResetDialog={(open: boolean) => setResetDialogOpen(open)}
          confirmResetData={confirmResetData}
        />
      )}

      {addDraft ? (
        <Modal title="Add record" onClose={() => setAddDraft(null)}>
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
                onChange={(event) =>
                  updateAddDraft("amount", event.target.value)
                }
                placeholder="0.00"
                required
              />
            </label>
            <label className="edit-note-field">
              Note
              <input
                type="text"
                value={addDraft.note}
                onChange={(event) => updateAddDraft("note", event.target.value)}
                placeholder="What was this about?"
              />
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setAddDraft(null)}
              >
                Cancel
              </button>
              <button type="submit" className="primary">
                Save record
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {editDraft ? (
        <Modal title="Edit record" onClose={() => setEditDraft(null)}>
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
                onChange={(event) =>
                  updateEditDraft("amount", event.target.value)
                }
                placeholder="0.00"
                required
              />
            </label>
            <label className="edit-note-field">
              Note
              <input
                type="text"
                value={editDraft.note}
                onChange={(event) =>
                  updateEditDraft("note", event.target.value)
                }
                placeholder="What was this about?"
              />
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setEditDraft(null)}
              >
                Cancel
              </button>
              <button type="submit" className="primary">
                Save changes
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </main>
  );
};
