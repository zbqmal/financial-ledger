import { fireEvent, render, screen } from "@testing-library/react";
import MonthlyTableFilter from "../MonthlyTableFilter";

describe("MonthlyTableFilter", () => {
  it("updates year, month and category", () => {
    const updateSelectedYear = jest.fn();
    const updateSelectedMonth = jest.fn();
    const updateSelectedMainCategory = jest.fn();

    render(
      <MonthlyTableFilter
        selectedYear="2025"
        selectedMonth="01"
        selectedMainCategory="Income"
        updateSelectedYear={updateSelectedYear}
        updateSelectedMonth={updateSelectedMonth}
        updateSelectedMainCategory={updateSelectedMainCategory}
      />,
    );

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "2024" } });
    fireEvent.change(selects[1], { target: { value: "02" } });
    fireEvent.change(selects[2], { target: { value: "Eat" } });

    expect(updateSelectedYear).toHaveBeenCalledWith("2024");
    expect(updateSelectedMonth).toHaveBeenCalledWith("02");
    expect(updateSelectedMainCategory).toHaveBeenCalledWith("Eat");
  });
});
