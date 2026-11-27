import React, { useState, useEffect, useContext } from "react";
import { useGetClassOverview } from "../services";
import StatCards from "../components/StatCards";
import ChartSection from "../components/ChartSection";
import RecentPaymentsTable from "../components/RecentPaymentsTable";
import { Context } from "../../../../shared/hooks/AppContext";

export default function ClassTrainingOverview() {
  const { training, GetTrainingOverview } = useGetClassOverview();
  const [paymentMode, setPaymentMode] = useState("mobile");

  const { classBackColor } = useContext(Context); // 2. classBackColor ကို ရယူရန်
  const isDark = classBackColor === "#1A1C1E";

  const themeStyles = {
    backgroundColor: classBackColor,
    color: isDark ? "#E1E1E1" : "#111827",
  };

  useEffect(() => {
    GetTrainingOverview();
  }, []);

  const handleExportToExcel = () => {
    // Export functionality can be implemented here if needed
    // This is called from ChartSection export button
    alert("Export functionality can be added here");
  };

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        background: themeStyles.backgroundColor, // Context background သုံးခြင်း
        minHeight: "100vh",
        padding: "24px",
        color: themeStyles.color,
      }}
    >
      <StatCards isDark={isDark} />
      <ChartSection onExport={handleExportToExcel} isDark={isDark} />
      <RecentPaymentsTable
        paymentMode={paymentMode}
        onPaymentModeChange={setPaymentMode}
        isDark={isDark}
      />
    </div>
  );
}
