import { fireEvent, render, screen } from "@testing-library/react";
import MonthlyTableNotesTooltip from "../MonthlyTableRowNotesTooltip";

describe("MonthlyTableRowNotesTooltip", () => {
  it("renders records and supports edit/delete", () => {
    const openEditRecord = jest.fn();
    const deleteRecord = jest.fn();

    const tableRow = {
      date: "2025-01-01",
      totals: { Salary: 1000 },
      notes: "",
      notesPreview: "",
      dayRecords: [
        {
          id: "a",
          date: "2025-01-01",
          mainCategory: "Income" as const,
          subCategory: "Salary",
          amount: 1000,
          note: "paycheck",
        },
        {
          id: "b",
          date: "2025-01-01",
          mainCategory: "Income" as const,
          subCategory: "Bonus",
          amount: 500,
          note: "",
        },
      ],
    };

    render(
      <MonthlyTableNotesTooltip
        tableRow={tableRow}
        openEditRecord={openEditRecord}
        deleteRecord={deleteRecord}
      />,
    );

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    expect(screen.getByText("01/01/2025")).toBeInTheDocument();
    expect(screen.getByText("2 records")).toBeInTheDocument();
    expect(screen.getByText("paycheck")).toBeInTheDocument();
    expect(screen.getByText("No note")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    expect(openEditRecord).toHaveBeenCalledWith(tableRow.dayRecords[0]);

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[1]);
    expect(deleteRecord).toHaveBeenCalledWith("b");
  });
});
