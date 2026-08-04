import { compactCurrency, currency } from "../currency-utils";

describe("currency-utils", () => {
  it("formats currency", () => {
    expect(currency(1234.56)).toBe("$1,234.56");
    expect(currency(0)).toBe("$0.00");
  });

  it("formats compact currency", () => {
    expect(compactCurrency(0)).toBe("$0");
    expect(compactCurrency(1200)).toBe("$1.2K");
  });
});
