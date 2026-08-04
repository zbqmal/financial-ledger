import { render, screen } from "@testing-library/react";
import MonthlyTableSectionHeader from "../MonthlyTableSectionHeader";

describe("MonthlyTableSectionHeader", () => {
  it("renders section label", () => {
    render(<MonthlyTableSectionHeader />);

    expect(screen.getByText("Monthly table")).toBeInTheDocument();
  });
});
