import "./styles/pos-report.css";
import ReportIcon from "@mui/icons-material/AssessmentOutlined";
import SearchIcon from "@mui/icons-material/SearchSharp";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

// Card ပုံစံသစ်အတွက် လိုက်ဖက်မည့် Icon သစ်များ
import RevenueIcon from "@mui/icons-material/PaidOutlined";
import OrderIcon from "@mui/icons-material/ShoppingBagOutlined";
import ProductIcon from "@mui/icons-material/Inventory2Outlined";
import CustomerIcon from "@mui/icons-material/PeopleAltOutlined";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useContext, useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Context } from "../../../shared/hooks/AppContext";
import { useGetOrder } from "../services";
import CustomerLoading from "../../../shared/components/LoadingCustomer";
import Swal from "sweetalert2";

function PosReport() {
  const [filteredData, setfilteredData] = useState([]);
  const [text, settext] = useState("");
  const [overviewData, setOverviewData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 📄 Table Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const chartsref = useRef(null);
  const tableref = useRef(null);

  const { backcolor } = useContext(Context);
  const { MOrders, GetMobileOrders } = useGetOrder();

  const allMonths = [
    { name: "Jan", month_num: 1, sales: 0, year: new Date().getFullYear() },
    { name: "Feb", month_num: 2, sales: 0, year: new Date().getFullYear() },
    { name: "Mar", month_num: 3, sales: 0, year: new Date().getFullYear() },
    { name: "Apr", month_num: 4, sales: 0, year: new Date().getFullYear() },
    { name: "May", month_num: 5, sales: 0, year: new Date().getFullYear() },
    { name: "Jun", month_num: 6, sales: 0, year: new Date().getFullYear() },
    { name: "Jul", month_num: 7, sales: 0, year: new Date().getFullYear() },
    { name: "Aug", month_num: 8, sales: 0, year: new Date().getFullYear() },
    { name: "Sep", month_num: 9, sales: 0, year: new Date().getFullYear() },
    { name: "Oct", month_num: 10, sales: 0, year: new Date().getFullYear() },
    { name: "Nov", month_num: 11, sales: 0, year: new Date().getFullYear() },
    { name: "Dec", month_num: 12, sales: 0, year: new Date().getFullYear() },
  ];

  const fetchPosOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/posoverview/showposoverview`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch POS overview data");
      }
      const jsonResult = await response.json();

      if (jsonResult) {
        setOverviewData(jsonResult);
        const salesMap = new Map();
        jsonResult.saleTrend.forEach((item) => {
          salesMap.set(item.month_num, {
            name: item.month_name,
            sales: parseInt(item.total_amount),
            month_num: item.month_num,
            year: item.year,
          });
        });

        const completeData = allMonths.map((month) => {
          const apiData = salesMap.get(month.month_num);
          if (apiData) {
            return {
              name: month.name,
              month_num: month.month_num,
              sales: apiData.sales,
              year: apiData.year,
            };
          }
          return month;
        });

        setChartData(completeData);
      } else {
        throw new Error("No data found");
      }
    } catch (err) {
      setError(err.message);
      setChartData(allMonths);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetMobileOrders();
    fetchPosOverview();
  }, []);

  useEffect(() => {
    if (text === "") {
      setfilteredData(MOrders.data || []);
    } else {
      let fdata = MOrders.data?.filter((item) => {
        return item.order_id?.toString().includes(text);
      });
      setfilteredData(fdata || []);
    }
    setCurrentPage(1);
  }, [text, MOrders.data]);

  const textchange = (event) => {
    settext(event.target.value);
  };

  // Dark Mode စစ်ဆေးခြင်း
  const Font_color = Boolean(backcolor === "#1A1C1E");

  const FontStyle = {
    color: Font_color ? "#E1E1E1" : "#0F172A",
  };

  const showImagePreview = (imageUrl) => {
    Swal.fire({
      imageUrl: imageUrl,
      imageAlt: "Payment Proof",
      showConfirmButton: false,
      showCloseButton: false,
      background: "transparent",
      customClass: {
        image: "preview-image-style",
      },
    });
  };

  const getFilteredChartData = () => {
    if (!startDate && !endDate) return chartData;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const startMonth = start.getMonth() + 1;
      const endMonth = end.getMonth() + 1;

      return chartData.filter(
        (item) => item.month_num >= startMonth && item.month_num <= endMonth,
      );
    }
    return chartData;
  };

  const filteredChartData = getFilteredChartData();
  const maxSales = Math.max(...filteredChartData.map((d) => d.sales), 0);
  const yAxisDomain = [0, Math.ceil(maxSales * 1.1)];

  async function handleExport() {
    let formattedData = filteredChartData.map((item) => ({
      Month: item.name,
      Sales: item.sales.toLocaleString(),
    }));
    const Worksheet = XLSX.utils.json_to_sheet(formattedData);
    const Workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(Workbook, Worksheet, "Sales Trends");
    XLSX.writeFile(Workbook, "sales-trends.xlsx");
  }

  async function ExportTable() {
    if (!filteredData?.length > 0) return;
    let formattedData = filteredData.map((item) => ({
      "Order Id": item.order_id,
      Customer: item.customer_name,
      Amount: item.Total,
      Date: item.Date,
      Time: item.Time,
      Payment: item.payment_method,
      "Order Status": item.order_status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    XLSX.writeFile(workbook, "sales-report.xlsx");
  }

  const headerData = overviewData
    ? [
        {
          title: "Total Revenue",
          amount: `${overviewData.total_revenue?.toLocaleString() || 0} ks`,
          icon: <RevenueIcon style={{ color: "#818cf8" }} />,
        },
        {
          title: "Order Received",
          amount: overviewData.total_order?.toString() || "0",
          icon: <OrderIcon style={{ color: "#f87171" }} />,
        },
        {
          title: "Total Product",
          amount: overviewData.total_products?.toString() || "0",
          icon: <ProductIcon style={{ color: "#fbbf24" }} />,
        },
        {
          title: "Total Customers",
          amount: overviewData.total_customer?.toString() || "0",
          icon: <CustomerIcon style={{ color: "#34d399" }} />,
        },
      ]
    : [];

  // 🧮 Pagination Calculation
  const totalTablePages =
    Math.ceil((filteredData?.length || 0) / rowsPerPage) || 1;
  const tableIndexOfLastRow = currentPage * rowsPerPage;
  const tableIndexOfFirstRow = tableIndexOfLastRow - rowsPerPage;
  const currentTableRows = filteredData.slice(
    tableIndexOfFirstRow,
    tableIndexOfLastRow,
  );
  const emptyTableRowsCount = rowsPerPage - currentTableRows.length;

  if (loading) {
    return (
      <div
        className={`posreportcontainer ${Font_color ? "dark-theme" : "light-theme"}`}
      >
        <h1 className="reporttitle" style={FontStyle}>
          <ReportIcon className="titleicon" /> Report
        </h1>
        <div
          style={{
            textAlign: "center",
            padding: "100px",
            color: "var(--text-main)",
          }}
        >
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`posreportcontainer ${Font_color ? "dark-theme" : "light-theme"}`}
      >
        <h1 className="reporttitle" style={FontStyle}>
          <ReportIcon className="titleicon" /> Report
        </h1>
        <div
          style={{ textAlign: "center", padding: "100px", color: "#ef4444" }}
        >
          <p>Error: {error}</p>
          <button
            onClick={fetchPosOverview}
            style={{
              marginTop: "16px",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`posreportcontainer ${Font_color ? "dark-theme" : "light-theme"}`}
    >
      <h1 className="reporttitle" style={FontStyle}>
        <ReportIcon className="titleicon" /> Report Dashboard
      </h1>

      {/* 📊 Top 4 Clean Cards (Auto Dark/Light via CSS) */}
      <div className="posreportbody">
        {headerData.map((item, index) => (
          <div className="posreporttitle white-card" key={index}>
            <div className="card-top-row">
              <p>{item.title}</p>
              <div className="icon-wrapper">{item.icon}</div>
            </div>
            <h3>{item.amount}</h3>
          </div>
        ))}
      </div>

      {/* 📈 Chart Area Block */}
      <div className="posreportbody2">
        <div className="posreportbody2header">
          <h2>Sale Trends Chart</h2>
          {/* <div className="chart-search-box">
            <input type="search" placeholder="Search trends..." />
            <SearchIcon className="search-icon-inside" />
          </div> */}
          <button onClick={handleExport} className="export-btn">
            <SaveAltIcon style={{ fontSize: "18px" }} /> Export
          </button>
        </div>

        <div className="posreportbody2secheader">
          <input
            type="month"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="month"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div
          style={{ width: "100%", height: "230px", marginTop: "10px" }}
          ref={chartsref}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredChartData}>
              <CartesianGrid
                strokeDasharray="0"
                vertical={false}
                stroke="var(--border-color)"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "var(--text-muted)" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                tickFormatter={(value) => value.toLocaleString()}
                domain={yAxisDomain}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-main)",
                }}
                formatter={(value) => [`${value.toLocaleString()} ks`, "Sales"]}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#4f46e5"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#4f46e5" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 📦 Orders History Table Area Block */}
      <div className="posreportbody2">
        <div className="posreportbody2header">
          <h2>Orders History List</h2>
          <div className="chart-search-box">
            <input
              type="search"
              placeholder="Search order ID..."
              onChange={textchange}
              value={text}
            />
            <SearchIcon className="search-icon-inside" />
          </div>
          <button onClick={ExportTable} className="export-btn">
            <SaveAltIcon style={{ fontSize: "18px" }} /> Export
          </button>
        </div>

        <div className="posreportbody2secheader">
          <input type="date" />
          <input type="date" />
        </div>

        <div className="posreporttablecontainer" ref={tableref}>
          <table className="posreporttable">
            <thead>
              <tr>
                <th>Order Id</th>
                <th>Customer Name</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Time</th>
                <th>Payment</th>
                <th style={{ textAlign: "center" }}>Payment Proof</th>
                <th style={{ textAlign: "center", width: "140px" }}>
                  Order Status
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(filteredData) ? (
                <>
                  {currentTableRows.map((item, index) => (
                    <tr key={index} className="table-data-row">
                      <td className="id-cell">#{item.order_id}</td>
                      <td className="customer-name-cell">
                        {item.customer_name}
                      </td>
                      <td className="amount-cell">
                        {item.Total?.toLocaleString()} ks
                      </td>
                      <td>{item.Date}</td>
                      <td>{item.Time}</td>
                      <td>
                        <span className="payment-badge">
                          {item.payment_method}
                        </span>
                      </td>
                      <td className="reportimg">
                        <div className="img-frame">
                          <img
                            src={item.payment_proof}
                            onClick={() => showImagePreview(item.payment_proof)}
                            alt="Proof"
                          />
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          className={`status-badge badge-${item.order_status?.toLowerCase()}`}
                        >
                          {item.order_status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {/* Empty Rows Padding */}
                  {emptyTableRowsCount > 0 &&
                    Array.from({ length: emptyTableRowsCount }).map(
                      (_, index) => (
                        <tr key={`empty-${index}`} className="row-empty">
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                        </tr>
                      ),
                    )}
                </>
              ) : (
                [...Array(10)].map((_, index) => (
                  <CustomerLoading times={8} key={index} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 🏁 Pagination Component Footer */}
        <div className="pos-pagination-footer">
          <span className="pagination-info">
            Showing {filteredData.length > 0 ? tableIndexOfFirstRow + 1 : 0} to{" "}
            {Math.min(tableIndexOfLastRow, filteredData.length)} of{" "}
            {filteredData.length} entries
          </span>
          <div className="pagination-btn-group">
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              <NavigateBeforeIcon style={{ fontSize: "20px" }} />
            </button>
            <span className="page-number-display">
              Page {currentPage} of {totalTablePages}
            </span>
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === totalTablePages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              <NavigateNextIcon style={{ fontSize: "20px" }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PosReport;
