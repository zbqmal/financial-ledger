import { formatUsDate, getDaysInMonth, getDefaultDate } from "../date-utils";

describe("date-utils", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns correct days including leap year", () => {
    expect(getDaysInMonth("2024", "02")).toBe(29);
    expect(getDaysInMonth("2023", "02")).toBe(28);
    expect(getDaysInMonth("2023", "11")).toBe(30);
  });

  it("formats iso date to us date", () => {
    expect(formatUsDate("2025-01-09")).toBe("01/09/2025");
  });

  it("returns default year and month based on current date", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-02-03T00:00:00.000Z"));

    expect(getDefaultDate()).toEqual({
      defaultYear: "2025",
      defaultMonth: "02",
    });
  });
});
