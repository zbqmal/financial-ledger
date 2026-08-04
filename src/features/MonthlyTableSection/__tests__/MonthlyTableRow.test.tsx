import { fireEvent, render, screen } from "@testing-library/react";
import MonthlyTableRow from "../MonthlyTableRow";

describe("MonthlyTableRow", () => {
  it("renders empty notes placeholder when no records", () => {
    render(
      <table>
        <tbody>
          <MonthlyTableRow
            tableRow={{
              date: "2025-01-01",
              totals: { Salary: 0 },
              dayRecords: [],
              notes: "",
              notesPreview: "",
            }}
            subCategories={["Salary"]}
            openAddRecordModal={jest.fn()}
            openEditRecordModal={jest.fn()}
            deleteRecord={jest.fn()}
          />
        </tbody>
      </table>,
    );

    expect(screen.getByText("01/01/2025")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders notes cell when day records exist", () => {
    const openAddRecordModal = jest.fn();

    render(
      <table>
        <tbody>
          <MonthlyTableRow
            tableRow={{
              date: "2025-01-02",
              totals: { Salary: 100 },
              dayRecords: [
                {
                  id: "1",
                  date: "2025-01-02",
                  mainCategory: "Income",
                  subCategory: "Salary",
                  amount: 100,
                  note: "note",
                },
              ],
              notes: "",
              notesPreview: "",
            }}
            subCategories={["Salary"]}
            openAddRecordModal={openAddRecordModal}
            openEditRecordModal={jest.fn()}
            deleteRecord={jest.fn()}
          />
        </tbody>
      </table>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Add Salary record on 01/02/2025" }),
    );
    expect(openAddRecordModal).toHaveBeenCalledWith("2025-01-02", "Salary");
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });
});
