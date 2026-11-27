import { MonthlyTableRowType } from "../../types/monthly-table-types";
import { formatUsDate } from "../../utils/date-utils";
import { currency } from "../../utils/currency-utils";
import { FinancialRecord } from "../../types/data-types";

type MonthlyTableNotesTooltipProps = {
  tableRow: MonthlyTableRowType;
  openEditRecord: (record: FinancialRecord) => void;
  deleteRecord: (recordId: string) => void;
};

const MonthlyTableNotesTooltip: React.FC<MonthlyTableNotesTooltipProps> = ({
  tableRow,
  openEditRecord,
  deleteRecord,
}) => {
  return (
    <div className="notes-details" role="tooltip">
      <div className="notes-details-header">
        <strong>{formatUsDate(tableRow.date)}</strong>
        <span>
          {tableRow.dayRecords.length} record
          {tableRow.dayRecords.length === 1 ? "" : "s"}
        </span>
      </div>
      <ul className="notes-record-list">
        {tableRow.dayRecords.map((record) => (
          <li key={record.id} className="notes-record-item">
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
  );
};

export default MonthlyTableNotesTooltip;
