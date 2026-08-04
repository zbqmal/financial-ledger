import { formatUsDate } from "../../utils/date-utils";

type MonthlyTableRowNotesButtonProps = {
  numOfRecords: number;
  date: string;
};

const MonthlyTableRowNotesButton: React.FC<MonthlyTableRowNotesButtonProps> = ({
  numOfRecords,
  date,
}) => {
  return (
    <button
      type="button"
      className="notes-icon-button"
      title={`View ${numOfRecords} record detail${numOfRecords === 1 ? "" : "s"}`}
      aria-label={`Show ${numOfRecords} record details for ${formatUsDate(date)}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M10.5 4a6.5 6.5 0 1 0 4.143 11.509l4.174 4.174 1.414-1.414-4.174-4.174A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"
          fill="currentColor"
        />
      </svg>
      <span>{numOfRecords}</span>
    </button>
  );
};

export default MonthlyTableRowNotesButton;
