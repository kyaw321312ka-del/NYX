import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Search,
  GetApp,
  Restaurant,
  MonetizationOn,
  CalendarToday,
  FileDownload,
  Close,
} from "@mui/icons-material";
import { Dialog } from "@mui/material";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";

// Dark/Light Mood အလိုက် Color ပြောင်းလဲပေးမည့် StatCard Component
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
      minWidth: "220px",
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
            color: isDark ? "#cbd5e1" : "#6b7280",
            background: isDark ? "#1e293b" : "#f3f4f6",
            padding: "2px 8px",
            borderRadius: "4px",
          }}
        >
          Today
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
        color: isDark ? "#ffffff" : "#111827",
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

export default function ClassCanteenOverview(props) {
  // OutletContext (သို့) Parent Props (သို့) Window/Local Theme မှ isDark တန်ဖိုးကို စစ်ဆေးခြင်း
  const outletContext = useOutletContext();

  // dynamic dark mode check
  const isDark =
    props.isDark !== undefined
      ? props.isDark
      : outletContext && outletContext.isDark !== undefined
        ? outletContext.isDark
        : false;

  const [overviewData, setOverviewData] = useState({
    total_order: "0",
    today_order: 0,
    total_menu: "—",
    today_revenue: 0,
  });

  const [orderTrend, setOrderTrend] = useState("+0%");
  const [revenueTrend, setRevenueTrend] = useState("+0%");

  const [orders, setOrders] = useState([]);
  const [rawChartData, setRawChartData] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [chartStartDate, setChartStartDate] = useState("");
  const [chartEndDate, setChartEndDate] = useState("");

  const [tableStartDate, setTableStartDate] = useState("");
  const [tableEndDate, setTableEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [openProofModal, setOpenProofModal] = useState(false);
  const [selectedProofImg, setSelectedProofImg] = useState("");

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/canteenoverview/showcanteenoverview`,
        );
        const json = await response.json();

        if (json.success) {
          const totalOrderNum = Number(json.data.total_order) || 0;
          const todayRevenueNum = Number(json.data.today_revenue) || 0;

          setOverviewData({
            total_order: json.data.total_order,
            today_order: json.data.today_order,
            total_menu: json.data.total_menu,
            today_revenue: json.data.today_revenue,
          });

          if (totalOrderNum > 100000) {
            setOrderTrend("+12%");
          } else if (totalOrderNum > 0 && totalOrderNum <= 100000) {
            setOrderTrend("+5%");
          } else {
            setOrderTrend("-2%");
          }

          if (todayRevenueNum > 50000) {
            setRevenueTrend("+15%");
          } else if (todayRevenueNum === 0) {
            setRevenueTrend("0%");
          } else {
            setRevenueTrend("-4%");
          }

          const formattedChartData = json.data.canteen_order_trend.map(
            (item) => ({
              name: item.month_name,
              orders: item.total_orders,
              fullDate: item.date || item.Data || "",
            }),
          );
          setRawChartData(formattedChartData);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const fetchTableOrders = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/canteenorder/showcanteenorder`,
        );
        const json = await response.json();
        if (json.data && Array.isArray(json.data)) {
          setOrders(json.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchOverviewData();
    fetchTableOrders();
  }, []);

  const filteredChartData = rawChartData.filter((item) => {
    if (!chartStartDate && !chartEndDate) return true;
    if (!item.fullDate) return true;
    const itemDate = new Date(item.fullDate);
    const start = chartStartDate ? new Date(chartStartDate) : null;
    const end = chartEndDate ? new Date(chartEndDate) : null;

    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    if (start && itemDate < start) return false;
    if (end && itemDate > end) return false;
    return true;
  });

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      "Msh".toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.reciept_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(order.order_id).includes(searchTerm);

    if (!tableStartDate && !tableEndDate) return matchesSearch;

    const orderDate = new Date(order.Data);
    const start = tableStartDate ? new Date(tableStartDate) : null;
    const end = tableEndDate ? new Date(tableEndDate) : null;

    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    if (start && orderDate < start) return false;
    if (end && orderDate > end) return false;
    return matchesSearch;
  });

  const handleViewClick = (order) => {
    setSelectedOrder(order);
    setOpenViewModal(true);
  };

  const handleProofClick = (imgUrl) => {
    setSelectedProofImg(imgUrl);
    setOpenProofModal(true);
  };

  const handleDownloadPNG = async (orderId) => {
    const element = document.querySelector(".receipt-print-section");

    if (element) {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDark ? "#0f172a" : "#ffffff",
      });

      const dataURL = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `Order_${orderId}_proof.png`;
      link.click();
    }
  };

  const handlePrintReceipt = () => {
    const printContent = document.querySelector(".receipt-print-section");
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
          body { 
            font-family: 'Segoe UI', sans-serif; 
            margin: 20px; 
            padding: 0;
            color: #111827;
          }
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;

  const exportToExcel = (dataToExport, fileName = "Canteen_Orders") => {
    const ws = XLSX.utils.json_to_sheet(
      dataToExport.map((o) => ({
        "Order ID": o.order_id,
        "Receipt No": o.reciept_no,
        "Total Amount": o.Total,
        Date: o.Data,
        Time: o.Time,
        "Payment Method": o.payment_method,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const inputStyle = {
    padding: "6px 12px",
    border: `1px solid ${isDark ? "#334155" : "#e5e7eb"}`,
    background: isDark ? "#1e293b" : "#fff",
    color: isDark ? "#ffffff" : "#111827",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
  };

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        background: isDark ? "#121212" : "#f3f4f6",
        minHeight: "100vh",
        padding: "24px",
        color: isDark ? "#ffffff" : "#111827",
        transition: "background 0.2s ease, color 0.2s ease",
      }}
    >
      {/* Stat Cards Row */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <StatCard
          title="TOTAL ORDERS"
          value={`${Number(overviewData.total_order).toLocaleString()} Ks`}
          change={orderTrend}
          icon={<MonetizationOn sx={{ fontSize: "24px" }} />}
          iconColor="#3b82f6"
          isDark={isDark}
        />
        <StatCard
          title="TODAY ORDERS"
          value={`${overviewData.today_order} orders`}
          change=""
          icon={<CalendarToday sx={{ fontSize: "24px" }} />}
          iconColor="#ef4444"
          isCurrent={true}
          isDark={isDark}
        />
        <StatCard
          title="TOP SELLING MENU"
          value={overviewData.total_menu}
          change=""
          icon={<Restaurant sx={{ fontSize: "24px" }} />}
          iconColor="#f59e0b"
          isDark={isDark}
        />
        <StatCard
          title="TOTAL REVENUE"
          value={`${Number(overviewData.today_revenue).toLocaleString()} Ks`}
          change={revenueTrend}
          icon={<MonetizationOn sx={{ fontSize: "24px" }} />}
          iconColor="#10b981"
          isDark={isDark}
        />
      </div>

      {/* Chart Section */}
      <div
        style={{
          background: isDark ? "#1a1c1e" : "#ffffff",
          border: `1px solid ${isDark ? "#2e3238" : "#e5e7eb"}`,
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
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              margin: 0,
              color: isDark ? "#ffffff" : "#111827",
            }}
          >
            Canteen Order Trends
          </h2>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="date"
              value={chartStartDate}
              onChange={(e) => setChartStartDate(e.target.value)}
              style={inputStyle}
            />
            <input
              type="date"
              value={chartEndDate}
              onChange={(e) => setChartEndDate(e.target.value)}
              style={inputStyle}
            />
            <button
              onClick={() => exportToExcel(filteredChartData, "Trend_Data")}
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
              <GetApp fontSize="small" />
              Export
            </button>
          </div>
        </div>

        <div style={{ width: "100%", height: 300 }}>
          {filteredChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={filteredChartData}
                margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="0"
                  vertical={false}
                  stroke={isDark ? "#1e293b" : "#e5e7eb"}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: isDark ? "#94a3b8" : "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: isDark ? "#94a3b8" : "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: isDark ? "#0f172a" : "#fff",
                    borderRadius: "8px",
                    border: `1px solid ${isDark ? "#1e293b" : "#e5e7eb"}`,
                    color: isDark ? "#ffffff" : "#111827",
                    fontSize: "13px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorOrders)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: isDark ? "#94a3b8" : "#9ca3af",
                fontSize: "14px",
              }}
            >
              No records found for the selected dates.
            </div>
          )}
        </div>
      </div>

      {/* Recent Canteen Orders Table Section */}
      <div
        style={{
          background: isDark ? "#1a1c1e" : "#ffffff",
          border: `1px solid ${isDark ? "#2e3238" : "#e5e7eb"}`,
          borderRadius: "12px",
          padding: "24px",
        }}
      >
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
              color: isDark ? "#ffffff" : "#111827",
            }}
          >
            Recent Canteen Orders
          </h2>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  background: isDark ? "#1e293b" : "#f3f4f6",
                  color: isDark ? "#ffffff" : "#111827",
                  border: `1px solid ${isDark ? "#334155" : "#e5e7eb"}`,
                  borderRadius: "8px",
                  padding: "8px 36px 8px 14px",
                  fontSize: "14px",
                  outline: "none",
                  width: "210px",
                }}
              />
              <Search
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  fontSize: "18px",
                }}
              />
            </div>
            {/* Export Button */}
            <button
              onClick={() => exportToExcel(filteredOrders)}
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
              <GetApp fontSize="small" /> Export
            </button>
          </div>
        </div>

        {/* Date Filter Layout */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="date"
              value={tableStartDate}
              onChange={(e) => {
                setTableStartDate(e.target.value);
                setCurrentPage(1);
              }}
              style={inputStyle}
            />
            <input
              type="date"
              value={tableEndDate}
              onChange={(e) => {
                setTableEndDate(e.target.value);
                setCurrentPage(1);
              }}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  borderBottom: `2px solid ${isDark ? "#1e293b" : "#f3f4f6"}`,
                }}
              >
                {[
                  "ORDER ID",
                  "CUSTOMER NAME",
                  "TOTAL AMOUNT",
                  "DATE",
                  "TIME",
                  "PAYMENT METHOD",
                  "PAYMENT PROOF",
                  "STATUS",
                  "ACTION",
                ].map((header) => (
                  <th
                    key={header}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: isDark ? "#94a3b8" : "#374151",
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
              {currentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      textAlign: "center",
                      padding: "24px",
                      color: isDark ? "#94a3b8" : "#6b7280",
                    }}
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                currentOrders.map((order, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: `1px solid ${isDark ? "#1e293b" : "#f3f4f6"}`,
                      height: "53px",
                    }}
                  >
                    <td
                      style={{
                        padding: "14px 12px",
                        fontSize: "14px",
                        color: isDark ? "#cbd5e1" : "#374151",
                      }}
                    >
                      #C-0{order.order_id}
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: isDark ? "#ffffff" : "#111827",
                      }}
                    >
                      Msh
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: isDark ? "#ffffff" : "#111827",
                      }}
                    >
                      {order.Total?.toLocaleString()} Ks
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        fontSize: "14px",
                        color: isDark ? "#cbd5e1" : "#374151",
                      }}
                    >
                      {order.Data}
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        fontSize: "14px",
                        color: isDark ? "#cbd5e1" : "#374151",
                      }}
                    >
                      {order.Time}
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        fontSize: "14px",
                        color: isDark ? "#cbd5e1" : "#374151",
                        textTransform: "uppercase",
                      }}
                    >
                      {order.payment_method}
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      {order.payment_image ? (
                        <img
                          src={order.payment_image}
                          alt="Proof"
                          onClick={() => handleProofClick(order.payment_image)}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "4px",
                            objectFit: "cover",
                            cursor: "pointer",
                            border: `1px solid ${isDark ? "#334155" : "#e5e7eb"}`,
                          }}
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background:
                            order.Total >= 6000
                              ? isDark
                                ? "#064e3b"
                                : "#e6f4ea"
                              : isDark
                                ? "#7f1d1d"
                                : "#fce8e6",
                          color:
                            order.Total >= 6000
                              ? isDark
                                ? "#6ee7b7"
                                : "#137333"
                              : isDark
                                ? "#fca5a5"
                                : "#c5221f",
                        }}
                      >
                        {order.Total >= 6000 ? "Profit" : "Loss"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <button
                        onClick={() => handleViewClick(order)}
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
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: `1px solid ${isDark ? "#1e293b" : "#f3f4f6"}`,
            }}
          >
            <span
              style={{
                fontSize: "14px",
                color: isDark ? "#94a3b8" : "#4b5563",
                fontWeight: 500,
              }}
            >
              Showing Page {currentPage} of {totalPages}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  border: `1.5px solid ${isDark ? "#334155" : "#e5e7eb"}`,
                  background: isDark ? "#1e293b" : "#fff",
                  color:
                    currentPage === 1
                      ? isDark
                        ? "#64748b"
                        : "#9ca3af"
                      : isDark
                        ? "#ffffff"
                        : "#374151",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
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
                      border: `1.5px solid ${isDark ? "#334155" : "#e5e7eb"}`,
                      background:
                        currentPage === pageNum
                          ? "#0284c7"
                          : isDark
                            ? "#1e293b"
                            : "#fff",
                      color:
                        currentPage === pageNum
                          ? "#fff"
                          : isDark
                            ? "#ffffff"
                            : "#374151",
                      fontWeight: 600,
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  border: `1.5px solid ${isDark ? "#334155" : "#e5e7eb"}`,
                  background: isDark ? "#1e293b" : "#fff",
                  color:
                    currentPage === totalPages
                      ? isDark
                        ? "#64748b"
                        : "#9ca3af"
                      : isDark
                        ? "#ffffff"
                        : "#374151",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                }}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Receipt Dialog Modal Box */}
      <Dialog
        open={openViewModal}
        onClose={() => setOpenViewModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: isDark ? "#1a1c1e" : "#ffffff",
            color: isDark ? "#ffffff" : "#111827",
            borderRadius: "12px",
          },
        }}
      >
        {selectedOrder && (
          <div style={{ padding: "24px", position: "relative" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "8px",
              }}
            >
              <button
                onClick={() => setOpenViewModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: isDark ? "#94a3b8" : "#6b7280",
                }}
              >
                <Close fontSize="small" />
              </button>
            </div>

            <div className="receipt-print-section" style={{ padding: "10px" }}>
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
                    color: isDark ? "#ffffff" : "#111827",
                  }}
                >
                  Order Placed Successfully!
                </h1>
                <p
                  style={{
                    fontSize: "13px",
                    color: isDark ? "#94a3b8" : "#6b7280",
                    margin: 0,
                  }}
                >
                  Thank you for shopping with us
                </p>
              </div>

              <div
                style={{
                  borderBottom: `1px dashed ${isDark ? "#334155" : "#e5e7eb"}`,
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
                  <span
                    style={{
                      color: isDark ? "#94a3b8" : "#6b7280",
                      fontWeight: 500,
                    }}
                  >
                    REGISTRATION ID
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: isDark ? "#ffffff" : "#111827",
                    }}
                  >
                    {selectedOrder.reciept_no || `#T-${selectedOrder.order_id}`}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span
                    style={{
                      color: isDark ? "#94a3b8" : "#6b7280",
                      fontWeight: 500,
                    }}
                  >
                    DATE
                  </span>
                  <span style={{ color: isDark ? "#ffffff" : "#111827" }}>
                    {selectedOrder.Data}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span
                    style={{
                      color: isDark ? "#94a3b8" : "#6b7280",
                      fontWeight: 500,
                    }}
                  >
                    PAYMENT
                  </span>
                  <span
                    style={{
                      color: isDark ? "#ffffff" : "#111827",
                      textTransform: "uppercase",
                    }}
                  >
                    {selectedOrder.payment_method}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span
                    style={{
                      color: isDark ? "#94a3b8" : "#6b7280",
                      fontWeight: 500,
                    }}
                  >
                    TIME
                  </span>
                  <span style={{ color: isDark ? "#ffffff" : "#111827" }}>
                    {selectedOrder.Time}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span
                    style={{
                      color: isDark ? "#94a3b8" : "#6b7280",
                      fontWeight: 500,
                    }}
                  >
                    STUDENT NAME
                  </span>
                  <span style={{ color: isDark ? "#ffffff" : "#111827" }}>
                    Msh
                  </span>
                </div>

                {selectedOrder.items &&
                  selectedOrder.items.map((item, i) => (
                    <React.Fragment key={i}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            color: isDark ? "#94a3b8" : "#6b7280",
                            fontWeight: 500,
                          }}
                        >
                          TRAINING NAME
                        </span>
                        <span style={{ color: "#3b82f6", fontWeight: 600 }}>
                          {item.product_name} (x{item.quantity})
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            color: isDark ? "#94a3b8" : "#6b7280",
                            fontWeight: 500,
                          }}
                        >
                          TRAINING LEVEL
                        </span>
                        <span style={{ color: "#3b82f6", fontWeight: 600 }}>
                          Beginner Class
                        </span>
                      </div>
                    </React.Fragment>
                  ))}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "8px",
                    paddingTop: "8px",
                    borderTop: `1px solid ${isDark ? "#1e293b" : "#f3f4f6"}`,
                  }}
                >
                  <span
                    style={{
                      color: isDark ? "#ffffff" : "#111827",
                      fontWeight: 700,
                    }}
                  >
                    AMOUNT
                  </span>
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: isDark ? "#ffffff" : "#111827",
                    }}
                  >
                    {selectedOrder.Total?.toLocaleString()} Ks
                  </span>
                </div>

                <div
                  style={{
                    borderBottom: `1px dashed ${isDark ? "#334155" : "#e5e7eb"}`,
                    margin: "16px 0",
                  }}
                ></div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div style={{ display: "flex", gap: "8px", marginTop: "24px" }}>
              {selectedOrder.payment_image && (
                <button
                  onClick={() => handleDownloadPNG(selectedOrder.order_id)}
                  style={{
                    background: isDark ? "#1e293b" : "#f3f4f6",
                    border: `1px solid ${isDark ? "#334155" : "#d1d5db"}`,
                    color: isDark ? "#ffffff" : "#111827",
                    borderRadius: "6px",
                    padding: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Download Payment Proof as PNG"
                >
                  <FileDownload fontSize="small" />
                </button>
              )}
              <button
                onClick={handlePrintReceipt}
                style={{
                  flex: 1,
                  background: "#0284c7",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  padding: "8px 16px",
                }}
              >
                Print
              </button>
              <button
                onClick={() => setOpenViewModal(false)}
                style={{
                  background: isDark ? "#1e293b" : "#fff",
                  border: `1px solid ${isDark ? "#334155" : "#d1d5db"}`,
                  color: isDark ? "#cbd5e1" : "#4b5563",
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

      {/* Pure Proof Preview Dialog */}
      <Dialog
        open={openProofModal}
        onClose={() => setOpenProofModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: isDark ? "#0f172a" : "#fff",
            borderRadius: "12px",
          },
        }}
      >
        <div style={{ padding: "16px", position: "relative" }}>
          <button
            onClick={() => setOpenProofModal(false)}
            style={{
              position: "absolute",
              right: "12px",
              top: "12px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: isDark ? "#94a3b8" : "#9ca3af",
            }}
          >
            <Close fontSize="small" />
          </button>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "20px",
            }}
          >
            <img
              src={selectedProofImg}
              alt="Payment Proof Preview Only"
              style={{
                maxWidth: "100%",
                maxHeight: "75vh",
                borderRadius: "6px",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
