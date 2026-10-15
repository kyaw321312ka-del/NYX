import BackIcon from "@mui/icons-material/ArrowCircleLeftRounded";
import PaymentIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import RemoveIcon from "@mui/icons-material/RemoveShoppingCartRounded";
import RentalIcon from "@mui/icons-material/Inventory2Outlined";
import StadiumIcon from "@mui/icons-material/StadiumOutlined";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import { useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useGetOrder, useGetPayment } from "../Api_Call";
import { useGetClassVenue } from "../ClassApi";
import { useNoti } from "../Hooks/alert";
import { Context } from "../Hooks/context";
import ClassEquipmentOrder from "./classequipmentorder";
import "./classcreatenewbooking.css";

function ClassCreateBooking({ data }) {
  const { classBackColor } = useContext(Context);
  const isDark = classBackColor?.toLowerCase() === "#1a1c1e";

  const [reciept, setreciept] = useState();
  const [amount, setamount] = useState(0);
  const [total, settotal] = useState(0);
  const [cart, setCart] = useState({});

  const [show, setshow] = useState(false);
  const [childdata, setchilddata] = useState([]);
  const [file, setfile] = useState(null);
  const [filetosend, setfiletosend] = useState(null);

  const [payment, setpayment] = useState(""); // ပထမအစမှာ ဘာမှမရွေးထားစေရန် အလွတ်ထားပါ
  const [name, setname] = useState("-------");
  const [number, setnumber] = useState("-------");
  const [formError, setFormError] = useState(""); // မြင်သာသော Error Message ပြရန် state

  // Success Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const imgref = useRef();
  const paymentref = useRef();
  const { Payment, GetPayment, Tax, GetTax } = useGetPayment();
  const { GetVenue, Courts } = useGetClassVenue();
  const { Loading, openerror, openloading, close } = useNoti();
  const { GetLocalOrders } = useGetOrder();

  const {
    venue_name,
    info,
    date,
    remainbooking,
    targettime,
    settargettime,
    venue_id,
    targettimeid,
    settargettimeid,
    setshowCreate,
    GetRemainBooking,
  } = data;

  useEffect(() => {
    GetVenue();
    GetPayment();
    GetTax();
  }, []);

  useEffect(() => {
    let totalamout = Number(amount) + Number(info?.hourly_price || 0);
    settotal(totalamout);
  }, [amount, info]);

  function randomNum() {
    let random = Date.now();
    setreciept(random);
  }

  useEffect(() => {
    randomNum();
  }, [childdata]);

  useEffect(() => {
    if (childdata.length > 0) {
      let totalprice = childdata.reduce((total, item) => {
        let qty = cart[item.id] !== undefined ? cart[item.id] : 1;
        return total + item.rental_price * qty;
      }, 0);
      setamount(totalprice);
    } else setamount(0);
  }, [childdata, cart]);

  useEffect(() => {
    if (Array.isArray(Payment.result) && Payment.result.length > 0) {
      let result = Payment.result.find((a) => a.payment_method === payment);
      if (result) {
        setname(result.payment_name || "-----");
        setnumber(result.payment_number || "------");
      }
    }
  }, [Payment.result, payment]);

  function updateQty(id, amt) {
    setCart((prev) => {
      let curqty = prev[id] || 1;
      let newqty = curqty + amt;

      if (newqty <= 0) {
        let updated = { ...prev };
        delete updated[id];
        return updated;
      }
      return { ...prev, [id]: newqty };
    });
  }

  function remove_item(id) {
    let result = childdata.filter((item) => item.id !== id);
    setchilddata(result);
  }

  const handleFileChange = (event) => {
    const selected_file = event.target.files[0];
    setfiletosend(selected_file);
    if (selected_file) {
      const url = URL.createObjectURL(selected_file);
      setfile(url);
      setFormError(""); // ပုံထည့်လိုက်တာနဲ့ error ပျောက်သွားမည်
    }
  };

  // Create Booking ခလုတ် နှိပ်ခွင့်ရှိမရှိ စစ်ဆေးသည့် Logic
  const isFormValid =
    targettime !== null &&
    payment !== "" &&
    (payment === "Cash" || filetosend !== null);

  async function add_order() {
    if (!targettimeid || !targettime) {
      setFormError("Please select an available time slot");
      return;
    }

    if (!payment) {
      setFormError("Please select a payment method");
      return;
    }

    if (payment !== "Cash" && !filetosend) {
      setFormError(`Please upload payment receipt image for ${payment}`);
      return;
    }

    setFormError("");

    let delta = childdata.map((item) => {
      let qty = cart[item.id] !== undefined ? cart[item.id] : 1;
      return { equipment_id: item.id, quantity: qty };
    });

    let formData = new FormData();

    if (filetosend) {
      formData.append("payment_image", filetosend);
    }
    formData.append("payment_method", payment);
    formData.append("venue_id", venue_id);
    formData.append("court_id", info?.id);

    formData.append("date", date);
    formData.append("court_time_slot_ids", JSON.stringify([targettimeid]));
    formData.append("reciept_no", reciept);
    formData.append("department", "equipment");
    if (childdata.length > 0) {
      formData.append("items", JSON.stringify(delta));
    }

    try {
      openloading();
      let response = await fetch(import.meta.env.VITE_CLASS_ADD_LOCAL_BOOKING, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        close();
        await GetLocalOrders();
        GetRemainBooking(info?.id, date);

        setReceiptData({
          order_no: reciept,
          payment: payment,
          date: date || new Date().toLocaleDateString(),
          time: targettime || new Date().toLocaleTimeString(),
          venue: venue_name,
          court: info?.court_name,
          court_fee: info?.hourly_price || 0,
          rental_fee: amount,
          total_amount: total,
          items: childdata.map((item) => ({
            name: item.product_name,
            qty: cart[item.id] || 1,
            price: item.rental_price * (cart[item.id] || 1),
          })),
        });

        setShowReceiptModal(true);

        settargettime(null);
        setchilddata([]);
        setfiletosend(null);
        setfile(null);
        setCart({});
      } else {
        close();
        openerror("Something went wrong");
      }
    } catch (err) {
      close();
      openerror("Cannot connect with server");
      console.log(err);
    }
  }

  function paymentchange(event) {
    const val = event.target.value;
    setpayment(val);
    if (val === "Cash" || filetosend) {
      setFormError("");
    } else {
      setFormError("Please upload payment receipt image for " + val);
    }
  }

  const handlePrint = () => {
    if (!receiptData) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const itemsHtml = receiptData.items?.length
      ? `
        <div style="border-bottom: 1px dashed #cbd5e1; margin: 10px 0;"></div>
        <div style="font-weight: 600; color: #64748b; font-size: 11px; margin-bottom: 6px;">RENTAL ITEMS:</div>
        ${receiptData.items
          .map(
            (item) => `
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #334155; margin-bottom: 4px;">
            <span>${item.name} x${item.qty}</span>
            <span>${item.price.toLocaleString()} Ks</span>
          </div>
        `,
          )
          .join("")}
      `
      : "";

    const doc = iframe.contentWindow.document;
    doc.write(`
      <html>
        <head>
          <title>Receipt_${receiptData.order_no}</title>
          <style>
            @page { size: auto; margin: 15mm; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 0; 
              color: #1e293b; 
              background: #fff;
              display: flex;
              justify-content: center;
            }
            .receipt-card {
              width: 320px;
              padding: 20px;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              box-sizing: border-box;
            }
            .title {
              text-align: center;
              font-size: 18px;
              font-weight: 700;
              margin: 0 0 4px 0;
              color: #0f172a;
            }
            .subtitle {
              text-align: center;
              font-size: 12px;
              color: #64748b;
              margin: 0 0 16px 0;
            }
            .divider {
              border-bottom: 1px dashed #cbd5e1;
              margin: 12px 0;
            }
            .row {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              margin-bottom: 8px;
            }
            .label { color: #64748b; font-weight: 500; }
            .val { font-weight: 600; color: #0f172a; }
            .highlight { color: #2563eb; }
            .total-row {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              font-weight: 700;
              padding-top: 8px;
              border-top: 1px solid #e2e8f0;
              margin-top: 8px;
            }
            .total-val { color: #16a34a; }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="title">Booking Successfully!</div>
            <div class="subtitle">Thank you for booking with us</div>
            <div class="divider"></div>
            
            <div class="row"><span class="label">RECEIPT NO</span><span class="val">#${receiptData.order_no}</span></div>
            <div class="row"><span class="label">VENUE</span><span class="val">${receiptData.venue}</span></div>
            <div class="row"><span class="label">COURT</span><span class="val highlight">${receiptData.court}</span></div>
            <div class="row"><span class="label">DATE</span><span class="val">${receiptData.date}</span></div>
            <div class="row"><span class="label">TIME SLOT</span><span class="val">${receiptData.time}</span></div>
            <div class="row"><span class="label">PAYMENT</span><span class="val" style="text-transform: uppercase;">${receiptData.payment}</span></div>
            
            ${itemsHtml}
            
            <div class="divider"></div>
            <div class="row"><span class="label">COURT FEE</span><span class="val">${Number(receiptData.court_fee).toLocaleString()} Ks</span></div>
            <div class="row"><span class="label">RENTAL FEE</span><span class="val">${Number(receiptData.rental_fee).toLocaleString()} Ks</span></div>
            
            <div class="total-row">
              <span>TOTAL AMOUNT</span>
              <span class="total-val">${Number(receiptData.total_amount).toLocaleString()} Ks</span>
            </div>
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

  return createPortal(
    <div className={`createordermain ${isDark ? "dark-mode" : ""}`}>
      {Loading}

      {/* Top Navbar Header */}
      <div className="createordernav">
        <button className="back-nav-btn" onClick={() => setshowCreate(false)}>
          <BackIcon className="back-icon" />
        </button>
        <h3 className="createordertitle">Create New Booking</h3>
      </div>

      <div className="addclassorderbody">
        {/* Left Column */}
        <div className="addclassorderbody1">
          <div className="createorderreciept">
            <p className="reciept-label">Receipt Number</p>
            <span className="reciept-value">{reciept}</span>
          </div>

          <div className="createorderselect">
            <h3 className="aos1">
              <StadiumIcon className="section-icon" />
              Venue & Court Details
            </h3>

            <div className="aos2">
              <span>
                <h5>SPORT TYPE</h5>
                <p className="ccnb">{venue_name || "---"}</p>
              </span>
              <span>
                <h5>COURT NAME</h5>
                <p className="ccnb">{info?.court_name || "---"}</p>
              </span>
              <span>
                <h5>DATE</h5>
                <p className="ccnb">{date || "---"}</p>
              </span>
            </div>

            <h5 className="timeslottitle">AVAILABLE TIME SLOTS</h5>
            <div className="aos3">
              {Array.isArray(remainbooking.data) ? (
                remainbooking.data.length > 0 ? (
                  remainbooking.data.map((item, idx) => {
                    const slotText = `${item.start_time.slice(0, 5)} - ${item.end_time.slice(0, 5)}`;
                    const isSelected = targettime === slotText;
                    return (
                      <p
                        key={idx}
                        className={`timeslot-badge ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          settargettimeid(item.id);
                          settargettime(slotText);
                          setFormError("");
                        }}
                      >
                        {slotText}
                      </p>
                    );
                  })
                ) : (
                  <p className="no-slot">No available slots</p>
                )
              ) : (
                <p className="no-slot">Loading slots...</p>
              )}
            </div>
          </div>

          <div className="addclassorderchoice">
            <div className="createorderchoiceheader">
              <p className="createorderchoiceheader1">
                <RentalIcon className="section-icon" />
                Rental Items
              </p>
              <button
                className="createorderchoiceheader2"
                onClick={() => setshow(true)}
              >
                + Select Equipment
              </button>
            </div>

            <div className="toorder">
              <div className="toorderheader">
                <p>Item Details</p>
                <p>Qty</p>
                <p>Price</p>
              </div>
              <div className="toorderlist">
                {childdata?.length > 0 ? (
                  childdata.map((item, index) => {
                    return (
                      <div className="toorderbody" key={index}>
                        <div className="toorderchild">
                          <p>{item.product_name}</p>
                        </div>
                        <div className="toorderchild1">
                          <button onClick={() => updateQty(item.id, -1)}>
                            -
                          </button>
                          <span>{cart[item.id] || 1}</span>
                          <button onClick={() => updateQty(item.id, 1)}>
                            +
                          </button>
                        </div>
                        <div className="toorderchild2">
                          <p>{item.rental_price * (cart[item.id] || 1)} Ks</p>
                          <button onClick={() => remove_item(item.id)}>
                            <RemoveIcon className="remove-icon" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="empty-cart-text">No Equipment Selected Yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="addclassorderbody2">
          <div className="orderamount">
            <h3>PAYMENT SUMMARY</h3>
            <span>
              <p>Court Fee (1 hour)</p>
              <p>{info?.hourly_price || 0} Ks</p>
            </span>
            <span>
              <p>Rental Items Fee</p>
              <p>{amount} Ks</p>
            </span>
            <div className="total-divider"></div>
            <h2>Total: {total} Ks</h2>
          </div>

          <div className="orderprint">
            <div className="orderprint1">
              <p className="orderprintheader">
                <PaymentIcon className="payment-icon" />
                Payment Options
              </p>

              <div className="ssx">
                <label>Payment Method *</label>
                <select
                  ref={paymentref}
                  value={payment}
                  onChange={paymentchange}
                >
                  <option value="">Select Payment Method</option>
                  <option value="Cash">Cash</option>
                  {Array.isArray(Payment.result) &&
                    Payment.result.map((item, index) => (
                      <option key={index} value={item.payment_method}>
                        {item.payment_method}
                      </option>
                    ))}
                </select>
              </div>

              {payment && payment !== "Cash" && (
                <div className="paymentmain">
                  <label>Account Details</label>
                  <div className="paymentwarper">
                    <span>
                      <p>{payment} Name</p>
                      <p>{name}</p>
                    </span>
                    <span>
                      <p>{payment} Number</p>
                      <p>{number}</p>
                    </span>
                  </div>
                </div>
              )}

              <div
                className={`createorderreceipet ${!payment || payment === "Cash" ? "disabled" : ""}`}
                onClick={() =>
                  payment && payment !== "Cash" && imgref.current.click()
                }
              >
                {file ? (
                  <img src={file} alt="payment receipt" className="receipet" />
                ) : (
                  <>
                    <UploadFileIcon className="upload-icon" />
                    <p>
                      {payment && payment !== "Cash"
                        ? "Click to Upload Receipt Image *"
                        : "Select payment method first"}
                    </p>
                  </>
                )}
                <input
                  type="file"
                  style={{ display: "none" }}
                  ref={imgref}
                  onChange={handleFileChange}
                  disabled={!payment || payment === "Cash"}
                />
              </div>
            </div>

            {/* မြင်သာသော Error Message ပြရန် */}
            {formError && (
              <div
                style={{
                  color: "#ef4444",
                  fontSize: "13px",
                  fontWeight: 600,
                  backgroundColor: isDark
                    ? "rgba(239, 68, 68, 0.15)"
                    : "#fee2e2",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #fecaca",
                  textAlign: "center",
                }}
              >
                ⚠️ {formError}
              </div>
            )}

            <div className="createorderbtn">
              <button
                className="cancel-btn"
                onClick={() => setshowCreate(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={add_order}
                disabled={!isFormValid}
              >
                Create Booking
              </button>
            </div>
          </div>
        </div>
      </div>

      {show && (
        <ClassEquipmentOrder
          data={{
            fun1: setchilddata,
            fun2: setshow,
            amount: amount,
            equipment: Courts.data?.[0]?.equipment,
          }}
        />
      )}

      {/* Booking Successfully Modal */}
      {showReceiptModal && receiptData && (
        <div className="success-modal-backdrop">
          <div className="success-modal-box">
            <button
              onClick={() => {
                setShowReceiptModal(false);
                setshowCreate(false);
              }}
              className="success-modal-close"
            >
              <CloseIcon fontSize="small" />
            </button>

            <div className="success-modal-header">
              <h2>Booking Successfully!</h2>
              <p>Thank you for booking with us</p>
            </div>

            <div className="success-modal-divider"></div>

            {/* Content Section */}
            <div className="success-modal-body">
              <div className="receipt-row">
                <span className="receipt-key">RECEIPT NO</span>
                <span className="receipt-val">#{receiptData.order_no}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-key">VENUE</span>
                <span className="receipt-val">{receiptData.venue}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-key">COURT</span>
                <span className="receipt-val court-highlight">
                  {receiptData.court}
                </span>
              </div>
              <div className="receipt-row">
                <span className="receipt-key">DATE</span>
                <span className="receipt-val">{receiptData.date}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-key">TIME SLOT</span>
                <span className="receipt-val">{receiptData.time}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-key">PAYMENT</span>
                <span className="receipt-val payment-method-text">
                  {receiptData.payment}
                </span>
              </div>

              {receiptData.items?.length > 0 && (
                <>
                  <div className="success-modal-divider-dashed"></div>
                  <span className="rental-items-title">RENTAL ITEMS:</span>
                  {receiptData.items.map((item, idx) => (
                    <div key={idx} className="receipt-sub-row">
                      <span>
                        {item.name} x {item.qty}
                      </span>
                      <span>{item.price.toLocaleString()} Ks</span>
                    </div>
                  ))}
                </>
              )}

              <div className="success-modal-divider-dashed"></div>

              <div className="receipt-row">
                <span className="receipt-key">COURT FEE</span>
                <span className="receipt-val">
                  {Number(receiptData.court_fee).toLocaleString()} Ks
                </span>
              </div>
              <div className="receipt-row">
                <span className="receipt-key">RENTAL FEE</span>
                <span className="receipt-val">
                  {Number(receiptData.rental_fee).toLocaleString()} Ks
                </span>
              </div>

              <div className="receipt-total-row">
                <span className="receipt-total-key">TOTAL AMOUNT</span>
                <span className="receipt-total-val">
                  {Number(receiptData.total_amount).toLocaleString()} Ks
                </span>
              </div>
            </div>

            <div className="success-modal-footer">
              <button onClick={handlePrint} className="modal-print-btn">
                <PrintIcon fontSize="small" /> Print
              </button>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setshowCreate(false);
                }}
                className="modal-close-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}

export default ClassCreateBooking;
