import React, { useState, useEffect, useMemo, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Dialog } from "@mui/material";

import GroupsIcon from "@mui/icons-material/Groups3Sharp";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WalletIcon from "@mui/icons-material/Wallet";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import CloseIcon from "@mui/icons-material/Close";

// Dynamic Dark/Light Mode 支持သည့် StatCard Component
const StatCard = ({
  title,
  value,
  change,
  icon,
  iconColor,
  isCurrent,
  isDark,
}) => (
  <div
    style={{
      background: isDark ? "#1a1c1e" : "#ffffff",
      border: `1px solid ${isDark ? "#2e3238" : "#e5e7eb"}`,
      borderRadius: "12px",
      padding: "20px 24px",
      flex: 1,
      minWidth: 0,
      transition: "all 0.2s ease",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "8px",
      }}
    >
      <span
        style={{
          fontSize: "13px",
          color: isDark ? "#94a3b8" : "#6b7280",
          fontWeight: 500,
        }}
      >
        {title}
      </span>
      {isCurrent ? (
        <span
          style={{
            fontSize: "12px",
            color: isDark ? "#94a3b8" : "#6b7280",
            background: isDark ? "#2a2d32" : "#f3f4f6",
            padding: "2px 8px",
            borderRadius: "4px",
          }}
        >
          Current
        </span>
      ) : (
        <span style={{ fontSize: "20px", color: iconColor || "#3b82f6" }}>
          {icon}
        </span>
      )}
    </div>
    <div
      style={{
        fontSize: "22px",
        fontWeight: 700,
        color: isDark ? "#f8fafc" : "#111827",
        marginBottom: "6px",
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontSize: "12px",
        color: change.includes("-") ? "#ef4444" : "#16a34a",
        fontWeight: 500,
      }}
    >
      {change.includes("vs") || change.includes("-") || change.includes("+")
        ? `↗ ${change}`
        : change}
    </div>
  </div>
);

const formatDateToDMY = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
};

