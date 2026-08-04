import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import YearlyGraphsSection from "../YearlyGraphsSection";

jest.mock("../YearlyGraph", () => ({
  __esModule: true,
  default: ({
    title,
    subheader,
    chipText,
  }: {
    title: string;
    subheader: string;
    chipText: string;
  }) => (
    <div data-testid="yearly-graph-card">
      <h3>{title}</h3>
      <p>{subheader}</p>
      <span>{chipText}</span>
    </div>
  ),
}));

describe("YearlyGraphsSection", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-15T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders comparison and category graphs for selected year", () => {
    render(
      <YearlyGraphsSection
        records={[
          {
            id: "1",
            date: "2025-01-01",
            mainCategory: "Income",
            subCategory: "Salary",
            amount: 1000,
            note: "",
          },
          {
            id: "2",
            date: "2025-01-02",
            mainCategory: "Eat",
            subCategory: "Mart",
            amount: 200,
            note: "",
          },
          {
            id: "3",
            date: "2024-01-03",
            mainCategory: "Income",
            subCategory: "Bonus",
            amount: 500,
            note: "ignored for 2025",
          },
        ]}
      />,
    );

    expect(screen.getByText("YEARLY GRAPHS")).toBeInTheDocument();
    expect(screen.getByText("Income & Expense")).toBeInTheDocument();

    const graphCards = screen.getAllByTestId("yearly-graph-card");
    expect(graphCards.length).toBeGreaterThanOrEqual(2);
  });

  it("recomputes when selecting a different year", () => {
    render(
      <YearlyGraphsSection
        records={[
          {
            id: "1",
            date: "2025-01-01",
            mainCategory: "Income",
            subCategory: "Salary",
            amount: 1000,
            note: "",
          },
          {
            id: "2",
            date: "2024-01-02",
            mainCategory: "Income",
            subCategory: "Bonus",
            amount: 700,
            note: "",
          },
        ]}
      />,
    );

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "2024" } });

    expect(screen.getByText("$700.00 vs $0.00")).toBeInTheDocument();
  });

  it("skips invalid month and unknown main-category records safely", () => {
    render(
      <YearlyGraphsSection
        records={[
          {
            id: "1",
            date: "2025-13-01",
            mainCategory: "Income",
            subCategory: "Salary",
            amount: 10,
            note: "",
          },
          {
            id: "2",
            date: "2025-01-01",
            mainCategory: "Unknown" as any,
            subCategory: "Anything",
            amount: 10,
            note: "",
          },
        ]}
      />,
    );

    expect(screen.getByText("Income & Expense")).toBeInTheDocument();
  });

  it("ignores records from a different selected year", () => {
    render(
      <YearlyGraphsSection
        records={[
          {
            id: "1",
            date: "2024-01-01",
            mainCategory: "Income",
            subCategory: "Salary",
            amount: 999,
            note: "",
          },
        ]}
      />,
    );

    expect(screen.getByText("$0.00 vs $0.00")).toBeInTheDocument();
  });

  it("skips unknown subcategory entries for known main category", () => {
    render(
      <YearlyGraphsSection
        records={[
          {
            id: "1",
            date: "2025-01-01",
            mainCategory: "Income",
            subCategory: "NotInTree",
            amount: 100,
            note: "",
          },
        ]}
      />,
    );

    expect(screen.getByText("$100.00 vs $0.00")).toBeInTheDocument();
  });

  it("renders safely with a mocked state hook", () => {
    const useStateSpy = jest
      .spyOn(React, "useState")
      .mockReturnValue(["", jest.fn()] as any);

    render(<YearlyGraphsSection records={[]} />);

    expect(screen.getByText("YEARLY GRAPHS")).toBeInTheDocument();
    expect(screen.getByText("Income & Expense")).toBeInTheDocument();

    useStateSpy.mockRestore();
  });
});
