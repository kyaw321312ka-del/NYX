import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { createPortal } from "react-dom";
import { Toaster } from "react-hot-toast";

// Icons
import BackIcon from "@mui/icons-material/ArrowCircleLeftRounded";
import FoodIcon from "@mui/icons-material/LocalDiningRounded";
import PaymentIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import RemoveIcon from "@mui/icons-material/RemoveShoppingCartRounded";
import UploadFileIcon from "@mui/icons-material/UploadFile";

// Hooks & Components
import { Context } from "../Hooks/context";
import { useReceipt } from "../Components/Receipt";
import { useGetOrder, useGetPayment } from "../Api_Call";
import { useNoti } from "../Hooks/alert";
import AddOrderMenu from "./addmenuorder";
import "./addmenu.css";

function AddMenu() {
  const { classBackColor } = useContext(Context);
  const isDark = classBackColor?.toLowerCase() === "#1a1c1e";

  const [reciept, setreciept] = useState();
  const [amount, setamount] = useState(0);
  const [cart, setCart] = useState({});
  const [show, setshow] = useState(false);
  const [childdata, setchilddata] = useState([]);
  const [file, setfile] = useState(null);
  const [filetosend, setfiletosend] = useState(null);
  const [allow, setallow] = useState(true);
  const [payment, setpayment] = useState("Cash");
  const [name, setname] = useState("-------");
  const [number, setnumber] = useState("-------");

  const imgref = useRef();
  const paymentref = useRef();

  const { Payment, Products, GetPayment, Tax, GetTax } = useGetPayment();
  const { Loading, openloading, openerror, opensuccess, close } = useNoti();
  const { GetOrder } = useOutletContext();
  const { ReceipetJsx, open } = useReceipt();
  const navigate = useNavigate();

  useEffect(() => {
    GetPayment();
    GetTax();
  }, []);

  useEffect(() => {
    setallow(childdata.length === 0);
  }, [childdata]);

  useEffect(() => {
    setreciept(Date.now());
  }, [childdata]);

  useEffect(() => {
    const totalprice = childdata.reduce((total, item) => {
      const qty = cart[item.id] || 1;
      return total + item.price * qty;
    }, 0);
    setamount(totalprice);
  }, [childdata, cart]);

  useEffect(() => {
    const result = Payment.result?.find((a) => a.payment_method === payment);
    setname(result?.payment_name || "-------");
    setnumber(result?.payment_number || "-------");
  }, [Payment.result, payment]);

  // Functions
  const updateQty = (id, amount) => {
    setCart((prev) => {
      const curqty = prev[id] || 1;
      const newqty = curqty + amount;
      if (newqty <= 0) {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      }
      return { ...prev, [id]: newqty };
    });
  };

  const remove_item = (id) => {
    setchilddata(childdata.filter((item) => item.id !== id));
  };

  const handleFileChange = (event) => {
    const selected_file = event.target.files[0];
    if (selected_file) {
      setfiletosend(selected_file);
      setfile(URL.createObjectURL(selected_file));
    }
  };

  const show_receipet = () => {
    const TAX = Tax.result?.[0]?.tax || 1;
    const curtax = (amount / 100) * Number(TAX);
    const newchildData = childdata.map((item) => ({
      ...item,
      productName: item.name,
      quantity: cart[item.id] || 1,
    }));

    open({
      order_no: reciept,
      payment: paymentref.current.value,
      items: newchildData,
      item_Qty: childdata.length,
      item_amount: Math.trunc(amount),
      tax: Math.trunc(curtax),
      dfee: 0,
      total_amount: Math.trunc(amount + curtax),
    });
  };

  async function add_order() {
    const delta = childdata.map((item) => ({
      product_id: item.id,
      quantity: cart[item.id] || 1,
    }));

    const formData = new FormData();
    if (filetosend) formData.append("payment_image", filetosend);
    formData.append("reciept_no", reciept);
    formData.append("payment_method", paymentref.current.value);
    formData.append("items", JSON.stringify(delta));

    try {
      openloading();
      const response = await fetch(
        (import.meta.env.VITE_BASE_URL + "/api/canteenorder/addcanteenorder"),
        {
          method: "POST",
          body: formData,
        },
      );
      if (response.ok) {
        await GetOrder();
        close();
        show_receipet();
        setchilddata([]);
        setfiletosend(null);
        setfile(null);
        setCart({});
      } else {
        openerror("Something went wrong");
      }
    } catch (err) {
      openerror("Cannot connect with server");
    }
  }

  return createPortal(
    <div className={`addordermain ${isDark ? "dark-mode" : ""}`}>
      <Toaster />
      {ReceipetJsx}
      {Loading}

      {/* Header */}
      <div className="addordernav">
        <button onClick={() => navigate(-1)} className="btn-back">
          <BackIcon
            sx={{ fontSize: "30px", color: isDark ? "#ffffff" : "#ffffff" }}
          />
        </button>
        <h3 className="addordertitle">Create New Order</h3>
      </div>

      <div className="addorder-container">
        {/* Top Info Cards */}
        <div className="order-info-cards">
          <div className="info-card">
            <p>Receipt No</p>
            <span>{reciept}</span>
          </div>
          <div className="info-card total-card">
            <p>Total amount</p>
            <h2>
              {amount} <small>Ks</small>
            </h2>
          </div>
        </div>

        <div className="order-grid">
          {/* Left: Items List Section */}
          <div className="order-items-section">
            <div className="section-header">
              <p>
                <FoodIcon sx={{ color: "#ef4444" }} /> Order items
              </p>
              <button onClick={() => setshow(true)}>
                + Select Menus Items
              </button>
            </div>

            {/* 🎯 Table Column Header Bar */}
            <div className="toorderheader">
              <p>Item Details</p>
              <p>Qty</p>
              <p>Price</p>
            </div>

            {/* Items List Rows */}
            <div className="items-list">
              {childdata?.length > 0 ? (
                childdata.map((item, index) => (
                  <div className="toorderbody" key={index}>
                    <div className="toorderchild">
                      <img src={item.image_url} alt={item.name} />
                      <p>{item.productName || item.name}</p>
                    </div>

                    <div className="toorderchild1">
                      <button onClick={() => updateQty(item.id, -1)}>-</button>
                      <span>{cart[item.id] || 1}</span>
                      <button onClick={() => updateQty(item.id, 1)}>+</button>
                    </div>

                    <div className="toorderchild2">
                      <span>{item.price * (cart[item.id] || 1)} Ks</span>
                      <button
                        className="remove-btn"
                        onClick={() => remove_item(item.id)}
                      >
                        <RemoveIcon sx={{ fontSize: "20px" }} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No Product Choose Yet...</div>
              )}
            </div>
          </div>

          {/* Right: Payment Details */}
          <div className="payment-section">
            <p className="section-title">
              <PaymentIcon sx={{ color: "#ef4444" }} /> Payment Details
            </p>

            <div className="payment-form">
              <label>Payment Method</label>
              <select
                ref={paymentref}
                onChange={(e) => setpayment(e.target.value)}
              >
                {Payment.result?.map((item, i) => (
                  <option key={i} value={item.payment_method}>
                    {item.payment_method}
                  </option>
                ))}
              </select>

              <div className="payment-data-box">
                <div>
                  <small>
                    {payment === "Cash" ? "--------" : `${payment} name`}
                  </small>
                  <p>{name}</p>
                </div>
                <div>
                  <small>
                    {payment === "Cash" ? "--------" : `${payment} number`}
                  </small>
                  <p>{number}</p>
                </div>
              </div>

              <div
                className="upload-box"
                onClick={() => imgref.current.click()}
              >
                {file ? (
                  <img src={file} alt="receipt" />
                ) : (
                  <div>
                    <UploadFileIcon />
                    <p>Click to Upload receipt</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={imgref}
                  onChange={handleFileChange}
                  hidden
                />
              </div>
            </div>

            <div className="action-buttons">
              <button
                className="btn-cancel"
                onClick={() => navigate(-1)}
                style={{ padding: "10px 37px" }}
              >
                cancel
              </button>
              <button
                className="btn-create"
                disabled={allow}
                onClick={add_order}
                style={{ padding: "10px 100px" }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>

      {show && (
        <AddOrderMenu data={{ fun1: setchilddata, fun2: setshow, amount }} />
      )}
    </div>,
    document.body,
  );
}

export default AddMenu;
