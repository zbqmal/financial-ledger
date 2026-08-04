import { fireEvent, render, screen } from "@testing-library/react";
import UpdateRecordModal from "../UpdateRecordModal";

describe("UpdateRecordModal", () => {
  const record = {
    id: "1",
    date: "2025-01-01",
    mainCategory: "Income" as const,
    subCategory: "Salary",
    amount: "1000.00",
    note: "pay",
  };

  it("returns null when record is null", () => {
    const { container } = render(
      <UpdateRecordModal
        record={null}
        isAddingRecord={true}
        onSubmit={jest.fn()}
        updateRecordDraft={jest.fn()}
        closeModal={jest.fn()}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders and triggers field updates", () => {
    const updateRecordDraft = jest.fn();
    const onSubmit = jest.fn((event) => event.preventDefault());
    const closeModal = jest.fn();

    render(
      <UpdateRecordModal
        record={record}
        isAddingRecord={true}
        onSubmit={onSubmit}
        updateRecordDraft={updateRecordDraft}
        closeModal={closeModal}
      />,
    );

    expect(screen.getByText("01/01/2025")).toBeInTheDocument();
    expect(screen.getByText("Income / Salary")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "1111.00" },
    });
    expect(updateRecordDraft).toHaveBeenCalledWith("amount", "1111.00");

    fireEvent.change(screen.getByPlaceholderText("What was this about?"), {
      target: { value: "new note" },
    });
    expect(updateRecordDraft).toHaveBeenCalledWith("note", "new note");

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(closeModal).toHaveBeenCalledTimes(1);

    fireEvent.submit(screen.getByRole("button", { name: "Add" }).closest("form")!);
    expect(onSubmit).toHaveBeenCalled();
  });

  it("shows update text when editing", () => {
    render(
      <UpdateRecordModal
        record={record}
        isAddingRecord={false}
        onSubmit={jest.fn()}
        updateRecordDraft={jest.fn()}
        closeModal={jest.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
  });
});
