import CustomerLoading from "../Components/loadingcustomer";
import BackIcon from "@mui/icons-material/ArrowCircleLeftRounded";
import FoodIcon from "@mui/icons-material/LocalDiningRounded";
import "./addorder.css";
import { useContext, useEffect, useRef, useState } from "react";
import AddorderProduct from "../Components/addorderproudct";
import PaymentIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import RemoveIcon from "@mui/icons-material/RemoveShoppingCartRounded";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import toast, { Toaster } from "react-hot-toast";
import { createPortal } from "react-dom";
import { Context } from "../Hooks/context";
import { useNavigate } from "react-router-dom";
import { useReceipt } from "../Components/Receipt";
import { useGetOrder, useGetPayment } from "../Api_Call";
import { useNoti } from "../Hooks/alert";

function AddOrder() {
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

  // Context မှ backcolor ယူယူပြီး Dark Mode စစ်ဆေးခြင်း
  const { Token, backcolor } = useContext(Context);
  const isDarkMode = Boolean(backcolor === "#1A1C1E");

  const { Payment, Products, GetPayment, Tax, GetTax } = useGetPayment();
  const { Loading, openconfirm, openerror, openloading, opensuccess, close } =
    useNoti();
  const { GetLocalOrders } = useGetOrder();
  const { ReceipetJsx, open } = useReceipt();

  const navigate = useNavigate();

  useEffect(() => {
    GetPayment();
    GetTax();
  }, []);

  useEffect(() => {
    if (childdata.length > 0 && filetosend) {
      setallow(false);
    } else {
      setallow(true);
    }
  }, [childdata, filetosend]);

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
        return total + item.price * qty;
      }, 0);
      setamount(totalprice);
    } else setamount(0);
  }, [childdata, cart]);

  useEffect(() => {
    if (Array.isArray(Payment.result) && Payment.result.length > 0) {
      let result = Payment.result.find((a) => a.payment_method == payment);
      if (result) {
        setname(result.payment_name || "-----");
        setnumber(result.payment_number || "------");
      }
    }
  }, [Payment.result, payment]);

  function updateQty(id, amount) {
    setCart((prev) => {
      let curqty = prev[id] || 1;
      let newqty = curqty + amount;

      if (newqty <= 0) {
        let newqty = { ...prev };
        delete newqty[id];
        return newqty;
      }
      return { ...prev, [id]: newqty };
    });
  }

  function show_receipet() {
    let TAX = Tax.result[0].tax || 1;
    let curtax = (amount / 100) * Number(TAX);
    let newchildData = childdata.map((item) => {
      let qty = cart[item.id] !== undefined ? cart[item.id] : 1;
      return {
        ...item,
        quantity: qty,
      };
    });

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
  }

  function remove_item(id) {
    let result = childdata.filter((item) => {
      return item.id != id;
    });
    setchilddata(result);
  }

  const handleFileChange = (event) => {
    const selected_file = event.target.files[0];
    setfiletosend(selected_file);
    if (selected_file) {
      const url = URL.createObjectURL(selected_file);
      setfile(url);
    }
  };

  async function add_order() {
    let delta = childdata.map((item) => {
      let qty = cart[item.id] !== undefined ? cart[item.id] : 1;
      return { product_id: item.id, quantity: qty };
    });

    let formData = new FormData();

    if (filetosend) {
      formData.append("payment_image", filetosend);
    }

    formData.append("reciept_no", reciept);
    formData.append("payment_method", paymentref.current.value);
    formData.append("items", JSON.stringify(delta));
    openloading();
    try {
      let response = await fetch((import.meta.env.VITE_BASE_URL + "/api/order/addorder"), {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        opensuccess("Action Successful", "New Order added successfully");
        await GetLocalOrders();

        show_receipet();
        setchilddata([]);
        setfiletosend(null);
        setfile(null);
        setCart({});
      } else {
        openerror("Something went wrong");
      }
    } catch (err) {
      openerror("Cannot connect with sever");
      console.log(err);
    }
  }

  function paymentchange(event) {
    setpayment(event.target.value);
  }

  return createPortal(
    <div className={`addordermain ${isDarkMode ? "dark-mode" : ""}`}>
      {Loading}
      {ReceipetJsx}
      <div className="addordernav">
        <button className="btn-back" onClick={() => navigate("/posorder")}>
          <BackIcon
            sx={{
              color: "#F8FAFC",
              fontSize: "28px",
            }}
          />
        </button>
      </div>
      <div className="addorderbody">
        <h3 className="addordertitle">Create New Order</h3>
        <div className="addorderbody1">
          <div className="addorderreciept">
            <p>Receipt No</p>
            <span>{reciept}</span>
          </div>
          <div className="addorderamount">
            <p>Total amount</p>
            <h2>
              {amount.toLocaleString()} <label htmlFor="h2">ks</label>
            </h2>
          </div>
        </div>
        <div className="addorderbody2">
          <div className="addorderchoice">
            <span className="addorderchoiceheader">
              <p className="addorderchoiceheader1">
                <FoodIcon sx={{ color: "#ef4444", fontSize: "20px" }} />
                Order items
              </p>
              <button
                className="addorderchoiceheader2"
                onClick={() => setshow(true)}
              >
                + select items form product
              </button>
            </span>

            <div className="toorder">
              <div className="toorderheader">
                <p>Item Details</p>
                <p>Qty</p>
                <p>Price</p>
              </div>
              {childdata?.length > 0 ? (
                childdata.map((item, index) => {
                  return (
                    <div className="toorderbody" key={index}>
                      <span className="toorderchild">
                        <div>
                          <img src={item.images} alt="" />
                        </div>
                        <p>{item.productName}</p>
                      </span>
                      <span className="toorderchild1">
                        <button onClick={() => updateQty(item.id, -1)}>
                          -
                        </button>
                        <p>{cart[item.id] || 1}</p>
                        <button onClick={() => updateQty(item.id, 1)}>+</button>
                      </span>
                      <p className="toorderchild2">
                        {item.price?.toLocaleString()} ks
                        <button onClick={() => remove_item(item.id)}>
                          <RemoveIcon sx={{ fontSize: "20px" }} />
                        </button>
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="empty-state">No Product Choose Yet...</p>
              )}
            </div>
          </div>

          <div className="orderprint">
            <div className="orderprint1">
              <p className="orderprintheader">
                <PaymentIcon sx={{ color: "#ef4444" }} />
                Payment Details
              </p>
              <div className="ssx">
                <label htmlFor="input">Payment Method</label>
                <select ref={paymentref} onChange={paymentchange}>
                  {Array.isArray(Payment.result) &&
                  Payment.result.length > 0 ? (
                    Payment.result.map((item, index) => {
                      return (
                        <option key={index} value={item.payment_method}>
                          {item.payment_method}
                        </option>
                      );
                    })
                  ) : (
                    <option value="no data" disabled>
                      No Data....
                    </option>
                  )}
                </select>
              </div>
              <span className="paymentmain">
                <label>Payment Details</label>
                <div className="paymentwarper">
                  <span>
                    <p>{payment == "Cash" ? "--------" : `${payment} name`}</p>
                    <p>{name}</p>
                  </span>
                  <span>
                    <p>
                      {payment == "Cash" ? "---------" : `${payment} number`}
                    </p>
                    <p>{number}</p>
                  </span>
                </div>
              </span>
              <div
                className="addorderreceipet"
                onClick={() => imgref.current.click()}
              >
                {file ? (
                  <img src={file} alt="paymentrecepit" className="receipet" />
                ) : (
                  <>
                    <UploadFileIcon />
                    <p>
                      Click to Upload <br />
                      receipet
                    </p>
                  </>
                )}
                <input
                  type="file"
                  style={{ display: "none" }}
                  ref={imgref}
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <span className="addorderbtn">
              <button onClick={() => navigate("/posorder")}>cancel</button>
              <button
                disabled={allow}
                onClick={add_order}
                className="btn-create"
              >
                Create
              </button>
            </span>
          </div>
        </div>
      </div>
      {show && (
        <AddorderProduct
          data={{ fun1: setchilddata, fun2: setshow, amount: amount }}
        />
      )}
    </div>,
    document.body,
  );
}

export default AddOrder;