export default function ClassRentalOverview() {
  const outletContext = useOutletContext();
  const isDark = outletContext?.isDark ?? false;

  // Theme Variables
  const cardBg = isDark ? "#1a1c1e" : "#ffffff";
  const borderColor = isDark ? "#2e3238" : "#e5e7eb";
  const textColor = isDark ? "#f8fafc" : "#111827";
  const subTextColor = isDark ? "#94a3b8" : "#6b7280";
  const inputBg = isDark ? "#242629" : "#ffffff";

  const [transactions, setTransactions] = useState([]);
  const [overviewData, setOverviewData] = useState({
    totalCourtBooking: 0,
    rentalRevenue: 0,
    equipmentRevenue: 0,
    canteenSnacks: 0,
    chartTrend: [],
  });

  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedPaymentImage, setSelectedPaymentImage] = useState(null); // Payment Image သီးသန့် State

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("Mobile");
  const [currentPage, setCurrentPage] = useState(1);

  const [chartStartDate, setChartStartDate] = useState("");
  const [chartEndDate, setChartEndDate] = useState("");

  const itemsPerPage = 5;

  useEffect(() => {
    const mobileApiUrl =
      "http://130.94.99.9:5000/api/mobilerental/showmobilebooking";
    const localApiUrl =
      "http://130.94.99.9:5000/api/localbooking/showlocalbooking";
    const overviewApiUrl =
      "http://130.94.99.9:5000/api/rentaloverview/showrentaloverview";

    setLoading(true);

    Promise.all([
      fetch(mobileApiUrl).then((res) => res.json()),
      fetch(localApiUrl).then((res) => res.json()),
      fetch(overviewApiUrl).then((res) => res.json()),
    ])
      .then(([mobileRes, localRes, overviewRes]) => {
        if (overviewRes.success && overviewRes.data) {
          const apiOverview = overviewRes.data;

          const allMonths = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];

          const currentYear = new Date().getFullYear();

          const trendMap = {};
          (apiOverview.monthly_booking_trend || []).forEach((t) => {
            trendMap[t.month_name] = t.total_booking;
          });

          const formattedTrend = allMonths.map((monthName) => {
            return {
              name: monthName,
              value:
                trendMap[monthName] !== undefined ? trendMap[monthName] : 0,
              dateRef: new Date(`${monthName} 1, ${currentYear}`),
            };
          });

          setOverviewData({
            totalCourtBooking: apiOverview.total_court_booking || 0,
            rentalRevenue: apiOverview.today_rental_revenue || 0,
            equipmentRevenue: apiOverview.today_equipment_revenue || 0,
            canteenSnacks: apiOverview.today_canteen_snacks || 0,
            chartTrend: formattedTrend,
          });
        }

        let combinedData = [];

        if (mobileRes.success && mobileRes.data) {
          const mobileFormatted = mobileRes.data.map((item) => ({
            id: `#CN-0${item.id}`,
            name: item.Customer || "Unknown",
            venue: item.venue_name || "-",
            court: item.court_name || "-",
            amount: item.Total !== null ? item.Total : item.Court_Fee || 0,
            date: item.Date || "",
            method: item.payment_method || "KBZPay",
            type: "Mobile",
            paymentImage: item.payment_image_url || "",
          }));
          combinedData = [...combinedData, ...mobileFormatted];
        }

        if (localRes.data) {
          const localFormatted = localRes.data.map((item) => ({
            id: `#CN-0${item.id}`,
            name: item.Customer || "Msh",
            venue: item.venue_name || "-",
            court: item.court_name || "-",
            amount: item.Total !== null ? item.Total : item.Court_Fee || 0,
            date: item.Date || "",
            method: item.payment_method || "KBZPay",
            type: "Local",
            paymentImage: item.payment_image_url || "",
          }));
          combinedData = [...combinedData, ...localFormatted];
        }

        combinedData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(combinedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Filter Transactions Logic
  const filteredRows = useMemo(() => {
    return transactions.filter((item) => {
      if (item.type !== typeFilter) return false;

      const matchesSearch =
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.venue.toLowerCase().includes(search.toLowerCase()) ||
        item.court.toLowerCase().includes(search.toLowerCase()) ||
        item.method.toLowerCase().includes(search.toLowerCase());

      let matchesStart = true,
        matchesEnd = true;
      if (startDate) matchesStart = new Date(item.date) >= new Date(startDate);
      if (endDate) matchesEnd = new Date(item.date) <= new Date(endDate);

      return matchesSearch && matchesStart && matchesEnd;
    });
  }, [transactions, search, typeFilter, startDate, endDate]);

  // Chart Data Filtering Logic
  const filteredChartData = useMemo(() => {
    return overviewData.chartTrend
      .map((item) => ({
        ...item,
        shortName: item.name ? item.name.slice(0, 3) : "",
      }))
      .filter((item) => {
        let matchesStart = true;
        let matchesEnd = true;
        if (chartStartDate) {
          const startLimit = new Date(chartStartDate);
          matchesStart =
            item.dateRef >=
            new Date(startLimit.getFullYear(), startLimit.getMonth(), 1);
        }
        if (chartEndDate) {
          const endLimit = new Date(chartEndDate);
          matchesEnd =
            item.dateRef <=
            new Date(endLimit.getFullYear(), endLimit.getMonth() + 1, 0);
        }
        return matchesStart && matchesEnd;
      });
  }, [overviewData.chartTrend, chartStartDate, chartEndDate]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem);

  const exportToExcel = () => {
    if (filteredRows.length === 0) {
      //alert("Export ထုတ်ရန် ဒေတာ မရှိသေးပါ!");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(
      filteredRows.map(({ paymentImage, ...rest }) => rest),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rental Payments");
    XLSX.writeFile(wb, "Rental_Overview.xlsx");
  };

  const handleTriggerPrint = () => {
    const printContent = document.getElementById("printable-receipt-content");
    if (!printContent) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
            body { font-family: 'Inter', sans-serif; margin: 20px; padding: 0; background: #fff; color: #111827; }
            div { display: flex; }
          </style>
        </head>
        <body>
          <div style="flex-direction: column; width: 100%;">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 500);
  };

  const handleTriggerDownloadPNG = () => {
    const modalElement = document.getElementById("printable-receipt-content");
    if (!modalElement) return;

    html2canvas(modalElement, { useCORS: true }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `Invoice_${previewImage?.id || "receipt"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        background: isDark ? "#121212" : "#f3f4f6",
        minHeight: "100vh",
        padding: "24px",
        color: textColor,
        transition: "background-color 0.2s ease",
      }}
    >
      {/* Stat Cards Row */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <StatCard
          title="TOTAL COURT BOOKINGS"
          value={`${overviewData.totalCourtBooking} bookings`}
          change="+12%"
          icon={<CalendarMonthIcon sx={{ fontSize: "24px" }} />}
          iconColor="#3b82f6"
          isDark={isDark}
        />
        <StatCard
          title="RENTAL REVENUE"
          value={`${overviewData.rentalRevenue.toLocaleString()} Ks`}
          change="+5%"
          icon={<WalletIcon sx={{ fontSize: "24px" }} />}
          iconColor="#10b981"
          isDark={isDark}
        />
        <StatCard
          title="EQUIPMENT RENTAL"
          value={`${overviewData.equipmentRevenue.toLocaleString()} Ks`}
          change="-3%"
          icon={<LocalMallIcon sx={{ fontSize: "24px" }} />}
          iconColor="#6366f1"
          isDark={isDark}
        />
        <StatCard
          title="CANTEEN SNACKS"
          value={`${overviewData.canteenSnacks.toLocaleString()} Ks`}
          change="+4%"
          icon={<LocalMallIcon sx={{ fontSize: "24px" }} />}
          iconColor="#f59e0b"
          isDark={isDark}
        />
      </div>

      {/* Chart Section */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              margin: 0,
              color: textColor,
            }}
          >
            Court Booking Trends
          </h2>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="date"
              value={chartStartDate}
              onChange={(e) => setChartStartDate(e.target.value)}
              style={{
                padding: "6px 12px",
                border: `1px solid ${borderColor}`,
                borderRadius: "6px",
                fontSize: "14px",
                background: inputBg,
                color: textColor,
              }}
            />
            <input
              type="date"
              value={chartEndDate}
              onChange={(e) => setChartEndDate(e.target.value)}
              style={{
                padding: "6px 12px",
                border: `1px solid ${borderColor}`,
                borderRadius: "6px",
                fontSize: "14px",
                background: inputBg,
                color: textColor,
              }}
            />
            <button
              onClick={exportToExcel}
              style={{
                background: isDark ? "#2563eb" : "#0D1B2A",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 18px",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <SaveAltIcon sx={{ fontSize: "20px" }} />
              Export
            </button>
          </div>
        </div>

        <div style={{ width: "100%", height: 260 }}>
          {!loading && filteredChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredChartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="0"
                  vertical={false}
                  stroke={isDark ? "#2e3238" : "#e5e7eb"}
                />
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 12, fill: subTextColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, "auto"]}
                  tick={{ fontSize: 12, fill: subTextColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    background: isDark ? "#242629" : "#ffffff",
                    border: `1px solid ${borderColor}`,
                    color: textColor,
                    fontSize: "13px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: subTextColor,
              }}
            >
              No trend data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Rental Payments Table Section */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        {/* Header Layout */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              margin: 0,
              color: textColor,
            }}
          >
            Recent Rental Payments
          </h2>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search ID, Name, Venue..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  background: isDark ? "#242629" : "#1e293b",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 36px 8px 14px",
                  fontSize: "14px",
                  outline: "none",
                  width: "210px",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  fontSize: "14px",
                }}
              >
                🔍
              </span>
            </div>

            {/* Export Button */}
            <button
              onClick={exportToExcel}
              style={{
                background: isDark ? "#2563eb" : "#0D1B2A",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 18px",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <SaveAltIcon sx={{ fontSize: "20px" }} />
              Export
            </button>
          </div>
        </div>

        {/* Filter Row: Switch Mode + Date Filter */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          {/* Mobile / Local Switcher */}
          <div
            style={{
              display: "inline-flex",
              background: isDark ? "#242629" : "#f1f5f9",
              padding: "4px",
              borderRadius: "8px",
              border: `1px solid ${borderColor}`,
            }}
          >
            {["Mobile", "Local"].map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setTypeFilter(mode);
                  setCurrentPage(1);
                }}
                style={{
                  padding: "6px 20px",
                  fontSize: "14px",
                  fontWeight: 600,
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: typeFilter === mode ? "#2563eb" : "transparent",
                  color: typeFilter === mode ? "#fff" : subTextColor,
                }}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Table Dates Filters */}
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "6px 12px",
                border: `1px solid ${borderColor}`,
                borderRadius: "6px",
                fontSize: "14px",
                background: inputBg,
                color: textColor,
              }}
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "6px 12px",
                border: `1px solid ${borderColor}`,
                borderRadius: "6px",
                fontSize: "14px",
                background: inputBg,
                color: textColor,
              }}
            />
          </div>
        </div>

        {/* Custom Table Component */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${borderColor}` }}>
                {[
                  "RENTAL ID",
                  "CUSTOMER NAME",
                  "VENUE",
                  "COURT",
                  "AMOUNT",
                  "DATE",
                  "PAYMENT METHOD",
                  "PAYMENT PROOF",
                  "ACTION",
                ].map((header) => (
                  <th
                    key={header}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: subTextColor,
                      letterSpacing: "0.5px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      textAlign: "center",
                      padding: "24px",
                      color: subTextColor,
                    }}
                  >
                    Loading data...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      textAlign: "center",
                      padding: "24px",
                      color: subTextColor,
                    }}
                  >
                    No matching rental records found.
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: `1px solid ${borderColor}`,
                      height: "53px",
                    }}
                  >
                    <td
                      style={{
                        padding: "14px 12px",
                        fontSize: "14px",
                        color: textColor,
                      }}
                    >
                      {item.id}
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: textColor,
                      }}
                    >
                      {item.name}
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        fontSize: "14px",
                        color: subTextColor,
                      }}
                    >
                      {item.venue}
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        fontSize: "14px",
                        color: textColor,
                      }}
                    >
                      {item.court}
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: textColor,
                      }}
                    >
                      {item.amount.toLocaleString()} Ks
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        fontSize: "14px",
                        color: textColor,
                      }}
                    >
                      {formatDateToDMY(item.date)}
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        fontSize: "14px",
                        color: textColor,
                      }}
                    >
                      {item.method}
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      {item.paymentImage ? (
                        <img
                          src={item.paymentImage}
                          alt="Proof"
                          onClick={() =>
                            setSelectedPaymentImage(item.paymentImage)
                          } // ပုံကိုနှိပ်ရင် payment image သီးသန့်ပေါ်စေရန်
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "4px",
                            objectFit: "cover",
                            cursor: "pointer",
                            border: `1px solid ${borderColor}`,
                          }}
                          onError={(e) => {
                            e.target.src =
                              "https://placehold.co/40x40?text=No+Img";
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: "13px", color: subTextColor }}>
                          No Image
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <button
                        onClick={() => setPreviewImage(item)} // View ခလုတ်နှိပ်မှသာ Booking Card ပေါ်စေရန်
                        style={{
                          border: "1.5px solid #16a34a",
                          background: "transparent",
                          color: "#16a34a",
                          borderRadius: "6px",
                          padding: "4px 12px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "16px",
            paddingTop: "12px",
            borderTop: `1px solid ${borderColor}`,
          }}
        >
          <span
            style={{ fontSize: "14px", color: subTextColor, fontWeight: 500 }}
          >
            Showing Page {currentPage} of {totalPages}
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                border: `1.5px solid ${borderColor}`,
                background: cardBg,
                color: currentPage === 1 ? subTextColor : textColor,
                fontWeight: 600,
                fontSize: "14px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    border: `1.5px solid ${borderColor}`,
                    background: currentPage === pageNum ? "#2563eb" : cardBg,
                    color: currentPage === pageNum ? "#fff" : textColor,
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
            {/* Next Button */}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                border: `1.5px solid ${borderColor}`,
                background: cardBg,
                color: currentPage === totalPages ? subTextColor : textColor,
                fontWeight: 600,
                fontSize: "14px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Payment Image Preview Dialog (Canteen Overview Style) */}
      <Dialog
        open={Boolean(selectedPaymentImage)}
        onClose={() => setSelectedPaymentImage(null)}
        maxWidth="sm"
        PaperProps={{
          style: {
            backgroundColor: cardBg,
            color: textColor,
            borderRadius: "12px",
            padding: "16px",
          },
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "8px",
          }}
        >
          <button
            onClick={() => setSelectedPaymentImage(null)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: subTextColor,
            }}
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
        <div style={{ textAlign: "center" }}>
          <img
            src={selectedPaymentImage}
            alt="Payment Proof Preview"
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              borderRadius: "8px",
              objectFit: "contain",
            }}
          />
        </div>
      </Dialog>

      {/* Modern Proof Receipt Modal Popup (Triggered by View button) */}
      <Dialog
        open={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: cardBg,
            color: textColor,
            borderRadius: "12px",
          },
        }}
      >
        {previewImage && (
          <div
            style={{
              background: cardBg,
              borderRadius: "12px",
              padding: "24px",
              position: "relative",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {/* Top Right Close Button */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "8px",
              }}
            >
              <button
                onClick={() => setPreviewImage(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: subTextColor,
                }}
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            {/* Printable Section */}
            <div id="printable-receipt-content" style={{ padding: "10px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                <h1
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    margin: "0 0 4px 0",
                    color: textColor,
                  }}
                >
                  Booking Successfully!
                </h1>
                <p style={{ fontSize: "13px", color: subTextColor, margin: 0 }}>
                  Thank you for booking with us
                </p>
              </div>

              <div
                style={{
                  borderBottom: `1px dashed ${borderColor}`,
                  marginBottom: "16px",
                }}
              ></div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  fontSize: "14px",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: subTextColor, fontWeight: 500 }}>
                    RENTAL ID
                  </span>
                  <span style={{ fontWeight: 700, color: textColor }}>
                    {previewImage.id || "—"}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: subTextColor, fontWeight: 500 }}>
                    NAME
                  </span>
                  <span style={{ color: textColor, fontWeight: 500 }}>
                    {previewImage.name}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: subTextColor, fontWeight: 500 }}>
                    VENUE
                  </span>
                  <span style={{ color: textColor }}>{previewImage.venue}</span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: subTextColor, fontWeight: 500 }}>
                    COURT
                  </span>
                  <span style={{ color: "#2563eb", fontWeight: 600 }}>
                    {previewImage.court}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: subTextColor, fontWeight: 500 }}>
                    DATE
                  </span>
                  <span style={{ color: textColor }}>
                    {formatDateToDMY(previewImage.date)}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: subTextColor, fontWeight: 500 }}>
                    METHOD
                  </span>
                  <span
                    style={{ color: textColor, textTransform: "uppercase" }}
                  >
                    {previewImage.method}
                  </span>
                </div>

                {/* Amount Section */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "8px",
                    paddingTop: "8px",
                    borderTop: `1px solid ${borderColor}`,
                  }}
                >
                  <span style={{ color: textColor, fontWeight: 700 }}>
                    AMOUNT
                  </span>
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: textColor,
                    }}
                  >
                    {previewImage.amount?.toLocaleString()} Ks
                  </span>
                </div>

                <div
                  style={{
                    borderBottom: `1px dashed ${borderColor}`,
                    margin: "16px 0",
                  }}
                ></div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div
              className="modal-actions-hide-on-print"
              style={{ display: "flex", gap: "8px", marginTop: "24px" }}
            >
              {/* Download Button */}
              {previewImage.paymentImage && (
                <button
                  onClick={handleTriggerDownloadPNG}
                  style={{
                    background: isDark ? "#242629" : "#f3f4f6",
                    border: `1px solid ${borderColor}`,
                    color: textColor,
                    borderRadius: "6px",
                    padding: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Download Payment Proof"
                >
                  <FileDownloadIcon fontSize="small" />
                </button>
              )}

              {/* Print Button */}
              <button
                onClick={handleTriggerPrint}
                style={{
                  flex: 1,
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Print
              </button>

              {/* Cancel Button */}
              <button
                onClick={() => setPreviewImage(null)}
                style={{
                  background: cardBg,
                  border: `1px solid ${borderColor}`,
                  color: subTextColor,
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontWeight: 500,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
