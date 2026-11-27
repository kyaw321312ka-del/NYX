import { useEffect, useContext } from "react";
import "../styles/class-booking-list.css";
import ListIcon from "@mui/icons-material/ChecklistRtlSharp";
import { classbookingheading } from "../../../../shared/utils/dataExport";
import { NavLink, Outlet } from "react-router-dom";
import HeaderIcon1 from "@mui/icons-material/MovingSharp";
import HeaderIcon2 from "@mui/icons-material/SecurityUpdateGood";
import HeaderIcon3 from "@mui/icons-material/StorefrontSharp";
import HeaderIcon4 from "@mui/icons-material/ListAltSharp";
import { Context } from "../../../../shared/hooks/AppContext";

function BookingList() {
  const { classBackColor } = useContext(Context);
  const isDark = classBackColor === "#1A1C1E";

  return (
    <div
      className={`blmain ${isDark ? "dark-mode" : ""}`}
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: classBackColor || (isDark ? "#121212" : "#f8fafc"),
        color: isDark ? "#ffffff" : "#111827",
        transition: "all 0.2s ease",
      }}
    >
      <header className="blheader">
        <ListIcon style={{ fontSize: "35px", marginRight: "5px" }} />
        <h2 style={{ fontSize: "30px" }}>Booking Schedule</h2>
      </header>
      <div className="bltitle">
        {classbookingheading.map((item, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: isDark ? "#242629" : "#ffffff",
                color: isDark ? "#ffffff" : "#111827",
                border: `1px solid ${isDark ? "#2e3238" : "#e5e7eb"}`,
              }}
            >
              <span>
                <h4>{item.title}</h4>
                {item.icon == 1 && (
                  <HeaderIcon1
                    sx={{
                      fontSize: "20px",
                      background: isDark ? "#333" : "#FAFAFA",
                      color: isDark ? "#38bdf8" : "#18181B",
                      borderRadius: "4px",
                    }}
                  />
                )}
                {item.icon == 2 && (
                  <HeaderIcon2
                    sx={{
                      fontSize: "20px",
                      color: "#059669",
                    }}
                  />
                )}
                {item.icon == 3 && (
                  <HeaderIcon3
                    sx={{
                      fontSize: "20px",
                      background: isDark ? "#333" : "#FAFAFA",
                      color: "#2563EB",
                      borderRadius: "4px",
                    }}
                  />
                )}
                {item.icon == 4 && (
                  <HeaderIcon4
                    sx={{
                      fontSize: "20px",
                      background: isDark ? "#333" : "#FAFAFA",
                      color: "#DC2626",
                      borderRadius: "4px",
                    }}
                  />
                )}
              </span>
              <h3>{item.info}</h3>
            </div>
          );
        })}
      </div>
      <div
        className="blswitch"
        style={{
          background: isDark ? "#242629" : "#f1f5f9",
          padding: "4px",
          borderRadius: "8px",
        }}
      >
        <NavLink
          to="classmobilebooking"
          style={({ isActive }) => ({
            padding: "8px 22px",
            borderRadius: "6px",
            textDecoration: "none",
            color: isActive ? "#ffffff" : isDark ? "#94a3b8" : "#64748b",
            background: isActive ? "#0D1B2A" : "transparent",
            fontWeight: isActive ? 600 : 500,
          })}
        >
          Mobile Order
        </NavLink>
        <NavLink
          to="classlocalbooking"
          style={({ isActive }) => ({
            padding: "8px 22px",
            borderRadius: "6px",
            textDecoration: "none",
            color: isActive ? "#ffffff" : isDark ? "#94a3b8" : "#64748b",
            background: isActive ? "#0D1B2A" : "transparent",
            fontWeight: isActive ? 600 : 500,
          })}
        >
          Local Order
        </NavLink>
      </div>
      <div>
        <Outlet context={{ isDark }} />
      </div>
    </div>
  );
}

export default BookingList;
