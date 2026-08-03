type YearlyGraphTooltipProps = {
  active?: boolean;
  payload?: any[];
  label?: string;
  currency: (value: number) => string;
};

const YearlyGraphTooltip: React.FC<YearlyGraphTooltipProps> = ({
  active,
  payload,
  label,
  currency,
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  const visibleItems = payload.filter((entry) =>
    Number.isFinite(Number(entry.value)),
  );

  if (!visibleItems.length) {
    return null;
  }

  const total = visibleItems.reduce(
    (sum, entry) => sum + Number(entry.value),
    0,
  );

  return (
    <div
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.96)",
        border: "1px solid rgba(148, 163, 184, 0.35)",
        borderRadius: "14px",
        boxShadow: "0 18px 45px rgba(15, 23, 42, 0.28)",
        color: "#f8fafc",
        padding: "0.75rem 0.9rem",
      }}
    >
      <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 700 }}>{label}</p>
      <div style={{ display: "grid", gap: "0.3rem", marginTop: "0.45rem" }}>
        {visibleItems.map((entry) => (
          <div
            key={entry.dataKey}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              fontSize: "0.8rem",
            }}
          >
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span>{currency(Number(entry.value))}</span>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            borderTop: "1px solid rgba(148, 163, 184, 0.28)",
            marginTop: "0.15rem",
            paddingTop: "0.4rem",
            fontSize: "0.8rem",
            fontWeight: 700,
          }}
        >
          <span>Total</span>
          <span>{currency(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default YearlyGraphTooltip;
