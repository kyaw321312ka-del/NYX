import React, { useState, useMemo, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { Context } from "../../../../shared/hooks/AppContext";
import "../styles/class-points.css";

// 🏆 Tournament ၁ ခုစီအတွက် ၁၀ ယောက်စီပါသော Realistic Mock Data
const INITIAL_PLAYERS = [
  // --- 1. 2026 National Badminton (10 Players) ---
  {
    id: "PLY-001",
    name: "Aung Aung",
    contact: "+95 9 12345678",
    tournament: "2026 National Badminton",
    previousPoints: 1200,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-002",
    name: "Kyaw Kyaw",
    contact: "+95 9 23456789",
    tournament: "2026 National Badminton",
    previousPoints: 800,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-003",
    name: "Min Min",
    contact: "+95 9 34567890",
    tournament: "2026 National Badminton",
    previousPoints: 620,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-004",
    name: "Zaw Zaw",
    contact: "+95 9 45678901",
    tournament: "2026 National Badminton",
    previousPoints: 590,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-005",
    name: "Nyi Nyi",
    contact: "+95 9 56789012",
    tournament: "2026 National Badminton",
    previousPoints: 510,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-006",
    name: "Tun Tun",
    contact: "+95 9 67890123",
    tournament: "2026 National Badminton",
    previousPoints: 480,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-007",
    name: "Kaung Kaung",
    contact: "+95 9 78901234",
    tournament: "2026 National Badminton",
    previousPoints: 450,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-008",
    name: "Htet Htet",
    contact: "+95 9 89012345",
    tournament: "2026 National Badminton",
    previousPoints: 420,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-009",
    name: "Kyaw Swar",
    contact: "+95 9 90123456",
    tournament: "2026 National Badminton",
    previousPoints: 390,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-010",
    name: "Mg Mg",
    contact: "+95 9 01234567",
    tournament: "2026 National Badminton",
    previousPoints: 350,
    currentPoints: 0,
    pointsToAward: 0,
  },

  // --- 2. Smash Summer Open 2026 (10 Players) ---
  {
    id: "PLY-011",
    name: "Thura",
    contact: "+95 9 11112222",
    tournament: "Smash Summer Open 2026",
    previousPoints: 650,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-012",
    name: "Mya Mya",
    contact: "+95 9 22223333",
    tournament: "Smash Summer Open 2026",
    previousPoints: 500,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-013",
    name: "Soe Soe",
    contact: "+95 9 33334444",
    tournament: "Smash Summer Open 2026",
    previousPoints: 450,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-014",
    name: "Bo Bo",
    contact: "+95 9 44445555",
    tournament: "Smash Summer Open 2026",
    previousPoints: 400,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-015",
    name: "Aung Ko",
    contact: "+95 9 55556666",
    tournament: "Smash Summer Open 2026",
    previousPoints: 380,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-016",
    name: "Lwin Lwin",
    contact: "+95 9 66667777",
    tournament: "Smash Summer Open 2026",
    previousPoints: 340,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-017",
    name: "Pyae Sone",
    contact: "+95 9 77778888",
    tournament: "Smash Summer Open 2026",
    previousPoints: 300,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-018",
    name: "Hla Hla",
    contact: "+95 9 88889999",
    tournament: "Smash Summer Open 2026",
    previousPoints: 260,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-019",
    name: "Khin Khin",
    contact: "+95 9 99990000",
    tournament: "Smash Summer Open 2026",
    previousPoints: 210,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-020",
    name: "Naing Naing",
    contact: "+95 9 10101010",
    tournament: "Smash Summer Open 2026",
    previousPoints: 180,
    currentPoints: 0,
    pointsToAward: 0,
  },

  // --- 3. Weekend Shuttle Masters (10 Players) ---
  {
    id: "PLY-021",
    name: "Zin Zin",
    contact: "+95 9 12121212",
    tournament: "Weekend Shuttle Masters",
    previousPoints: 720,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-022",
    name: "Wai Yan",
    contact: "+95 9 23232323",
    tournament: "Weekend Shuttle Masters",
    previousPoints: 580,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-023",
    name: "Myo Min",
    contact: "+95 9 34343434",
    tournament: "Weekend Shuttle Masters",
    previousPoints: 490,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-024",
    name: "Phyu Phyu",
    contact: "+95 9 45454545",
    tournament: "Weekend Shuttle Masters",
    previousPoints: 420,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-025",
    name: "Thu Ra",
    contact: "+95 9 56565656",
    tournament: "Weekend Shuttle Masters",
    previousPoints: 390,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-026",
    name: "Kyi Kyi",
    contact: "+95 9 67676767",
    tournament: "Weekend Shuttle Masters",
    previousPoints: 330,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-027",
    name: "Ye Yint",
    contact: "+95 9 78787878",
    tournament: "Weekend Shuttle Masters",
    previousPoints: 290,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-028",
    name: "Sane Sane",
    contact: "+95 9 89898989",
    tournament: "Weekend Shuttle Masters",
    previousPoints: 250,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-029",
    name: "Thae Thae",
    contact: "+95 9 90909090",
    tournament: "Weekend Shuttle Masters",
    previousPoints: 200,
    currentPoints: 0,
    pointsToAward: 0,
  },
  {
    id: "PLY-030",
    name: "Hein Hein",
    contact: "+95 9 01010101",
    tournament: "Weekend Shuttle Masters",
    previousPoints: 150,
    currentPoints: 0,
    pointsToAward: 0,
  },
];

const TOURNAMENTS = [
  "2026 National Badminton",
  "Smash Summer Open 2026",
  "Weekend Shuttle Masters",
];

function ClassPoints() {
  const contextData = useContext(Context);
  const outletContext = useOutletContext() || {};
  const { isDark: parentIsDark } = outletContext;

  const isDark =
    parentIsDark ?? contextData?.classBackColor?.toLowerCase() === "#1a1c1e";

  const [selectedTournament, setSelectedTournament] = useState(TOURNAMENTS[0]);
  const [players, setPlayers] = useState(INITIAL_PLAYERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // 🎯 Page တခုမှာ ၁၀ ရိုးပြမည်
  const ITEMS_PER_PAGE = 10;

  // 1. Selected Tournament & Search filter
  const filteredPlayers = useMemo(() => {
    return players.filter(
      (p) =>
        p.tournament === selectedTournament &&
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.contact.includes(searchTerm)),
    );
  }, [players, selectedTournament, searchTerm]);

  // 2. Pagination Logic
  const totalEntries = filteredPlayers.length;
  const totalPages = Math.ceil(totalEntries / ITEMS_PER_PAGE) || 1;

  const paginatedPlayers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPlayers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPlayers, currentPage]);

  const emptyRowsCount = Math.max(0, ITEMS_PER_PAGE - paginatedPlayers.length);

  // 3. Award Input Handler
  const handleAwardChange = (id, val) => {
    const numericVal = parseInt(val, 10) || 0;
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, pointsToAward: numericVal } : p)),
    );
  };

  // 4. Save & Sync Logic
  const handleSaveSync = () => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.tournament === selectedTournament && p.pointsToAward > 0) {
          return {
            ...p,
            currentPoints: p.currentPoints + p.pointsToAward, // Current points ထဲ ရောက်သွားမည်
            pointsToAward: 0, // Points to award ကို 0 ပြန်ဖြစ်စေမည်
          };
        }
        return p;
      }),
    );
    setIsEditing(false);
  };

  // 5. Leaderboard (Total Points အလိုက် အစဉ်လိုက်စီမည်)
  const top10Leaderboard = useMemo(() => {
    return [...players]
      .map((p) => ({
        ...p,
        totalPoints: p.previousPoints + p.currentPoints + p.pointsToAward,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);
  }, [players]);

  return (
    <div className={`cp-container ${isDark ? "dark-mode" : ""}`}>
      {/* TOPBAR */}
      <div className="cp-topbar">
        <div className="cp-header">
          <div className="cp-icon-box">
            <EmojiEventsOutlinedIcon
              style={{
                fontSize: "2.3rem",
                color: isDark ? "#3b82f6" : "#eab308",
              }}
            />
          </div>
          <h2 className="cp-title">
            Points Allocation & Leaderboard Management
          </h2>
        </div>

        <select
          className="cp-select"
          value={selectedTournament}
          onChange={(e) => {
            setSelectedTournament(e.target.value);
            setCurrentPage(1);
          }}
        >
          {TOURNAMENTS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* MAIN GRID */}
      <div className="cp-grid">
        {/* LEFT BOX */}
        <div className="cp-card cp-left-box">
          <div className="cp-card-header">
            <h3>Approved Player Points Allocation</h3>

            <div className="cp-actions">
              <div className="cp-search-box">
                <input
                  type="text"
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <SearchIcon className="cp-search-icon" />
              </div>

              <button
                className={`cp-btn cp-btn-edit ${isEditing ? "active" : ""}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                <EditOutlinedIcon style={{ fontSize: "16px" }} />
                Edit Points
              </button>

              <button
                className="cp-btn cp-btn-sync"
                disabled={!isEditing}
                onClick={handleSaveSync}
              >
                <SyncOutlinedIcon style={{ fontSize: "16px" }} />
                Save & Sync
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="cp-table-wrapper">
            <table className="cp-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>PLAYER NAME</th>
                  <th>CONTACT NUMBER</th>
                  <th>CURRENT POINTS</th>
                  <th style={{ textAlign: "center" }}>POINTS TO AWARD</th>
                  <th style={{ textAlign: "right" }}>NEW TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPlayers.map((row) => {
                  // 🎯 New Total = Previous + Current + Points to Award
                  const newTotal =
                    row.previousPoints +
                    row.currentPoints +
                    (row.pointsToAward || 0);

                  return (
                    <tr key={row.id}>
                      <td className="cp-id-cell">{row.id}</td>
                      <td className="cp-name-cell">{row.name}</td>
                      <td className="cp-sub-text">{row.contact}</td>
                      <td className="cp-points-cell">
                        {row.currentPoints.toLocaleString()}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <input
                          type="number"
                          className="cp-award-input"
                          disabled={!isEditing}
                          value={
                            row.pointsToAward === 0 ? "" : row.pointsToAward
                          }
                          onChange={(e) =>
                            handleAwardChange(row.id, e.target.value)
                          }
                          placeholder="0"
                        />
                      </td>
                      <td className="cp-total-cell">
                        {newTotal.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}

                {Array.from({ length: emptyRowsCount }).map((_, idx) => (
                  <tr key={`empty-${idx}`} className="cp-empty-row">
                    <td colSpan={6}>&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER & PAGINATION */}
          <div className="cp-footer">
            <span className="cp-entries-info">
              Showing{" "}
              {totalEntries === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * ITEMS_PER_PAGE, totalEntries)} of{" "}
              {totalEntries} approved players
            </span>

            <div className="cp-pagination">
              <button
                className="cp-page-nav"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                &lt; Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`cp-page-num ${currentPage === page ? "active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                className="cp-page-nav"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next &gt;
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT BOX: Leaderboard */}
        <div className="cp-card cp-right-box">
          <div className="cp-leaderboard-header">
            <EmojiEventsOutlinedIcon
              style={{ color: "#eab308", fontSize: "20px" }}
            />
            <h3>Overall Top 10 Players Leaderboard</h3>
          </div>

          <div className="cp-leaderboard-list">
            {top10Leaderboard.map((item, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              return (
                <div
                  key={item.id}
                  className={`cp-leaderboard-item rank-${rank}`}
                >
                  <div className="cp-rank-badge">
                    {isTop3 ? (
                      <span className={`cp-medal medal-${rank}`}>
                        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                      </span>
                    ) : (
                      <span className="cp-rank-num">{rank}</span>
                    )}
                  </div>

                  <div className="cp-player-info">
                    <span className="cp-lb-name">{item.name}</span>
                    <span className="cp-lb-id">{item.id}</span>
                  </div>

                  <div className="cp-lb-points">
                    {item.totalPoints.toLocaleString()} Pts
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClassPoints;
