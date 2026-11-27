import { NavLink, Outlet, useOutletContext } from "react-router-dom";
import "../styles/class-overview.css";
import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../../../shared/hooks/AppContext";

function ClassOverview({ isDark: propIsDark }) {
  const { classBackColor } = useContext(Context); // 2. classBackColor ကို ရယူရန်
  const isDark = classBackColor === "#1A1C1E";

  const themeStyles = {
    backgroundColor: classBackColor,
    color: isDark ? "#E1E1E1" : "#111827",
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: isDark ? "#121212" : "#f8fafc",
        color: isDark ? "#ffffff" : "#111827",
        transition: "all 0.2s ease",
      }}
    >
      {/* Top Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          backgroundColor: isDark ? "#1a1c1e" : "#ffffff",
          borderBottom: `1px solid ${isDark ? "#2e3238" : "#e5e7eb"}`,
        }}
      >
        <span
          style={{
            fontSize: "24px",
            fontWeight: 800,
            color: isDark ? "#f8fafc" : "#111827",
          }}
        >
          ⚡ Services Overview
        </span>

        {/* Tab Buttons */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            background: isDark ? "#242629" : "#f1f5f9",
            padding: "4px",
            borderRadius: "8px",
          }}
        >
          <NavLink
            to="classtrainingoverview"
            style={({ isActive }) => ({
              padding: "8px 22px",
              borderRadius: "6px",
              textDecoration: "none",
              color: isActive ? "#ffffff" : isDark ? "#94a3b8" : "#64748b",
              background: isActive ? "#0D1B2A" : "transparent",
              fontWeight: isActive ? 600 : 500,
            })}
          >
            Training
          </NavLink>
          <NavLink
            to="classrentaloverview"
            style={({ isActive }) => ({
              padding: "8px 22px",
              borderRadius: "6px",
              textDecoration: "none",
              color: isActive ? "#ffffff" : isDark ? "#94a3b8" : "#64748b",
              background: isActive ? "#0D1B2A" : "transparent",
              fontWeight: isActive ? 600 : 500,
            })}
          >
            Rental
          </NavLink>
          <NavLink
            to="classcanteenoverview"
            style={({ isActive }) => ({
              padding: "8px 22px",
              borderRadius: "6px",
              textDecoration: "none",
              color: isActive ? "#ffffff" : isDark ? "#94a3b8" : "#64748b",
              background: isActive ? "#0D1B2A" : "transparent",
              fontWeight: isActive ? 600 : 500,
            })}
          >
            Canteen
          </NavLink>
        </div>
      </div>

      {/* Child Routes (ClassRentalOverview, etc.) */}
      <div style={{ padding: "0px" }}>
        <Outlet context={{ isDark }} />
      </div>
    </div>
  );
}

export default ClassOverview;
