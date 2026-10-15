import SearchIcon from "@mui/icons-material/SearchSharp";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import "../classCss/classbookinglist.css";
import { useGetClassBooking } from "../ClassApi";
import { useEffect, useState, useContext } from "react";
import Default from "../images/Vector.png";
import { useClassReceipt } from "./ClassReceipt";
import { useNoti } from "../Hooks/alert";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { useTableFooter } from "../Hooks/tablefooter";
import { useOutletContext } from "react-router-dom";
import { Context } from "../Hooks/context";

function ClassMobileBooking() {
  const contextData = useContext(Context);
  const outletContext = useOutletContext();
  const isDark =
    outletContext?.isDark ?? contextData?.classBackColor === "#1A1C1E";

  const [text, settext] = useState("");
  const [filtered, setfiltered] = useState(null);

  const { GetMobileBooking, ClassMobileBookings } = useGetClassBooking();
  const { open, ClassReceipetJsx } = useClassReceipt();
  const { Loading, openloading, openconfirm, openerror, opensuccess, close } =
    useNoti();
  const { TableFooterJsx, startnumber, endnumber } = useTableFooter(filtered);

  useEffect(() => {
    GetMobileBooking();
  }, []);

  useEffect(() => {
    let result = ClassMobileBookings?.data;
    if (Array.isArray(result) && result.length > 0) {
      if (text.trim() != "") {
        result = result.filter((item) => {
          return (
            item.venue_name.toLowerCase().includes(text.toLowerCase()) ||
            item.court_name.toLowerCase().includes(text.toLowerCase()) ||
            item.Customer.toLowerCase().includes(text.toLowerCase()) ||
            item.payment_method.toLowerCase().includes(text.toLowerCase())
          );
        });
      }
    }
    setfiltered(result);
  }, [text, ClassMobileBookings?.data]);

  const changetext = (e) => {
    settext(e.target.value);
  };

  function formatTimeSlot(start, end) {
    if (!start || !end) return "-";
    return `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
  }

  function show_reciept(item) {
    let rental_fee = 0;
    if (Array.isArray(item.items) && item.items.length > 0) {
      rental_fee = item.items.reduce((total, current) => {
        return total + Number(current.price) * Number(current.quantity);
      }, 0);
    }
    open(
      {
        order_no: item.id.toString().padStart(4, "0"),
        payment: item?.payment_method || "Cash",
        Date: item?.date,
        Time: new Date(item.create_at).toLocaleTimeString(),
        court_fee: item?.Court_Fee || 0,
        rental_fee: rental_fee,
        total_amount: item?.Total || 0,
      },
      isDark, // <--- ဒီမှာ isDark ကို ထည့်ပေးလိုက်ပါ
    );
    open({
      order_no: item.id.toString().padStart(4, "0"),
      payment: item?.payment_method || "Cash",
      Date: item?.Date,
      start_time: item?.start_time,
      end_time: item?.end_time,
      court_fee: item?.Court_Fee || 0,
      rental_fee: rental_fee,
      total_amount: item?.Total || 0,
      items: item.items || [],
    });
  }

  async function ExportTable() {
    //  alert("Please Read the documentation(document.txt) or comment");
    if (!filtered) return;
    return;
  }

  const showImagePreview = (imageUrl) => {
    if (!imageUrl) return;
    Swal.fire({
      imageUrl: imageUrl,
      imageAlt: "Payment Proof",
      showConfirmButton: false,
      showCloseButton: false,
      background: isDark ? "#1e1e1e" : "#ffffff",
      customClass: {
        image: "preview-image-style",
      },
    });
  };

  return (
    <div className={`mbmain ${isDark ? "dark-mode" : ""}`}>
      {ClassReceipetJsx}
      {Loading}
      <div className="mb1">
        <h2 style={{ color: isDark ? "#ffffff" : "#111827" }}>
          Top Booking (Mobile)
        </h2>
        <div
          className="mb2"
          style={{
            backgroundColor: isDark ? "#2a2d32" : "#ffffff",
            border: `1px solid ${isDark ? "#3f444e" : "#ccc"}`,
          }}
        >
          <input
            type="search"
            placeholder="Search..."
            onChange={changetext}
            style={{
              color: isDark ? "#ffffff" : "#000000",
              backgroundColor: "transparent",
            }}
          />
          <SearchIcon sx={{ color: isDark ? "#94a3b8" : "gray" }} />
        </div>
        <button
          onClick={() => ExportTable()}
          style={{ background: isDark ? "#2563eb" : "#0D1B2A", color: "#fff" }}
        >
          <SaveAltIcon sx={{ fontSize: "20px" }} />
          Export
        </button>
      </div>
      <div className="mobilebookingtablewaper">
        <div className="mb3">
          <table
            className="mb4"
            style={{
              color: isDark ? "#e2e8f0" : "#111827",
            }}
          >
            <thead
              style={{
                backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
                color: isDark ? "#f8fafc" : "#000000",
              }}
            >
              <tr>
                <th>
                  Booking <br />
                  No
                </th>
                <th>Customer</th>
                <th>
                  Venue /<br /> Court
                </th>
                <th>Equipment</th>
                <th>
                  Date / <br />
                  Time Slot
                </th>
                <th>
                  Total <br /> amount
                </th>
                <th>Payment</th>
                <th>
                  Payment <br /> Proof
                </th>
                <th style={{ textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(filtered) ? (
                filtered.length > 0 ? (
                  filtered.slice(startnumber, endnumber).map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>#{item.id.toString().padStart(4, "0")}</td>
                        <td>{item.Customer}</td>
                        <td>
                          {item.venue_name}/ <br />
                          {item.court_name}
                        </td>
                        <td className="specialrow">
                          {Array.isArray(item.items) && item.items.length > 0
                            ? item.items
                                .map((childitem) =>
                                  childitem.equipment
                                    ? childitem.equipment
                                    : "-----------------",
                                )
                                .join(", ")
                            : "--------------"}
                        </td>
                        <td>
                          {item.Date}
                          <br />
                          {formatTimeSlot(item.start_time, item.end_time)}
                        </td>
                        <td>{item.Total} ks</td>
                        <td>{item.payment_method}</td>
                        <td>
                          <div className="specialdiv">
                            <img
                              src={item.payment_image_url || Default}
                              onClick={() =>
                                showImagePreview(item.payment_image_url)
                              }
                              alt="proof"
                            />
                          </div>
                        </td>
                        <td>
                          <div className="specialdiv1">
                            <button
                              onClick={() => show_reciept(item)}
                              style={{
                                border: "1.5px solid #16a34a",
                                background: "transparent",
                                color: "#16a34a",
                                borderRadius: "6px",
                                cursor: "pointer",
                              }}
                            >
                              view
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} style={{ textAlign: "center" }}>
                      no result found..
                    </td>
                  </tr>
                )
              ) : (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center" }}>
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ClassMobileBooking;
