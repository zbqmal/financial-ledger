import { fireEvent, render, screen } from "@testing-library/react";
import MonthlyTable from "../MonthlyTable";

describe("MonthlyTable", () => {
  it("renders rows for month and handles cell click", () => {
    const openAddRecordModal = jest.fn();

    render(
      <MonthlyTable
        selectedYear="2025"
        selectedMonth="01"
        selectedMainCategory="Income"
        openAddRecordModal={openAddRecordModal}
        openEditRecordModal={jest.fn()}
        deleteRecord={jest.fn()}
        records={[
          {
            id: "r1",
            date: "2025-01-01",
            mainCategory: "Income",
            subCategory: "Salary",
            amount: 1000,
            note: "pay",
          },
          {
            id: "r2",
            date: "2025-01-02",
            mainCategory: "Income",
            subCategory: "Bonus",
            amount: 500,
            note: "",
          },
          {
            id: "r3",
            date: "2025-01-03",
            mainCategory: "Eat",
            subCategory: "Mart",
            amount: 99,
            note: "ignored",
          },
        ]}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "Date" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Salary" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Bonus" })).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Add Salary record on 01/01/2025",
      }),
    );
    expect(openAddRecordModal).toHaveBeenCalledWith("2025-01-01", "Salary");
  });

  it("returns no rows when year is empty", () => {
    const { container } = render(
      <MonthlyTable
        selectedYear=""
        selectedMonth="01"
        selectedMainCategory="Income"
        openAddRecordModal={jest.fn()}
        openEditRecordModal={jest.fn()}
        deleteRecord={jest.fn()}
        records={[]}
      />,
    );

    expect(container.querySelectorAll("tbody tr")).toHaveLength(0);
  });
});
