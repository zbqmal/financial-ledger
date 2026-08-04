import { fireEvent, render, screen } from "@testing-library/react";
import YearlyGraphsSectionHeader from "../YearlyGraphSectionHeader";

describe("YearlyGraphSectionHeader", () => {
  it("renders section label and changes year", () => {
    const onYearChange = jest.fn();

    render(
      <YearlyGraphsSectionHeader selectedYear="2025" onYearChange={onYearChange} />,
    );

    expect(screen.getByText("YEARLY GRAPHS")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "2024" } });
    expect(onYearChange).toHaveBeenCalled();
  });
});
