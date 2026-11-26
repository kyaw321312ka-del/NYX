import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import DeleteIcon from "@mui/icons-material/DeleteForeverOutlined";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import { useContext, useRef, useState, useEffect } from "react";
import "./cssFolder/posorder.css";
import CloseIcon from "@mui/icons-material/Close";
import { Context } from "./Hooks/context";
import Swal from "sweetalert2";
import TableLoading from "./Components/tableloading";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import toast, { Toaster } from "react-hot-toast";
import CustomerLoading from "./Components/loadingcustomer";
import MobileOrder from "./Routes/mobileorder";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useGetOrder } from "./Api_Call";

// Icons သစ်များ ထပ်တိုးထည့်သွင်းခြင်း
import AccountCircleIcon from "@mui/icons-material/AccountCircleOutlined";
import PaidIcon from "@mui/icons-material/PaidOutlined";
import InventoryIcon from "@mui/icons-material/Inventory2Outlined";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBagOutlined";

function PosOrder() {
  const [show, setshow] = useState(false);
  const [img, setimg] = useState(null);
  const [orderStats, setOrderStats] = useState([
    { title: "Total Order", amount: "0", lastorder: "0" },
    { title: "Total Revenue", amount: "0", lastorder: "0" },
    { title: "Total Product", amount: "0", lastorder: "0" },
    { title: "Total Customer", amount: "0", lastorder: "0" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const recepitimg = useRef();
  const nameref = useRef();
  const amountref = useRef();
  const paymentref = useRef();

  const navigate = useNavigate();

  const { OrderHeader, GetOrderHeader } = useGetOrder();
  const { backcolor, Token } = useContext(Context);

  const isDarkMode = Boolean(backcolor === "#1A1C1E");

  // Modern Dynamic UI Colors & Theme Styles
  const themeStyles = {
    color: isDarkMode ? "#F8FAFC" : "#0F172A",
    subText: isDarkMode ? "#94A3B8" : "#64748B",
    cardBg: isDarkMode ? "#1E293B" : "#FFFFFF",
    borderColor: isDarkMode ? "#334155" : "#E2E8F0",
    pageBg: isDarkMode ? "#0F172A" : "#F8FAFC",
    buttonBg: isDarkMode ? "#F8FAFC" : "#0F172A",
    buttonText: isDarkMode ? "#0F172A" : "#FFFFFF",
  };

  const FontStyle = { color: themeStyles.color };
  const ButtonStyle = {
    color: themeStyles.buttonText,
    backgroundColor: themeStyles.buttonBg,
  };

  // Card တစ်ခုချင်းစီအလိုက် Icon သတ်မှတ်ပေးသည့် Function
  const getCardIcon = (title) => {
    const iconStyle = { fontSize: "24px" };
    switch (title) {
      case "Total Order":
        return <ShoppingBagIcon style={{ ...iconStyle, color: "#3B82F6" }} />;
      case "Total Revenue":
        return <PaidIcon style={{ ...iconStyle, color: "#10B981" }} />;
      case "Total Product":
        return <InventoryIcon style={{ ...iconStyle, color: "#F59E0B" }} />;
      case "Total Customer":
        return <AccountCircleIcon style={{ ...iconStyle, color: "#EC4899" }} />;
      default:
        return <ShoppingBagIcon style={{ ...iconStyle, color: "#3B82F6" }} />;
    }
  };

  // Card တစ်ခုချင်းစီအလိုက် Icon Background Color သတ်မှတ်ခြင်း
  const getIconBg = (title) => {
    switch (title) {
      case "Total Order":
        return isDarkMode ? "rgba(59,130,246,0.15)" : "#EFF6FF";
      case "Total Revenue":
        return isDarkMode ? "rgba(16,185,129,0.15)" : "#ECFDF5";
      case "Total Product":
        return isDarkMode ? "rgba(245,158,11,0.15)" : "#FEF3C7";
      case "Total Customer":
        return isDarkMode ? "rgba(236,72,153,0.15)" : "#FDF2F8";
      default:
        return isDarkMode ? "rgba(59,130,246,0.15)" : "#EFF6FF";
    }
  };

  const fetchOrderStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/order/totalResult`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch order statistics");
      }
      const jsonResult = await response.json();

      if (jsonResult.status === "success" && jsonResult.totalResult) {
        const { total_order, total_revenue, total_product, total_customer } =
          jsonResult.totalResult;

        setOrderStats([
          {
            title: "Total Order",
            amount: total_order?.toString() || "0",
            lastorder: "0",
          },
          {
            title: "Total Revenue",
            amount: `${total_revenue?.toLocaleString() || 0} ks`,
            lastorder: "0",
          },
          {
            title: "Total Product",
            amount: total_product?.toString() || "0",
            lastorder: "0",
          },
          {
            title: "Total Customer",
            amount: total_customer?.toString() || "0",
            lastorder: "0",
          },
        ]);
      } else {
        throw new Error("Invalid data format");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching order statistics:", err);
      toast.error("Failed to load order statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderStatistics();
  }, []);

  if (loading) {
    return (
      <div
        className="ordermain"
        style={{ backgroundColor: themeStyles.pageBg }}
      >
        <Toaster />
        <div className="orderheader" style={FontStyle}>
          <h2 style={{ fontSize: "22px", fontWeight: "700" }}>
            <AssignmentIcon style={{ marginRight: "8px" }} /> Orders
          </h2>
          <button
            className="addorderbutton"
            onClick={() => navigate("posaddorder")}
            style={ButtonStyle}
          >
            + Add Order
          </button>
        </div>
        <div className="orderbody">
          {[1, 2, 3, 4].map((_, index) => (
            <div key={index} className="orderitem-skeleton">
              <div
                className="loading-skeleton"
                style={{ height: "100%", width: "100%", borderRadius: "12px" }}
              ></div>
            </div>
          ))}
        </div>
        <div className={isDarkMode ? "OrderswitchD" : "Orderswitch"}>
          <NavLink to="mobileorder">Mobile Order</NavLink>
          <NavLink to="localorder">Local Order</NavLink>
        </div>
        <div className="posfooter">
          <Outlet />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="ordermain"
        style={{ backgroundColor: themeStyles.pageBg }}
      >
        <Toaster />
        <div className="orderheader" style={FontStyle}>
          <h2 style={{ fontSize: "22px", fontWeight: "700" }}>
            <AssignmentIcon style={{ marginRight: "8px" }} /> Orders
          </h2>
          <button
            className="addorderbutton"
            onClick={() => navigate("posaddorder")}
            style={ButtonStyle}
          >
            + Add Order
          </button>
        </div>
        <div className="orderbody">
          <div
            className="order-error-card"
            style={{
              borderColor: themeStyles.borderColor,
              backgroundColor: themeStyles.cardBg,
            }}
          >
            <p style={{ color: "#ef4444", fontWeight: "500" }}>
              Error: {error}
            </p>
            <button onClick={fetchOrderStatistics} className="retry-btn">
              Retry
            </button>
          </div>
        </div>
        <div className={isDarkMode ? "OrderswitchD" : "Orderswitch"}>
          <NavLink to="mobileorder">Mobile Order</NavLink>
          <NavLink to="localorder">Local Order</NavLink>
        </div>
        <div className="posfooter">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="ordermain"
        style={{ backgroundColor: themeStyles.pageBg, minHeight: "100vh" }}
      >
        <Toaster />
        <div className="orderheader" style={FontStyle}>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
            }}
          >
            <AssignmentIcon style={{ marginRight: "8px", fontSize: "24px" }} />{" "}
            Orders
          </h2>
          <button
            className="addorderbutton"
            onClick={() => navigate("posaddorder")}
            style={ButtonStyle}
          >
            + Add Order
          </button>
        </div>

        {/* Modern Clean Statistics Cards Section */}
        <div className="orderbody">
          {orderStats.map((item, index) => {
            return (
              <div
                key={index}
                className="orderitem"
                style={{
                  backgroundColor: themeStyles.cardBg,
                  border: `1px solid ${themeStyles.borderColor}`,
                }}
              >
                <div className="card-content-left">
                  <p style={{ color: themeStyles.subText }}>{item.title}</p>
                  <h4 style={{ color: themeStyles.color }}>{item.amount}</h4>
                </div>
                <div
                  className="card-icon-right"
                  style={{ backgroundColor: getIconBg(item.title) }}
                >
                  {getCardIcon(item.title)}
                </div>
              </div>
            );
          })}
        </div>

        <div className={isDarkMode ? "OrderswitchD" : "Orderswitch"}>
          <NavLink to="mobileorder">Mobile Order</NavLink>
          <NavLink to="localorder">Local Order</NavLink>
        </div>

        <div className="posfooter">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default PosOrder;
