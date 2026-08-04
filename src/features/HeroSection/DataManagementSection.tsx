import toast from "react-hot-toast";
import Button from "../../components/Button/Button";
import { FinancialRecord } from "../../types/data-types";
import { buildBackupPayload, parseRecords } from "../../utils/record-utils";

type DataManagementSectionProps = {
  records: FinancialRecord[];
  openResetDialog: (open: boolean) => void;
  updateRecords: (records: FinancialRecord[]) => void;
};

const DataManagementSection: React.FC<DataManagementSectionProps> = ({
  records,
  openResetDialog,
  updateRecords,
}) => {
  /**
   * Exports current records as a JSON backup file.
   */
  const exportData = () => {
    const payload = buildBackupPayload(records);
    const blob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    // Trigger a one-time download via a temporary anchor element.
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `financial-ledger-${Date.now()}.json`;
    anchor.click();

    URL.revokeObjectURL(url);
    toast.success("Backup exported.");
  };

  /**
   * Opens ResetDialog if there are records to reset, otherwise shows an error message.
   */
  const resetData = () => {
    if (!records.length) {
      toast.error("No data to reset.");
      return;
    }

    openResetDialog(true);
  };

  /**
   * Imports records from a JSON backup file and updates the current records.
   * @param event - The file input change event containing the selected backup file.
   */
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        if (!parsed.records || !Array.isArray(parsed.records)) {
          toast.error(
            "Import failed. Please use a valid financial-ledger backup file.",
          );
          throw new Error("invalid");
        }

        const nextRecords = parseRecords(parsed);

        updateRecords(nextRecords);
        toast.success(
          `Imported ${nextRecords.length} record${nextRecords.length === 1 ? "" : "s"}.`,
        );
      } catch {
        toast.error(
          "Import failed. Please use a valid financial-ledger backup file.",
        );
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <div className="hero-actions">
      <Button className="primary" onClick={exportData}>
        Export data
      </Button>
      <label className="secondary import-label" htmlFor="import-backup">
        Import data
      </label>
      <Button className="secondary" onClick={resetData}>
        Reset
      </Button>
      <input
        id="import-backup"
        type="file"
        accept="application/json"
        onChange={importData}
      />
    </div>
  );
};

export default DataManagementSection;
