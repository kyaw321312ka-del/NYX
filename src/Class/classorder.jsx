import React, { useEffect, useState, useContext } from "react";
import OrderIcon from "@mui/icons-material/DensityMedium";
import SearchIcon from "@mui/icons-material/SearchSharp";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Restaurant, MonetizationOn, CalendarToday } from "@mui/icons-material";
import { Outlet, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import "../classCss/classOrder.css";
import { useGetClassOrder } from "../ClassApi";
import { useReceipt } from "../Components/Receipt";
import { useTableFooter } from "../Hooks/tablefooter";
import { Context } from "../Hooks/context";

// Stat Card Component (Theme aware)
const StatCard = ({
  title,
  value,
  change,
  icon,
  iconColor,
  isCurrent,
  isDark,
}) => (
  <div className={`order-stat-card ${isDark ? "dark-card" : ""}`}>
    <div className="order-stat-card-header">
      <span className="order-stat-card-title">{title}</span>
      {isCurrent ? (
        <span className="order-stat-card-badge">Today</span>
      ) : (
        <span className="order-stat-card-icon" style={{ color: iconColor }}>
          {icon}
        </span>
      )}
    </div>
    <div className="order-stat-card-value">{value}</div>
    <div
      className={`order-stat-card-change ${change.includes("-") ? "negative" : "positive"}`}
    >
      {change.includes("vs") || change.includes("-") || change.includes("+")
        ? `↗ ${change}`
        : change}
    </div>
  </div>
);

function ClassOrder() {
  const { classBackColor } = useContext(Context);
  const isDark = classBackColor === "#1A1C1E";

  const [text, settext] = useState("");
  const [filtered, setfiltered] = useState(null);

  const navigate = useNavigate();
  const { GetOrder, ClassOrders } = useGetClassOrder();
  const { ReceipetJsx, open } = useReceipt();
  const { startnumber, endnumber, TableFooterJsx } = useTableFooter(filtered);

  useEffect(() => {
    GetOrder();
  }, []);

  // Payment Proof Image Preview Modal (Light / Dark Theme)
  const showImagePreview = (imageUrl) => {
    if (!imageUrl) return;
    Swal.fire({
      imageUrl: imageUrl,
      imageAlt: "Payment Proof",
      showConfirmButton: false,
      showCloseButton: true,
      background: isDark ? "#1a1c1e" : "#ffffff",
      color: isDark ? "#ffffff" : "#111827",
      customClass: {
        popup: `preview-swal-popup ${isDark ? "dark-swal" : ""}`,
        image: "preview-image-style",
        closeButton: "preview-swal-close",
      },
    });
  };

  async function ExportTable() {
    //  alert("Please Read the documentation(document.txt) or comment");
    if (!filtered) return;
    let formattedData = filtered.map((item) => ({
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

  useEffect(() => {
    let result = ClassOrders?.data;
    if (Array.isArray(result) && result.length > 0) {
      result = result.filter((item) => {
        return (
          item?.payment_method?.toLowerCase().includes(text.toLowerCase()) ||
          item?.Total?.toString().includes(text.toLowerCase()) ||
          item?.reciept_no
            ?.toString()
            .toLowerCase()
            .includes(text.toLowerCase())
        );
      });
    }
    setfiltered(result);
  }, [text, ClassOrders?.data]);

  const textchange = (e) => {
    settext(e.target.value);
  };

  function show_receipet(item) {
    let newchildData = item.items?.map((item) => ({
      ...item,
      productName: item.product_name,
      quantity: item.quantity,
    }));

    open({
      Date: item.Data,
      Time: item.Time,
      order_no: item.reciept_no,
      payment: item.payment_method,
      items: newchildData,
      item_Qty: item.items?.length,
      item_amount: item.Total,
      tax: 0,
      dfee: 0,
      total_amount: item.Total,
    });
  }

  // Pagination အတွက် ရွေးချယ်ထားသော Data Rows
  const currentRows = Array.isArray(filtered)
    ? filtered.slice(startnumber, endnumber)
    : [];

  // Table တွင် အနည်းဆုံး Row ၅ ခု စာ အမြဲရှိနေစေရန်အတွက် တွက်ချက်ခြင်း
  const TARGET_ROW_COUNT = 5;
  const emptyRowsCount =
    filtered && filtered.length > 0
      ? Math.max(0, TARGET_ROW_COUNT - currentRows.length)
      : 0;

  return (
    <div className={`classordermain ${isDark ? "dark-mode" : ""}`}>
      {/* View Modal Receipt Wrapper */}
      <div
        className={`receipt-modal-theme-wrapper ${isDark ? "dark-theme-modal" : ""}`}
      >
        {ReceipetJsx}
      </div>

      {/* Header Section */}
      <div className="classorderbody1">
        <h2 className="classorderheader">
          <OrderIcon className="header-icon" />
          <span style={{ fontSize: "30px" }}>Orders Management</span>
        </h2>
        <button
          className="btn-add-order"
          onClick={() => navigate("classorderaddmenu")}
        >
          <AddIcon sx={{ fontSize: "18px" }} />
          Add Order
        </button>
      </div>

      {/* Stat Cards Row */}
      <div className="stat-cards-container">
        <StatCard
          title="TODAY ORDERS"
          value="12 orders"
          change="7"
          icon={<CalendarToday sx={{ fontSize: "20px" }} />}
          iconColor="#ef4444"
          isCurrent={true}
          isDark={isDark}
        />
        <StatCard
          title="TOTAL ORDERS"
          value="250"
          change="+12"
          icon={<MonetizationOn sx={{ fontSize: "20px" }} />}
          iconColor="#3b82f6"
          isDark={isDark}
        />
        <StatCard
          title="TOP SELLING MENU"
          value="Dinner"
          change="45"
          icon={<Restaurant sx={{ fontSize: "20px" }} />}
          iconColor="#f59e0b"
          isDark={isDark}
        />
        <StatCard
          title="TOTAL REVENUE"
          value="250,000 Ks"
          change="5"
          icon={<MonetizationOn sx={{ fontSize: "20px" }} />}
          iconColor="#10b981"
          isDark={isDark}
        />
      </div>

      {/* Main Table Container */}
      <div className="classorderbody3">
        <div className="classorderfooter1">
          <h2>Top Orders</h2>
          <div className="order-actions-right">
            <div className="classordersearch">
              <SearchIcon className="search-icon" />
              <input
                type="search"
                placeholder="Search Order No..."
                value={text}
                onChange={textchange}
              />
            </div>
            <button className="btn-export" onClick={ExportTable}>
              <SaveAltIcon sx={{ fontSize: "18px" }} />
              Export
            </button>
          </div>
        </div>

        <div className="towarpthetable">
          <div className="classorderfooter2">
            <table className="classordertable">
              <thead>
                <tr>
                  <th>Order No</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Payment Proof</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(filtered) ? (
                  filtered.length > 0 ? (
                    <>
                      {/* Actual Data Rows */}
                      {currentRows.map((item, index) => (
                        <tr key={index}>
                          <td className="font-semibold">{item.reciept_no}</td>
                          <td className="amount-cell">{item.Total} Ks</td>
                          <td>
                            <span className="payment-badge">
                              {item.payment_method || "N/A"}
                            </span>
                          </td>
                          <td className="imgrowmain">
                            <div
                              className="imgrow"
                              onClick={() =>
                                showImagePreview(item.payment_image)
                              }
                            >
                              {item.payment_image ? (
                                <img
                                  src={item.payment_image}
                                  alt="Payment Proof"
                                />
                              ) : (
                                <span className="no-img">No Image</span>
                              )}
                            </div>
                          </td>
                          <td className="classordertdbtn">
                            <button
                              className="btn-view"
                              onClick={() => show_receipet(item)}
                            >
                              <VisibilityIcon sx={{ fontSize: "15px" }} />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}

                      {/* Row ၅ ခု မပြည့်ပါက နေရာအလွတ် (Placeholder Rows) ဖြည့်ပေးခြင်း */}
                      {Array.from({ length: emptyRowsCount }).map(
                        (_, index) => (
                          <tr key={`empty-${index}`} className="empty-row">
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
                    <tr>
                      <td colSpan={5} className="table-empty">
                        No orders found...
                      </td>
                    </tr>
                  )
                ) : (
                  <tr>
                    <td colSpan={5} className="table-empty">
                      Loading orders...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer-wrapper">{TableFooterJsx}</div>
        </div>
      </div>

      <Outlet context={{ GetOrder }} />
    </div>
  );
}

export default ClassOrder;
