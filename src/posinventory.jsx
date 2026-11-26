import InventoryIcon from "@mui/icons-material/DensityMediumOutlined";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import AllItemsIcon from "@mui/icons-material/LayersOutlined";
import StockOutIcon from "@mui/icons-material/CancelOutlined";
import AlertIcon from "@mui/icons-material/ErrorOutlineOutlined";
import CategoryIcon from "@mui/icons-material/ClassOutlined";
import "./cssFolder/posinventory.css";
import { useContext, useEffect, useState } from "react";
import { Context } from "./Hooks/context";
import CustomerLoading from "./Components/loadingcustomer";
import { useGetCategory, useGetInventroy } from "./Api_Call";

function PosInventory() {
  const [text, settext] = useState("");
  const [value, setvalue] = useState("All");
  const [filteredData, setfiltered] = useState([]);

  // 📄 Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [inventoryStats, setInventoryStats] = useState({
    totalInventory: "0",
    outOfStock: "0",
    lowStock: "0",
    topCategory: "N/A"
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const rowsPerPage = 10;

  const { Categories, GetCategories } = useGetCategory();
  const { Inventory, GetInventory } = useGetInventroy();
  const { backcolor } = useContext(Context);

  const Font_color = Boolean(backcolor == "#1A1C1E");
  const FontStyle = {
    color: Font_color ? "#E1E1E1" : "#0D1B2A",
  };
  const InputStyle = {
    backgroundColor: Font_color ? "#E1E1E1" : "#0D1B2A",
  };

  // Fetch inventory statistics from API
  const fetchInventoryStats = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/inventory/totalinventory`
      );
      const data = await response.json();
      console.log("Inventory Stats:", data);
      
      if (data && data["total inventory"]) {
        setInventoryStats({
          totalInventory: data["total inventory"].total_inventory || "0",
          outOfStock: data["total inventory"].out_of_stock || "0",
          lowStock: data["total inventory"].low_stock || "0",
          topCategory: data["top category"] || "N/A"
        });
      }
    } catch (error) {
      console.error("Error fetching inventory stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    GetInventory();
    GetCategories();
    fetchInventoryStats();
  }, []);

  // Condition data from API
  const Condition = [
    { title: "Total Inventory", data: inventoryStats.totalInventory },
    { title: "Out of Stocks", data: inventoryStats.outOfStock },
    { title: "Low Stocks", data: inventoryStats.lowStock },
    { title: "Top Categories", data: inventoryStats.topCategory },
  ];

  //for option
  function changevalue(event) {
    setvalue(event.target.value);
    setCurrentPage(1);
  }

  function changetext(event) {
    settext(event.target.value);
    setCurrentPage(1);
  }

  useEffect(() => {
    if (!Array.isArray(Inventory.data)) return;

    let result = Inventory.data;
    if (value !== "All") {
      result = result.filter((item) =>
        item.category?.toLowerCase().includes(value.toLowerCase()),
      );
    }
    if (text.trim() !== "") {
      result = result.filter(
        (item) =>
          item.productName?.toLowerCase().includes(text.trim().toLowerCase()) ||
          item.tags?.toLowerCase().includes(text.trim().toLowerCase()),
      );
    }
    setfiltered(result);
  }, [text, value, Inventory.data]);

  // 🧮 Pagination Calculation
  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  // Row ၁၀ ခု ပြည့်အောင် ကွက်လပ်ဖြည့်ဖို့ တွက်ချက်ခြင်း
  const emptyRowsCount = rowsPerPage - currentRows.length;

  return (
    <div
      className={`posinventorymain ${Font_color ? "dark-theme" : "light-theme"}`}
    >
      {/* Title block */}
      <h1 className="Inventorytitle" style={FontStyle}>
        <InventoryIcon className="inventoryIcon" />
        Inventory
      </h1>

      {/* 📊 Top 4 Cards Row */}
      <div className="inventoryCondition">
        {Condition.map((item, index) => {
          const cardIcons = [
            <AllItemsIcon className="card-icon" style={{ color: "#4f46e5" }} />,
            <StockOutIcon className="card-icon" style={{ color: "#ef4444" }} />,
            <AlertIcon className="card-icon" style={{ color: "#f59e0b" }} />,
            <CategoryIcon className="card-icon" style={{ color: "#10b981" }} />,
          ];

          return (
            <div key={index} className="condition-card">
              <div className="card-top-row">
                <p className="card-title">{item.title}</p>
                <div className="icon-wrapper">{cardIcons[index]}</div>
              </div>
              <h4 className="card-data">
                {statsLoading ? (
                  <span className="loading-text">...</span>
                ) : (
                  item.data
                )}
              </h4>
            </div>
          );
        })}
      </div>

      {/* Table Action Header Area */}
      <div className="inventoryheader">
        <h2 style={FontStyle}>Product Stocks Overview</h2>

        <div className="header-controls-right">
          <select onChange={changevalue} className="inventory-select" value={value}>
            <option value="All">All Categories</option>
            {Array.isArray(Categories.data) && Categories.data.length > 0 ? (
              Categories.data.map((item, index) => (
                <option key={index} value={item.name}>
                  {item.name}
                </option>
              ))
            ) : (
              <option>Loading...</option>
            )}
          </select>

          <div className="inventory-search-wrapper">
            <input
              type="search"
              placeholder="Search products..."
              onChange={changetext}
            />
            <SearchIcon className="search-icon-inventory" />
          </div>
        </div>
      </div>

      {/* 📦 Modern Data Table Container */}
      <div className="inventorytablecontainer">
        <table className="inventorytable">
          <thead>
            <tr>
              <th>Product Id</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Tags</th>
              <th>Date</th>
              <th>Stocks</th>
              <th style={{ textAlign: "center" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(Inventory.data) && Inventory.data.length > 0 ? (
              <>
                {/* 1. Show dynamic table rows */}
                {currentRows.map((item, index) => {
                  const isOutOfStock = item.current_stock <= 0;
                  return (
                    <tr key={index} className="inventory-data-row">
                      <td className="id-cell">#{item.ProductID}</td>
                      <td className="productname">{item.productName}</td>
                      <td>{item.category}</td>
                      <td>
                        <span className="tag-badge">{item.tags || "-"}</span>
                      </td>
                      <td>{item.Date || "-"}</td>
                      <td
                        className={`stock-count ${isOutOfStock ? "stock-out" : ""}`}
                      >
                        {item.current_stock}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          className={`status-badge ${isOutOfStock ? "badge-out" : "badge-in"}`}
                        >
                          {isOutOfStock ? "Out of Stock" : "Available"}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {/* 2. Fill empty rows to make strictly 10 items rows */}
                {emptyRowsCount > 0 &&
                  Array.from({ length: emptyRowsCount }).map((_, index) => (
                    <tr key={`empty-${index}`} className="row-empty">
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                    </tr>
                  ))}
              </>
            ) : (
              [...Array(10)].map((_, index) => (
                <CustomerLoading key={index} times={7} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🏁 Pagination Controls Footer */}
      {filteredData.length > 0 && (
        <div className="pos-pagination-footer">
          <span className="pagination-info">
            Showing {filteredData.length > 0 ? indexOfFirstRow + 1 : 0} to{" "}
            {Math.min(indexOfLastRow, filteredData.length)} of{" "}
            {filteredData.length} stocks
          </span>
          <div className="pagination-btn-group">
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              <NavigateBeforeIcon style={{ fontSize: "20px" }} />
            </button>

            <span className="page-number-display">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              <NavigateNextIcon style={{ fontSize: "20px" }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PosInventory;