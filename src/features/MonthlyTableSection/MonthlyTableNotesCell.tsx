import { MonthlyTableRowType } from "../../types/monthly-table-types";
import MonthlyTableRowNotesButton from "./MonthlyTableRowNotesButton";
import { FinancialRecord } from "../../types/data-types";
import MonthlyTableNotesTooltip from "./MonthlyTableRowNotesTooltip";

type MonthlyTableNotesCellProps = {
  tableRow: MonthlyTableRowType;
  openEditRecordModal: (record: FinancialRecord) => void;
  deleteRecord: (recordId: string) => void;
};

const MonthlyTableNotesCell: React.FC<MonthlyTableNotesCellProps> = ({
  tableRow,
  openEditRecordModal,
  deleteRecord,
}) => {
  return (
    <div className="notes-popover">
      <MonthlyTableRowNotesButton
        numOfRecords={tableRow.dayRecords.length}
        date={tableRow.date}
      />
      <MonthlyTableNotesTooltip
        tableRow={tableRow}
        openEditRecord={openEditRecordModal}
        deleteRecord={deleteRecord}
      />
    </div>
  );
};

export default MonthlyTableNotesCell;
