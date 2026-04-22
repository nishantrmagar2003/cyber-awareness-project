export default function PageHeader({ title, subtitle, action }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "16px",
        flexWrap: "wrap",
        marginBottom: "22px",
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "30px",
            lineHeight: "1.12",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#0f172a",
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            style={{
              margin: "8px 0 0",
              fontSize: "14px",
              lineHeight: "1.7",
              color: "#475569",
              maxWidth: "760px",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {action}
        </div>
      )}
    </div>
  );
}