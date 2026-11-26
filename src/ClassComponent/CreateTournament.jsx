import React, { useState, useRef, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useOutletContext } from "react-router-dom";
import BackIcon from "@mui/icons-material/ArrowBackIosNew";
import TrophyIcon from "@mui/icons-material/EmojiEventsOutlined";
import UploadIcon from "@mui/icons-material/CloudUploadOutlined";
import AddIcon from "@mui/icons-material/Add";
import Swal from "sweetalert2";
import { Context } from "../Hooks/context";
import { useGetClassVenue } from "../ClassApi";
import "./CreateTournament.css";

function CreateTournament() {
  const navigate = useNavigate();
  const contextData = useContext(Context);
  const outletContext = useOutletContext() || {};
  const { isDark: parentIsDark } = outletContext;

  // Dark Mode Check (ClassAddCourt Pattern)
  const isDark =
    parentIsDark ?? contextData?.classBackColor?.toLowerCase() === "#1a1c1e";

  const getSwalTheme = () => ({
    background: isDark ? "#1A1C1E" : "#ffffff",
    color: isDark ? "#E1E1E1" : "#0f172a",
  });

  // File & Image States
  const [file, setFile] = useState(null);
  const [filePath, setFilePath] = useState(null);
  const fileRef = useRef(null);

  const { GetVenue, Venue, GetCourts, Courts } = useGetClassVenue();

  const [matchFormats, setMatchFormats] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState("");

  useEffect(() => {
    GetVenue();
  }, [GetVenue]);

  useEffect(() => {
    const fetchMatchFormats = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/tournament/showmatchformats`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch match formats");
        }

        const result = await response.json();
        const formats = Array.isArray(result?.data) ? result.data : [];
        setMatchFormats(formats);

        if (formats.length > 0 && !selectedFormat) {
          setSelectedFormat(String(formats[0].id ?? formats[0].name));
        }
      } catch (error) {
        console.error("Match format fetch error:", error);
        setMatchFormats([]);
      }
    };

    fetchMatchFormats();
  }, []);

  const venueOptions = Array.isArray(Venue?.data) ? Venue.data : [];
  const courtOptions = Array.isArray(Courts?.data) ? Courts.data : [];

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCourt, setSelectedCourt] = useState("");

  useEffect(() => {
    if (!venueOptions.length) return;

    if (!selectedCategory) {
      setSelectedCategory(String(venueOptions[0].id ?? venueOptions[0].venue_name));
    }

    if (!selectedCategory) {
      return;
    }

    const targetVenue = venueOptions.find(
      (venue) => String(venue.id ?? venue.venue_name) === String(selectedCategory),
    );

    if (targetVenue && targetVenue.id) {
      GetCourts(targetVenue.id);
    }
  }, [venueOptions, selectedCategory, GetCourts]);

  useEffect(() => {
    if (!courtOptions.length) {
      setSelectedCourt("");
      return;
    }

    const currentCourtExists = courtOptions.some(
      (court) => String(court.id ?? court.court_name) === String(selectedCourt),
    );

    if (!currentCourtExists) {
      setSelectedCourt(String(courtOptions[0].id ?? courtOptions[0].court_name));
    }
  }, [courtOptions, selectedCourt]);

  // Rank positions are generated from their order; only points are editable.
  const [rankPoints, setRankPoints] = useState([
    { points: "500" },
    { points: "250" },
    { points: "100" },
  ]);

  const handleCategoryChange = (e) => {
    const nextCategory = e.target.value;
    setSelectedCategory(nextCategory);
    setSelectedCourt("");
  };

  const handleFormatChange = (e) => {
    setSelectedFormat(e.target.value);
  };

  const handleCourtChange = (e) => {
    setSelectedCourt(e.target.value);
  };

  const handleImageChange = (e) => {
    const img = e.target.files[0];
    if (img) {
      setFile(img);
      setFilePath(URL.createObjectURL(img));
    }
  };

  const handleAddRankPoint = () => {
    setRankPoints((prev) => [...prev, { points: "0" }]);
  };

  const handlePointChange = (index, val) => {
    const updated = [...rankPoints];
    updated[index].points = val;
    setRankPoints(updated);
  };

  const handleRemoveRankPoint = (index) => {
    setRankPoints((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );
  };

  const handleCreateTournament = async (e) => {
    e.preventDefault();

    const normalizedRankPoints = rankPoints.map((item, index) => ({
      rank_position: index + 1,
      points: Number(item.points),
    }));

    const hasInvalidRankPoints = normalizedRankPoints.some(
      (item, index) =>
        rankPoints[index].points === "" ||
        !Number.isFinite(item.points) ||
        item.points < 0,
    );

    if (hasInvalidRankPoints) {
      await Swal.fire({
        title: "Invalid Rank Points",
        text: "Enter a non-negative number of points for every rank.",
        icon: "warning",
        confirmButtonColor: "#ef4444",
        ...getSwalTheme(),
      });
      return;
    }

    // Image Upload Check
    if (!file) {
      await Swal.fire({
        title: "Banner Required",
        text: "Please upload a tournament banner photo.",
        icon: "warning",
        confirmButtonColor: "#ef4444",
        ...getSwalTheme(),
      });
      return;
    }

    try {
      const formData = new FormData(e.currentTarget);
      const tournamentName = formData.get("name");
      const tournamentFee = String(formData.get("fee") || "").replace(
        /,/g,
        "",
      );
      const startDate = formData.get("startDate");
      const endDate = formData.get("endDate");
      const description = formData.get("description");
      const categoryId = formData.get("category");
      const courtId = formData.get("courtNumber");
      const tournamentTime = formData.get("time");
      const tournamentAddress = formData.get("address");
      const maxParticipants = formData.get("slots");

      formData.delete("name");
      formData.append("tournament_name", tournamentName || "");
      formData.delete("description");
      formData.append("rules_description", description || "");
      formData.delete("format");
      formData.append("match_format_id", selectedFormat);
      formData.delete("category");
      formData.append("court_category_id", categoryId || "");
      formData.delete("courtNumber");
      formData.append("court_id", courtId || "");
      formData.delete("startDate");
      formData.append("start_date", startDate || "");
      formData.delete("endDate");
      formData.append("end_date", endDate || "");
      formData.delete("time");
      formData.append("tournament_time", tournamentTime || "");
      formData.delete("address");
      formData.append("tournament_address", tournamentAddress || "");
      formData.delete("fee");
      formData.append("tournament_fee", tournamentFee);
      formData.delete("slots");
      formData.append("max_participants", maxParticipants || "");
      formData.append("status_id", "1");
      formData.append("banner_image", file);
      formData.append("rank_points", JSON.stringify(normalizedRankPoints));

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/tournament/addtournament`,
        {
          method: "POST",
          headers: contextData?.Token
            ? { Authorization: `Bearer ${contextData.Token}` }
            : undefined,
          body: formData,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText || `Tournament creation failed (${response.status})`,
        );
      }

      await Swal.fire({
        title: "Success",
        text: "Tournament has been created successfully",
        icon: "success",
        confirmButtonText: "Great, Thanks!",
        confirmButtonColor: "#3b82f6",
        ...getSwalTheme(),
      });

      navigate(-1);
    } catch (err) {
      console.error(err);
      await Swal.fire({
        title: "Error",
        text: "Something went wrong",
        icon: "error",
        confirmButtonColor: "#ef4444",
        ...getSwalTheme(),
      });
    }
  };

  return createPortal(
    <form
      className={`create-tournament-main ${isDark ? "dark-mode" : ""}`}
      onSubmit={handleCreateTournament}
    >
      {/* 1. TOP STICKY NAV BAR (ClassAddCourt Pattern) */}
      <nav className="ct-nav">
        <button type="button" onClick={() => navigate(-1)}>
          <BackIcon sx={{ fontSize: "15px" }} />
        </button>
      </nav>

      {/* 2. MAIN CARD CONTENT */}
      <main className="ct-body-container">
        <div className="ct-card">
          {/* Card Header Title */}
          <div className="ct-card-header">
            <div className="trophy-badge">
              <TrophyIcon className="trophy-badge-icon" />
            </div>
            <h2>Create New Tournament</h2>
          </div>

          {/* 2 Columns Grid */}
          <div className="ct-form-grid">
            {/* LEFT COLUMN: Basic Info */}
            <div className="ct-form-col">
              <h3 className="ct-section-title">Basic Information</h3>

              <div className="ct-input-group">
                <label>TOURNAMENT NAME</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Summer Smash Open"
                  required
                />
              </div>

              <div className="ct-input-group">
                <label>RULES & DESCRIPTION</label>
                <textarea
                  rows={4}
                  name="description"
                  placeholder="Write details like match rounds, ground rules, and eligibility..."
                  required
                ></textarea>
              </div>

              {/* Banner Photo Upload */}
              <div className="ct-input-group">
                <label>TOURNAMENT BANNER PHOTO</label>
                <div
                  className="ct-upload-box"
                  onClick={() => fileRef.current.click()}
                >
                  <input
                    type="file"
                    ref={fileRef}
                    accept="image/*"
                    className="ct-hidden-file"
                    onChange={handleImageChange}
                  />
                  {file ? (
                    <img
                      src={filePath}
                      alt="Banner Preview"
                      className="ct-banner-preview"
                    />
                  ) : (
                    <>
                      <UploadIcon className="ct-upload-icon" />
                      <p className="ct-upload-text">
                        Drag & Drop or <span>browse</span>
                      </p>
                      <span className="ct-upload-sub">
                        (JPG, PNG supported)
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Points & Rewards Sub-Card */}
              <div className="ct-rewards-card">
                <div className="ct-rewards-title">
                  <TrophyIcon sx={{ fontSize: 16, color: "#0058be" }} />
                  <span>Points & Rewards</span>
                </div>

                <div className="ct-rewards-grid">
                  {rankPoints.map((item, i) => (
                    <div key={i} className="ct-reward-item">
                      <button
                        type="button"
                        className="ct-remove-rank-btn"
                        onClick={() => handleRemoveRankPoint(i)}
                        aria-label={`Remove ${i + 1}${i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"} place`}
                      >
                        ×
                      </button>
                      <span className="ct-rank-label">
                        {i + 1}{i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"} Place
                      </span>
                      <div className="ct-reward-input-wrap">
                        <TrophyIcon sx={{ fontSize: 13, color: "#94a3b8" }} />
                        <input
                          type="number"
                          min="0"
                          step="1"
                          required
                          aria-label={`${i + 1}${i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"} place points`}
                          value={item.points}
                          onChange={(e) => handlePointChange(i, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="ct-add-rank-btn"
                  onClick={handleAddRankPoint}
                >
                  <AddIcon sx={{ fontSize: 15 }} /> Add Rank Point
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Match Details */}
            <div className="ct-form-col">
              <h3 className="ct-section-title">Match Details</h3>

              <div className="ct-input-group">
                <label>MATCH FORMAT</label>
                <select
                  name="format"
                  required
                  value={selectedFormat}
                  onChange={handleFormatChange}
                  disabled={!matchFormats.length}
                >
                  {matchFormats.length ? (
                    matchFormats.map((format) => (
                      <option
                        key={format.id ?? format.name}
                        value={String(format.id ?? format.name)}
                      >
                        {format.name}
                      </option>
                    ))
                  ) : (
                    <option value="">Loading formats...</option>
                  )}
                </select>
              </div>

              <div className="ct-input-group">
                <label>COURT CATEGORY</label>
                <select
                  name="category"
                  required
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  disabled={!venueOptions.length}
                >
                  {venueOptions.length ? (
                    venueOptions.map((venue) => (
                      <option
                        key={venue.id ?? venue.venue_name}
                        value={String(venue.id ?? venue.venue_name)}
                      >
                        {venue.venue_name || venue.name || `Venue ${venue.id}`}
                      </option>
                    ))
                  ) : (
                    <option value="">Loading venues...</option>
                  )}
                </select>
              </div>

              <div className="ct-input-group">
                <label>COURT NUMBER</label>
                <select
                  name="courtNumber"
                  required
                  value={selectedCourt}
                  onChange={handleCourtChange}
                  disabled={!courtOptions.length}
                >
                  {courtOptions.length ? (
                    courtOptions.map((court) => (
                      <option
                        key={court.id ?? court.court_name}
                        value={String(court.id ?? court.court_name)}
                      >
                        {court.court_name || `Court ${court.id}`}
                      </option>
                    ))
                  ) : (
                    <option value="">Select a venue first</option>
                  )}
                </select>
              </div>

              <div className="ct-grid-two">
                <div className="ct-input-group">
                  <label>START DATE</label>
                  <input type="date" name="startDate" required />
                </div>
                <div className="ct-input-group">
                  <label>END DATE</label>
                  <input type="date" name="endDate" required />
                </div>
              </div>

              <div className="ct-input-group">
                <label>TOURNAMENT TIME</label>
                <input
                  type="text"
                  name="time"
                  placeholder="09:00 AM - 05:00 PM"
                  required
                />
              </div>

              <div className="ct-input-group">
                <label>TOURNAMENT ADDRESS</label>
                <input
                  type="text"
                  name="address"
                  placeholder="e.g. 123 Sports Avenue, Yangon"
                  required
                />
              </div>

              <div className="ct-input-group">
                <label>TOURNAMENT FEE</label>
                <input type="text" name="fee" placeholder="10,000" required />
              </div>

              <div className="ct-input-group">
                <label>MAX PARTICIPANTS / SLOTS</label>
                <input
                  type="text"
                  name="slots"
                  placeholder="e.g. 16, 32, 64"
                  required
                />
              </div>
            </div>
          </div>

          {/* Form Bottom Actions */}
          <div className="ct-footer-actions">
            <button
              type="button"
              className="ct-btn-cancel"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button type="submit" className="ct-btn-submit">
              Create
            </button>
          </div>
        </div>
      </main>
    </form>,
    document.body,
  );
}

export default CreateTournament;
