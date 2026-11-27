// Intl.NumberFormat instances are expensive to construct, and these helpers run
// for every table cell and chart tick, so build each formatter once and reuse it.
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/**
 * Formats a numeric amount as USD currency (e.g. `$1,234.56`).
 *
 * @param value Amount to format. Falsy values are treated as `0`.
 * @returns Formatted currency string in `en-US` locale.
 */
export const currency = (value: number): string =>
  currencyFormatter.format(value || 0);

/**
 * Formats a numeric amount as compact USD text (e.g. `$1.2K`, `$3.4M`).
 *
 * @param value Amount to format. Falsy values are treated as `0`.
 * @returns Compact currency string in `en-US` locale.
 */
export const compactCurrency = (value: number): string =>
  `$${compactFormatter.format(value || 0)}`;
