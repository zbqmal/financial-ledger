type MonthlyTableHeaderProps = {
  subCategories: string[];
};

const MonthlyTableHeader: React.FC<MonthlyTableHeaderProps> = ({
  subCategories,
}) => {
  return (
    <thead>
      <tr>
        <th>Date</th>
        {subCategories.map((subCategory) => (
          <th key={subCategory}>{subCategory}</th>
        ))}
        <th>Notes</th>
      </tr>
    </thead>
  );
};

export default MonthlyTableHeader;
