import { useEffect } from "react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthMap = {
    sm: "420px",
    md: "560px",
    lg: "760px",
    xl: "980px",
  };

  const modalWidth = maxWidthMap[size] || maxWidthMap.md;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(15, 23, 42, 0.52)",
          backdropFilter: "blur(6px)",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: modalWidth,
          maxHeight: "calc(100vh - 48px)",
          overflowY: "auto",
          borderRadius: "24px",
          background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
          border: "1px solid #dbeafe",
          boxShadow:
            "0 24px 60px rgba(15, 23, 42, 0.22), 0 10px 24px rgba(37, 99, 235, 0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h3>

          <button
            onClick={onClose}
            type="button"
            aria-label="Close modal"
            style={{
              width: "40px",
              height: "40px",
              border: "1px solid #dbe3ee",
              borderRadius: "12px",
              background: "#ffffff",
              color: "#64748b",
              fontSize: "20px",
              lineHeight: 1,
              cursor: "pointer",
              transition: "all 0.18s ease",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            padding: "24px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}