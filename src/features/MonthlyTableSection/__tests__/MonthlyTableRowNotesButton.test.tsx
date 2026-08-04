import { render, screen } from "@testing-library/react";
import MonthlyTableRowNotesButton from "../MonthlyTableRowNotesButton";

describe("MonthlyTableRowNotesButton", () => {
  it("renders singular and plural labels", () => {
    const { rerender } = render(
      <MonthlyTableRowNotesButton numOfRecords={1} date="2025-01-01" />,
    );

    expect(
      screen.getByRole("button", {
        name: "Show 1 record details for 01/01/2025",
      }),
    ).toHaveAttribute("title", "View 1 record detail");

    rerender(<MonthlyTableRowNotesButton numOfRecords={2} date="2025-01-01" />);
    expect(
      screen.getByRole("button", {
        name: "Show 2 record details for 01/01/2025",
      }),
    ).toHaveAttribute("title", "View 2 record details");
  });
});
