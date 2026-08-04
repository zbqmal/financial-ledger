import { MonthlyTableRowType } from "../../types/monthly-table-types";
import { currency } from "../../utils/currency-utils";
import { formatUsDate } from "../../utils/date-utils";

type MonthlyTableCellProps = {
  subCategory: string;
  openAddRecordModal: (date: string, subCategory: string) => void;
  tableRow: MonthlyTableRowType;
};

const MonthlyTableCell: React.FC<MonthlyTableCellProps> = ({
  subCategory,
  openAddRecordModal,
  tableRow,
}) => {
  return (
    <td className="amount-cell">
      <button
        type="button"
        className="amount-cell-button"
        onClick={() => openAddRecordModal(tableRow.date, subCategory)}
        aria-label={`Add ${subCategory} record on ${formatUsDate(tableRow.date)}`}
      >
        {currency(tableRow.totals[subCategory])}
      </button>
    </td>
  );
};

export default MonthlyTableCell;
