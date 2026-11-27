import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined"; // Delete Icon ထည့်သွင်းခြင်း
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";

import { Context } from "../../../shared/hooks/AppContext"; // Context Path ကို ပြင်ပါ

const Manage = () => {
  const navigate = useNavigate();

  // 1. Context မှ Dark Mode ရယူခြင်း
  const { classBackColor, Token } = useContext(Context);
  const isDark = classBackColor === "#1A1C1E";

  // Dynamic Status တွက်ချက်ပေးသည့် Function
  const getTournamentStatus = (startDateStr, endDateStr) => {
    const now = new Date();
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (now < start) {
      return { status: "UPCOMING", bg: "#3b82f6" }; // ပြိုင်ပွဲမစသေးပါ (Blue)
    } else if (now >= start && now <= end) {
      return { status: "ONGOING", bg: "#10b981" }; // ပြိုင်ပွဲယှဉ်ပြိုင်နေဆဲ (Green)
    } else {
      return { status: "COMPLETED", bg: "#64748b" }; // ပြိုင်ပွဲပြီးသွားပြီ (Gray)
    }
  };

  const initialTournaments = [
    {
      id: 1,
      title: "Smash Summer Open 2026",
      category: "badminton",
      startDate: "2026-09-10",
      endDate: "2026-09-20",
      displayDates: "Sep 10 - Sep 20, 2026",
      court: "Court 1",
      format: "Doubles",
      slots: "16",
      fee: "20,000 Ks",
      time: "08:00 AM - 05:00 PM",
      description:
        "1. Standard BWF scoring system.\n2. Non-marking shoes are strictly required.\n3. Late arrivals over 15 mins will be disqualified.",
      image:
        "https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=600",
      rankPoints: [
        { rank: "1st Place", value: "1000" },
        { rank: "2nd Place", value: "500" },
        { rank: "3rd Place", value: "250" },
      ],
    },
    {
      id: 2,
      title: "Weekend Shuttle Masters",
      category: "badminton",
      startDate: "2026-10-01",
      endDate: "2026-10-05",
      displayDates: "Oct 01 - Oct 05, 2026",
      court: "Court 2",
      format: "Singles",
      slots: "32",
      fee: "15,000 Ks",
      time: "09:00 AM - 06:00 PM",
      description:
        "1. Knockout tournament format.\n2. Shuttlecocks provided by organizers.",
      image:
        "https://images.pexels.com/photos/8007432/pexels-photo-8007432.jpeg?auto=compress&cs=tinysrgb&w=600",
      rankPoints: [
        { rank: "1st Place", value: "500" },
        { rank: "2nd Place", value: "250" },
        { rank: "3rd Place", value: "100" },
      ],
    },
    {
      id: 3,
      title: "National Badminton Championship",
      category: "badminton",
      startDate: "2026-01-10",
      endDate: "2026-01-15",
      displayDates: "Jan 10 - Jan 15, 2026",
      court: "Court C",
      format: "Singles",
      slots: "64",
      fee: "25,000 Ks",
      time: "08:00 AM - 08:00 PM",
      description:
        "1. Annual national level championship.\n2. All match results registered in official rankings.",
      image:
        "https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600",
      rankPoints: [
        { rank: "1st Place", value: "2000" },
        { rank: "2nd Place", value: "1000" },
        { rank: "3rd Place", value: "500" },
      ],
    },
  ];

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // State များ သတ်မှတ်ခြင်း (Delete လုပ်နိုင်ရန် state ပြောင်းထားသည်)
  const [tournaments, setTournaments] = useState(initialTournaments);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const formatDate = (dateValue) => {
      if (!dateValue) return "";

      const date = String(dateValue).slice(0, 10);
      const [year, month, day] = date.split("-").map(Number);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }).format(new Date(year, month - 1, day));
    };

    const fetchTournaments = async () => {
      try {
        setLoadError("");
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/tournament/showtournaments`,
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch tournaments (${response.status})`);
        }

        const result = await response.json();
        const apiTournaments = Array.isArray(result?.data) ? result.data : [];

        setTournaments(
          apiTournaments.map((item) => ({
            id: item.id,
            title: item.tournament_name,
            category: String(
              item.court_category_name || item.court_category_id || "",
            ).toLowerCase(),
            startDate: String(item.start_date || "").slice(0, 10),
            endDate: String(item.end_date || "").slice(0, 10),
            displayDates: `${formatDate(item.start_date)} - ${formatDate(item.end_date)}`,
            court: item.court_name || item.court_id,
            format: item.match_format_name || item.match_format_id,
            formatId: item.match_format_id,
            categoryId: item.court_category_id,
            courtId: item.court_id,
            slots: item.max_participants,
            fee: item.tournament_fee,
            time: item.tournament_time,
            address: item.tournament_address,
            description: item.rules_description,
            image: item.banner_photo,
            rankPoints: Array.isArray(item.rank_points)
              ? item.rank_points.map((rankPoint) => ({
                  rank: `${rankPoint.rank_position}${rankPoint.rank_position === 1 ? "st" : rankPoint.rank_position === 2 ? "nd" : rankPoint.rank_position === 3 ? "rd" : "th"} Place`,
                  value: String(rankPoint.points),
                }))
              : [],
          })),
        );
      } catch (error) {
        console.error("Tournament fetch error:", error);
        setLoadError("Unable to load tournaments.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  // Delete Modal အတွက် State
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredTournaments = tournaments.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Delete အတည်ပြုသည့် Function
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/tournament/deletetournament/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: Token ? { Authorization: `Bearer ${Token}` } : undefined,
        },
      );

      if (!response.ok) {
        throw new Error(`Tournament deletion failed (${response.status})`);
      }

      setTournaments((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Tournament delete error:", error);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: isDark ? "#121212" : "#f8fafc",
        color: isDark ? "#ffffff" : "#111827",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      <main style={{ flexGrow: 1, padding: "25px", boxSizing: "border-box" }}>
        {/* HEADER SECTION */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "2.2rem",
              fontWeight: 700,
              color: isDark ? "#ffffff" : "#0f172a",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <EmojiEventsIcon style={{ fontSize: "2.5rem" }} /> Tournament
            Management
          </h1>

          <button
            onClick={() => navigate("create")}
            style={{
              backgroundColor: isDark ? "#0284c7" : "#0f172a",
              color: "#ffffff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <AddIcon style={{ fontSize: "1.2rem" }} /> Create New Tournament
          </button>
        </header>

        {/* SEARCH & FILTER BAR */}
        <div
          style={{
            backgroundColor: isDark ? "#1a1c1e" : "#ffffff",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            borderRadius: "10px",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "350px",
            }}
          >
            <SearchIcon style={{ color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search tournaments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
                color: isDark ? "#ffffff" : "#0f172a",
                fontSize: "14px",
              }}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`,
              backgroundColor: isDark ? "#0f172a" : "#ffffff",
              color: isDark ? "#ffffff" : "#0f172a",
              outline: "none",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            <option value="all">All Courts / Sports</option>
            <option value="badminton">Badminton</option>
            <option value="football">Football</option>
            <option value="tennis">Tennis</option>
          </select>
        </div>

        {(isLoading || loadError) && (
          <p
            style={{
              margin: "0 0 24px",
              color: loadError ? "#ef4444" : isDark ? "#cbd5e1" : "#64748b",
              fontSize: "14px",
            }}
          >
            {loadError || "Loading tournaments..."}
          </p>
        )}

        {/* TOURNAMENT CARDS GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {filteredTournaments.map((item) => {
            const statusInfo = getTournamentStatus(
              item.startDate,
              item.endDate,
            );

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: isDark ? "#1a1c1e" : "#ffffff",
                  border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                  borderRadius: "12px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ position: "relative", height: "180px" }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/600x300?text=Tournament+Banner";
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      backgroundColor: statusInfo.bg,
                      color: "#ffffff",
                      fontSize: "11px",
                      fontWeight: "bold",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {statusInfo.status}
                  </span>
                </div>

                <div
                  style={{
                    padding: "20px",
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "16px",
                      fontWeight: 700,
                      color: isDark ? "#ffffff" : "#0f172a",
                    }}
                  >
                    {item.title}
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px 16px",
                      fontSize: "13px",
                      color: isDark ? "#94a3b8" : "#64748b",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          display: "block",
                        }}
                      >
                        <LocationOnOutlinedIcon style={{ fontSize: "14px" }} />{" "}
                        Court
                      </span>
                      <strong>{item.court}</strong>
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          display: "block",
                        }}
                      >
                        <PersonOutlineIcon style={{ fontSize: "14px" }} />{" "}
                        Format
                      </span>
                      <strong>{item.format}</strong>
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          display: "block",
                        }}
                      >
                        <CalendarTodayOutlinedIcon
                          style={{ fontSize: "14px" }}
                        />{" "}
                        Dates
                      </span>
                      <strong>{item.displayDates}</strong>
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          display: "block",
                        }}
                      >
                        <GroupsOutlinedIcon style={{ fontSize: "14px" }} />{" "}
                        Slots
                      </span>
                      <strong>{item.slots}</strong>
                    </div>
                  </div>

                  <div
                    style={{
                      height: "1px",
                      backgroundColor: isDark ? "#334155" : "#f1f5f9",
                      margin: "auto 0 16px 0",
                    }}
                  />

                  {/* BOTTOM ACTION BUTTONS */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      onClick={() =>
                        navigate(`edit/${item.id}`, {
                          state: { tournamentData: item },
                        })
                      }
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        color: isDark ? "#38bdf8" : "#2563eb",
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                    >
                      View Details{" "}
                      <ArrowForwardIcon style={{ fontSize: "14px" }} />
                    </span>

                    {/* Edit & Delete Icons Container */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <EditOutlinedIcon
                        onClick={() =>
                          navigate(`edit/${item.id}`, {
                            state: { tournamentData: item, autoEdit: true },
                          })
                        }
                        style={{
                          cursor: "pointer",
                          color: isDark ? "#cbd5e1" : "#64748b",
                          fontSize: "20px",
                          transition: "color 0.2s",
                        }}
                      />

                      {/* Trash Delete Icon */}
                      <DeleteOutlineOutlinedIcon
                        onClick={() => setDeleteTarget(item)}
                        style={{
                          cursor: "pointer",
                          color: "#ef4444", // Red Accent
                          fontSize: "20px",
                          transition: "opacity 0.2s",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* DELETE CONFIRMATION MODAL CARD */}
      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              color: isDark ? "#ffffff" : "#0f172a",
              border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
              borderRadius: "16px",
              width: "100%",
              maxWidth: "420px",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setDeleteTarget(null)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                color: isDark ? "#94a3b8" : "#64748b",
                cursor: "pointer",
              }}
            >
              <CloseIcon style={{ fontSize: "20px" }} />
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DeleteOutlineOutlinedIcon style={{ fontSize: "22px" }} />
              </div>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
                Delete Tournament?
              </h3>
            </div>

            <p
              style={{
                fontSize: "14px",
                color: isDark ? "#94a3b8" : "#64748b",
                margin: "0 0 20px 0",
                lineHeight: "1.5",
              }}
            >
              Are you sure you want to delete{" "}
              <strong style={{ color: isDark ? "#f8fafc" : "#0f172a" }}>
                "{deleteTarget.title}"
              </strong>
              ? This action cannot be undone.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  padding: "9px 16px",
                  borderRadius: "8px",
                  border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`,
                  backgroundColor: "transparent",
                  color: isDark ? "#cbd5e1" : "#475569",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{
                  padding: "9px 18px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Outlet context={{ isDark }} />
    </div>
  );
};

export default Manage;
