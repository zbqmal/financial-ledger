import { useMemo } from "react";
import { getSubCategoryOptions, truncateText } from "../../utils/record-utils";
import { FinancialRecord, MainCategory } from "../../types/data-types";
import { MonthlyTableRowType } from "../../types/monthly-table-types";
import { getDaysInMonth } from "../../utils/date-utils";
import { currency } from "../../utils/currency-utils";
import MonthlyTableHeader from "./MonthlyTableHeader";
import MonthlyTableRow from "./MonthlyTableRow";

type MonthlyTableProps = {
  selectedYear: string;
  selectedMonth: string;
  selectedMainCategory: MainCategory;
  openAddRecordModal: (date: string, subCategory: string) => void;
  openEditRecordModal: (record: FinancialRecord) => void;
  deleteRecord: (recordId: string) => void;
  records: FinancialRecord[];
};

const MonthlyTable: React.FC<MonthlyTableProps> = ({
  selectedYear,
  selectedMonth,
  selectedMainCategory,
  openAddRecordModal,
  openEditRecordModal,
  deleteRecord,
  records,
}) => {
  const selectedMainSubCategories = getSubCategoryOptions(selectedMainCategory);

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

  const tableRows: MonthlyTableRowType[] = useMemo(() => {
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

  return (
    <div className="table-wrap">
      <table>
        <MonthlyTableHeader subCategories={selectedMainSubCategories} />
        <tbody>
          {tableRows.map((row) => (
            <MonthlyTableRow
              key={row.date}
              tableRow={row}
              subCategories={selectedMainSubCategories}
              openAddRecordModal={openAddRecordModal}
              openEditRecordModal={openEditRecordModal}
              deleteRecord={deleteRecord}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlyTable;
