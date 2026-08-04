import { lazy, useEffect, useState } from "react";
import { getDefaultDate } from "./utils/date-utils";
import "./App.css";
import DataManagementSection from "./features/HeroSection/DataManagementSection";
import toast, { Toaster } from "react-hot-toast";
import ResetRecordsDialog from "./features/HeroSection/ResetRecordsDialog";
import {
  buildBackupPayload,
  isValidAmountInput,
  loadInitialRecords,
  sanitizeAmountInput,
} from "./utils/record-utils";
import {
  FinancialRecord,
  MainCategory,
  UpdateRecordDraftType,
} from "./types/data-types";
import { STORAGE_KEY } from "./constants/keys";
import IntroSection from "./features/HeroSection/IntroSection";
import Modal from "./components/Modal/Modal";
import MonthlyTableSectionHeader from "./features/MonthlyTableSection/MonthlyTableSectionHeader";
import MonthlyTableFilter from "./features/MonthlyTableSection/MonthlyTableFilter";
import UpdateRecordModal from "./features/UpdateRecordModal/UpdateRecordModal";
import MonthlyTable from "./features/MonthlyTableSection/MonthlyTable";

const YearlyGraphsSection = lazy(
  () => import("./features/YearlyGraphsSection/YearlyGraphsSection.js"),
);

const DEFAULT_MAIN_CATEGORY = "Housing";

export const App: React.FC = () => {
  const { defaultYear, defaultMonth } = getDefaultDate();
  const [records, setRecords] = useState<FinancialRecord[]>(() =>
    loadInitialRecords(),
  );
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedMainCategory, setSelectedMainCategory] =
    useState<MainCategory>(DEFAULT_MAIN_CATEGORY);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const [recordDraft, setRecordDraft] = useState<UpdateRecordDraftType | null>(
    null,
  );
  const [isUpdateRecordModalOpen, setIsUpdateRecordModalOpen] = useState(false);
  const [isCreatingRecord, setIsCreatingRecord] = useState(false);

  const updateSelectedYear = (year: string) => {
    setSelectedYear(year);
  };

  const updateSelectedMonth = (month: string) => {
    setSelectedMonth(month);
  };

  const updateSelectedMainCategory = (mainCategory: MainCategory) => {
    setSelectedMainCategory(mainCategory);
  };

  const closeUpdateRecordModal = () => {
    setIsUpdateRecordModalOpen(false);
    setRecordDraft(null);
  };

  const openAddRecordModal = (date: string, subCategory: string) => {
    setIsUpdateRecordModalOpen(true);
    setIsCreatingRecord(true);

    setRecordDraft({
      date,
      mainCategory: selectedMainCategory,
      subCategory,
      amount: "",
      note: "",
    });
  };

  const openEditRecordModal = (record: FinancialRecord) => {
    setIsUpdateRecordModalOpen(true);
    setIsCreatingRecord(false);

    setRecordDraft({
      id: record.id,
      date: record.date,
      mainCategory: record.mainCategory,
      subCategory: record.subCategory,
      amount: record.amount.toFixed(2),
      note: record.note,
    });
  };

  const updateRecordDraft = (field: string, value: string) => {
    setRecordDraft((previous: UpdateRecordDraftType | null) => {
      if (!previous) return previous;

      if (field === "amount") {
        const nextAmount = sanitizeAmountInput(value);
        if (nextAmount === null) return previous;

        return { ...previous, amount: nextAmount };
      }

      return { ...previous, [field]: value };
    });
  };

  const saveRecord = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!recordDraft || !isValidAmountInput(recordDraft.amount)) {
      toast.error(
        "Enter a valid amount. Typed digits will be formatted to 2 decimals automatically.",
      );
      return;
    }

    const amount = Number.parseFloat(recordDraft.amount);

    if (!Number.isFinite(amount) || amount === 0) {
      toast.error("Enter an amount other than 0.");
      return;
    }

    setRecords((previous) => [
      {
        id: crypto.randomUUID(),
        date: recordDraft.date,
        mainCategory: recordDraft.mainCategory,
        subCategory: recordDraft.subCategory,
        amount,
        note: recordDraft.note.trim(),
      },
      ...previous,
    ]);
    toast.success(
      `${recordDraft.mainCategory} / ${recordDraft.subCategory} record saved locally.`,
    );

    closeUpdateRecordModal();
  };

  const deleteRecord = (recordId: string) => {
    setRecords((previous) =>
      previous.filter((record) => record.id !== recordId),
    );
    toast.success("Record deleted.");

    closeUpdateRecordModal();
  };

  const confirmResetData = () => {
    setRecords([]);
    setResetDialogOpen(false);
    toast.success("All data reset.");
  };

  const saveEditedRecord = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!recordDraft || !isValidAmountInput(recordDraft.amount)) {
      toast.error(
        "Enter a valid edited amount. Typed digits will be formatted to 2 decimals automatically.",
      );
      return;
    }

    const amount = Number.parseFloat(recordDraft.amount);
    if (!Number.isFinite(amount) || amount === 0) {
      toast.error("Enter an amount other than 0.");
      return;
    }

    setRecords((previous) =>
      previous.map((record) =>
        record.id === recordDraft.id
          ? {
              ...record,
              amount,
              note: recordDraft.note.trim(),
            }
          : record,
      ),
    );
    toast.success("Record updated.");

    closeUpdateRecordModal();
  };

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(buildBackupPayload(records)),
    );
  }, [records]);

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
        <MonthlyTableSectionHeader />

        <MonthlyTableFilter
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedMainCategory={selectedMainCategory}
          updateSelectedYear={updateSelectedYear}
          updateSelectedMonth={updateSelectedMonth}
          updateSelectedMainCategory={updateSelectedMainCategory}
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

      {isUpdateRecordModalOpen ? (
        isCreatingRecord ? (
          <Modal title="Add Record" onClose={() => closeUpdateRecordModal()}>
            <UpdateRecordModal
              record={recordDraft}
              isAddingRecord={true}
              onSubmit={saveRecord}
              updateRecordDraft={updateRecordDraft}
              closeModal={() => closeUpdateRecordModal()}
            />
          </Modal>
        ) : (
          <Modal title="Add Record" onClose={() => closeUpdateRecordModal()}>
            <UpdateRecordModal
              record={recordDraft}
              isAddingRecord={false}
              onSubmit={saveEditedRecord}
              updateRecordDraft={updateRecordDraft}
              closeModal={() => closeUpdateRecordModal()}
            />
          </Modal>
        )
      ) : null}
    </main>
  );
};
