import { fireEvent, render, screen } from "@testing-library/react";
import MonthlyTableCell from "../MonthlyTableCell";

describe("MonthlyTableCell", () => {
  it("renders amount and opens add record modal", () => {
    const openAddRecordModal = jest.fn();

    render(
      <table>
        <tbody>
          <tr>
            <MonthlyTableCell
              subCategory="Salary"
              openAddRecordModal={openAddRecordModal}
              tableRow={{
                date: "2025-01-01",
                totals: { Salary: 1234.56 },
                dayRecords: [],
                notes: "",
                notesPreview: "",
              }}
            />
          </tr>
        </tbody>
      </table>,
    );

    const button = screen.getByRole("button", {
      name: "Add Salary record on 01/01/2025",
    });
    expect(button).toHaveTextContent("$1,234.56");

    fireEvent.click(button);
    expect(openAddRecordModal).toHaveBeenCalledWith("2025-01-01", "Salary");
  });
});
