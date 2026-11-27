import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import "./styles/pos-customer.css";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../../shared/hooks/AppContext";
import CustomerLoading from "../../../shared/components/LoadingCustomer";
import { useGetCustomer } from "../services";
import Swal from "sweetalert2";

function PosCustomer() {
  const [text, settext] = useState("");
  const [filteredData, setfilteredData] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  // 📄 Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const { backcolor, Token } = useContext(Context);
  const { GetCustomer, Customers } = useGetCustomer();

  const textchange = (event) => {
    settext(event.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (Array.isArray(Customers.showCustomerData)) {
      let data = Customers.showCustomerData;
      if (text.trim() !== "") {
        data = data.filter(
          (item) =>
            item.name
              .toLocaleLowerCase()
              .includes(text.toLocaleLowerCase().trim()) ||
            item.address
              ?.toLocaleLowerCase()
              .includes(text.toLocaleLowerCase().trim())
        );
      }
      setfilteredData(data);
    }
  }, [text, Customers.showCustomerData]);

  useEffect(() => {
    GetCustomer();
  }, []);

  async function delete_customer(id) {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        setDeletingId(id);
        
        const response = await fetch(
          `http://
130.94.99.9:5000/api/customer/user/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Token}`,
            },
          }
        );
        
        const data = await response.json();
        console.log("Delete response:", data);
        
        if (response.ok && data.status === "success") {
          await GetCustomer();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: data.message || 'Customer has been deleted successfully.',
            confirmButtonColor: '#3085d6',
            timer: 2000
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: data.message || 'Failed to delete customer.',
            confirmButtonColor: '#3085d6'
          });
        }
      }
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire({
        icon: 'error',
        title: 'Network Error!',
        text: 'Unable to connect to the server. Please check your connection.',
        confirmButtonColor: '#3085d6'
      });
    } finally {
      setDeletingId(null);
    }
  }

  // Helper function to get warning status display
  const getWarningStatusDisplay = (warningStatus) => {
    const hasWarning = warningStatus === "true" || warningStatus === "1" || warningStatus === true;
    return {
      text: hasWarning ? "Warning Active" : "No Warning",
      style: {
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
        backgroundColor: hasWarning ? "#fee2e2" : "#dcfce7",
        color: hasWarning ? "#ef4444" : "#16a34a",
      }
    };
  };

  // 🌓 Dark Mode / Light Mode
  const isDarkMode = Boolean(backcolor === "#1A1C1E");

  // Dynamic styles based on theme
  const FontStyle = {
    color: isDarkMode ? "#E1E1E1" : "#0D1B2A",
  };
  const InputStyle = {
    backgroundColor: isDarkMode ? "#E1E1E1" : "#0D1B2A",
  };

  // 🧮 Pagination Calculation
  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
  const emptyRowsCount = rowsPerPage - currentRows.length;

  return (
    <div className={`Poscustomermain ${isDarkMode ? "dark-theme" : "light-theme"}`}>
      {/* Header Block */}
      <div className="Poscustomerheader">
        <h1 style={FontStyle}>
          <PersonIcon style={{ fontSize: "28px" }} />
          Customers
        </h1>
        <div style={InputStyle} className="search-box-wrapper">
          <input
            type="search"
            onChange={textchange}
            placeholder="Search customers..."
            style={{ color: !isDarkMode ? "white" : "#0D1B2A" }}
          />
          <SearchIcon className="search-icon-inside" style={{ color: !isDarkMode ? "white" : "#0D1B2A" }} />
        </div>
      </div>

      <div className="customertableContainer">
        <table className="customertable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Warning Status</th>
              <th style={{ textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(filteredData) && filteredData.length > 0 ? (
              <>
                {currentRows.map((item, index) => {
                  const warningStatus = item.warning || "false";
                  const statusDisplay = getWarningStatusDisplay(warningStatus);
                  
                  return (
                    <tr key={index}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.address || "-"}</td>
                      <td>{item.phone || "-"}</td>
                      <td>{item.email || "-"}</td>
                      <td>
                        <span style={statusDisplay.style}>
                          {statusDisplay.text}
                        </span>
                      </td>
                      <td className="customerbuttoncontainer">
                        <button
                          className="deletebutton"
                          onClick={() => delete_customer(item.id)}
                          disabled={deletingId === item.id}
                          style={{
                            backgroundColor: "#dc2626",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: deletingId === item.id ? "not-allowed" : "pointer",
                            opacity: deletingId === item.id ? 0.7 : 1,
                          }}
                        >
                          {deletingId === item.id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Pagination Controls */}
      {filteredData.length > 0 && (
        <div className="pos-pagination-footer">
          <span className="pagination-info">
            Showing {filteredData.length > 0 ? indexOfFirstRow + 1 : 0} to{" "}
            {Math.min(indexOfLastRow, filteredData.length)} of{" "}
            {filteredData.length} entries
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

export default PosCustomer;