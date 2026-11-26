import React, { useState, useRef, useContext } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import BackIcon from "@mui/icons-material/ArrowBackIosNew";
import TrophyIcon from "@mui/icons-material/EmojiEventsOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import AddPhotoIcon from "@mui/icons-material/AddAPhotoOutlined";
import AddIcon from "@mui/icons-material/Add";
import Swal from "sweetalert2";
import { Context } from "../Hooks/context";
import "./tournamentdetails.css";

function TournamentDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const contextData = useContext(Context);
  const outletContext = useOutletContext() || {};
  const { isDark: parentIsDark } = outletContext;

  const isDark =
    parentIsDark ?? contextData?.classBackColor?.toLowerCase() === "#1a1c1e";

  const getSwalTheme = () => ({
    background: isDark ? "#1A1C1E" : "#ffffff",
    color: isDark ? "#E1E1E1" : "#0f172a",
  });

  // Edit Icon နှိပ်ပြီး ဝင်လာရင် Auto Edit Mode ပွင့်ရန်
  const [isEditing, setIsEditing] = useState(location.state?.autoEdit || false);

  // 🎯 Card မှ ပါလာသော Data အစုံအလင် (မပါလာပါက Fallback Default)
  const incomingData = location.state?.tournamentData;

  const [formData, setFormData] = useState({
    name: incomingData?.title || "",
    description: incomingData?.description || "",
    format: String(incomingData?.formatId ?? incomingData?.format ?? "1"),
    category: String(incomingData?.categoryId ?? incomingData?.category ?? ""),
    courtNumber: String(incomingData?.courtId ?? incomingData?.court ?? ""),
    startDate: incomingData?.startDate || "",
    endDate: incomingData?.endDate || "",
    time: incomingData?.time || "",
    address: incomingData?.address || "",
    fee: incomingData?.fee || "",
    slots: incomingData?.slots || "",
  });

  const [bannerPreview, setBannerPreview] = useState(incomingData?.image || "");
  const [bannerFile, setBannerFile] = useState(null);
  const [rankPoints, setRankPoints] = useState(
    incomingData?.rankPoints?.map((item) => ({
      rank: item.rank || `${item.rank_position}th Place`,
      value: String(item.value ?? item.points ?? ""),
    })) || [
      { rank: "1st Place", value: "500" },
      { rank: "2nd Place", value: "250" },
      { rank: "3rd Place", value: "100" },
    ],
  );

  const fileRef = useRef(null);

  // Input Change Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const img = e.target.files[0];
    if (img) {
      setBannerFile(img);
      setBannerPreview(URL.createObjectURL(img));
    }
  };

  const handlePointChange = (index, val) => {
    const updated = [...rankPoints];
    updated[index].value = val;
    setRankPoints(updated);
  };

  const handleRankChange = (index, val) => {
    const updated = [...rankPoints];
    updated[index].rank = val;
    setRankPoints(updated);
  };

  const handleRemoveRankPoint = (index) => {
    setRankPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddRankPoint = () => {
    const nextIndex = rankPoints.length + 1;
    let rankText = `${nextIndex}th Place`;
    if (nextIndex === 4) rankText = "4th Place";

    setRankPoints((prev) => [...prev, { rank: rankText, value: "" }]);
  };

  // Submit Save Changes
  const handleSaveChanges = async (e) => {
    e.preventDefault();

    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    try {
      const requestData = new FormData();
      const tournamentFee = String(formData.fee || "").replace(/,/g, "");

      requestData.append("tournament_name", formData.name);
      requestData.append("rules_description", formData.description);
      requestData.append("match_format_id", formData.format);
      requestData.append("court_category_id", formData.category);
      requestData.append("court_id", formData.courtNumber);
      requestData.append("start_date", formData.startDate);
      requestData.append("end_date", formData.endDate);
      requestData.append(
        "dates",
        JSON.stringify([formData.startDate, formData.endDate]),
      );
      requestData.append("tournament_time", formData.time);
      requestData.append("tournament_address", formData.address);
      requestData.append("tournament_fee", tournamentFee);
      requestData.append("max_participants", formData.slots);
      requestData.append("status_id", "1");
      requestData.append(
        "rank_points",
        JSON.stringify(
          rankPoints.map((item, index) => ({
            rank_position: index + 1,
            points: Number(item.value),
          })),
        ),
      );

      if (bannerFile) {
        requestData.append("banner_image", bannerFile);
      }

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/tournament/updatetournament/${incomingData?.id}`,
        {
          method: "PUT",
          headers: contextData?.Token
            ? { Authorization: `Bearer ${contextData.Token}` }
            : undefined,
          body: requestData,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText || `Tournament update failed (${response.status})`,
        );
      }

      await Swal.fire({
        title: "Success",
        text: "Tournament details updated successfully!",
        icon: "success",
        confirmButtonText: "Great, Thanks!",
        confirmButtonColor: "#3b82f6",
        ...getSwalTheme(),
      });

      setIsEditing(false);
    } catch (err) {
      console.error(err);
      await Swal.fire({
        title: "Error",
        text: "Failed to save changes",
        icon: "error",
        confirmButtonColor: "#ef4444",
        ...getSwalTheme(),
      });
    }
  };

  return createPortal(
    <form
      className={`td-main ${isDark ? "dark-mode" : ""}`}
      onSubmit={handleSaveChanges}
    >
      {/* 1. TOP STICKY NAV BAR */}
      <nav className="td-nav">
        <button type="button" onClick={() => navigate(-1)}>
          <BackIcon sx={{ fontSize: "15px" }} />
        </button>
      </nav>

      {/* 2. MAIN CARD */}
      <main className="td-body-container">
        <div className="td-card">
          {/* Header & Edit Info Toggle Button */}
          <div className="td-card-header">
            <div className="td-header-left">
              <div className="trophy-badge">
                <TrophyIcon className="trophy-badge-icon" />
              </div>
              <h2>Tournament Details</h2>
            </div>

            <button
              type="button"
              className={`td-edit-btn ${isEditing ? "active" : ""}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              <EditIcon sx={{ fontSize: 16 }} />
              {isEditing ? "Cancel Edit" : "Edit Info"}
            </button>
          </div>

          {/* Form Content Grid */}
          <div className="td-form-grid">
            {/* LEFT COLUMN: Basic Info */}
            <div className="td-form-col">
              <h3 className="td-section-title">Basic Information</h3>

              <div className="td-input-group">
                <label>TOURNAMENT NAME</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="td-input-group">
                <label>RULES & DESCRIPTION</label>
                <textarea
                  rows={5}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                ></textarea>
              </div>

              {/* Tournament Banner Photo */}
              <div className="td-input-group">
                <label>TOURNAMENT BANNER PHOTO</label>
                <div className="td-banner-row">
                  <div className="td-current-banner">
                    {bannerPreview ? (
                      <img src={bannerPreview} alt="Tournament Banner" />
                    ) : (
                      <div className="td-no-img">No Image</div>
                    )}
                  </div>

                  <div
                    className={`td-add-photo-box ${!isEditing ? "disabled" : ""}`}
                    onClick={() => isEditing && fileRef.current.click()}
                  >
                    <input
                      type="file"
                      ref={fileRef}
                      accept="image/*"
                      className="td-hidden-file"
                      onChange={handleImageChange}
                      disabled={!isEditing}
                    />
                    <AddPhotoIcon className="td-add-icon" />
                    <span>+ Add Image</span>
                  </div>
                </div>
              </div>

              {/* Points & Rewards */}
              <div className="td-rewards-card">
                <div className="td-rewards-title">
                  <TrophyIcon sx={{ fontSize: 16, color: "#0058be" }} />
                  <span>Points & Rewards</span>
                </div>

                <div className="td-rewards-grid">
                  {rankPoints.map((item, i) => (
                    <div key={i} className="td-reward-item">
                      <button
                        type="button"
                        className="td-remove-rank-btn"
                        onClick={() => handleRemoveRankPoint(i)}
                        aria-label={`Remove ${item.rank}`}
                        disabled={!isEditing}
                      >
                        ×
                      </button>
                      <input
                        type="text"
                        className="td-rank-edit-input"
                        value={item.rank}
                        onChange={(e) => handleRankChange(i, e.target.value)}
                        disabled={!isEditing}
                        placeholder="Rank name"
                      />
                      <div className="td-reward-input-wrap">
                        <TrophyIcon sx={{ fontSize: 13, color: "#94a3b8" }} />
                        <input
                          type="number"
                          value={item.value}
                          onChange={(e) => handlePointChange(i, e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <button
                    type="button"
                    className="td-add-rank-btn"
                    onClick={handleAddRankPoint}
                  >
                    <AddIcon sx={{ fontSize: 15 }} /> Add Rank Point
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Match Details */}
            <div className="td-form-col">
              <h3 className="td-section-title">Match Details</h3>

              <div className="td-input-group">
                <label>MATCH FORMAT</label>
                <select
                  name="format"
                  value={formData.format}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >
                  <option value="1">Singles</option>
                  <option value="2">Group</option>
                </select>
              </div>

              <div className="td-input-group">
                <label>COURT CATEGORY</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >
                  <option value={String(incomingData?.categoryId ?? "badminton")}>
                    {incomingData?.category || "Badminton"}
                  </option>
                  <option value="badminton">Badminton</option>
                  <option value="tennis">Tennis</option>
                  <option value="football">Football</option>
                </select>
              </div>

              <div className="td-input-group">
                <label>COURT NUMBER</label>
                <select
                  name="courtNumber"
                  value={formData.courtNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >
                  <option value={String(incomingData?.courtId ?? "Court 1")}>
                    {incomingData?.court || "Court 1"}
                  </option>
                  <option value="1">Court 1</option>
                  <option value="Court 2">Court 2</option>
                  <option value="Court 3">Court 3</option>
                </select>
              </div>

              <div className="td-grid-two">
                <div className="td-input-group">
                  <label>START DATE</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="td-input-group">
                  <label>END DATE</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="td-input-group">
                <label>TOURNAMENT TIME</label>
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="td-input-group">
                <label>TOURNAMENT ADDRESS</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="td-input-group">
                <label>TOURNAMENT FEE</label>
                <input
                  type="text"
                  name="fee"
                  value={formData.fee}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="td-input-group">
                <label>MAX PARTICIPANTS / SLOTS</label>
                <input
                  type="text"
                  name="slots"
                  value={formData.slots}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="td-footer-actions">
            <button
              type="button"
              className="td-btn-cancel"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`td-btn-submit ${!isEditing ? "disabled-btn" : ""}`}
              disabled={!isEditing}
            >
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </form>,
    document.body,
  );
}

export default TournamentDetails;
