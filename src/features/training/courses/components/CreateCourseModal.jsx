import React, { useState } from "react";

import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

const days = [
  { short: "M", label: "MON" },
  { short: "T", label: "TUE" },
  { short: "W", label: "WED" },
  { short: "T", label: "THU" },
  { short: "F", label: "FRI" },
  { short: "S", label: "SAT" },
  { short: "S", label: "SUN" },
];

export default function CreateCourseModal() {
  const [thumbnail, setThumbnail] = useState(null);
  const [banner, setBanner] = useState(null);

  const navigate = useNavigate();

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file.name);
    }
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBanner(file.name);
    }
  };

  return (
    <div className="modal-wrapper">
      <div className="modal-card">
        {/* HEADER */}
        <div className="modal-header">
          <div>
            <h1>Create New Course</h1>
            <p>Step 1 of 2</p>
          </div>

          <button className="close-btn" onClick={() => navigate(-1)}>
            <CloseIcon />
          </button>
        </div>

        {/* UPLOAD SECTION */}
        <div className="upload-section">
          {/* THUMBNAIL */}
          <div className="upload-group">
            <p className="upload-title">CATEGORY CARD THUMBNAIL</p>

            <div className="upload-box square-box">
              <CloudUploadOutlinedIcon className="upload-icons" />

              <label htmlFor="thumbnail-upload" className="upload-labels">
                {thumbnail ? thumbnail : "Upload Square"}
              </label>

              <input
                type="file"
                id="thumbnail-upload"
                className="file-inputs"
                accept="image/*"
                onChange={handleThumbnailUpload}
              />
            </div>
          </div>

          {/* BANNER */}
          <div className="upload-group flex-grow">
            <p className="upload-title">MAIN PROGRAM BANNER</p>

            <div className="upload-box banner-box">
              <CloudUploadOutlinedIcon className="upload-icons" />

              <label htmlFor="banner-upload" className="upload-labels">
                {banner ? banner : "Upload Class Banner Image"}
              </label>

              <p>Recommended: 1920x820px</p>

              <input
                type="file"
                id="banner-upload"
                className="file-inputs"
                accept="image/*"
                onChange={handleBannerUpload}
              />
            </div>
          </div>
        </div>

        {/* TRAINING LEVELS */}
        <div className="form-card">
          <div className="card-title">
            <span className="red-line"></span>
            <h3>Training Levels</h3>
          </div>

          <div className="grid-header">
            <span>LEVEL TITLE</span>
            <span>DESCRIPTION</span>
            <span>PRICE</span>
          </div>

          <div className="input-row">
            <input type="text" />
            <input type="text" />
            <input type="text" />
          </div>

          <button className="add-btn">+ Add New Level</button>
        </div>

        {/* TRAINING SCHEDULE */}
        <div className="form-card">
          <div className="card-title">
            <span className="red-line"></span>
            <h3>Training Schedule</h3>
          </div>

          <div className="days-row">
            <small>Days:</small>

            <div className="days-list">
              {days.map((day, index) => (
                <div className="day-item" key={index}>
                  <button
                    className={`day-btn ${
                      day.label === "WED" || day.label === "FRI" ? "active" : ""
                    }`}
                  >
                    {day.short}
                  </button>

                  <span>{day.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid-header schedule-grid">
            <span>START TIME</span>
            <span>END TIME</span>
            <span>LEVEL TYPE</span>
          </div>

          <div className="input-row schedule-row">
            <input type="text" />
            <input type="text" />
            <input type="text" />
          </div>

          <button className="add-btn">+ Add New Time Slot</button>
        </div>

        {/* FOOTER */}
        <div className="footer-btn-wrap">
          <button
            className="next-btn"
            onClick={() =>
              navigate(
                "/class/classcoursemanagement/classcoursemanagementnewcourt2",
              )
            }
          >
            NEXT: PROGRAM DETAILS <span>➜</span>
          </button>
        </div>
      </div>
    </div>
  );
}
