import { render, screen } from "@testing-library/react";
import MonthlyTableNotesCell from "../MonthlyTableNotesCell";

describe("MonthlyTableNotesCell", () => {
  it("renders notes button and tooltip wrappers", () => {
    render(
      <MonthlyTableNotesCell
        tableRow={{
          date: "2025-01-01",
          totals: {},
          notes: "",
          notesPreview: "",
          dayRecords: [
            {
              id: "a",
              date: "2025-01-01",
              mainCategory: "Income",
              subCategory: "Salary",
              amount: 10,
              note: "",
            },
          ],
        }}
        openEditRecordModal={jest.fn()}
        deleteRecord={jest.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /Show 1 record details/i })).toBeInTheDocument();
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });
});
