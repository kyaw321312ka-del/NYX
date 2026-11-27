import { useRef, useState } from "react";
import "../styles/class-receipt.css";
import { createPortal } from "react-dom";
import SaveIcon from "@mui/icons-material/SaveAlt";
import CloseIcon from "@mui/icons-material/Close";
import html2canvas from "html2canvas";
import { useReactToPrint } from "react-to-print";

export const useClassReceipt = () => {
  const [show, setshow] = useState(false);
  const [info, setinfo] = useState(null);
  const [isDark, setIsDark] = useState(false); // Dark mode state ထည့်သွင်းခြင်း

  const imgref = useRef();

  // open function တွင် isDarkMode ပါ လက်ခံအောင် ပြင်ဆင်ခြင်း
  const open = (receiptinfo, isDarkMode = false) => {
    setinfo(receiptinfo);
    setIsDark(isDarkMode);
    setshow(true);
  };

  const close = () => {
    setshow(false);
    setinfo(null);
  };

  const print = useReactToPrint({
    contentRef: imgref,
    documentTitle: `Receipt_${info?.order_no || Date.now()}`,
  });

  const download = async () => {
    if (imgref.current) {
      const canvas = await html2canvas(imgref.current, {
        backgroundColor: null,
        scale: 2,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `receipt_${info?.order_no || Date.now()}.png`;
      link.click();
    }
  };

  const ClassReceipetJsx = show
    ? createPortal(
        /* isDark ပေါ်မူတည်၍ dark / dark-mode class ထည့်ပေးခြင်း */
        <div className={`receipetwarper ${isDark ? "dark" : ""}`}>
          <div className="rccmain">
            {/* Top Close Icon */}
            <button className="rc-close-btn" onClick={close}>
              <CloseIcon fontSize="small" />
            </button>

            {/* Printable Area */}
            <div className="rcbody" ref={imgref}>
              <div className="rc1">
                <h3>Order Placed Successfully!</h3>
                <p>Thank you for shopping with us</p>
              </div>
              <div className="rc2">
                <div className="rc21" style={{ width: "50%" }}>
                  <span>
                    <h3>Registration id:</h3>
                    <p>#{info?.order_no || "00000"}</p>
                  </span>
                  <span>
                    <h3>Payment:</h3>
                    <p>{info?.payment || "Cash"}</p>
                  </span>
                </div>
                <div className="rc21">
                  <span>
                    <h3>Date:</h3>
                    <p>{info?.Date || new Date().toLocaleDateString()}</p>
                  </span>
                  <span>
                    <h3>Start Time:</h3>
                    <p>
                      {info?.start_time
                        ? info.start_time.slice(0, 5)
                        : info?.Time || "-"}
                    </p>
                  </span>
                  <span>
                    <h3>End Time:</h3>
                    <p>{info?.end_time ? info.end_time.slice(0, 5) : "-"}</p>
                  </span>
                </div>
              </div>
              <hr />

              <div className="rc-row">
                <span className="label">Registration ID</span>
                <span className="value">#{info?.order_no || "00000"}</span>
              </div>
              <div className="rc-row">
                <span className="label">Date</span>
                <span className="value">
                  {info?.Date || new Date().toLocaleDateString()}
                </span>
              </div>
              <hr />
              <div className="rc_equipments">
                <h3>Equipments:</h3>
                {info?.items &&
                Array.isArray(info.items) &&
                info.items.length > 0 ? (
                  <ul className="rc_equipment_list">
                    {info.items.map((it, idx) => (
                      <li key={idx}>
                        {it.equipment ? it.equipment : "Item"} -{" "}
                        {it.quantity || 0} x {it.price || 0} ks
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>None</p>
                )}
              </div>
              <hr />
              <div className="rc4">
                <span className="rc41">
                  <h3>Total Amount:</h3>
                  <h3>Discount(%):</h3>
                </span>
                <span className="rc42">
                  <h3>{info ? info.total_amount : "---------"} KS</h3>
                  <h3>{info?.discount || 0} ks</h3>
                </span>
              </div>

              <hr />

              <div className="rc-row">
                <span className="label">Court Fee</span>
                <span className="value">{info ? info.court_fee : 0} KS</span>
              </div>
              <div className="rc-row">
                <span className="label">Rental Fee</span>
                <span className="value">{info ? info.rental_fee : 0} KS</span>
              </div>
              <div className="rc-row">
                <span className="label">Discount</span>
                <span className="value">{info?.discount || 0} KS</span>
              </div>

              <hr />

              <div className="rc-row rc-total-row">
                <span className="label total-label">Total Amount</span>
                <span className="value total-value">
                  {info ? info.total_amount : 0} KS
                </span>
              </div>
            </div>

            {/* Integrated Action Buttons */}
            <div className="rc6">
              <button
                onClick={download}
                className="downloadbtn"
                title="Download"
              >
                <SaveIcon fontSize="small" />
              </button>
              <button
                onClick={print}
                className="printbtn"
                style={{ padding: "0 100px" }}
              >
                Print
              </button>
              <button onClick={close} className="cancelbtn">
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return { open, ClassReceipetJsx };
};
