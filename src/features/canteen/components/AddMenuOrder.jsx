import CloseIcon from "@mui/icons-material/CloseOutlined";
import FoodIcon from "@mui/icons-material/Flatware";
import { useContext, useEffect, useState } from "react";
import { useGetClassMenu } from "../services";
import { Context } from "../../../shared/hooks/AppContext";
import "../styles/add-menu-order.css";

function AddOrderMenu({ data }) {
  const { classBackColor } = useContext(Context);
  const isDark = classBackColor?.toLowerCase() === "#1a1c1e";

  const [state, setstate] = useState({});
  const [category, setcategory] = useState("All");
  const [purfiedData, setpurfiedData] = useState(null);

  const { ClassMenu, GetClassmenu } = useGetClassMenu();
  const { fun1, fun2, amount } = data;

  const classcategory = [
    { category: "All" },
    { category: "Snack" },
    { category: "Meal" },
    { category: "Drink" },
  ];

  useEffect(() => {
    GetClassmenu();
  }, []);

  useEffect(() => {
    if (Array.isArray(ClassMenu.data)) {
      let result = ClassMenu.data.filter((item) => item.available !== "false");

      if (category !== "All" && result.length > 0) {
        result = result.filter((item) => {
          return category.toLowerCase() === item.category_name.toLowerCase();
        });
      }

      setpurfiedData(result);
    }
  }, [category, ClassMenu.data]);

  // add order to the table
  function add_order(item) {
    fun1((prev) => [...prev, item]);
  }

  // function to clickable once
  function click_once(id) {
    setstate((prev) => {
      return { ...prev, [id]: true };
    });
  }

  function categorychange(item) {
    setcategory(item);
  }

  return (
    <div className="addordermenu-overlay">
      <div className={`addordermenumain ${isDark ? "dark-mode" : ""}`}>
        {/* Header */}
        <div className="addordermenuheader">
          <h3>Select Menu Item</h3>
          <button onClick={() => fun2(false)}>
            <CloseIcon sx={{ color: isDark ? "#ffffff" : "#0d1b2a" }} />
          </button>
        </div>

        {/* Categories */}
        <div className="addordermenucategory">
          {classcategory.map((item, index) => {
            return (
              <p
                key={index}
                onClick={() => categorychange(item.category)}
                className={category === item.category ? "active" : ""}
              >
                {item.category}
              </p>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="addordermenuproduct">
          {Array.isArray(purfiedData) ? (
            purfiedData.length > 0 ? (
              purfiedData.map((item, index) => {
                return (
                  <div className="AODsinglemenu" key={index}>
                    <div className="AODimg">
                      <img src={item.image_url} alt={item.name} />
                    </div>

                    <div className="AODdetails">
                      <div className="AODtitle-row">
                        <p className="AODname" title={item.name}>
                          {item.name}
                        </p>
                        <span className="AODprice">{item.price} ks</span>
                      </div>

                      <div className="AODaction-row">
                        <div className="AODcategory-tag">
                          <FoodIcon
                            sx={{
                              color: isDark ? "#9ca3af" : "#64748b",
                              fontSize: "16px",
                            }}
                          />
                          <span>{item.category_name}</span>
                        </div>
                        <button
                          disabled={state[item.id]}
                          onClick={() => {
                            add_order(item);
                            click_once(item.id);
                          }}
                        >
                          + Add Order
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="no-data">No items found</p>
            )
          ) : (
            <p className="no-data">Loading...</p>
          )}
        </div>

        {/* Footer */}
        <div className="addordermenufooter">
          <span>
            <h5>Total Amount</h5>
            <h3>{amount} Ks</h3>
          </span>
          <button onClick={() => fun2(false)}>Confirm Order</button>
        </div>
      </div>
    </div>
  );
}

export default AddOrderMenu;
