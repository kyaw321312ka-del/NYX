import { useRef, useState } from "react";
import "./Receipt.css";
import { createPortal } from "react-dom";
import CheckIcon from "@mui/icons-material/CheckBox";
import SaveIcon from "@mui/icons-material/SaveAlt";
import html2canvas from "html2canvas";
import { useReactToPrint } from "react-to-print";
export const useReceipt = () => {
  const [show, setshow] = useState(false);
  const [info, setinfo] = useState(null);

  const imgref = useRef();

  const open = (receiptinfo) => {
    setinfo(receiptinfo);
    setshow(true);
  };
  const close = () => {
    setshow(false);
    setinfo(null);
  };

  const print = useReactToPrint({
    contentRef: imgref,
    documentTitle: `Receipt_${info?.order_no}` || `reciept${Date.now()}`,
    // Print ထုတ်တဲ့အခါ style တွေ ပါလာစေရန်
    bodyClass: "print-body",
  });

  const download = async () => {
    if (imgref.current) {
      const canvas = await html2canvas(imgref.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `receipet${Date.now()}.png`;
      link.click();
    }
  };
  const ReceipetJsx = show
    ? createPortal(
        <div className="receipetwarper">
          <div className="rcmain">
            <div className="rcbody" ref={imgref}>
              <div className="rc1">
                <h3>
                  <CheckIcon />
                  Order Placed Successfully
                </h3>
                <p>Thank you for shopping with us</p>
              </div>
              <div className="rc2">
                <div className="rc21" style={{ width: "50%" }}>
                  <span>
                    <h3>Order No:</h3>
                    <p>#{info?.order_no || "00000"}</p>
                  </span>
                  <span>
                    <h3>Payment:</h3>
                    <p>{info?.payment || "-"}</p>
                  </span>
                </div>
                <div className="rc21">
                  <span>
                    <h3>Date:</h3>
                    <p>{info?.Date || new Date().toLocaleDateString()}</p>
                  </span>
                  <span>
                    <h3>Time:</h3>
                    <p>{info?.Time || new Date().toLocaleTimeString()}</p>
                  </span>
                </div>
              </div>
              <hr />
              <div className="rc3">
                {Array.isArray(info?.items) && info.items.length > 0 ? (
                  info.items.map((item, index) => (
                    <span className="rc31" key={index}>
                      <h3>{item.productName}</h3>
                      <h3>{item.quantity}</h3>
                      <h3>{item.price}-Ks</h3>
                    </span>
                  ))
                ) : (
                  <span className="rc31">
                    <h3>---------</h3>
                    <h3>------</h3>
                    <h3>----------</h3>
                  </span>
                )}
              </div>
              <hr />
              <div className="rc4">
                <span className="rc41">
                  <h3>Total Items:</h3>
                  <h3>Sub Total:</h3>
                  <h3>Tax:</h3>
                  <h3>Delivery Fee:</h3>
                </span>
                <span className="rc42">
                  <h3>{info?.item_Qty || 0}-items</h3>
                  <h3>{info?.item_amount || 0}-ks</h3>
                  <h3>{info?.tax || 0}-ks</h3>
                  <h3>{info?.dfee || 0}-ks</h3>
                </span>
              </div>
              <hr />
              <div className="rc5">
                <h3>Total</h3>
                <h3>{info?.total_amount || 0}-ks</h3>
              </div>
            </div>
            <div className="rc6">
              <button onClick={() => download()}>
                <SaveIcon />
              </button>
              <button onClick={() => print()}>Print</button>
              <button onClick={() => close()}>Cancel</button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;
  return { open, ReceipetJsx };
};
export default useReceipt;
