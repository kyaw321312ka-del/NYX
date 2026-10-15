import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowBackIosNew,
  DescriptionOutlined,
  Search,
  FileDownloadOutlined,
  ReceiptLongOutlined,
  Close,
  Download,
  CheckCircle,
  Refresh,
  ErrorOutline,
  ChevronLeft,
  ChevronRight,
  Print,
} from "@mui/icons-material";

import * as XLSX from "xlsx";
import html2canvas from "html2canvas";

import { Context } from "../Hooks/context";
import "./walkbookinglist.css";

const MOBILE_BOOKING_API_URL =
  "http://130.94.99.9:5000/api/walk_in/mobile_booking_list";
const LOCAL_API_URL = "http://130.94.99.9:5000/api/walk_in";
const ITEMS_PER_PAGE = 20;

const formatMoney = (value) => {
  return `${Number(value || 0).toLocaleString("en-US")} Ks`;
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

const WalkBookingList = () => {
  const { classBackColor } = useContext(Context);
  const isDark = classBackColor === "#1A1C1E";

  const [orderType, setOrderType] = useState("mobile");
  const [mobileBookings, setMobileBookings] = useState([]);
  const [localBookings, setLocalBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showPaymentProof, setShowPaymentProof] = useState(false);

  const paymentSuccessRef = useRef(null);
  const navigate = useNavigate();

  const fetchBookings = useCallback(async (url, setBookings) => {
    setIsLoading(true);
    setApiError("");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      if (!Array.isArray(data?.result)) throw new Error("Invalid API response");

      const formattedData = data.result.map((item) => ({
        id: `#${item.booking_id}`,
        walkInId: item.Walk_In_id,
        bookingId: item.booking_id,
        name: item.booking_name,
        phone: item.phone,
        venue: item.venue_name,
        court: item.court_name,
        date: formatDate(item.date),
        rawDate: item.date,
        time: item.time,
        payment: item.payment_method,
        paymentProof: item.payment_image_url,
        courtFee: Number(item.walk_in_price || 0),
        equipmentFee: Number(item.equipment_price || 0),
        rentFee: 0,
        snackBill: 0,
        discount: 0,
        amount: Number(item.amount || 0),
      }));

      setBookings(formattedData);
    } catch (error) {
      console.error("Booking API error:", error);
      if (error.name === "AbortError") {
        setApiError("Server response is taking too long. Please try again.");
      } else {
        setApiError(
          "Unable to connect to the booking server. Please check your network connection.",
        );
      }
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMobileBookings = useCallback(
    () => fetchBookings(MOBILE_BOOKING_API_URL, setMobileBookings),
    [fetchBookings],
  );

  const fetchLocalBookings = useCallback(
    () => fetchBookings(LOCAL_API_URL, setLocalBookings),
    [fetchBookings],
  );

  useEffect(() => {
    if (orderType === "mobile") fetchMobileBookings();
    else fetchLocalBookings();
  }, [fetchLocalBookings, fetchMobileBookings, orderType]);

  const currentData = orderType === "local" ? localBookings : mobileBookings;

  const filteredBookings = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return currentData;

    return currentData.filter((booking) => {
      const searchableText = [
        booking.id,
        booking.name,
        booking.phone,
        booking.venue,
        booking.court,
        booking.date,
        booking.time,
        booking.payment,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [currentData, searchText]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, orderType]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const shouldShowPagination = filteredBookings.length > ITEMS_PER_PAGE;
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageEnd = pageStart + ITEMS_PER_PAGE;
  const paginatedBookings = filteredBookings.slice(pageStart, pageEnd);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const openView = (booking) => {
    setShowPaymentProof(false);
    setSelectedBooking(booking);
  };

  const closeView = () => {
    setSelectedBooking(null);
  };

  const openPaymentProof = (booking) => {
    setSelectedBooking(booking);
    setShowPaymentProof(true);
  };

  const closePaymentProof = () => {
    setShowPaymentProof(false);
    setSelectedBooking(null);
  };

  const getTotalAmount = (booking) => {
    if (!booking) return 0;
    if (orderType === "local") return Number(booking.amount || 0);

    const subTotal =
      Number(booking.courtFee || 0) +
      Number(booking.rentFee || 0) +
      Number(booking.snackBill || 0);

    return subTotal - Number(booking.discount || 0);
  };

  const downloadPaymentSuccess = async () => {
    if (!paymentSuccessRef.current || !selectedBooking) return;
    try {
      const canvas = await html2canvas(paymentSuccessRef.current, {
        backgroundColor: isDark ? "#1a1c1e" : "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: false,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `payment-success-${selectedBooking.id.replace("#", "")}.png`;
      link.click();
    } catch (error) {
      console.error("PNG download error:", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const exportExcel = () => {
    const excelData = filteredBookings.map((booking) => ({
      "Booking ID": booking.id,
      "Walk In ID": booking.walkInId || "-",
      Name: booking.name,
      "Phone Number": booking.phone,
      Venue: booking.venue,
      Court: booking.court,
      Date: booking.date,
      Time: booking.time,
      "Payment Method": booking.payment,
      "Court / Walk-in Fee": booking.courtFee,
      "Equipment Fee": booking.equipmentFee || 0,
      "Rent Fee": booking.rentFee || 0,
      "Snack Bill": booking.snackBill || 0,
      Discount: booking.discount || 0,
      "Total Amount": booking.amount || getTotalAmount(booking),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      orderType === "local" ? "Local Orders" : "Mobile Orders",
    );
    XLSX.writeFile(
      workbook,
      orderType === "local"
        ? "local-booking-list.xlsx"
        : "mobile-booking-list.xlsx",
    );
  };

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );

  return (
    <div
      className={`booking-page ${isDark ? "dark-mode" : ""}`}
      style={{
        backgroundColor: classBackColor || (isDark ? "#121212" : "#f4f6f9"),
      }}
    >
      <button
        className="booking-back-button"
        onClick={() => navigate("/class/classwalk-in")}
      >
        <ArrowBackIosNew className="booking-back-icon" />
      </button>
      <div style={{ padding: "15px 25px" }}>
        <div className="booking-header">
          <div className="booking-title-wrapper">
            <div className="booking-title-icon">
              <DescriptionOutlined className="booking-title-icon-svg" />
            </div>
            <h1 className="booking-title">Booking List</h1>
          </div>

          <div className="order-switch">
            <button
              className={`order-switch-button ${
                orderType === "mobile" ? "order-switch-button-active" : ""
              }`}
              onClick={() => setOrderType("mobile")}
            >
              Mobile Order
            </button>
            <button
              className={`order-switch-button ${
                orderType === "local" ? "order-switch-button-active" : ""
              }`}
              onClick={() => setOrderType("local")}
            >
              Local Order
            </button>
          </div>
        </div>

        <div className="booking-card">
          <div className="booking-card-header">
            <h2 className="booking-card-title">All Bookings</h2>
            <div className="booking-tools">
              <div className="booking-search">
                <Search className="booking-search-icon" />
                <input
                  className="booking-search-input"
                  type="text"
                  placeholder="Search..."
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
              </div>
              <button className="booking-export-button" onClick={exportExcel}>
                <FileDownloadOutlined className="booking-export-icon" />
                Export
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="booking-loading-container">
              <div className="booking-loading-box">
                <div className="booking-loading-title">Loading bookings...</div>
                <div className="booking-loading-text">
                  Please wait while we connect to the server.
                </div>
              </div>
            </div>
          )}

          {!isLoading && apiError && (
            <div className="booking-error-container">
              <div className="booking-error-box">
                <div className="booking-error-icon">
                  <ErrorOutline />
                </div>
                <div className="booking-error-title">Connection Failed</div>
                <div className="booking-error-message">{apiError}</div>
                <button
                  className="booking-retry-button"
                  onClick={
                    orderType === "mobile"
                      ? fetchMobileBookings
                      : fetchLocalBookings
                  }
                >
                  <Refresh className="booking-retry-icon" />
                  Try Again
                </button>
              </div>
            </div>
          )}

          {!isLoading && !apiError && (
            <div className="booking-table-wrapper">
              <table className="booking-table">
                <thead className="booking-table-head">
                  <tr className="booking-table-header-row">
                    <th className="booking-table-cell booking-id-cell">
                      BOOKING ID
                    </th>
                    <th className="booking-table-cell">NAME</th>
                    <th className="booking-table-cell">PHONE NUMBER</th>
                    <th className="booking-table-cell">VENUE/COURT</th>
                    <th className="booking-table-cell">DATE</th>
                    <th className="booking-table-cell">TOTAL AMOUNT</th>
                    <th className="booking-table-cell">PAYMENT PROOF</th>
                    <th className="booking-table-cell booking-action-header">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="booking-table-body">
                  {paginatedBookings.map((booking) => (
                    <tr
                      className="booking-data-row"
                      key={booking.walkInId || booking.id}
                    >
                      <td className="booking-table-cell booking-id-cell">
                        {booking.id}
                      </td>
                      <td className="booking-table-cell booking-name">
                        {booking.name}
                      </td>
                      <td className="booking-table-cell">{booking.phone}</td>
                      <td className="booking-table-cell">
                        <div className="booking-venue">
                          <span className="booking-venue-name">
                            {booking.venue}
                          </span>
                          <span className="booking-court-name">
                            {booking.court}
                          </span>
                        </div>
                      </td>
                      <td className="booking-table-cell">{booking.date}</td>
                      <td className="booking-table-cell booking-amount">
                        {formatMoney(booking.amount)}
                      </td>
                      <td className="booking-table-cell">
                        <button
                          className="payment-proof-button"
                          onClick={() => openPaymentProof(booking)}
                        >
                          {booking.paymentProof ? (
                            <img
                              className="payment-proof-thumbnail"
                              src={booking.paymentProof}
                              alt="Payment proof"
                            />
                          ) : (
                            <ReceiptLongOutlined className="payment-proof-icon" />
                          )}
                        </button>
                      </td>
                      <td className="booking-table-cell booking-action-cell">
                        <button
                          className="booking-view-button"
                          onClick={() => openView(booking)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}

                  {paginatedBookings.length === 0 && (
                    <tr className="booking-empty-row">
                      <td className="booking-empty-cell" colSpan="8">
                        No bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && !apiError && (
            <div className="booking-footer">
              <span className="booking-result-text">
                Showing {filteredBookings.length === 0 ? 0 : pageStart + 1} to{" "}
                {Math.min(pageEnd, filteredBookings.length)} of{" "}
                {filteredBookings.length} bookings
              </span>

              {shouldShowPagination && (
                <div className="booking-pagination">
                  <button
                    className="pagination-button"
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    <ChevronLeft className="pagination-arrow-icon" />
                    Previous
                  </button>

                  <div className="pagination-numbers">
                    {pageNumbers.map((page) => (
                      <button
                        className={`pagination-number ${
                          currentPage === page ? "pagination-number-active" : ""
                        }`}
                        key={page}
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    className="pagination-button"
                    disabled={currentPage === totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    Next
                    <ChevronRight className="pagination-arrow-icon" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedBooking && !showPaymentProof && (
          <div className="booking-modal-overlay">
            <div className="payment-success-modal">
              <div className="payment-success-card" ref={paymentSuccessRef}>
                <div className="payment-success-title-row">
                  <div className="payment-success-icon">
                    <CheckCircle className="payment-success-icon-svg" />
                  </div>
                  <h2 className="payment-success-title">
                    Booking Successfully!
                  </h2>
                </div>

                <p className="payment-success-message">
                  Thank you for shopping with us.
                </p>

                <div className="payment-info-grid">
                  <div className="payment-info-item">
                    <span className="payment-info-label">
                      Registration id :
                    </span>
                    <span className="payment-info-value">
                      {selectedBooking.id}
                    </span>
                  </div>

                  <div className="payment-info-item payment-info-right">
                    <span className="payment-info-label">Date :</span>
                    <span className="payment-info-value">
                      {selectedBooking.date}
                    </span>
                  </div>

                  <div className="payment-info-item">
                    <span className="payment-info-label">Payment :</span>
                    <span className="payment-info-value">
                      {selectedBooking.payment}
                    </span>
                  </div>

                  <div className="payment-info-item payment-info-right">
                    <span className="payment-info-label">Time :</span>
                    <span className="payment-info-value">
                      {selectedBooking.time}
                    </span>
                  </div>
                </div>

                <div className="payment-divider" />

                <div className="payment-price-row">
                  <span className="payment-price-label">Court Fee</span>
                  <span className="payment-price-value">
                    {formatMoney(selectedBooking.courtFee)}
                  </span>
                </div>

                {orderType === "local" && (
                  <div className="payment-price-row">
                    <span className="payment-price-label">Equipment Fee</span>
                    <span className="payment-price-value">
                      {formatMoney(selectedBooking.equipmentFee)}
                    </span>
                  </div>
                )}

                {orderType === "mobile" && (
                  <>
                    <div className="payment-price-row">
                      <span className="payment-price-label">Rent Fees</span>
                      <span className="payment-price-value">
                        {formatMoney(selectedBooking.rentFee)}
                      </span>
                    </div>

                    <div className="payment-price-row">
                      <span className="payment-price-label">Snack Bill</span>
                      <span className="payment-price-value">
                        {formatMoney(selectedBooking.snackBill)}
                      </span>
                    </div>
                  </>
                )}

                <div className="payment-divider" />

                <div className="payment-price-row">
                  <span className="payment-price-label">Total Amount</span>
                  <span className="payment-price-value">
                    {formatMoney(selectedBooking.amount)}
                  </span>
                </div>

                <div className="payment-price-row">
                  <span className="payment-price-label">Discount (%)</span>
                  <span className="payment-price-value">
                    {formatMoney(selectedBooking.discount)}
                  </span>
                </div>

                <div className="payment-divider" />

                <div className="payment-price-row payment-grand-total-row">
                  <span className="payment-price-label">Total :</span>
                  <span className="payment-price-value">
                    {formatMoney(getTotalAmount(selectedBooking))}
                  </span>
                </div>

                {/* Button များကို Card အထဲသို့ ထည့်သွင်းထားသည် */}
                <div className="payment-modal-actions">
                  {/*       <button
                    className="payment-download-button"
                    onClick={downloadPaymentSuccess}
                  >
                    <Download className="payment-download-icon" />
                    Download
                  </button>*/}

                  <button
                    className="payment-print-button"
                    onClick={handlePrint}
                  >
                    <Print className="payment-print-icon" />
                    Print
                  </button>

                  <button className="payment-cancel-button" onClick={closeView}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showPaymentProof && selectedBooking && (
          <div className="proof-modal-overlay" onClick={closePaymentProof}>
            <div
              className="proof-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="proof-modal-header">
                <div className="proof-modal-title">Payment Proof</div>
                <button
                  className="proof-close-button"
                  onClick={closePaymentProof}
                >
                  <Close className="proof-close-icon" />
                </button>
              </div>

              <div className="proof-image-wrapper">
                {selectedBooking.paymentProof ? (
                  <img
                    className="proof-full-image"
                    src={selectedBooking.paymentProof}
                    alt="Payment proof"
                  />
                ) : (
                  <div className="proof-no-image">
                    Payment proof image not found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalkBookingList;
