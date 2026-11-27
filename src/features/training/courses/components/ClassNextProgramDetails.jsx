import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

export default function NextProgramDetails() {
  const navigate = useNavigate();

  const [featureImage, setFeatureImage] = useState(null);
  const [coachImage, setCoachImage] = useState(null);

  const handleFeatureUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      setFeatureImage(file.name);
    }
  };

  const handleCoachUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      setCoachImage(file.name);
    }
  };

  return (
    <div className="program-wrapper">
      <div className="program-card">
        {/* HEADER */}
        <div className="program-header">
          <div>
            <h1>Create New Course</h1>
            <p>Step 2 of 2</p>
          </div>

          <button className="close-btn" onClick={() => navigate(-1)}>
            <CloseIcon />
          </button>
        </div>

        {/* WHAT YOU'LL LEARN */}
        <div className="section-title">
          <span className="red-line"></span>
          <h3>What You'll Learn</h3>
        </div>

        <div className="learn-section">
          {/* FEATURE IMAGE */}
          <div className="upload-group">
            <div className="upload-box learn-box">
              <CloudUploadOutlinedIcon className="upload-icon" />

              <label htmlFor="feature-upload" className="upload-label">
                {featureImage ? featureImage : "Upload Featured Learning Asset"}
              </label>

              <input
                type="file"
                id="feature-upload"
                className="file-input"
                accept="image/*"
                onChange={handleFeatureUpload}
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="description-group">
            <label>LEARNING DESCRIPTION</label>

            <textarea placeholder="Outline the key curriculum milestones and student outcomes..." />
          </div>
        </div>

        {/* MEET YOUR COACH */}
        <div className="coach-card">
          <div className="section-title">
            <span className="red-line"></span>
            <h3>Meet Your Coach</h3>
          </div>

          <div className="coach-content">
            {/* COACH PHOTO */}
            <div className="coach-upload">
              <div className="upload-box coach-box">
                <CloudUploadOutlinedIcon className="upload-icon" />

                <label htmlFor="coach-upload" className="upload-label">
                  Upload
                </label>

                <input
                  type="file"
                  id="coach-upload"
                  className="file-input"
                  accept="image/*"
                  onChange={handleCoachUpload}
                />
              </div>

              <p>Photo</p>
            </div>

            {/* FORM */}
            <div className="coach-form">
              <div className="form-group">
                <label>INSTRUCTOR NAME</label>
                <input type="text" />
              </div>

              <div className="form-group">
                <label>BIOGRAPHY</label>

                <textarea placeholder="Describe the instructor's background and experience..." />
              </div>
            </div>
          </div>
        </div>

        {/* ADD TAB */}
        <button className="add-tab-btn">
          <AddCircleOutlineIcon />
          Add New Tab
        </button>

        {/* OFFER CARD */}
        <div className="offer-card">
          <div className="form-group">
            <label>Main Title</label>
            <input type="text" defaultValue="Exclusive Opening Offer" />
          </div>

          <div className="offer-grid">
            <div className="form-group">
              <label>Title</label>

              <input type="text" defaultValue="Early Bird Special." />
            </div>

            <div className="form-group">
              <label>Details</label>

              <textarea
                defaultValue="Get a massive 50% discount on your first month's registration!

Limited to the first 20 applicants this season. Don't miss out on this opportunity."
              />
            </div>
          </div>

          <div className="offer-grid">
            <div className="form-group">
              <label>About Title</label>

              <input type="text" defaultValue="50% off" />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="footer">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
            Back
          </button>

          <button className="create-btn">Create</button>
        </div>
      </div>
    </div>
  );
}
