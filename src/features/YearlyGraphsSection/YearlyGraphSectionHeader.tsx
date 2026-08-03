import YearlyGraphsYearSelect from "./YearlyGraphsYearSelect";

type YearlyGraphsSectionHeaderProps = {
  selectedYear: string;
  onYearChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

const YearlyGraphsSectionHeader: React.FC<YearlyGraphsSectionHeaderProps> = ({
  selectedYear,
  onYearChange,
}) => {
  return (
    <div className="section-heading">
      <div>
        <p className="section-label">YEARLY GRAPHS</p>
      </div>
      <YearlyGraphsYearSelect
        selectedYear={selectedYear}
        onYearChange={onYearChange}
      />
    </div>
  );
};

export default YearlyGraphsSectionHeader;
