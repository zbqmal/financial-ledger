import { MAIN_CATEGORY_OPTIONS } from "../../constants/categories";
import { MONTH_OPTIONS, YEAR_OPTIONS } from "../../constants/dates";
import { MainCategory } from "../../types/data-types";

type MonthlyTableFilterProps = {
  selectedYear: string;
  selectedMonth: string;
  selectedMainCategory: MainCategory;
  updateSelectedYear: (year: string) => void;
  updateSelectedMonth: (month: string) => void;
  updateSelectedMainCategory: (mainCategory: MainCategory) => void;
};

const MonthlyTableFilter: React.FC<MonthlyTableFilterProps> = ({
  selectedYear,
  selectedMonth,
  selectedMainCategory,
  updateSelectedYear,
  updateSelectedMonth,
  updateSelectedMainCategory,
}) => {
  return (
    <div className="table-controls">
      <label>
        Year
        <select
          value={selectedYear}
          onChange={(event) => updateSelectedYear(event.target.value)}
        >
          <option value="">Select year</option>
          {YEAR_OPTIONS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>
      <label>
        Month
        <select
          value={selectedMonth}
          onChange={(event) => updateSelectedMonth(event.target.value)}
        >
          {MONTH_OPTIONS.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Main-Category
        <select
          value={selectedMainCategory}
          onChange={(event) =>
            updateSelectedMainCategory(event.target.value as MainCategory)
          }
        >
          {MAIN_CATEGORY_OPTIONS.map((mainCategory) => (
            <option key={mainCategory} value={mainCategory}>
              {mainCategory}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default MonthlyTableFilter;
