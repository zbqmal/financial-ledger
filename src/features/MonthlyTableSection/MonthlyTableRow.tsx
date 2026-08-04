import { FinancialRecord } from "../../types/data-types";
import { MonthlyTableRowType } from "../../types/monthly-table-types";
import { formatUsDate } from "../../utils/date-utils";
import MonthlyTableCell from "./MonthlyTableCell";
import MonthlyTableNotesCell from "./MonthlyTableNotesCell";

type MonthlyTableRowProps = {
  tableRow: MonthlyTableRowType;
  subCategories: string[];
  openAddRecordModal: (date: string, subCategory: string) => void;
  openEditRecordModal: (record: FinancialRecord) => void;
  deleteRecord: (recordId: string) => void;
};

const MonthlyTableRow: React.FC<MonthlyTableRowProps> = ({
  tableRow,
  subCategories,
  openAddRecordModal,
  openEditRecordModal,
  deleteRecord,
}) => {
  return (
    <tr>
      <td>{formatUsDate(tableRow.date)}</td>
      {subCategories.map((subCategory) => (
        <MonthlyTableCell
          key={subCategory}
          subCategory={subCategory}
          openAddRecordModal={openAddRecordModal}
          tableRow={tableRow}
        />
      ))}
      <td className="notes-cell">
        {tableRow.dayRecords.length ? (
          <MonthlyTableNotesCell
            tableRow={tableRow}
            openEditRecordModal={openEditRecordModal}
            deleteRecord={deleteRecord}
          />
        ) : (
          <span className="notes-preview notes-empty">—</span>
        )}
      </td>
    </tr>
  );
};

export default MonthlyTableRow;
