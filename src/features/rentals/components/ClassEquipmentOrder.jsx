import CloseIcon from "@mui/icons-material/CloseOutlined";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../../shared/hooks/AppContext";
import "../styles/class-equipment-order.css";

function ClassEquipmentOrder({ data }) {
  const { classBackColor } = useContext(Context);
  const isDark = classBackColor?.toLowerCase() === "#1a1c1e";

  const [fliterdata, setfliterdata] = useState([]);
  const [text, settext] = useState("");
  const [state, setstate] = useState({});

  const { fun1, fun2, amount, equipment } = data;

  useEffect(() => {
    if (Array.isArray(equipment)) {
      let purifiedData = equipment.filter((item) => item.qty_total > 0);
      let result = purifiedData;
      if (text && text.trim() !== "") {
        result = purifiedData.filter((item) =>
          item.product_name.toLowerCase().includes(text.toLowerCase()),
        );
      }
      setfliterdata(result);
    }
  }, [text, equipment]);

  function searchHandler(e) {
    let textvalue = e.target.value;
    settext(textvalue);
  }

  function add_order(item) {
    fun1((prev) => [...prev, item]);
  }

  function click_once(id) {
    setstate((prev) => ({ ...prev, [id]: true }));
  }

  return (
    <div className="addorderproduct-overlay">
      <div className={`addorderproductmain ${isDark ? "dark-mode" : ""}`}>
        {/* Header */}
        <div className="Adpheader">
          <h2>Select Product Items</h2>
          <div className="Adpheader-actions">
            <div className="Adpsearch-box">
              <SearchIcon className="search-icon" />
              <input
                type="search"
                placeholder="Search products..."
                value={text}
                onChange={searchHandler}
              />
            </div>
            <button className="Aptcloseicon" onClick={() => fun2(false)}>
              <CloseIcon sx={{ color: isDark ? "#ffffff" : "#0d1b2a" }} />
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="Adpproduct">
          {Array.isArray(fliterdata) && fliterdata.length > 0 ? (
            fliterdata.map((item, index) => {
              return (
                <div className="addequipment" key={index}>
                  <div className="addequipment-top">
                    <h3 className="product-title" title={item.product_name}>
                      {item.product_name}
                    </h3>
                    <span className="status-badge">Available</span>
                  </div>

                  <div className="addequipment-bottom">
                    <span className="price-tag">{item.rental_price} Ks/hr</span>
                    <button
                      disabled={state[item.id]}
                      onClick={() => {
                        add_order(item);
                        click_once(item.id);
                      }}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-product">No Product Found</p>
          )}
        </div>

        {/* Footer */}
        <div className="Adpfooter">
          <span>
            <h5>Total Amount</h5>
            <h3>{amount} Ks</h3>
          </span>
          <button className="confirm-btn" onClick={() => fun2(false)}>
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClassEquipmentOrder;
