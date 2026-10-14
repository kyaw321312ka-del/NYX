import React, { useState } from "react";
import Swal from "sweetalert2";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import "../classCss/courseaddclass.css";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = "http://130.94.99.9:5000";

const AddClassForm = () => {
  const [selectedDays, setSelectedDays] = useState("");
  const [classImage, setClassImage] = useState(null);
  const [learningImage, setLearningImage] = useState(null);
  const [coachImage, setCoachImage] = useState(null);
  const [level, setLevel] = useState("");
  const [endTime, setEndTime] = useState("");
  const [mainTitle, setMainTitle] = useState("");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [aboutTitle, setAboutTitle] = useState("");
  const [biography, setBiography] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [learningDescription, setLearningDescription] = useState("");
  const [coachName, setCoachName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [isOptionalEnabled, setIsOptionalEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Get navigation state
  const courseId = location.state?.courseId;
  const courseName = location.state?.courseName || "Course";
  const isDark = location.state?.isDark || false; // 💡 Read dark mode state

  const toggleDay = (day) => {
    setSelectedDays(day);
  };

  const handleImageChange = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: "warning",
          title: "Invalid File Type",
          text: "Please upload a valid image file (JPEG, PNG, WEBP)",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "warning",
          title: "File Too Large",
          text: "File size should be less than 5MB",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      setImage(file);
    }
  };

  const days = {
    M: 18,
    TU: 19,
    W: 20,
    TH: 21,
    F: 22,
    SA: 23,
    SU: 24,
  };

  const isValidTimeFormat = (time) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const validateForm = () => {
    if (!level || level.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please enter Level Title",
        confirmButtonColor: "#3085d6",
      });
      return false;
    }
    if (!price || price.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please enter Price",
        confirmButtonColor: "#3085d6",
      });
      return false;
    }
    if (isNaN(price) || parseFloat(price) <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Price",
        text: "Please enter a valid price greater than 0",
        confirmButtonColor: "#3085d6",
      });
      return false;
    }
    if (!selectedDays) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please select a training day",
        confirmButtonColor: "#3085d6",
      });
      return false;
    }
    if (!startTime || !isValidTimeFormat(startTime)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Start Time",
        text: "Format: HH:MM:SS",
        confirmButtonColor: "#3085d6",
      });
      return false;
    }
    if (!endTime || !isValidTimeFormat(endTime)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid End Time",
        text: "Format: HH:MM:SS",
        confirmButtonColor: "#3085d6",
      });
      return false;
    }
    if (!classImage) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please upload a Class Image",
        confirmButtonColor: "#3085d6",
      });
      return false;
    }
    if (!courseId) {
      Swal.fire({
        icon: "warning",
        title: "Missing Course",
        text: "Please select a course first",
        confirmButtonColor: "#3085d6",
      });
      return false;
    }
    if (!description || description.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please enter Description",
        confirmButtonColor: "#3085d6",
      });
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    const formData = new FormData();

    formData.append("category_card_image", classImage);
    if (learningImage) formData.append("learning_image", learningImage);
    if (coachImage) formData.append("coach_file", coachImage);

    formData.append("learning_description", learningDescription || "");
    formData.append("title_level", level);
    formData.append("price", price);
    formData.append("start_time", startTime);
    formData.append("end_time", endTime);
    formData.append("instructor_name", coachName || "");
    formData.append("biography", biography || "");
    formData.append("course_id", courseId);
    formData.append("day_id", days[selectedDays]);
    formData.append("about_level", description || "");

    if (isOptionalEnabled) {
      formData.append("main_title", mainTitle || "");
      formData.append("title", title || "");
      formData.append("details", details || "");
      formData.append("about_title", aboutTitle || "");
    } else {
      formData.append("main_title", "-");
      formData.append("title", "-");
      formData.append("details", "-");
      formData.append("about_title", "-");
    }

    try {
      const res = await fetch(`${API_BASE}/api/course/trainingprogram`, {
        method: "POST",
        body: formData,
      });

      const responseText = await res.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { success: false, message: responseText };
      }

      if (res.status === 200 || res.status === 201) {
        if (responseData.success) {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: `Training program for "${courseName}" created successfully!`,
            confirmButtonColor: "#3085d6",
          }).then(() => {
            setSelectedDays("");
            setClassImage(null);
            setLearningImage(null);
            setCoachImage(null);
            setLevel("");
            setEndTime("");
            setMainTitle("");
            setTitle("");
            setDetails("");
            setAboutTitle("");
            setBiography("");
            setPrice("");
            setDescription("");
            setLearningDescription("");
            setCoachName("");
            setStartTime("");
            setIsOptionalEnabled(true);
            setIsSubmitting(false);
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: responseData.message || "Failed to create class",
            confirmButtonColor: "#3085d6",
          });
          setIsSubmitting(false);
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: `Failed to create training program (${res.status})`,
          confirmButtonColor: "#3085d6",
        });
        setIsSubmitting(false);
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Network Error!",
        text: "Unable to connect to the server.",
        confirmButtonColor: "#3085d6",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`custom-admin-container ${isDark ? "dark-mode" : ""}`}>
      <header className="custom-header">
        <div className="custom-header-title">
          <button className="custom-back-btn" onClick={() => navigate(-1)}>
            <ChevronLeftIcon />
          </button>
          <span>{courseName}</span>
        </div>
        <div className="custom-tabs-container">
          <div className="custom-tab custom-active-tab">
            <AddIcon /> Add Class
          </div>
        </div>
      </header>

      <main className="custom-form-grid">
        {/* Left Column */}
        <div className="custom-form-column">
          <section className="custom-form-card">
            <div className="custom-section-title">Main Class Photo *</div>
            <label
              className="custom-upload-box main-photo-box"
              style={{
                backgroundImage: classImage
                  ? `url(${URL.createObjectURL(classImage)})`
                  : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setClassImage)}
                hidden
              />
              {!classImage && (
                <>
                  <PhotoCameraIcon className="custom-upload-icon-mui" />
                  <p className="custom-upload-text">Upload Class Image</p>
                </>
              )}
            </label>
          </section>

          <section className="custom-form-card">
            <div className="custom-section-title">Training Levels *</div>
            <div className="custom-input-row">
              <div className="custom-input-group">
                <label>Level Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Beginner, Intermediate, Advanced"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                />
              </div>
              <div className="custom-input-group">
                <label>Price (MMK) *</label>
                <input
                  type="number"
                  placeholder="50000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="1000"
                />
                <small className="custom-subtext">
                  Enter price in Myanmar Kyat (MMK)
                </small>
              </div>
            </div>
            <div className="custom-input-group custom-mt-3">
              <label>Description *</label>
              <textarea
                placeholder="Establish a strong foundation..."
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </section>

          <section className="custom-form-card">
            <div className="custom-section-title">Training Schedule *</div>
            <div className="custom-schedule-row">
              <span className="custom-days-label">Days *:</span>
              <div>
                {["M", "TU", "W", "TH", "F", "SA", "SU"].map((day, idx) => {
                  const dayNames = [
                    "MON",
                    "TUE",
                    "WED",
                    "THU",
                    "FRI",
                    "SAT",
                    "SUN",
                  ];
                  const isSelected = selectedDays === day;
                  return (
                    <div key={idx} className="custom-day-item">
                      <button
                        type="button"
                        className={`custom-day-btn ${isSelected ? "custom-day-selected" : ""}`}
                        onClick={() => toggleDay(day)}
                      >
                        {day}
                      </button>
                      <span className="custom-days-subtext">
                        {dayNames[idx]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="custom-input-row custom-mt-3">
              <div className="custom-input-group">
                <label>Start Time *</label>
                <div className="custom-icon--input-wrapper">
                  <input
                    type="text"
                    placeholder="12:00:00"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                  <AccessTimeIcon className="custom-input-icon-mui" />
                </div>
                <small className="custom-subtext">
                  Format: HH:MM:SS (24-hour)
                </small>
              </div>
              <div className="custom-input-group">
                <label>End Time *</label>
                <div className="custom-icon--input-wrapper">
                  <input
                    type="text"
                    placeholder="16:00:00"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                  <AccessTimeIcon className="custom-input-icon-mui" />
                </div>
                <small className="custom-subtext">
                  Format: HH:MM:SS (24-hour)
                </small>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="custom-form-column">
          <section className="custom-form-card">
            <div className="custom-section-title">What You'll Learn</div>
            <div className="custom-flex-row">
              <label
                className="custom-upload-box small-photo-box"
                style={{
                  backgroundImage: learningImage
                    ? `url(${URL.createObjectURL(learningImage)})`
                    : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, setLearningImage)}
                  hidden
                />
                {!learningImage && (
                  <>
                    <PhotoCameraIcon className="custom-upload-icon-small-mui" />
                    <span className="custom-small-upload-text">
                      Upload Asset
                    </span>
                  </>
                )}
              </label>
              <div className="custom-input-group custom-flex-1">
                <label>Learning Description</label>
                <textarea
                  placeholder="Outline key milestones..."
                  rows="4"
                  value={learningDescription}
                  onChange={(e) => setLearningDescription(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="custom-form-card">
            <div className="custom-section-title">Meet Your Coach</div>
            <div className="custom-flex-row">
              <label
                className="custom-upload-box small-photo-box coach-box"
                style={{
                  backgroundImage: coachImage
                    ? `url(${URL.createObjectURL(coachImage)})`
                    : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, setCoachImage)}
                  hidden
                />
                {!coachImage && (
                  <>
                    <PhotoCameraIcon className="custom-upload-icon-small-mui" />
                    <span className="custom-small-upload-text">
                      Upload Coach Asset
                    </span>
                  </>
                )}
              </label>
              <div className="custom-flex-1">
                <div className="custom-input-group">
                  <label>Coach Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Coach John Doe"
                    value={coachName}
                    onChange={(e) => setCoachName(e.target.value)}
                  />
                </div>
                <div className="custom-input-group custom-mt-2">
                  <label>Biography</label>
                  <textarea
                    placeholder="Describe instructor background..."
                    rows="3"
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="custom-form-card">
            <div className="custom-toggle-header">
              <div className="custom-section-title">Optional Selection</div>
              <label className="custom-switch">
                <input
                  type="checkbox"
                  checked={isOptionalEnabled}
                  onChange={(e) => setIsOptionalEnabled(e.target.checked)}
                />
                <span className="custom-slider"></span>
              </label>
            </div>
            <div className="custom-input-group custom-mt-2">
              <label>Main Title</label>
              <input
                type="text"
                placeholder="Exclusive Opening Offer"
                value={mainTitle}
                onChange={(e) => setMainTitle(e.target.value)}
                disabled={!isOptionalEnabled}
                style={{ opacity: !isOptionalEnabled ? 0.6 : 1 }}
              />
            </div>
            <div className="custom-input-row custom-mt-2">
              <div className="custom-input-group">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="Early Bird Special"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!isOptionalEnabled}
                  style={{ opacity: !isOptionalEnabled ? 0.6 : 1 }}
                />
              </div>
              <div className="custom-input-group">
                <label>Details</label>
                <textarea
                  placeholder="Get a discount..."
                  rows="3"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  disabled={!isOptionalEnabled}
                  style={{ opacity: !isOptionalEnabled ? 0.6 : 1 }}
                />
              </div>
            </div>
            <div className="custom-input-group custom-mt-2 custom-half-width">
              <label>About Title</label>
              <input
                type="text"
                placeholder="50% off"
                value={aboutTitle}
                onChange={(e) => setAboutTitle(e.target.value)}
                disabled={!isOptionalEnabled}
                style={{ opacity: !isOptionalEnabled ? 0.6 : 1 }}
              />
            </div>
          </section>
        </div>
      </main>

      <footer className="custom-form-footer" style={{ marginTop: "-40px" }}>
        <button
          className="custom-btn-cancel"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          className="custom-btn-create"
          onClick={handleCreate}
          disabled={isSubmitting}
          style={{
            opacity: isSubmitting ? 0.7 : 1,
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting ? "Creating..." : "Create"}
        </button>
      </footer>
    </div>
  );
};

export default AddClassForm;
