import { render, screen } from "@testing-library/react";
import YearlyGraphTooltip from "../YearlyGraphToolTip";

describe("YearlyGraphTooltip", () => {
  const format = (value: number) => `$${value.toFixed(2)}`;

  it("returns null when inactive or no payload", () => {
    const { container, rerender } = render(
      <YearlyGraphTooltip active={false} payload={[]} label="Jan" currency={format} />,
    );
    expect(container.firstChild).toBeNull();

    rerender(
      <YearlyGraphTooltip active={true} payload={[]} label="Jan" currency={format} />,
    );
    expect(container.firstChild).toBeNull();

    rerender(
      <YearlyGraphTooltip
        active={true}
        payload={[{ dataKey: "Income", name: "Income", color: "green", value: "bad" }]}
        label="Jan"
        currency={format}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders visible items and total", () => {
    render(
      <YearlyGraphTooltip
        active={true}
        label="Jan"
        currency={format}
        payload={[
          { dataKey: "Income", name: "Income", color: "green", value: 100 },
          { dataKey: "Expense", name: "Expense", color: "red", value: "bad" },
          { dataKey: "Bonus", name: "Bonus", color: "blue", value: 20 },
        ]}
      />,
    );

    expect(screen.getByText("Jan")).toBeInTheDocument();
    expect(screen.getByText("Income")).toBeInTheDocument();
    expect(screen.getByText("Bonus")).toBeInTheDocument();
    expect(screen.queryByText("Expense")).not.toBeInTheDocument();
    expect(screen.getByText("$120.00")).toBeInTheDocument();
  });
});
