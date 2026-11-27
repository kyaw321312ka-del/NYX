import React, { useEffect, useState, useContext } from "react";
import "../styles/class-menu.css";
import MenuIcon from "@mui/icons-material/Inventory2Outlined";
import FoodIcon from "@mui/icons-material/Flatware";
import DotIcon from "@mui/icons-material/FiberManualRecord";
import AddIcon from "@mui/icons-material/Add";
import { Restaurant, MonetizationOn, CalendarToday } from "@mui/icons-material";
import { useGetClassMenu } from "../services";
import AddMenuPopUp from "../components/AddMenuPopup";
import { useNoti } from "../../../shared/hooks/useNoti";
import { Context } from "../../../shared/hooks/AppContext";

// Theme Aware Stat Card Component
const StatCard = ({
  title,
  value,
  change,
  icon,
  iconColor,
  isCurrent,
  isDark,
}) => (
  <div className={`menu-stat-card ${isDark ? "dark-card" : ""}`}>
    <div className="menu-stat-card-header">
      <span className="menu-stat-card-title">{title}</span>
      {isCurrent ? (
        <span className="menu-stat-card-badge">Today</span>
      ) : (
        <span className="menu-stat-card-icon" style={{ color: iconColor }}>
          {icon}
        </span>
      )}
    </div>
    <div className="menu-stat-card-value">{value}</div>
    <div
      className={`menu-stat-card-change ${change.includes("-") ? "negative" : "positive"}`}
    >
      {change.includes("vs") || change.includes("-") || change.includes("+")
        ? `↗ ${change}`
        : change}
    </div>
  </div>
);

function ClassMenu() {
  const { classBackColor } = useContext(Context);
  const isDark = classBackColor === "#1A1C1E";

  const [show, setshow] = useState(false);
  const [info, setinfo] = useState(null);
  const [category, setcategory] = useState("All");
  const [purfiedData, setpurfiedData] = useState(null);

  const { ClassMenu, GetClassmenu } = useGetClassMenu();
  const { Loading, openloading, opensuccess, openerror, openconfirm } =
    useNoti();

  useEffect(() => {
    GetClassmenu();
  }, []);

  useEffect(() => {
    if (Array.isArray(ClassMenu?.data)) {
      setpurfiedData(ClassMenu.data);

      if (ClassMenu.data.length > 0) {
        if (category !== "All") {
          let filtered = ClassMenu.data.filter((item) => {
            return category.toLowerCase() === item.category_name?.toLowerCase();
          });
          setpurfiedData(filtered);
        }
      }
    }
  }, [category, ClassMenu?.data]);

  const classcategory = [
    { category: "All" },
    { category: "Snack" },
    { category: "Meal" },
    { category: "Drink" },
  ];

  function categorychange(item) {
    setcategory(item);
  }

  return (
    <div className={`classmenumain ${isDark ? "dark-mode" : ""}`}>
      {Loading}
      {show && (
        <AddMenuPopUp
          data={{
            setshow: setshow,
            info: info,
            setinfo: setinfo,
            updateFun: GetClassmenu,
            openloading: openloading,
            opensuccess: opensuccess,
            openerror: openerror,
            openconfirm: openconfirm,
          }}
        />
      )}

      {/* Header Title */}
      <div className="classmenuheader-container">
        <h2 className="classmenuheader">
          <MenuIcon className="menu-header-icon" style={{ fontSize: "40px" }} />
          <span style={{ fontSize: "30px" }}>Menus Management</span>
        </h2>
      </div>

      {/* Stat Cards Row */}
      <div className="stat-cards-container">
        <StatCard
          title="TODAY ORDERS"
          value="12 orders"
          change="7"
          icon={<CalendarToday sx={{ fontSize: "20px" }} />}
          iconColor="#ef4444"
          isCurrent={true}
          isDark={isDark}
        />
        <StatCard
          title="TOTAL ORDERS"
          value="250"
          change="+12"
          icon={<MonetizationOn sx={{ fontSize: "20px" }} />}
          iconColor="#3b82f6"
          isDark={isDark}
        />
        <StatCard
          title="TOP SELLING MENU"
          value="Dinner"
          change="45"
          icon={<Restaurant sx={{ fontSize: "20px" }} />}
          iconColor="#f59e0b"
          isDark={isDark}
        />
        <StatCard
          title="TOTAL REVENUE"
          value="250,000 Ks"
          change="5"
          icon={<MonetizationOn sx={{ fontSize: "20px" }} />}
          iconColor="#10b981"
          isDark={isDark}
        />
      </div>

      {/* Filter Tabs & Add Menu Action Row */}
      <div className="classmenubody">
        <div className="classmenubody1">
          {classcategory.map((item, index) => {
            return (
              <p
                key={index}
                onClick={() => categorychange(item.category)}
                className={category === item.category ? "menu_active" : ""}
              >
                {item.category}
              </p>
            );
          })}
        </div>
        <button className="addmenubtn" onClick={() => setshow(true)}>
          <AddIcon sx={{ fontSize: "18px" }} />
          Add Menu
        </button>
      </div>

      {/* Menu Cards Grid Section */}
      <div className="classmenufooter">
        {Array.isArray(purfiedData) ? (
          purfiedData.length > 0 ? (
            purfiedData.map((item, index) => {
              const isAvailable =
                item.available === "true" || item.available === true;

              return (
                <div
                  className="singlemenuproduct"
                  key={index}
                  onClick={() => {
                    setshow(true);
                    setinfo(item);
                  }}
                >
                  <div className="menuimg">
                    <img src={item.image_url} alt={item.name} />
                  </div>
                  <div className="singlemenutext">
                    <div className="singlemenutext1">
                      <p className="product-title">{item.name}</p>
                      <h3 className="product-price">{item.price} Ks</h3>
                    </div>

                    <div className="singlemenutext2">
                      <div className="singlemenutext21">
                        <FoodIcon className="category-icon" />
                        <p>{item.category_name}</p>
                      </div>

                      <div
                        className={`status-pill ${isAvailable ? "status-available" : "status-out-of-stock"}`}
                      >
                        <DotIcon className="dot-icon" />
                        <span>
                          {isAvailable ? "Available" : "Out of stock"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-product-box">No products found...</div>
          )
        ) : (
          <div className="no-product-box">Loading menus...</div>
        )}
      </div>
    </div>
  );
}

export default ClassMenu;
