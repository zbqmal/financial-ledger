import { render, screen } from "@testing-library/react";
import MonthlyTableHeader from "../MonthlyTableHeader";

describe("MonthlyTableHeader", () => {
  it("renders date, subcategories and notes headers", () => {
    render(<MonthlyTableHeader subCategories={["Salary", "Bonus"]} />);

    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Salary")).toBeInTheDocument();
    expect(screen.getByText("Bonus")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
  });
});
