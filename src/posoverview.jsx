import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DollarIcon from "@mui/icons-material/Paid";
import OrderIcon from "@mui/icons-material/ShoppingBag";
import ProductIcon from "@mui/icons-material/Widgets";
import CustomerIcon from "@mui/icons-material/Groups";
import Shoe from "./images/shoe.png";
import { useContext, useEffect, useState } from "react";
import { Context } from "./Hooks/context";
import CustomerLoading from "./Components/loadingcustomer";
import Swal from "sweetalert2";
import { useGetOrder } from "./Api_Call";

function PosOverview() {
  const { backcolor } = useContext(Context);
  const { MOrders, GetMobileOrders } = useGetOrder();
  const [overviewData, setOverviewData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [popularProduct, setPopularProduct] = useState(null);
  const [topCustomer, setTopCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const isDarkMode = backcolor === "#1A1C1E";

  // Light & Dark Mode Dynamic Styles
  const themeStyles = {
    backgroundColor: isDarkMode ? "#1A1C1E" : "#F8FAFC",
    color: isDarkMode ? "#E1E1E1" : "#0F172A",
    cardBg: isDarkMode ? "#242629" : "#FFFFFF",
    borderColor: isDarkMode ? "#334155" : "#E2E8F0",
    subText: isDarkMode ? "#94A3B8" : "#64748B",
    chartGrid: isDarkMode ? "#334155" : "#F1F5F9",
    subCardBg: isDarkMode ? "#1E2022" : "#F8FAFC",
  };

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
        `${import.meta.env.VITE_BASE_URL}/api/posoverview/showposoverview`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch POS overview data");
      }
      const jsonResult = await response.json();

      if (jsonResult) {
        setOverviewData(jsonResult);

        const salesMap = new Map();
        jsonResult.saleTrend?.forEach((item) => {
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

        if (jsonResult.popular_product_data) {
          setPopularProduct(jsonResult.popular_product_data);
        }

        if (jsonResult.top_customer_data) {
          setTopCustomer(jsonResult.top_customer_data);
        }
      } else {
        throw new Error("No data found");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching POS overview:", err);
      setChartData(allMonths);
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    GetMobileOrders();
    fetchPosOverview();
  }, []);

  // Dynamic Color Icons
  const icons = [
    <DollarIcon style={{ color: "#3B82F6" }} />,
    <OrderIcon style={{ color: "#A855F7" }} />,
    <ProductIcon style={{ color: "#F97316" }} />,
    <CustomerIcon style={{ color: "#EC4899" }} />,
  ];

  // Map API values to Cards Layout
  const headerdata = [
    {
      title: "Total Revenue",
      amount: `${overviewData?.total_revenue?.toLocaleString() || 0} ks`,
      // increasement: "+11%",
      // compare: "from yesterday",
      iconBg: isDarkMode ? "#1E3A8A" : "#EFF6FF",
    },
    {
      title: "Total Admin Orders",
      amount: overviewData?.total_order?.toLocaleString() || "0",
      // increasement: "-3%",
      // compare: "from yesterday",
      iconBg: isDarkMode ? "#581C87" : "#F3E8FF",
    },
    {
      title: "Total Products",
      amount: overviewData?.total_products?.toLocaleString() || "0",
      // increasement: "+5",
      // compare: "New Products",
      iconBg: isDarkMode ? "#7C2D12" : "#FFEDD5",
    },
    {
      title: "Total Customers",
      amount: overviewData?.total_customer?.toLocaleString() || "0",
      // increasement: "+12",
      // compare: "New Customers",
      iconBg: isDarkMode ? "#701A75" : "#FCE7F3",
    },
  ];

  const maxSales = Math.max(...chartData.map((d) => d.sales), 0);
  const yAxisDomain = [0, Math.ceil(maxSales * 1.1) || 10000];

  if (loading) {
    return (
      <div
        style={{
          padding: "24px",
          minHeight: "100vh",
          backgroundColor: themeStyles.backgroundColor,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "16px",
          fontFamily: "sans-serif",
        }}
      >
        <div className="spinner"></div>
        <p style={{ color: themeStyles.color }}>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "24px",
          minHeight: "100vh",
          backgroundColor: themeStyles.backgroundColor,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "16px",
          fontFamily: "sans-serif",
          color: "#EF4444",
        }}
      >
        <p>Error: {error}</p>
        <button
          onClick={() => {
            fetchPosOverview();
            GetMobileOrders();
          }}
          style={{
            padding: "8px 16px",
            background: "#4F46E5",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        minHeight: "100vh",
        fontFamily: "sans-serif",
        backgroundColor: themeStyles.backgroundColor,
        color: themeStyles.color,
        boxSizing: "border-box",
      }}
    >
      {/* 1. Header Section */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "700",
            letterSpacing: "-0.5px",
            margin: "0 0 4px 0",
          }}
        >
          Point of Sale Overview Dashboard
        </h1>
        <p style={{ fontSize: "14px", color: themeStyles.subText, margin: 0 }}>
          Welcome back. Here's today's shop overview
        </p>
      </div>

      {/* 2. Overview Cards Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        {headerdata.map((item, index) => {
          const isPositive = item.increasement?.startsWith("+") || item.increasement === "+11%";
          return (
            <div
              key={index}
              style={{
                padding: "20px",
                borderRadius: "16px",
                border: `1px solid ${themeStyles.borderColor}`,
                backgroundColor: themeStyles.cardBg,
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#94A3B8",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      margin: 0,
                    }}
                  >
                    {item.title}
                  </p>
                  <h3
                    style={{
                      fontSize: "22px",
                      fontWeight: "700",
                      margin: "8px 0 0 0",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {item.amount}
                  </h3>
                </div>
                <div
                  style={{
                    padding: "10px",
                    borderRadius: "12px",
                    backgroundColor: item.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {icons[index]}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "16px",
                  fontSize: "12px",
                }}
              >
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    fontWeight: "600",
                    backgroundColor: isPositive ? "#E6F4EA" : "#FCE8E6",
                    color: isPositive ? "#137333" : "#C5221F",
                  }}
                >
                  {item.increasement}
                </span>
                <span style={{ color: themeStyles.subText }}>
                  {item.compare}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Chart & Side Content Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {/* Sales Chart Box */}
        <div
          style={{
            gridColumn: "span 2",
            padding: "24px",
            borderRadius: "16px",
            border: `1px solid ${themeStyles.borderColor}`,
            backgroundColor: themeStyles.cardBg,
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            boxSizing: "border-box",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "700",
              margin: "0 0 24px 0",
            }}
          >
            Sale Statistics
          </h2>
          <div style={{ width: "100%", height: "280px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={themeStyles.chartGrid}
                />
                <XAxis
                  dataKey="name"
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={yAxisDomain}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: themeStyles.cardBg,
                    borderColor: themeStyles.borderColor,
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  itemStyle={{ color: themeStyles.color }}
                  formatter={(value) => [
                    `${value.toLocaleString()} ks`,
                    "Sales",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#4F46E5", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Popular Product */}
          <div
            style={{
              padding: "20px",
              borderRadius: "16px",
              border: `1px solid ${themeStyles.borderColor}`,
              backgroundColor: themeStyles.cardBg,
              flex: 1,
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "700",
                margin: "0 0 16px 0",
              }}
            >
              Popular Product
            </h2>
            {popularProduct ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "12px",
                  borderRadius: "12px",
                  backgroundColor: themeStyles.subCardBg,
                  border: `1px solid ${themeStyles.borderColor}`,
                }}
              >
                <img
                  src={popularProduct.popular_product_image || Shoe}
                  alt="Product"
                  style={{
                    width: "64px",
                    height: "64px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    backgroundColor: "#FFFFFF",
                    padding: "4px",
                    border: `1px solid ${themeStyles.borderColor}`,
                  }}
                  onError={(e) => {
                    e.target.src = Shoe;
                  }}
                />
                <div>
                  <p style={{ fontWeight: "600", fontSize: "14px", margin: 0 }}>
                    {popularProduct.popular_product_name || "No product name"}
                  </p>
                  <p
                    style={{
                      color: "#4F46E5",
                      fontWeight: "700",
                      fontSize: "14px",
                      margin: "4px 0 0 0",
                    }}
                  >
                    {popularProduct.popular_product_price?.toLocaleString() ||
                      0}{" "}
                    ks
                  </p>
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "16px",
                  color: "#94A3B8",
                  fontSize: "14px",
                }}
              >
                No popular product data
              </div>
            )}
          </div>

          {/* Top Customer */}
          <div
            style={{
              padding: "20px",
              borderRadius: "16px",
              border: `1px solid ${themeStyles.borderColor}`,
              backgroundColor: themeStyles.cardBg,
              flex: 1,
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "700",
                margin: "0 0 16px 0",
              }}
            >
              Top Customer
            </h2>
            {topCustomer ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "12px",
                  borderRadius: "12px",
                  backgroundColor: themeStyles.subCardBg,
                  border: `1px solid ${themeStyles.borderColor}`,
                }}
              >
                {topCustomer.top_customer_image ? (
                  <img
                    src={topCustomer.top_customer_image}
                    alt="Customer"
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "#EEF2FF",
                      color: "#4F46E5",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {topCustomer.top_customer_name
                      ? topCustomer.top_customer_name
                          .substring(0, 2)
                          .toUpperCase()
                      : "CH"}
                  </div>
                )}
                <div>
                  <p style={{ fontWeight: "600", fontSize: "14px", margin: 0 }}>
                    {topCustomer.top_customer_name || "No customer"}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#94A3B8",
                      margin: "2px 0 0 0",
                    }}
                  >
                    {topCustomer.top_customer_address || "N/A"}
                  </p>
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "16px",
                  color: "#94A3B8",
                  fontSize: "14px",
                }}
              >
                No top customer data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Recent Orders Table Section */}
      <div
        style={{
          padding: "24px",
          borderRadius: "16px",
          border: `1px solid ${themeStyles.borderColor}`,
          backgroundColor: themeStyles.cardBg,
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "700",
            margin: "0 0 24px 0",
            color: themeStyles.color,
          }}
        >
          Recent Mobile Orders
        </h2>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              textAlign: "left",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: `1px solid ${themeStyles.borderColor}`,
                  color: "#94A3B8",
                  fontSize: "12px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                <th style={{ paddingBottom: "16px", paddingLeft: "12px" }}>
                  Order ID
                </th>
                <th style={{ paddingBottom: "16px", paddingLeft: "12px" }}>
                  Customer
                </th>
                <th style={{ paddingBottom: "16px", paddingLeft: "12px" }}>
                  Amount
                </th>
                <th style={{ paddingBottom: "16px", paddingLeft: "12px" }}>
                  Date
                </th>
                <th style={{ paddingBottom: "16px", paddingLeft: "12px" }}>
                  Time
                </th>
                <th style={{ paddingBottom: "16px", paddingLeft: "12px" }}>
                  Payment
                </th>
                <th
                  style={{
                    paddingBottom: "16px",
                    paddingLeft: "12px",
                    textAlign: "center",
                  }}
                >
                  Proof
                </th>
                <th
                  style={{
                    paddingBottom: "16px",
                    paddingRight: "12px",
                    textAlign: "right",
                    width: "140px",
                  }}
                >
                  Order Status
                </th>
              </tr>
            </thead>
            <tbody style={{ fontSize: "14px", color: themeStyles.color }}>
              {Array.isArray(MOrders?.data) && MOrders.data.length > 0 ? (
                MOrders.data
                  .slice((currentPage - 1) * 5, currentPage * 5)
                  .map((item, index) => {
                    const status = item.order_status
                      ? item.order_status.toLowerCase()
                      : "";
                    return (
                      <tr
                        key={index}
                        style={{
                          borderBottom: `1px solid ${themeStyles.borderColor}`,
                          transition: "background-color 0.2s",
                          height: "69px",
                        }}
                        className="table-row-hover"
                      >
                        <td
                          style={{
                            padding: "16px 12px",
                            fontWeight: "600",
                            color: "#4F46E5",
                          }}
                        >
                          #{item.order_id}
                        </td>
                        <td
                          style={{
                            padding: "16px 12px",
                            fontWeight: "600",
                          }}
                        >
                          {item.customer_name}
                        </td>
                        <td
                          style={{
                            padding: "16px 12px",
                            fontWeight: "600",
                          }}
                        >
                          {item.Total?.toLocaleString()} ks
                        </td>
                        <td
                          style={{ padding: "16px 12px", color: "#94A3B8" }}
                        >
                          {item.Date}
                        </td>
                        <td
                          style={{ padding: "16px 12px", color: "#94A3B8" }}
                        >
                          {item.Time}
                        </td>
                        <td style={{ padding: "16px 12px" }}>
                          <span
                            style={{
                              fontSize: "12px",
                              backgroundColor: isDarkMode
                                ? "#334155"
                                : "#F1F5F9",
                              color: isDarkMode ? "#E1E1E1" : "#475569",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontWeight: "500",
                            }}
                          >
                            {item.payment_method}
                          </span>
                        </td>
                        <td style={{ padding: "16px 12px" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <img
                              src={item.payment_proof}
                              style={{
                                width: "44px",
                                height: "28px",
                                borderRadius: "4px",
                                objectFit: "cover",
                                cursor: "pointer",
                                border: `1px solid ${themeStyles.borderColor}`,
                              }}
                              onClick={() =>
                                showImagePreview(item.payment_proof)
                              }
                              alt="Proof"
                            />
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "16px 12px",
                            textAlign: "center",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              padding: "5px 12px",
                              borderRadius: "10px",
                              fontSize: "12px",
                              fontWeight: "600",
                              minWidth: "80px",
                              textAlign: "center",
                              backgroundColor:
                                status === "completed"
                                  ? "#D1FAE5"
                                  : status === "pending"
                                  ? "#FEF3C7"
                                  : "#FEE2E2",
                              color:
                                status === "completed"
                                  ? "#065F46"
                                  : status === "pending"
                                  ? "#D97706"
                                  : "#991B1B",
                            }}
                          >
                            {item.order_status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    style={{ textAlign: "center", padding: "40px", color: "#94A3B8" }}
                  >
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {Array.isArray(MOrders?.data) && MOrders.data.length > 0 && (
          <div
            style={{
              marginTop: "16px",
              paddingTop: "14px",
              borderTop: `1px solid ${themeStyles.borderColor}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{ fontSize: "13px", color: "#64748B", fontWeight: "500" }}
            >
              Showing {(currentPage - 1) * 5 + 1} to{" "}
              {Math.min(currentPage * 5, MOrders.data.length)} of{" "}
              {MOrders.data.length} entries
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  border: `1px solid ${themeStyles.borderColor}`,
                  backgroundColor: themeStyles.cardBg,
                  color: themeStyles.color,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  opacity: currentPage === 1 ? 0.4 : 1,
                }}
              >
                <span style={{ fontSize: "18px", fontWeight: "600" }}>&lt;</span>
              </button>

              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: themeStyles.color,
                  minWidth: "85px",
                  textAlign: "center",
                }}
              >
                Page {currentPage} of {Math.ceil(MOrders.data.length / 5)}
              </span>

              <button
                type="button"
                disabled={currentPage === Math.ceil(MOrders.data.length / 5)}
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, Math.ceil(MOrders.data.length / 5))
                  )
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  border: `1px solid ${themeStyles.borderColor}`,
                  backgroundColor: themeStyles.cardBg,
                  color: themeStyles.color,
                  cursor:
                    currentPage === Math.ceil(MOrders.data.length / 5)
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    currentPage === Math.ceil(MOrders.data.length / 5) ? 0.4 : 1,
                }}
              >
                <span style={{ fontSize: "18px", fontWeight: "600" }}>&gt;</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PosOverview;