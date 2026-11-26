import { useEffect, useMemo, useState, useContext } from "react";
import PersonIcon from "@mui/icons-material/Person";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import { useLocation, useNavigate } from "react-router-dom";
import { Context } from "../Hooks/context"; // Context လမ်းကြောင်းကို စစ်ဆေးပေးပါ
import "./walkbooking.css";

const COURT_FEE = 50000;
const PAYMENT_LIST_URL = `${import.meta.env.VITE_PAYMENT_BASE_URL}/api/cart/showPayment`;
const CREATE_BOOKING_URL = `${import.meta.env.VITE_BASE_URL}/api/walk_in/booking`;

const courtList = [
  {
    id: "court-1",
    name: "Court 1",
    sport: "Badminton",
    hours: "09:00 AM - 10:00 PM",
  },
  {
    id: "court-2",
    name: "Court 2",
    sport: "Badminton",
    hours: "09:00 AM - 10:00 PM",
  },
  {
    id: "court-3",
    name: "Court 3",
    sport: "Badminton",
    hours: "09:00 AM - 10:00 PM",
  },
];

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatPrice = (price) => Number(price || 0).toLocaleString("en-US");

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const createBookingId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `WB-${year}${month}${day}-${randomNumber}`;
};

function WalkBooking() {
  // Context မှ classBackColor ကို ယူပြီး dark mode စစ်ခြင်း
  const { classBackColor } = useContext(Context);
  const isDark = classBackColor === "#1A1C1E";

  const location = useLocation();
  const {
    venueName,
    venueId,
    court: sourceCourt,
    walkInConfig,
  } = location.state || {};
  const bookingCourt = sourceCourt
    ? {
        id: sourceCourt.id,
        name: sourceCourt.court_name || `Court ${sourceCourt.id}`,
        sport: venueName || "-",
        hours: `${walkInConfig?.openTime || "-"} - ${walkInConfig?.closeTime || "-"}`,
        equipment: sourceCourt.equipment || [],
      }
    : courtList[0];
  const courtFee = Number(walkInConfig?.price || COURT_FEE);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingDate, setBookingDate] = useState(getToday());
  const [selectedCourt, setSelectedCourt] = useState(bookingCourt);
  const [items, setItems] = useState([]);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const getPaymentAccounts = async () => {
      try {
        const response = await fetch(PAYMENT_LIST_URL);
        if (!response.ok) return;

        const result = await response.json();
        const accounts = Array.isArray(result?.data) ? result.data : [];
        setPaymentAccounts(accounts);
        setPaymentMethod(
          (currentMethod) => currentMethod || accounts[0]?.payment_method || "",
        );
      } catch (error) {
        console.error("Payment list loading error:", error);
      }
    };

    getPaymentAccounts();
  }, []);

  useEffect(() => {
    const savedDraft = localStorage.getItem("walkInBookingDraft");
    if (!savedDraft) return;

    try {
      const draft = JSON.parse(savedDraft);
      setCustomerName(draft.customerName || "");
      setPhone(draft.phone || "");
      setBookingDate(draft.bookingDate || getToday());
      setSelectedCourt(
        sourceCourt ? bookingCourt : draft.selectedCourt || bookingCourt,
      );
      setItems(draft.items || []);
      setPaymentMethod(draft.paymentMethod || "");
    } catch (error) {
      console.error("Draft loading error:", error);
    }
  }, []);

  useEffect(() => {
    const draft = {
      customerName,
      phone,
      bookingDate,
      selectedCourt,
      items,
      paymentMethod,
    };
    localStorage.setItem("walkInBookingDraft", JSON.stringify(draft));
  }, [customerName, phone, bookingDate, selectedCourt, items, paymentMethod]);

  const rentalTotal = useMemo(() => {
    return items.reduce((total, item) => total + item.price * item.qty, 0);
  }, [items]);

  const equipmentTotal = useMemo(
    () =>
      items
        .filter((item) => item.category === "Equipment")
        .reduce((total, item) => total + item.price * item.qty, 0),
    [items],
  );

  const totalAmount = useMemo(
    () => courtFee + rentalTotal,
    [courtFee, rentalTotal],
  );

  const equipmentItems = (selectedCourt.equipment || []).map((item) => ({
    id: item.id,
    name: item.product_name,
    category: "Equipment",
    price: Number(item.rental_price || 0),
  }));
  const currentItems = equipmentItems;
  const selectedPayment = paymentAccounts.find(
    (account) => account.payment_method === paymentMethod,
  );

  const handleAddItem = (item) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (currentItem) => currentItem.id === item.id,
      );
      if (existingItem) {
        return currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, qty: currentItem.qty + 1 }
            : currentItem,
        );
      }
      return [...currentItems, { ...item, qty: 1 }];
    });
    setShowItemSelector(false);
  };

  const handleIncrease = (id) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item,
      ),
    );
  };

  const handleDecrease = (id) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty - 1) } : item,
      ),
    );
  };

  const handleDeleteItem = (id) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const handlePaymentMethodChange = (event) => {
    const method = event.target.value;
    setPaymentMethod(method);
    setErrors((current) => ({ ...current, paymentMethod: "", receipt: "" }));
    if (method === "Cash") setReceipt(null);
  };

  const handleReceiptUpload = (event) => {
    if (paymentMethod === "Cash") return;
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image receipt.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Receipt image must be smaller than 5MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReceipt({
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        preview: reader.result,
      });
      setErrors((current) => ({ ...current, receipt: "" }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveReceipt = () => setReceipt(null);

  const validateForm = () => {
    const newErrors = {};
    if (!customerName.trim())
      newErrors.customerName = "Customer name is required.";
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^[0-9+\-\s]{7,15}$/.test(phone.trim())) {
      newErrors.phone = "Please enter a valid phone number.";
    }
    if (!bookingDate) newErrors.bookingDate = "Please select booking date.";
    if (!selectedCourt) newErrors.court = "Please select a court.";
    if (!paymentMethod)
      newErrors.paymentMethod = "Please select payment method.";
    if (paymentMethod !== "Cash" && !receipt?.file)
      newErrors.receipt = "Please upload payment receipt.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateBooking = async () => {
    if (!validateForm()) return;

    const walkInId =
      walkInConfig?.walkInId ||
      walkInConfig?.walk_in_id ||
      walkInConfig?.Walk_In_id ||
      sourceCourt?.walk_in_id ||
      sourceCourt?.Walk_In_id;
    const courtId =
      sourceCourt?.court_id || sourceCourt?.id || walkInConfig?.court_id;

    if (!venueId || !courtId || !walkInId) {
      setErrors((current) => ({
        ...current,
        booking:
          "Booking information is incomplete. Please return and select the court again.",
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (receipt?.file) {
        formData.append("payment_image", receipt.file, receipt.file.name);
      }
      formData.append("walk_in_id", String(walkInId));
      formData.append("payment_method", paymentMethod);
      formData.append("vanue_id", String(venueId));
      formData.append("court_id", String(courtId));
      formData.append("name", customerName.trim());
      formData.append("phone", phone.trim());
      formData.append("date", bookingDate);
      const bookingItems = items
        .filter((item) => item.category === "Equipment" && item.id)
        .map((item) => ({
          equipment_id: Number(item.id),
          quantity: Number(item.qty),
        }));
      if (bookingItems.length > 0) {
        formData.append("items", JSON.stringify(bookingItems));
      } else {
        formData.append("items", "");
      }

      console.table(
        Array.from(formData.entries()).map(([key, value]) => ({
          key,
          value: value instanceof File ? value.name : value,
          type: value instanceof File ? value.type : "text",
        })),
      );

      const response = await fetch(CREATE_BOOKING_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw new Error(
          errorData.message ||
            errorData.error ||
            errorData.details ||
            `Booking failed (${response.status})`,
        );
      }

      const responseData = await response.json().catch(() => ({}));
      const bookingResult = responseData.result || responseData.data || {};

      const bookingData = {
        bookingId: bookingResult.booking_id || createBookingId(),
        walkInId: bookingResult.Walk_In_id || walkInId,
        customer: {
          name: bookingResult.booking_name || customerName.trim(),
          phone: bookingResult.phone || phone.trim(),
        },
        venue: {
          sport: bookingResult.venue_name || selectedCourt.sport,
          court: bookingResult.court_name || selectedCourt.name,
          operatingHours: bookingResult.operating_hour || selectedCourt.hours,
        },
        date: bookingResult.date || bookingDate,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          qty: item.qty,
          subtotal: item.price * item.qty,
        })),
        payment: {
          method: bookingResult.payment_method || paymentMethod,
          receipt: receipt || null,
        },
        pricing: {
          courtFee: Number(bookingResult.walk_in_price ?? courtFee),
          rentalTotal: Number(bookingResult.equipment_price ?? rentalTotal),
          totalAmount: Number(bookingResult.amount ?? totalAmount),
        },
        status: "Pending",
        createdAt: new Date().toISOString(),
      };

      const savedBookings =
        JSON.parse(localStorage.getItem("walkInBookings")) || [];
      savedBookings.push(bookingData);
      localStorage.setItem("walkInBookings", JSON.stringify(savedBookings));
      localStorage.setItem("lastWalkInBooking", JSON.stringify(bookingData));
      localStorage.removeItem("walkInBookingDraft");

      setCreatedBooking(bookingData);
      setIsSubmitting(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Booking error:", error);
      setIsSubmitting(false);
      alert(error.message || "Something went wrong. Please try again.");
    }
  };

  const handleReset = () => {
    if (isSubmitting) return;
    setCustomerName("");
    setPhone("");
    setBookingDate(getToday());
    setSelectedCourt(bookingCourt);
    setItems([]);
    setPaymentMethod(paymentAccounts[0]?.payment_method || "");
    setReceipt(null);
    setErrors({});
    localStorage.removeItem("walkInBookingDraft");
  };

  const handleCloseSuccess = () => setShowSuccessModal(false);

  return (
    <div
      className={`booking-page ${isDark ? "dark-mode" : ""}`}
      style={{
        backgroundColor: classBackColor || (isDark ? "#121212" : "#f5f7fb"),
      }}
    >
      <div className="top-bar">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/class/classwalk-in")}
        >
          <ArrowBackIosNewIcon fontSize="small" />
        </button>
      </div>

      <main className="booking-container">
        <div className="page-title">
          <h1 className="page-heading">Walk-in Booking</h1>
        </div>

        <div className="booking-layout">
          <div className="left-column">
            <section className="summary-card">
              <div className="section-title">
                <PersonIcon className="section-icon" />
                <h2 className="section-heading">Customer Information</h2>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">CUSTOMER NAME</label>
                  <input
                    className={`form-input ${errors.customerName ? "input-error" : ""}`}
                    type="text"
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setErrors((cur) => ({ ...cur, customerName: "" }));
                    }}
                  />
                  {errors.customerName && (
                    <span className="error-message">{errors.customerName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">PHONE NUMBER</label>
                  <input
                    className={`form-input ${errors.phone ? "input-error" : ""}`}
                    type="tel"
                    placeholder="09xxxxxxxxx"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setErrors((cur) => ({ ...cur, phone: "" }));
                    }}
                  />
                  {errors.phone && (
                    <span className="error-message">{errors.phone}</span>
                  )}
                </div>
              </div>
            </section>

            <section className="summary-card">
              <div className="section-title">
                <SportsTennisIcon className="section-icon" />
                <h2 className="section-heading">Selected Venue & Court</h2>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Venue</label>
                  <div className="disabled-field">{selectedCourt.sport}</div>
                </div>

                <div className="form-group">
                  <label className="form-label">COURT NAME</label>
                  <div className="disabled-field">{selectedCourt.name}</div>
                  {errors.court && (
                    <span className="error-message">{errors.court}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">OPERATING HOURS</label>
                  <div className="disabled-field">{selectedCourt.hours}</div>
                </div>

                <div className="form-group">
                  <label className="form-label">DATE</label>
                  <div
                    className={`date-field ${errors.bookingDate ? "input-error" : ""}`}
                  >
                    <input
                      className="date-input"
                      type="date"
                      min={getToday()}
                      value={bookingDate}
                      onChange={(e) => {
                        setBookingDate(e.target.value);
                        setErrors((cur) => ({ ...cur, bookingDate: "" }));
                      }}
                    />
                  </div>
                  {errors.bookingDate && (
                    <span className="error-message">{errors.bookingDate}</span>
                  )}
                </div>
              </div>
            </section>

            <section className="summary-card rental-card">
              <div className="rental-header">
                <div className="section-title">
                  <Inventory2OutlinedIcon className="section-icon" />
                  <h2 className="section-heading">Rental Items</h2>
                </div>
              </div>

              <button
                type="button"
                className="equipment-button"
                onClick={() => setShowItemSelector(true)}
              >
                <AddCircleOutlineIcon />
                <span>Select Equipment</span>
              </button>

              <div className="items-table">
                <div className="table-header">
                  <span>Item Details</span>
                  <span>Qty</span>
                  <span>Department</span>
                  <span>Price</span>
                  <span></span>
                </div>

                {items.length === 0 && (
                  <div className="empty-items">
                    <Inventory2OutlinedIcon />
                    <span>No rental items selected</span>
                    <small>Click "Select from Equipment" to add items</small>
                  </div>
                )}

                {items.map((item) => (
                  <div className="item-row" key={item.id}>
                    <div className="item-name">{item.name}</div>
                    <div className="quantity-control">
                      <button
                        type="button"
                        className="quantity-button"
                        onClick={() => handleDecrease(item.id)}
                      >
                        <RemoveIcon fontSize="small" />
                      </button>
                      <span className="quantity-number">{item.qty}</span>
                      <button
                        type="button"
                        className="quantity-button"
                        onClick={() => handleIncrease(item.id)}
                      >
                        <AddIcon fontSize="small" />
                      </button>
                    </div>
                    <div className="item-category">{item.category}</div>
                    <div className="item-price">
                      {formatPrice(item.price * item.qty)} Ks
                    </div>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <DeleteOutlineIcon />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="right-column">
            <section className="summary-card">
              <h2 className="summary-title">TOTAL AMOUNT</h2>
              <div className="summary-row">
                <span>Court Fee (1 day)</span>
                <span>{formatPrice(courtFee)} Ks</span>
              </div>
              <div className="summary-row">
                <span>Rental Equipment</span>
                <span>{formatPrice(equipmentTotal)} Ks</span>
              </div>
              <div className="summary-divider" />
              <div className="total-row">
                <span>Total</span>
                <strong>{formatPrice(totalAmount)} Ks</strong>
              </div>
            </section>

            <section className="payment-card">
              <div className="payment-title">
                <PaymentOutlinedIcon className="payment-icon" />
                <h2 className="payment-heading">Payment Details</h2>
              </div>

              <div className="payment-group">
                <label className="form-label">PAYMENT METHOD</label>
                <div
                  className={`select-wrapper ${errors.paymentMethod ? "input-error" : ""}`}
                >
                  <select
                    className="select-input"
                    value={paymentMethod}
                    onChange={handlePaymentMethodChange}
                  >
                    {paymentAccounts.map((account) => (
                      <option key={account.id} value={account.payment_method}>
                        {account.payment_method}
                      </option>
                    ))}
                  </select>
                  <ExpandMoreIcon className="select-icon" />
                </div>
                {errors.paymentMethod && (
                  <span className="error-message">{errors.paymentMethod}</span>
                )}
              </div>

              <div className="payment-group">
                <label className="form-label">PAYMENT INFO</label>
                {paymentMethod === "Cash" ? (
                  <div className="cash-payment-box">
                    <CheckCircleOutlineIcon className="cash-icon" />
                    <span className="cash-title">Cash Payment</span>
                    <span className="cash-subtitle">
                      Receipt upload is not required
                    </span>
                  </div>
                ) : (
                  <div className="payment-info">
                    <div className="info-row">
                      <span>Agent Name</span>
                      <strong>{selectedPayment?.payment_name || "-"}</strong>
                    </div>
                    <div className="info-row">
                      <span>Agent Number</span>
                      <strong>{selectedPayment?.payment_number || "-"}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="payment-group">
                <label className="form-label">PAYMENT RECEIPT</label>
                {paymentMethod === "Cash" ? (
                  <div className="cash-receipt-disabled">
                    <CheckCircleOutlineIcon />
                    <span>Receipt upload is disabled for Cash</span>
                  </div>
                ) : !receipt ? (
                  <label
                    className={`upload-box ${errors.receipt ? "upload-error" : ""}`}
                  >
                    <input
                      className="hidden-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                    />
                    <CloudUploadOutlinedIcon className="upload-icon" />
                    <span className="upload-title">Click to upload</span>
                    <span className="upload-subtitle">Payment receipt</span>
                  </label>
                ) : (
                  <div className="receipt-preview">
                    <img
                      className="receipt-image"
                      src={receipt.preview}
                      alt="Payment receipt"
                    />
                    <div className="receipt-details">
                      <span className="receipt-name">{receipt.name}</span>
                      <button
                        type="button"
                        className="remove-receipt-button"
                        onClick={handleRemoveReceipt}
                      >
                        <CloseIcon fontSize="small" />
                      </button>
                    </div>
                  </div>
                )}
                {errors.receipt && (
                  <span className="error-message">{errors.receipt}</span>
                )}
              </div>
            </section>

            <div className="action-buttons">
              {errors.booking && (
                <span className="error-message">{errors.booking}</span>
              )}
              <button
                type="button"
                className="cancel-button"
                disabled={isSubmitting}
                onClick={handleReset}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`confirm-button ${isSubmitting ? "confirm-button-loading" : ""}`}
                disabled={isSubmitting}
                onClick={handleCreateBooking}
              >
                {isSubmitting ? (
                  <div className="loading-content">
                    <span className="loading-spinner"></span>
                    <span>Please wait...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircleOutlineIcon />
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>
            </div>
          </aside>
        </div>
      </main>

      {showItemSelector && (
        <div
          className="modal-overlay"
          onClick={() => setShowItemSelector(false)}
        >
          <div className="item-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Select Equipment</h2>
                <span className="modal-subtitle">Choose an item to add</span>
              </div>
              <button
                type="button"
                className="modal-close-button"
                onClick={() => setShowItemSelector(false)}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="item-selector-list">
              {currentItems.map((item) => {
                const alreadyAdded = items.some(
                  (currentItem) => currentItem.id === item.id,
                );
                return (
                  <button
                    type="button"
                    className="selector-item"
                    key={item.id}
                    onClick={() => handleAddItem(item)}
                  >
                    <div className="selector-icon">
                      <Inventory2OutlinedIcon />
                    </div>
                    <div className="selector-info">
                      <strong>{item.name}</strong>
                      <span>{formatPrice(item.price)} Ks</span>
                    </div>
                    {alreadyAdded && (
                      <span className="already-added">Added</span>
                    )}
                    <AddIcon className="selector-add-icon" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && createdBooking && (
        <div className="success-overlay">
          <div className="success-popup">
            <button
              type="button"
              className="success-close-button"
              onClick={handleCloseSuccess}
            >
              <CloseIcon />
            </button>
            <div className="success-icon-box">
              <CheckCircleOutlineIcon />
            </div>
            <h2 className="success-popup-title">Booking Created!</h2>
            <p className="success-popup-text">
              Your booking has been created successfully.
            </p>
            <div className="success-booking-id">
              <span className="success-id-label">BOOKING ID</span>
              <strong className="success-id-value">
                {createdBooking.bookingId}
              </strong>
            </div>

            <div className="success-info">
              <div className="success-info-row">
                <span>Customer</span>
                <strong>{createdBooking.customer.name}</strong>
              </div>
              <div className="success-info-row">
                <span>Court</span>
                <strong>{createdBooking.venue.court}</strong>
              </div>
              <div className="success-info-row">
                <span>Date</span>
                <strong>{formatDate(createdBooking.date)}</strong>
              </div>
              <div className="success-info-row">
                <span>Payment</span>
                <strong>{createdBooking.payment.method}</strong>
              </div>
              <div className="success-info-row success-total-row">
                <span>Total</span>
                <strong>
                  {formatPrice(createdBooking.pricing.totalAmount)} Ks
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="success-done-button"
              onClick={handleCloseSuccess}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WalkBooking;
