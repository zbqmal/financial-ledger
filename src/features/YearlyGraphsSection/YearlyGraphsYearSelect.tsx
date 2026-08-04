import { YEAR_OPTIONS } from "../../constants/dates";

type YearlyGraphsYearSelectProps = {
  selectedYear: string;
  onYearChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

const YearlyGraphsYearSelect = ({
  selectedYear,
  onYearChange,
}: YearlyGraphsYearSelectProps) => {
  return (
    <label className="graph-year-control">
      <select value={selectedYear} onChange={onYearChange}>
        {YEAR_OPTIONS.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </label>
  );
};

export default YearlyGraphsYearSelect;
