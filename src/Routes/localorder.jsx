import SearchIcon from "@mui/icons-material/SearchOutlined";
import CustomerLoading from "../Components/loadingcustomer";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import Swal from "sweetalert2";
import { useEffect, useState, useContext } from "react";
import useReceipt from "../Components/Receipt";
import { useGetOrder } from "../Api_Call";
import * as XLSX from "xlsx";
import { useTableFooter } from "../Hooks/tablefooter";
import { Context } from "../Hooks/context";

function LocalOrder() {
  const [text, settext] = useState("");
  const [filterdata, setfilterdata] = useState(null);

  const { open, ReceipetJsx } = useReceipt();
  const { LOrders, GetLocalOrders } = useGetOrder(); // Local Order API Call
  const { TableFooterJsx, startnumber, endnumber } = useTableFooter(filterdata);
  const { backcolor } = useContext(Context);

  const isDarkMode = Boolean(backcolor === "#1A1C1E");

  const themeStyles = {
    color: isDarkMode ? "#F8FAFC" : "#0F172A",
    cardBg: isDarkMode ? "#1E293B" : "#FFFFFF",
    borderColor: isDarkMode ? "#334155" : "#E2E8F0",
  };

  useEffect(() => {
    if (!LOrders.data) return;
    if (text === "") {
      setfilterdata(LOrders.data);
    } else {
      let filtered = LOrders.data.filter((item) => {
        // customer_name မရှိခဲ့ရင် order_id နဲ့ ရှာလို့ရအောင် fallback ထည့်ပေးထားပါတယ်
        const searchKey = item.customer_name
          ? item.customer_name.toLowerCase()
          : String(item.order_id);
        return searchKey.includes(text.toLowerCase());
      });
      setfilterdata(filtered);
    }
  }, [text, LOrders.data]);

  useEffect(() => {
    GetLocalOrders();
  }, []);

  const changetext = (event) => {
    settext(event.target.value);
  };

  async function UpdateOrder(item, event) {
    let status = event.target.value;
    let id = item.order_id;
    try {
      let reponse = await fetch(`${import.meta.env.VITE_UPDATE_ORDER}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: status }),
      });
      if (reponse.ok) {
        await GetLocalOrders();
      }
    } catch (error) {
      console.log(error);
    }
  }

  function show_order(info) {
    if (!info) return null;
    let formatData = {
      order_no: info.order_id,
      payment: info.payment_method,
      Date: info.Date,
      Time: info.Time,
      items: info.items.map((item) => ({
        ...item,
        productName: item.product_name,
      })),
      item_Qty: info.items.length,
      item_amount: info.Sub_total,
      tax: info.tax,
      dfee: info.develivery_fee || 0,
      total_amount: info.Total,
    };
    open(formatData);
  }

  async function ExportTable() {
    if (!filterdata) return;
    let formattedData = filterdata.map((item) => ({
      "Order Id": item.order_id,
      Customer: item.customer_name || "Walk-in Customer",
      Amount: item.Total,
      Date: item.Date,
      Time: item.Time,
      Payment: item.payment_method,
      "Order Status": item.order_status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Local Sales Report");
    XLSX.writeFile(workbook, "local-sales-report.xlsx");
  }

  const currentRowsCount = Array.isArray(filterdata)
    ? filterdata.slice(startnumber, endnumber).length
    : 0;

  return (
    <div style={{ padding: "0px", marginTop: "20px" }}>
      {/* Print ချိန်တွင် အဖြူကြီးဖြစ်နေခြင်းကို ဖြေရှင်းရန် CSS Style */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-modal-container, .receipt-modal-container * {
            visibility: visible;
          }
          .receipt-modal-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {ReceipetJsx}

      {/* 📦 Table Container Card */}
      <div
        style={{
          padding: "24px",
          borderRadius: "16px",
          border: `1px solid ${themeStyles.borderColor}`,
          backgroundColor: themeStyles.cardBg,
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        }}
      >
        {/* ✨ Table Box အတွင်းဘက်ထိပ်ဆုံး Panel Row (Top Order, Search, Export) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            width: "100%",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: themeStyles.color,
              margin: 0,
            }}
          >
            Local Order
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Search Input */}
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                border: `1px solid ${themeStyles.borderColor}`,
                borderRadius: "8px",
                padding: "6px 12px",
                backgroundColor: isDarkMode ? "#334155" : "#F8FAFC",
                width: "240px",
              }}
            >
              <input
                type="search"
                placeholder="Search..."
                onChange={changetext}
                style={{
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  color: themeStyles.color,
                  fontSize: "14px",
                  width: "100%",
                  paddingRight: "24px",
                }}
              />
              <SearchIcon
                style={{
                  position: "absolute",
                  right: "10px",
                  color: "#94A3B8",
                  fontSize: "20px",
                }}
              />
            </div>

            {/* Export Button */}
            <button
              onClick={ExportTable}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#0F172A",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              <SaveAltIcon style={{ fontSize: "18px" }} /> Export
            </button>
          </div>
        </div>

        {/* 📊 Table Content */}
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
                  backgroundColor: isDarkMode ? "#1E293B" : "#F8FAFC",
                }}
              >
                <th style={{ padding: "16px 12px" }}>ORDER ID</th>
                <th style={{ padding: "16px 12px" }}>Customer</th>
                <th style={{ padding: "16px 12px" }}>Amount</th>
                <th style={{ padding: "16px 12px" }}>Date</th>
                <th style={{ padding: "16px 12px" }}>Time</th>
                <th style={{ padding: "16px 12px" }}>Payment</th>
                <th style={{ padding: "16px 12px" }}>Proof</th>
                <th style={{ padding: "16px 12px", textAlign: "right" }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody style={{ fontSize: "14px", color: themeStyles.color }}>
              {Array.isArray(filterdata) ? (
                filterdata.length > 0 ? (
                  <>
                    {filterdata
                      .slice(startnumber, endnumber)
                      .map((item, index) => {
                        return (
                          <tr
                            key={index}
                            style={{
                              borderBottom: `1px solid ${themeStyles.borderColor}`,
                              height: "69px",
                            }}
                          >
                            <td
                              style={{
                                padding: "12px",
                                fontWeight: "600",
                                color: "#4F46E5",
                              }}
                            >
                              #{item.order_id}
                            </td>
                            <td style={{ padding: "12px", fontWeight: "600" }}>
                              {item.customer_name || "Walk-in Customer"}
                            </td>
                            <td style={{ padding: "12px", fontWeight: "500" }}>
                              {item.Total?.toLocaleString()} ks
                            </td>
                            <td style={{ padding: "12px", color: "#94A3B8" }}>
                              {item.Date}
                            </td>
                            <td style={{ padding: "12px", color: "#94A3B8" }}>
                              {item.Time}
                            </td>
                            <td style={{ padding: "12px" }}>
                              <span
                                style={{
                                  fontSize: "12px",
                                  backgroundColor: isDarkMode
                                    ? "#334155"
                                    : "#F1F5F9",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                }}
                              >
                                {item.payment_method}
                              </span>
                            </td>
                            <td style={{ padding: "12px" }}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <img
                                  src={item.payment_proof}
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "8px",
                                    objectFit: "cover",
                                    cursor: "pointer",
                                    border: `1px solid ${themeStyles.borderColor}`,
                                  }}
                                  alt="Proof"
                                />
                              </div>
                            </td>
                            <td style={{ padding: "12px", textAlign: "right" }}>
                              <p
                                style={{
                                  display: "inline-block",
                                  margin: 0,
                                  padding: "4px 12px",
                                  // Dark/Light mode အလိုက် View Button အရောင်ပြောင်းလဲစေရန် (Light mode တွင် အပြာနု/နောက်ခံဖြူ၊ Dark mode တွင် အမဲနောက်ခံ/စာသားအဖြူ သို့မဟုတ် ထင်ရှားသောအရောင်)
                                  backgroundColor: isDarkMode
                                    ? "#F8FAFC"
                                    : "#0F172A",
                                  color: isDarkMode ? "#0F172A" : "#FFFFFF",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontSize: "13px",
                                  fontWeight: "600",
                                }}
                                onClick={() => show_order(item)}
                              >
                                View
                              </p>
                            </td>
                          </tr>
                        );
                      })}
                    {/* Padding Empty Rows ထဲက colSpan ကိုလည်း 8 သို့ ပြောင်းပေးပါ */}
                    {currentRowsCount < 5 &&
                      [...Array(5 - currentRowsCount)].map((_, idx) => (
                        <tr
                          key={`empty-${idx}`}
                          style={{
                            borderBottom: `1px solid ${themeStyles.borderColor}`,
                            height: "69px",
                          }}
                        >
                          <td colSpan="8">&nbsp;</td>
                        </tr>
                      ))}
                  </>
                ) : (
                  <tr style={{ height: "345px" }}>
                    <td
                      colSpan="8"
                      style={{ textAlign: "center", color: "#94A3B8" }}
                    >
                      No data found
                    </td>
                  </tr>
                )
              ) : (
                [...Array(5)].map((_, index) => (
                  <tr key={index} style={{ height: "69px" }}>
                    <td colSpan="8" style={{ padding: "12px 0" }}>
                      <CustomerLoading times={8} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {Array.isArray(filterdata) && filterdata.length > 5 && (
          <div
            style={{
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: `1px solid ${themeStyles.borderColor}`,
            }}
          >
            {TableFooterJsx}
          </div>
        )}
      </div>
    </div>
  );
}

export default LocalOrder;
