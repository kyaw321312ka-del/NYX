import { useState, useEffect } from "react";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { Dialog } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CloseIcon from "@mui/icons-material/Close";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";

const formatDateToDMY = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
};

export default function RecentPaymentsTable({
  paymentMode,
  onPaymentModeChange,
  isDark,
}) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const itemsPerPage = 5;

  // Dynamic Theme Colors
  const cardBg = isDark ? "#242629" : "#ffffff";
  const borderColor = isDark ? "#334155" : "#e5e7eb";
  const textColor = isDark ? "#f8fafc" : "#111827";
  const subTextColor = isDark ? "#94a3b8" : "#6b7280";
  const tableHeaderBg = isDark ? "#1e293b" : "#ffffff";
  const rowBorder = isDark ? "#334155" : "#f3f4f6";
  const inputBg = isDark ? "#1e293b" : "#ffffff";

  const fetchTrainingOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        "http://130.94.99.9:5000/api/trainingoverview/training_overview",
      );
      if (!response.ok) {
        throw new Error("Failed to fetch training overview data");
      }
      const jsonResult = await response.json();

      if (jsonResult.success && jsonResult.data) {
        const transformedData = jsonResult.data.map((item) => ({
          id: `#T-${item.id}`,
          studentName: item.name,
          trainingName: item.course_name,
          className: item.title_level,
          amount: `${item.price.toLocaleString()} Ks`,
          date: item.date,
          paymentMethod: item.payment_method,
          proof: item.payment_image_url,
          mode: item.source || "mobile",
          originalData: item,
        }));
        setTransactions(transformedData);
      } else {
        throw new Error("No data found");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingOverview();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    if (t.mode !== paymentMode) return false;
    const matchesSearch =
      search === "" ||
      t.studentName.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());

    if (!t.date) return matchesSearch;

    const itemDate = new Date(t.date);
    const startTarget = startDate ? new Date(startDate) : null;
    const endTarget = endDate ? new Date(endDate) : null;

    if (startTarget && itemDate < startTarget) return false;
    if (endTarget && itemDate > endTarget) return false;

    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const emptyRows = itemsPerPage - currentItems.length;

  const handleDownloadPNG = () => {
    const modalElement = document.getElementById("invoice-modal-content");
    if (!modalElement) return;

    html2canvas(modalElement, { useCORS: true }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `Invoice_${selectedTransaction?.id || "receipt"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  const handlePrintReceipt = () => {
    const printContent = document.getElementById("invoice-modal-content");
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
            font-family: 'Inter', sans-serif; 
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

  const handleExportToExcel = () => {
    if (filteredTransactions.length === 0) {
      //  alert("Export ထုတ်ရန် ဒေတာ မရှိသေးပါ!");
      return;
    }

    const excelData = filteredTransactions.map((t) => ({
      "STUDENT ID": t.id,
      "STUDENT NAME": t.studentName,
      "TRAINING NAME": t.trainingName,
      "CLASS NAME": t.className,
      AMOUNT: t.amount,
      DATE: t.date,
      "PAYMENT METHOD": t.paymentMethod,
      "PAYMENT PROOF": t.proof,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "filtered_training_payments.xlsx");
  };

  if (loading) {
    return (
      <div
        style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: "12px",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div className="st-spinner" style={{ margin: "20px auto" }}></div>
        <p style={{ color: subTextColor }}>Loading training payments data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: "12px",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#ef4444" }}>Error: {error}</p>
        <button
          onClick={fetchTrainingOverview}
          style={{
            marginTop: "16px",
            padding: "8px 16px",
            background: "#1e293b",
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
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: "12px",
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
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
          Recent Training Payments
        </h2>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search Name or ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                background: "#1e293b",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 36px 8px 14px",
                fontSize: "14px",
                outline: "none",
                width: "190px",
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

          <button
            onClick={handleExportToExcel}
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

      {/* Mode and Date Filters */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", gap: "5px" }}>
          <button
            onClick={() => {
              onPaymentModeChange("mobile");
              setCurrentPage(1);
            }}
            style={{
              background: paymentMode === "mobile" ? "#1e293b" : cardBg,
              color: paymentMode === "mobile" ? "#fff" : subTextColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "6px",
              padding: "8px 20px",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Mobile
          </button>
          <button
            onClick={() => {
              onPaymentModeChange("admin");
              setCurrentPage(1);
            }}
            style={{
              background: paymentMode === "admin" ? "#1e293b" : cardBg,
              color: paymentMode === "admin" ? "#fff" : subTextColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "6px",
              padding: "8px 20px",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Admin
          </button>
        </div>
        <div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "6px 12px",
              background: inputBg,
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "6px",
              fontSize: "14px",
              marginRight: "7px",
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
              background: inputBg,
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
        </div>
      </div>

      {/* Table Section */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                borderBottom: `2px solid ${rowBorder}`,
                background: tableHeaderBg,
              }}
            >
              {[
                "STUDENT ID",
                "STUDENT NAME",
                "TRAINING NAME",
                "CLASS NAME",
                "AMOUNT",
                "DATE",
                "PAYMENT METHOD",
                "PAYMENT PROOF",
                "ACTION",
              ].map((h) => (
                <th
                  key={h}
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
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((t, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: `1px solid ${rowBorder}`,
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
                  {t.id}
                </td>
                <td
                  style={{
                    padding: "14px 12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: textColor,
                  }}
                >
                  {t.studentName}
                </td>
                <td
                  style={{
                    padding: "14px 12px",
                    fontSize: "14px",
                    color: subTextColor,
                  }}
                >
                  {t.trainingName}
                </td>
                <td
                  style={{
                    padding: "14px 12px",
                    fontSize: "14px",
                    color: textColor,
                  }}
                >
                  {t.className}
                </td>
                <td
                  style={{
                    padding: "14px 12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: textColor,
                  }}
                >
                  {t.amount}
                </td>
                <td
                  style={{
                    padding: "14px 12px",
                    fontSize: "14px",
                    color: textColor,
                  }}
                >
                  {formatDateToDMY(t.date)}
                </td>
                <td
                  style={{
                    padding: "14px 12px",
                    fontSize: "14px",
                    color: textColor,
                  }}
                >
                  {t.paymentMethod}
                </td>

                <td style={{ padding: "14px 12px" }}>
                  <img
                    src={t.proof}
                    alt="Proof"
                    onClick={() => {
                      setSelectedTransaction(t);
                      setIsModalOpen(true);
                    }}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "4px",
                      objectFit: "cover",
                      cursor: "pointer",
                      border: `1px solid ${borderColor}`,
                    }}
                    onError={(e) => {
                      e.target.src = "https://placehold.co/40x40?text=No+Img";
                    }}
                  />
                </td>

                <td style={{ padding: "14px 12px" }}>
                  <button
                    onClick={() => {
                      setSelectedTransaction(t);
                      setIsModalOpen(true);
                    }}
                    style={{
                      border: "1.5px solid #16a34a",
                      background: "transparent",
                      color: "#16a34a",
                      borderRadius: "6px",
                      padding: "4px 14px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}

            {emptyRows > 0 &&
              Array.from({ length: emptyRows }).map((_, index) => (
                <tr
                  key={`empty-${index}`}
                  style={{
                    borderBottom: `1px solid ${rowBorder}`,
                    height: "53px",
                  }}
                >
                  <td
                    colSpan={9}
                    style={{
                      padding: "14px 12px",
                      color: subTextColor,
                      fontSize: "14px",
                      textAlign: "center",
                    }}
                  >
                    {currentItems.length === 0 && index === 0
                      ? "No data found matching filters"
                      : ""}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Receipt Modal Box */}
      <Dialog
        open={isModalOpen && Boolean(selectedTransaction)}
        onClose={() => setIsModalOpen(false)}
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
        {selectedTransaction && (
          <div
            style={{
              background: cardBg,
              borderRadius: "12px",
              padding: "24px",
              position: "relative",
              fontFamily: "Inter, sans-serif",
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
                onClick={() => setIsModalOpen(false)}
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

            <div id="invoice-modal-content" style={{ padding: "10px" }}>
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
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
                  Registration Successfully!
                </h1>
                <p style={{ fontSize: "13px", color: subTextColor, margin: 0 }}>
                  Thank you for shopping with us
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
                    REGISTRATION ID
                  </span>
                  <span style={{ fontWeight: 700, color: textColor }}>
                    {selectedTransaction.id || "—"}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: subTextColor, fontWeight: 500 }}>
                    DATE
                  </span>
                  <span style={{ color: textColor }}>
                    {formatDateToDMY(selectedTransaction.date)}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: subTextColor, fontWeight: 500 }}>
                    PAYMENT
                  </span>
                  <span
                    style={{ color: textColor, textTransform: "uppercase" }}
                  >
                    {selectedTransaction.paymentMethod}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: subTextColor, fontWeight: 500 }}>
                    TIME
                  </span>
                  <span style={{ color: textColor }}>
                    {selectedTransaction.time || "12:25 AM"}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: subTextColor, fontWeight: 500 }}>
                    STUDENT NAME
                  </span>
                  <span style={{ color: textColor, fontWeight: 500 }}>
                    {selectedTransaction.studentName}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: subTextColor, fontWeight: 500 }}>
                    TRAINING NAME
                  </span>
                  <span style={{ color: "#2563eb", fontWeight: 600 }}>
                    {selectedTransaction.trainingName}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: subTextColor, fontWeight: 500 }}>
                    TRAINING LEVEL
                  </span>
                  <span style={{ color: "#2563eb", fontWeight: 600 }}>
                    {selectedTransaction.className || "Beginner Class"}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "8px",
                    paddingTop: "8px",
                    borderTop: `1px solid ${rowBorder}`,
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
                    {selectedTransaction.amount}
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

            <div
              className="modal-actions-hide-on-print"
              style={{ display: "flex", gap: "8px", marginTop: "24px" }}
            >
              {selectedTransaction.proof && (
                <button
                  onClick={handleDownloadPNG}
                  style={{
                    background: isDark ? "#334155" : "#f3f4f6",
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

              <button
                onClick={handlePrintReceipt}
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

              <button
                onClick={() => setIsModalOpen(false)}
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

      {/* Pagination Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "16px",
        }}
      >
        <span style={{ fontSize: "13px", color: subTextColor }}>
          Showing {filteredTransactions.length === 0 ? 0 : indexOfFirstItem + 1}{" "}
          to {Math.min(indexOfLastItem, filteredTransactions.length)} of{" "}
          {filteredTransactions.length} transactions
        </span>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
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

          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNum = index + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  border: `1.5px solid ${borderColor}`,
                  background: currentPage === pageNum ? "#1e293b" : cardBg,
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
  );
}
