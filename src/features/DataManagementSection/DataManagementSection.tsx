import Button from "../../components/Button/Button";
import { FinancialRecord } from "../../types/data-types";
import { buildBackupPayload } from "../../utils/data-utils";

type DataManagementSectionProps = {
  records: FinancialRecord[];
};

const DataManagementSection: React.FC<DataManagementSectionProps> = ({
  records,
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
    setStatusMessage("Backup exported.");
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
