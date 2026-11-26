import PeopleIcon from "@mui/icons-material/PeopleAltSharp";
import SearchIcon from "@mui/icons-material/SearchSharp";
import "../classCss/classcustomer.css";
import { useGetClassCustomer } from "../ClassApi";
import { useNoti } from "../Hooks/alert";
import { useTableFooter } from "../Hooks/tablefooter";
import Swal from "sweetalert2";
import React, { useState, useEffect, useContext } from "react";
import { Context } from "../Hooks/context";

function ClassCustomer() {
  const { classBackColor } = useContext(Context);

  // 🎯 1. isDark ကို အရင်ဆုံး စစ်ဆေးခြင်း (Case-Insensitive)
  const isDark = classBackColor?.toLowerCase() === "#1a1c1e";

  // 🎯 2. Dynamic Theme Generator Function
  const getSwalTheme = () => ({
    background: isDark ? "#1A1C1E" : "#ffffff",
    color: isDark ? "#E1E1E1" : "#0f172a",
  });

  const [Index, setIndex] = useState(0);
  const [filtered, setfiletered] = useState(null);
  const [text, settext] = useState(null);
  const [warningLoading, setWarningLoading] = useState({});
  const [deleteLoading, setDeleteLoading] = useState({});

  // Warning status များကို Instant Real-Time UI Toggle လုပ်ရန် State
  const [warnedStatus, setWarnedStatus] = useState({});

  const { GetClassCustomers, ClassCustomers } = useGetClassCustomer();
  const { Loading } = useNoti();
  const { TableFooterJsx, startnumber, endnumber } = useTableFooter();

  useEffect(() => {
    GetClassCustomers();
  }, []);

  const textchange = (event) => {
    settext(event.target.value);
  };

  useEffect(() => {
    let result = ClassCustomers.data?.[Index]?.customers;
    if (Array.isArray(ClassCustomers.data?.[Index]?.customers)) {
      if (text) {
        result = result.filter((item) => {
          return (
            item?.name?.toLowerCase().includes(text.toLowerCase()) ||
            item?.court_name?.toLowerCase().includes(text.toLowerCase()) ||
            item?.phone?.toString().includes(text.toString())
          );
        });
      }

      // Initial warn state များကို backend data မှ synchronize လုပ်ခြင်း
      const initialWarnMap = {};
      result.forEach((c) => {
        initialWarnMap[c.id] = Boolean(
          c.is_warned || c.is_warning || c.warning,
        );
      });
      setWarnedStatus((prev) => ({ ...initialWarnMap, ...prev }));
    }
    setfiletered(result);
  }, [text, ClassCustomers.data?.[Index], Index]);

  // 1. Add Warning Function
  async function addWarning(id) {
    if (!id) return;

    const result = await Swal.fire({
      title: "Add Warning?",
      text: "Are you sure you want to add a warning to this customer?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      ...getSwalTheme(),
    });

    if (!result.isConfirmed) return;

    setWarningLoading((prev) => ({ ...prev, [id]: true }));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/customer/updatecustomer/${id}/true`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setWarnedStatus((prev) => ({ ...prev, [id]: true }));
        await GetClassCustomers();

        await Swal.fire({
          title: "Action Successful",
          text: "Warning added to customer successfully!",
          icon: "success",
          confirmButtonText: "Great, Thank!",
          confirmButtonColor: "#3b82f6",
          ...getSwalTheme(),
        });
      } else {
        await Swal.fire({
          title: "Failed",
          text: data.message || "Failed to add warning",
          icon: "error",
          confirmButtonColor: "#ef4444",
          ...getSwalTheme(),
        });
      }
    } catch (err) {
      console.error("Add warning error:", err);
      await Swal.fire({
        title: "Error",
        text: "Cannot connect with server",
        icon: "error",
        confirmButtonColor: "#ef4444",
        ...getSwalTheme(),
      });
    } finally {
      setWarningLoading((prev) => ({ ...prev, [id]: false }));
    }
  }

  // 2. Remove Warning Function
  async function removeWarning(id) {
    if (!id) return;

    const result = await Swal.fire({
      title: "Remove Warning?",
      text: "Are you sure you want to remove warning from this customer?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      ...getSwalTheme(),
    });

    if (!result.isConfirmed) return;

    setWarningLoading((prev) => ({ ...prev, [id]: true }));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/customer/updatecustomer/${id}/false`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setWarnedStatus((prev) => ({ ...prev, [id]: false }));
        await GetClassCustomers();

        await Swal.fire({
          title: "Action Successful",
          text: "Warning removed from customer successfully!",
          icon: "success",
          confirmButtonText: "Great, Thank!",
          confirmButtonColor: "#3b82f6",
          ...getSwalTheme(),
        });
      } else {
        await Swal.fire({
          title: "Failed",
          text: data.message || "Failed to remove warning",
          icon: "error",
          confirmButtonColor: "#ef4444",
          ...getSwalTheme(),
        });
      }
    } catch (err) {
      console.error("Remove warning error:", err);
      await Swal.fire({
        title: "Error",
        text: "Cannot connect with server",
        icon: "error",
        confirmButtonColor: "#ef4444",
        ...getSwalTheme(),
      });
    } finally {
      setWarningLoading((prev) => ({ ...prev, [id]: false }));
    }
  }

  // 3. Delete Customer Function
  async function delete_customer(id) {
    if (!id) return;

    const result = await Swal.fire({
      title: "Deleting Customer?",
      text: "Are you sure to delete this customer?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      ...getSwalTheme(),
    });

    if (!result.isConfirmed) return;

    setDeleteLoading((prev) => ({ ...prev, [id]: true }));

    try {
      let response = await fetch(
        `${import.meta.env.VITE_CLASS_DELETE_MOBILE_BOOKING}/${id}`,
        { method: "DELETE" },
      );

      if (response.ok) {
        await GetClassCustomers();

        await Swal.fire({
          title: "Action Successful",
          text: "Customer deleted successfully from list",
          icon: "success",
          confirmButtonText: "Great, Thank!",
          confirmButtonColor: "#3b82f6",
          ...getSwalTheme(),
        });
      } else {
        await Swal.fire({
          title: "Error",
          text: "Something went wrong",
          icon: "error",
          confirmButtonColor: "#ef4444",
          ...getSwalTheme(),
        });
      }
    } catch (err) {
      console.log(err);
      await Swal.fire({
        title: "Error",
        text: "Cannot connect with server",
        icon: "error",
        confirmButtonColor: "#ef4444",
        ...getSwalTheme(),
      });
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [id]: false }));
    }
  }

  return (
    <div className={`classcustomermain ${isDark ? "dark-mode" : ""}`}>
      <header className="ccheader">
        {Loading}
        <PeopleIcon sx={{ fontSize: "35px" }} />
        <h2 style={{ fontSize: "30px" }}>Customers</h2>
      </header>
      <div className="ccbody">
        <div className="ccnav">
          <div className="ccnav1">
            {Array.isArray(ClassCustomers.data) ? (
              ClassCustomers.data.length > 0 ? (
                ClassCustomers.data.map((item, index) => (
                  <h3
                    key={index}
                    className={Index === index ? "active-tab" : ""}
                    onClick={() => setIndex(index)}
                  >
                    {item.venue_name}
                  </h3>
                ))
              ) : (
                <h3 className="no-venue">No venue</h3>
              )
            ) : (
              <h3 className="no-venue">Loading...</h3>
            )}
          </div>
          <div className="ccnav2">
            <input
              type="search"
              placeholder="Search..."
              onChange={textchange}
            />
            <SearchIcon className="search-icon" />
          </div>
        </div>
        <div className="towarpthetable">
          <div className="cctablewarper">
            <table>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Name</th>
                  <th>Phone No</th>
                  <th>Court Name</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(filtered) ? (
                  filtered.length > 0 ? (
                    filtered
                      .slice(startnumber, endnumber)
                      .map((item, index) => {
                        const isWarned = Boolean(warnedStatus[item.id]);
                        const isProcessing = warningLoading[item.id];

                        return (
                          <tr key={index}>
                            <td>{item.id}</td>
                            <td>{item.name}</td>
                            <td>{item.phone}</td>
                            <td>{item.court_name}</td>
                            <td>{item.date}</td>
                            <td>
                              {Array.isArray(item.time_slots) &&
                              item.time_slots.length > 0
                                ? `${item.time_slots[0].start_time.slice(
                                    0,
                                    5,
                                  )} - ${item.time_slots[0].end_time.slice(
                                    0,
                                    5,
                                  )}`
                                : "null"}
                            </td>
                            <td>{item.remarks || "-"}</td>
                            <td>
                              <div className="classactiondiv">
                                <button
                                  onClick={() => addWarning(item.id)}
                                  disabled={isProcessing || isWarned}
                                  className={`btn-action btn-add-warning ${
                                    isWarned ? "dimmed-warned" : ""
                                  }`}
                                >
                                  {isProcessing
                                    ? "Processing..."
                                    : isWarned
                                      ? "Warning"
                                      : "Add Warning"}
                                </button>

                                <button
                                  onClick={() => removeWarning(item.id)}
                                  disabled={isProcessing || !isWarned}
                                  className={`btn-action btn-remove-warning ${
                                    !isWarned ? "dimmed-remove" : ""
                                  }`}
                                >
                                  {isProcessing
                                    ? "Processing..."
                                    : "Remove Warning"}
                                </button>

                                <button
                                  onClick={() => delete_customer(item.id)}
                                  disabled={deleteLoading[item.id]}
                                  className="btn-action btn-delete"
                                >
                                  {deleteLoading[item.id]
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        No results found
                      </td>
                    </tr>
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      Loading...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="custom-table-footer-wrapper">{TableFooterJsx}</div>
        </div>
      </div>
    </div>
  );
}

export default ClassCustomer;
