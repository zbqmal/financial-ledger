import { fireEvent, render, screen } from "@testing-library/react";
import RecordFormModal from "../RecordFormModal";

describe("RecordFormModal", () => {
  const draft = {
    date: "2025-01-01",
    mainCategory: "Eat" as const,
    subCategory: "Mart",
    amount: "",
    note: "",
  };

  it("keeps the draft locally and submits it", () => {
    const onSubmit = jest.fn();

    render(
      <RecordFormModal
        initialDraft={draft}
        isAddingRecord={true}
        onSubmit={onSubmit}
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Add Record" })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "1234" },
    });
    expect(screen.getByPlaceholderText("0.00")).toHaveValue("12.34");

    fireEvent.change(screen.getByPlaceholderText("What was this about?"), {
      target: { value: "groceries" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(onSubmit).toHaveBeenCalledWith({
      ...draft,
      amount: "12.34",
      note: "groceries",
    });
  });

  it("uses an edit title when editing", () => {
    render(
      <RecordFormModal
        initialDraft={{ ...draft, id: "1", amount: "5.00" }}
        isAddingRecord={false}
        onSubmit={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Edit Record" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
  });

  it("closes on cancel", () => {
    const onClose = jest.fn();

    render(
      <RecordFormModal
        initialDraft={draft}
        isAddingRecord={true}
        onSubmit={jest.fn()}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
