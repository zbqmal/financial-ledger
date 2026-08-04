import { fireEvent, render, screen } from "@testing-library/react";
import YearlyGraphsYearSelect from "../YearlyGraphsYearSelect";

describe("YearlyGraphsYearSelect", () => {
  it("renders year options and triggers change", () => {
    const onYearChange = jest.fn();

    render(
      <YearlyGraphsYearSelect selectedYear="2025" onYearChange={onYearChange} />,
    );

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "2024" } });

    expect(onYearChange).toHaveBeenCalled();
  });
});
