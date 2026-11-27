import { lazy, Suspense, useEffect, useState } from "react";
import { getDefaultDate } from "./utils/date-utils";
import "./App.css";
import DataManagementSection from "./features/HeroSection/DataManagementSection";
import toast, { Toaster } from "react-hot-toast";
import ResetRecordsDialog from "./features/HeroSection/ResetRecordsDialog";
import {
  isValidAmountInput,
  loadStoredRecords,
  saveRecords,
} from "./utils/record-utils";
import {
  FinancialRecord,
  MainCategory,
  UpdateRecordDraftType,
} from "./types/data-types";
import IntroSection from "./features/HeroSection/IntroSection";
import MonthlyTableSectionHeader from "./features/MonthlyTableSection/MonthlyTableSectionHeader";
import MonthlyTableFilter from "./features/MonthlyTableSection/MonthlyTableFilter";
import RecordFormModal from "./features/UpdateRecordModal/RecordFormModal";
import MonthlyTable from "./features/MonthlyTableSection/MonthlyTable";

const YearlyGraphsSection = lazy(
  () => import("./features/YearlyGraphsSection/YearlyGraphsSection.js"),
);

const DEFAULT_MAIN_CATEGORY = "Housing";

/**
 * Validates the draft amount and returns it as a number, or shows an error
 * toast and returns null.
 */
const parseDraftAmount = (draft: UpdateRecordDraftType): number | null => {
  if (!isValidAmountInput(draft.amount)) {
    toast.error(
      "Enter a valid amount. Typed digits will be formatted to 2 decimals automatically.",
    );
    return null;
  }

  const amount = Number.parseFloat(draft.amount);
  if (!Number.isFinite(amount) || amount === 0) {
    toast.error("Enter an amount other than 0.");
    return null;
  }

  return amount;
};

export const App: React.FC = () => {
  const { defaultYear, defaultMonth } = getDefaultDate();
  const [initialLoad] = useState(loadStoredRecords);
  const [records, setRecords] = useState<FinancialRecord[]>(
    initialLoad.records,
  );
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedMainCategory, setSelectedMainCategory] =
    useState<MainCategory>(DEFAULT_MAIN_CATEGORY);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // The draft itself lives inside RecordFormModal; App only knows which record
  // the form was opened for.
  const [recordFormState, setRecordFormState] = useState<{
    draft: UpdateRecordDraftType;
    isAddingRecord: boolean;
  } | null>(null);

  const closeRecordForm = () => setRecordFormState(null);

  const openAddRecordModal = (date: string, subCategory: string) => {
    setRecordFormState({
      isAddingRecord: true,
      draft: {
        date,
        mainCategory: selectedMainCategory,
        subCategory,
        amount: "",
        note: "",
      },
    });
  };

  const openEditRecordModal = (record: FinancialRecord) => {
    setRecordFormState({
      isAddingRecord: false,
      draft: {
        id: record.id,
        date: record.date,
        mainCategory: record.mainCategory,
        subCategory: record.subCategory,
        amount: record.amount.toFixed(2),
        note: record.note,
      },
    });
  };

  const saveRecord = (draft: UpdateRecordDraftType) => {
    const amount = parseDraftAmount(draft);
    if (amount === null) return;

    setRecords((previous) => [
      {
        id: crypto.randomUUID(),
        date: draft.date,
        mainCategory: draft.mainCategory,
        subCategory: draft.subCategory,
        amount,
        note: draft.note.trim(),
      },
      ...previous,
    ]);
    toast.success(
      `${draft.mainCategory} / ${draft.subCategory} record saved locally.`,
    );

    closeRecordForm();
  };

  const saveEditedRecord = (draft: UpdateRecordDraftType) => {
    const amount = parseDraftAmount(draft);
    if (amount === null) return;

    setRecords((previous) =>
      previous.map((record) =>
        record.id === draft.id
          ? {
              ...record,
              amount,
              note: draft.note.trim(),
            }
          : record,
      ),
    );
    toast.success("Record updated.");

    closeRecordForm();
  };

  const deleteRecord = (recordId: string) => {
    setRecords((previous) =>
      previous.filter((record) => record.id !== recordId),
    );
    toast.success("Record deleted.");

    closeRecordForm();
  };

  const confirmResetData = () => {
    setRecords([]);
    setResetDialogOpen(false);
    toast.success("All data reset.");
  };

  useEffect(() => {
    if (initialLoad.backedUpRawData) {
      toast.error(
        "Some saved data could not be read. A raw copy was kept in browser storage.",
        { id: "storage-backup" },
      );
    }
  }, [initialLoad]);

  useEffect(() => {
    // The records were just read from storage. Writing them straight back
    // could overwrite data that failed to load, so only save real changes.
    if (records === initialLoad.records) return;

    if (!saveRecords(records)) {
      toast.error(
        "Could not save to browser storage. Export a backup to keep your data.",
      );
    }
  }, [records, initialLoad]);

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

      <Suspense
        fallback={
          <section className="card graph-section">
            <p className="empty-state">Loading graphs…</p>
          </section>
        }
      >
        <YearlyGraphsSection records={records} />
      </Suspense>

      <article className="card table-card">
        <MonthlyTableSectionHeader />

        <MonthlyTableFilter
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedMainCategory={selectedMainCategory}
          updateSelectedYear={setSelectedYear}
          updateSelectedMonth={setSelectedMonth}
          updateSelectedMainCategory={setSelectedMainCategory}
        />

        {selectedYear ? (
          <MonthlyTable
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            selectedMainCategory={selectedMainCategory}
            openAddRecordModal={openAddRecordModal}
            openEditRecordModal={openEditRecordModal}
            deleteRecord={deleteRecord}
            records={records}
          />
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

      {recordFormState ? (
        <RecordFormModal
          initialDraft={recordFormState.draft}
          isAddingRecord={recordFormState.isAddingRecord}
          onSubmit={
            recordFormState.isAddingRecord ? saveRecord : saveEditedRecord
          }
          onClose={closeRecordForm}
        />
      ) : null}
    </main>
  );
};
