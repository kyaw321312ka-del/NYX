import React, { useState, useEffect, useContext } from "react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import { Context } from "../Hooks/context"; // Context Import

const API_BASE = `${import.meta.env.VITE_BASE_URL}`;

// Map level data from API to editable form
const mapLevelToEditableData = (level) => {
  return {
    title_level: level.title_level || "",
    price:
      level.price !== undefined && level.price !== null
        ? String(level.price)
        : "",
    description: level.description === "-" ? "" : level.description || "",
    learning_description:
      level.learning_description === "-"
        ? ""
        : level.learning_description || "",
    main_title: level.main_title === "-" ? "" : level.main_title || "",
    title: level.title === "-" ? "" : level.title || "",
    about_title: level.about_title === "-" ? "" : level.about_title || "",
    details: level.details === "-" ? "" : level.details || "",
    instructor_name: level.instructor_name || "",
    biography: level.biography === "-" ? "" : level.biography || "",
  };
};

const isDiscountActive = (level) => {
  if (!level) return true;
  const hasDiscount =
    level.main_title && level.main_title !== "-" && level.main_title !== "";
  return hasDiscount;
};

const decodeHtmlEntities = (text) => {
  if (!text) return "";
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value.replace(/\s+/g, " ").trim();
};

const parseApiError = (responseText, responseData) => {
  if (responseData?.message) return responseData.message;
  const preMatch = responseText.match(/<pre>([\s\S]*?)<\/pre>/i);
  if (preMatch?.[1]) {
    return decodeHtmlEntities(preMatch[1].replace(/<[^>]+>/g, " "));
  }
  return "";
};

const CourseManagementDetail = ({ courseId, onBack }) => {
  // Context မှ classBackColor ရယူပြီး True Dark Mode စစ်ဆေးခြင်း
  const { classBackColor } = useContext(Context);
  const isDark = classBackColor === "#1A1C1E";

  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLevel, setActiveLevel] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Editable fields state
  const [editableData, setEditableData] = useState({
    title_level: "",
    price: "",
    description: "",
    learning_description: "",
    main_title: "",
    title: "",
    about_title: "",
    details: "",
    instructor_name: "",
    biography: "",
  });

  // Original data for comparison
  const [originalData, setOriginalData] = useState({});

  // Image states
  const [categoryCardImage, setCategoryCardImage] = useState(null);
  const [learningImage, setLearningImage] = useState(null);
  const [learningImagePreview, setLearningImagePreview] = useState(null);
  const [coachFile, setCoachFile] = useState(null);

  // UI States
  const [isDiscountEnabled, setIsDiscountEnabled] = useState(true);
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedDayId, setSelectedDayId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);

  // Edit Time Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [isUpdatingTime, setIsUpdatingTime] = useState(false);
  const [currentEditSlotId, setCurrentEditSlotId] = useState(null);

  // Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteType, setDeleteType] = useState("");

  const daysList = [
    { id: 18, name: "Monday" },
    { id: 19, name: "Tuesday" },
    { id: 20, name: "Wednesday" },
    { id: 21, name: "Thursday" },
    { id: 22, name: "Friday" },
    { id: 23, name: "Saturday" },
    { id: 24, name: "Sunday" },
  ];

  const applyLevelData = (
    level,
    { resetImages = true, resetFormState = true } = {},
  ) => {
    const newData = mapLevelToEditableData(level);
    setActiveLevel(level);
    if (resetFormState) {
      setEditableData(newData);
      setOriginalData(newData);
      setIsDiscountEnabled(isDiscountActive(level));
    }
    setLearningImagePreview(level.learning_image_url || "");
    if (resetImages) {
      setCategoryCardImage(null);
      setLearningImage(null);
      setCoachFile(null);
    }
  };

  // Fetch course data by ID
  const fetchCourseData = async (
    id,
    { silent = false, preserveLevelId = null, resetFormState = !silent } = {},
  ) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/course/showtraining/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const courseList = Array.isArray(data?.data)
        ? data.data
        : data?.data
          ? [data.data]
          : [];

      if (courseList.length > 0) {
        const courseData = courseList[0];
        setTraining(courseData);

        if (courseData.levels?.length > 0) {
          const level =
            preserveLevelId != null
              ? courseData.levels.find((item) => item.id === preserveLevelId) ||
                courseData.levels[0]
              : courseData.levels[0];
          applyLevelData(level, {
            resetImages: !silent,
            resetFormState,
          });
        } else {
          setActiveLevel(null);
        }
      } else {
        setError("No training course found for this ID");
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
      setError(error.message);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseData(courseId);
    } else {
      setError("Invalid course ID");
      setLoading(false);
    }
  }, [courseId]);

  const handleLevelChange = (level) => {
    applyLevelData(level, { resetImages: true, resetFormState: true });
    setSaveMessage("");
  };

  const handleDiscardChanges = () => {
    setEditableData(originalData);
    setCategoryCardImage(null);
    setLearningImage(null);
    setLearningImagePreview(activeLevel?.learning_image_url || "");
    setCoachFile(null);
    setIsDiscountEnabled(isDiscountActive(activeLevel));
    setSaveMessage("");
  };

  const getSchedulesForActiveLevel = () => {
    if (!training || !training.schedules || !activeLevel) return [];
    return training.schedules.filter(
      (schedule) => schedule.training_level_id === activeLevel.id,
    );
  };

  const handleFieldChange = (field, value) => {
    setEditableData((prev) => ({ ...prev, [field]: value }));
  };

  const hasDataChanged = () => {
    return JSON.stringify(editableData) !== JSON.stringify(originalData);
  };

  const handleLearningImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setLearningImagePreview(previewUrl);
      setLearningImage(file);
    }
  };

  const handleSaveCoachInfo = async () => {
    if (!activeLevel?.id) {
      return false;
    }

    if (
      !editableData.instructor_name &&
      !editableData.biography &&
      !coachFile
    ) {
      return true;
    }

    const formData = new FormData();

    if (
      editableData.instructor_name &&
      editableData.instructor_name.trim() !== ""
    ) {
      formData.append("instructor_name", editableData.instructor_name.trim());
    }

    if (editableData.biography && editableData.biography.trim() !== "") {
      formData.append("biography", editableData.biography.trim());
    }

    if (coachFile) {
      formData.append("coach_file", coachFile);
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/coursemanagement/update_coach/${activeLevel.id}`,
        {
          method: "PUT",
          body: formData,
        },
      );

      if (response.ok) {
        const data = await response.json();
        return data.success === true;
      }
      return true;
    } catch (err) {
      console.log(
        "Coach endpoint not available, coach info will be saved via main endpoint if supported",
      );
      return true;
    }
  };

  const handleSaveLevel = async () => {
    if (!activeLevel?.id) {
      alert("No training level selected");
      return;
    }

    if (
      !hasDataChanged() &&
      !categoryCardImage &&
      !learningImage &&
      !coachFile
    ) {
      setSaveMessage("No changes to save");
      setTimeout(() => setSaveMessage(""), 2000);
      return;
    }

    setIsSaving(true);
    setSaveMessage("");
    const formData = new FormData();

    if (editableData.title_level && editableData.title_level.trim() !== "") {
      formData.append("title_level", editableData.title_level.trim());
    }

    if (editableData.price && editableData.price.trim() !== "") {
      const priceNum = Number(editableData.price);
      if (!isNaN(priceNum)) {
        formData.append("price", priceNum);
      }
    }

    if (editableData.description && editableData.description.trim() !== "") {
      formData.append("description", editableData.description.trim());
    }

    if (
      editableData.learning_description &&
      editableData.learning_description.trim() !== ""
    ) {
      formData.append(
        "learning_description",
        editableData.learning_description.trim(),
      );
    }

    if (isDiscountEnabled) {
      if (editableData.main_title && editableData.main_title.trim() !== "") {
        formData.append("main_title", editableData.main_title.trim());
      }
      if (editableData.title && editableData.title.trim() !== "") {
        formData.append("title", editableData.title.trim());
      }
      if (editableData.about_title && editableData.about_title.trim() !== "") {
        formData.append("about_title", editableData.about_title.trim());
      }
      if (editableData.details && editableData.details.trim() !== "") {
        formData.append("details", editableData.details.trim());
      }
    }

    if (
      editableData.instructor_name &&
      editableData.instructor_name.trim() !== ""
    ) {
      formData.append("instructor_name", editableData.instructor_name.trim());
    }

    if (editableData.biography && editableData.biography.trim() !== "") {
      formData.append("biography", editableData.biography.trim());
    }

    if (categoryCardImage)
      formData.append("category_card_image", categoryCardImage);
    if (learningImage) formData.append("learning_image", learningImage);
    if (coachFile) formData.append("coach_file", coachFile);

    try {
      const response = await fetch(
        `${API_BASE}/api/coursemanagement/update_training_level_and_coach/${activeLevel.id}`,
        {
          method: "PUT",
          body: formData,
        },
      );

      const contentType = response.headers.get("content-type") || "";
      const responseText = await response.text();
      let responseData = null;

      if (contentType.includes("application/json")) {
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = null;
        }
      }

      if (response.ok && responseData?.success) {
        await handleSaveCoachInfo();

        setCategoryCardImage(null);
        setLearningImage(null);
        setCoachFile(null);
        await fetchCourseData(courseId, {
          silent: true,
          preserveLevelId: activeLevel.id,
          resetFormState: true,
        });
        setSaveMessage(
          responseData.message || "Training level saved successfully!",
        );
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        const parsedError = parseApiError(responseText, responseData);
        const errorMessage =
          parsedError || `Save failed (status ${response.status})`;
        setSaveMessage(errorMessage);
        setTimeout(() => setSaveMessage(""), 8000);
      }
    } catch (err) {
      console.error("Error saving:", err);
      setSaveMessage("Network error. Please try again.");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryImageUpload = (file) => {
    if (file) setCategoryCardImage(file);
  };

  const handleCoachImageUpload = (file) => {
    if (file) setCoachFile(file);
  };

  const openEditModal = (slotId, currentStartTime, currentEndTime) => {
    setCurrentEditSlotId(slotId);
    setEditStartTime(currentStartTime);
    setEditEndTime(currentEndTime);
    setIsEditModalOpen(true);
  };

  const handleUpdateTime = async () => {
    if (!editStartTime || !editEndTime) {
      alert("Please enter both start and end time");
      return;
    }
    if (!currentEditSlotId) return;

    setIsUpdatingTime(true);

    const requestData = {
      start_time: editStartTime,
      end_time: editEndTime,
    };

    try {
      const response = await fetch(
        `${API_BASE}/api/course/put_training_program_time_slot/${currentEditSlotId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Time slot updated successfully!");
        await fetchCourseData(courseId, {
          silent: true,
          preserveLevelId: activeLevel?.id,
        });
        setIsEditModalOpen(false);
        setCurrentEditSlotId(null);
      } else {
        alert(data.message || "Failed to update time slot");
      }
    } catch (err) {
      console.error("Error updating schedule:", err);
      alert("Network error. Please try again.");
    } finally {
      setIsUpdatingTime(false);
    }
  };

  const handleAddSchedule = async () => {
    if (!selectedDay || !startTime || !endTime) {
      alert("Please fill all fields");
      return;
    }
    if (!activeLevel?.id) {
      alert("No training level selected");
      return;
    }

    setIsAddingSchedule(true);

    const requestData = {
      training_program_id: training.id,
      training_schedule_days_id: parseInt(selectedDayId),
      training_level_id: activeLevel.id,
      start_time: startTime,
      end_time: endTime,
    };

    try {
      const response = await fetch(
        `${API_BASE}/api/course/adddaytimetraining`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Schedule added successfully!");
        await fetchCourseData(courseId, {
          silent: true,
          preserveLevelId: activeLevel?.id,
        });
        setSelectedDay("");
        setSelectedDayId("");
        setStartTime("");
        setEndTime("");
        setIsAddScheduleOpen(false);
      } else {
        alert(data.message || "Failed to add schedule");
      }
    } catch (err) {
      console.error("Error adding schedule:", err);
      alert("Network error. Please try again.");
    } finally {
      setIsAddingSchedule(false);
    }
  };

  const openLevelDeleteModal = (levelId) => {
    setDeleteTargetId(levelId);
    setDeleteType("level");
    setIsDeleteModalOpen(true);
  };

  const openScheduleDeleteModal = (slotId) => {
    setDeleteTargetId(slotId);
    setDeleteType("schedule");
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    const apiUrl =
      deleteType === "level"
        ? `${API_BASE}/api/course/deletetraininglevel/${deleteTargetId}`
        : `${API_BASE}/api/course/deletetrainingschedule/${deleteTargetId}`;

    try {
      const response = await fetch(apiUrl, { method: "DELETE" });
      const contentType = response.headers.get("content-type") || "";
      let data = {};

      if (contentType.includes("application/json")) {
        data = await response.json();
      }

      if (response.ok && data.success !== false) {
        await fetchCourseData(courseId, {
          silent: true,
          preserveLevelId: deleteType === "schedule" ? activeLevel?.id : null,
        });
        alert(`${deleteType} deleted successfully!`);
      } else {
        alert(data.message || `Failed to delete ${deleteType}`);
      }
    } catch (err) {
      console.error("Deletion Error:", err);
      alert("Network error. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
      setDeleteType("");
    }
  };

  const formatTime = (timeValue) => {
    if (!timeValue) return "";
    const timeString = String(timeValue);
    return timeString.includes(".")
      ? timeString.split(".")[0]
      : timeString.substring(0, 8);
  };

  const activeLevelSchedules = getSchedulesForActiveLevel();

  // Color Constants for True Dark / Light Theme
  const theme = {
    bg: isDark ? "#121212" : "#f8fafc",
    cardBg: isDark ? "#1e1e1e" : "#ffffff",
    cardBorder: isDark ? "#333333" : "#e2e8f0",
    textPrimary: isDark ? "#ffffff" : "#111827",
    textSecondary: isDark ? "#a1a1aa" : "#64748b",
    inputBg: isDark ? "#121212" : "#ffffff",
    inputBorder: isDark ? "#333333" : "#cbd5e1",
    tabActiveBg: isDark ? "#282828" : "#ffffff",
    topBarBg: isDark ? "#1e1e1e" : "#0f172a",
    buttonBg: isDark ? "#282828" : "#f1f5f9",
  };

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: theme.bg,
          color: theme.textPrimary,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h2>Loading Course Data...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: theme.bg,
          color: "#ef4444",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <h2>Error: {error}</h2>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              padding: "10px 20px",
              backgroundColor: theme.cardBg,
              color: theme.textPrimary,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Go Back to Courses
          </button>
        )}
      </div>
    );
  }

  if (!training) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: theme.bg,
          color: theme.textPrimary,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <h2>No Training Course Found</h2>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              padding: "10px 20px",
              backgroundColor: theme.cardBg,
              color: theme.textPrimary,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Go Back to Courses
          </button>
        )}
      </div>
    );
  }

  const commonInputStyle = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "6px",
    border: `1px solid ${theme.inputBorder}`,
    backgroundColor: theme.inputBg,
    color: theme.textPrimary,
    boxSizing: "border-box",
    outline: "none",
    fontSize: "14px",
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: theme.bg,
        color: theme.textPrimary,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Top Navigation Bar */}
      <div
        style={{
          backgroundColor: theme.topBarBg,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          borderBottom: `1px solid ${theme.cardBorder}`,
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: isDark ? "#ffffff" : "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </button>
        )}
        <span
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: theme.textPrimary,
          }}
        >
          {training.course_name || "Training Course"}
        </span>
      </div>

      {/* Tabs Navigation - Level Titles */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "16px 24px 0 24px",
          borderBottom: `1px solid ${theme.cardBorder}`,
          overflowX: "auto",
        }}
      >
        {training.levels &&
          training.levels.map((level) => {
            const isActive = activeLevel?.id === level.id;
            return (
              <button
                key={level.id}
                onClick={() => handleLevelChange(level)}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderBottom: isActive
                    ? "3px solid #0284c7"
                    : "3px solid transparent",
                  backgroundColor: isActive ? theme.tabActiveBg : "transparent",
                  color: isActive ? theme.textPrimary : theme.textSecondary,
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "14px",
                  cursor: "pointer",
                  borderRadius: "6px 6px 0 0",
                  transition: "all 0.2s ease",
                }}
              >
                {level.title_level || "Level"}
              </button>
            );
          })}
      </div>

      {/* Main Content Area */}
      <div style={{ padding: "24px", flexGrow: 1 }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 800,
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: theme.textPrimary,
          }}
        >
          <MenuBookOutlinedIcon /> Class Management
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Main Grid Layout: Responsive Two Columns */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {/* LEFT COLUMN */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              {/* Training Levels Card */}
              <div
                style={{
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: isDark
                    ? "0 4px 12px rgba(0,0,0,0.5)"
                    : "0 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "18px" }}>
                    Training Levels
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    {saveMessage && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: saveMessage.toLowerCase().includes("success")
                            ? "#0284c7"
                            : "#f59e0b",
                        }}
                      >
                        {saveMessage}
                      </span>
                    )}
                    <button
                      onClick={handleSaveLevel}
                      disabled={isSaving}
                      style={{
                        padding: "8px 14px",
                        backgroundColor: isDark ? "#0284c7" : "#0f1f3d",
                        color: isDark ? "#ffffff" : "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <SaveIcon style={{ fontSize: "16px" }} />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>

                {activeLevel && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: "12px",
                          color: theme.textSecondary,
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Level Title
                      </label>
                      <input
                        type="text"
                        value={editableData.title_level}
                        onChange={(e) =>
                          handleFieldChange("title_level", e.target.value)
                        }
                        placeholder="Enter level title"
                        style={commonInputStyle}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "12px",
                          color: theme.textSecondary,
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Description
                      </label>
                      <textarea
                        value={editableData.description}
                        onChange={(e) =>
                          handleFieldChange("description", e.target.value)
                        }
                        rows="2"
                        placeholder="Enter description"
                        style={{ ...commonInputStyle, resize: "vertical" }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "12px",
                          color: theme.textSecondary,
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Price
                      </label>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="text"
                          value={editableData.price}
                          onChange={(e) =>
                            handleFieldChange("price", e.target.value)
                          }
                          placeholder="Enter price"
                          style={commonInputStyle}
                        />
                        <DeleteIcon
                          onClick={() => openLevelDeleteModal(activeLevel.id)}
                          style={{ cursor: "pointer", color: "#ef4444" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Training Schedule Card */}
              <div
                style={{
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: isDark
                    ? "0 4px 12px rgba(0,0,0,0.5)"
                    : "0 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "18px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <CalendarMonthOutlinedIcon />
                    Training Schedule
                  </h3>
                  <button
                    onClick={() => setIsAddScheduleOpen(true)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#0284c7",
                      cursor: "pointer",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "13px",
                    }}
                  >
                    <AddIcon fontSize="small" />
                    Add Schedule
                  </button>
                </div>

                {activeLevelSchedules.length > 0 ? (
                  activeLevelSchedules.map((schedule) => (
                    <div
                      key={schedule.slot_id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 0",
                        borderBottom: `1px solid ${theme.cardBorder}`,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <span
                          style={{
                            fontSize: "12px",
                            color: theme.textSecondary,
                            display: "block",
                          }}
                        >
                          Day
                        </span>
                        <strong style={{ fontSize: "14px" }}>
                          {schedule.day}
                        </strong>
                      </div>
                      <div style={{ flex: 1 }}>
                        <span
                          style={{
                            fontSize: "12px",
                            color: theme.textSecondary,
                            display: "block",
                          }}
                        >
                          Start Time
                        </span>
                        <span style={{ fontSize: "13px" }}>
                          {formatTime(schedule.start_time)}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <span
                          style={{
                            fontSize: "12px",
                            color: theme.textSecondary,
                            display: "block",
                          }}
                        >
                          End Time
                        </span>
                        <span style={{ fontSize: "13px" }}>
                          {formatTime(schedule.end_time)}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <EditIcon
                          onClick={() =>
                            openEditModal(
                              schedule.slot_id,
                              formatTime(schedule.start_time),
                              formatTime(schedule.end_time),
                            )
                          }
                          style={{
                            cursor: "pointer",
                            color: theme.textSecondary,
                            fontSize: "18px",
                          }}
                        />
                        <DeleteIcon
                          onClick={() =>
                            openScheduleDeleteModal(schedule.slot_id)
                          }
                          style={{
                            cursor: "pointer",
                            color: "#ef4444",
                            fontSize: "18px",
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p
                    style={{
                      color: theme.textSecondary,
                      fontSize: "14px",
                      margin: 0,
                    }}
                  >
                    No schedules available.
                  </p>
                )}
              </div>

              {/* Special Discount Box */}
              <div
                style={{
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: isDark
                    ? "0 4px 12px rgba(0,0,0,0.5)"
                    : "0 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "18px" }}>
                    Special Discount
                  </h3>
                  <input
                    type="checkbox"
                    checked={isDiscountEnabled}
                    onChange={() => setIsDiscountEnabled(!isDiscountEnabled)}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: "12px",
                        color: theme.textSecondary,
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Main Discount Title
                    </label>
                    <input
                      type="text"
                      value={editableData.main_title}
                      onChange={(e) =>
                        handleFieldChange("main_title", e.target.value)
                      }
                      placeholder="Enter main discount title"
                      disabled={!isDiscountEnabled}
                      style={commonInputStyle}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: "12px",
                        color: theme.textSecondary,
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      value={editableData.title}
                      onChange={(e) =>
                        handleFieldChange("title", e.target.value)
                      }
                      placeholder="Enter title"
                      disabled={!isDiscountEnabled}
                      style={commonInputStyle}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: "12px",
                        color: theme.textSecondary,
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      About Discount
                    </label>
                    <input
                      type="text"
                      value={editableData.about_title}
                      onChange={(e) =>
                        handleFieldChange("about_title", e.target.value)
                      }
                      placeholder="Enter about discount"
                      disabled={!isDiscountEnabled}
                      style={commonInputStyle}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: "12px",
                        color: theme.textSecondary,
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Details
                    </label>
                    <textarea
                      value={editableData.details}
                      onChange={(e) =>
                        handleFieldChange("details", e.target.value)
                      }
                      rows="3"
                      placeholder="Enter discount details"
                      disabled={!isDiscountEnabled}
                      style={{ ...commonInputStyle, resize: "vertical" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              {/* Category Card Banner Image */}
              <div
                style={{
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: "12px",
                  padding: "16px",
                  boxShadow: isDark
                    ? "0 4px 12px rgba(0,0,0,0.5)"
                    : "0 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={
                      activeLevel?.category_card_image_url ||
                      training.category_card_image_url ||
                      "https://via.placeholder.com/400x200?text=No+Image"
                    }
                    alt="Banner"
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <label
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      right: "10px",
                      backgroundColor: "rgba(0,0,0,0.7)",
                      color: "#ffffff",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleCategoryImageUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <EditIcon fontSize="small" /> Edit Image
                  </label>
                </div>
              </div>

              {/* What You'll Learn Box */}
              <div
                style={{
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: isDark
                    ? "0 4px 12px rgba(0,0,0,0.5)"
                    : "0 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "18px" }}>
                    What You'll Learn
                  </h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <label
                      style={{
                        cursor: "pointer",
                        color: "#0284c7",
                        fontSize: "12px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleLearningImageChange}
                      />
                      <EditIcon style={{ fontSize: "16px" }} />
                      <span>Change</span>
                    </label>
                    {learningImage && (
                      <button
                        onClick={() => {
                          setLearningImage(null);
                          setLearningImagePreview(
                            activeLevel?.learning_image_url || "",
                          );
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </button>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <img
                      src={
                        learningImagePreview ||
                        activeLevel?.learning_image_url ||
                        "https://via.placeholder.com/200x150?text=No+Image"
                      }
                      alt="Learning"
                      style={{
                        width: "100%",
                        height: "140px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                  <textarea
                    value={editableData.learning_description}
                    onChange={(e) =>
                      handleFieldChange("learning_description", e.target.value)
                    }
                    rows="4"
                    placeholder="Enter learning description"
                    style={{ ...commonInputStyle, resize: "vertical" }}
                  />
                </div>
              </div>

              {/* Meet Your Coach Card */}
              <div
                style={{
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: isDark
                    ? "0 4px 12px rgba(0,0,0,0.5)"
                    : "0 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ marginBottom: "16px" }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "18px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <PersonIcon /> Meet Your Coach
                  </h3>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <img
                        src={
                          activeLevel?.coach_image_url ||
                          "https://via.placeholder.com/100x100?text=No+Image"
                        }
                        alt="Coach"
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: `2px solid ${theme.cardBorder}`,
                        }}
                      />
                      <label
                        style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          backgroundColor: "#0284c7",
                          color: "#ffffff",
                          borderRadius: "50%",
                          padding: "4px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleCoachImageUpload(e.target.files[0]);
                            }
                          }}
                        />
                        <PhotoCameraIcon style={{ fontSize: "16px" }} />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: "12px",
                        color: theme.textSecondary,
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Coach Name
                    </label>
                    <input
                      type="text"
                      value={editableData.instructor_name}
                      onChange={(e) =>
                        handleFieldChange("instructor_name", e.target.value)
                      }
                      placeholder="Enter coach name"
                      style={commonInputStyle}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: "12px",
                        color: theme.textSecondary,
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Coach Biography
                    </label>
                    <textarea
                      value={editableData.biography}
                      onChange={(e) =>
                        handleFieldChange("biography", e.target.value)
                      }
                      rows="4"
                      placeholder="Enter coach biography"
                      style={{ ...commonInputStyle, resize: "vertical" }}
                    />
                  </div>
                </div>
              </div>

              {/* Page Action Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={handleDiscardChanges}
                  disabled={isSaving}
                  style={{
                    padding: "10px 20px",
                    border: `1px solid ${theme.cardBorder}`,
                    backgroundColor: theme.buttonBg,
                    color: theme.textPrimary,
                    borderRadius: "6px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveLevel}
                  disabled={isSaving}
                  style={{
                    padding: "10px 24px",
                    border: "none",
                    backgroundColor: isDark ? "#0284c7" : "#0f1f3d",
                    color: isDark ? "#ffffff" : "white",
                    borderRadius: "6px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT TIME MODAL */}
      {isEditModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: "12px",
              width: "380px",
              padding: "24px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "18px",
                  color: theme.textPrimary,
                }}
              >
                Edit Time Slot
              </h2>
              <CloseIcon
                onClick={() => setIsEditModalOpen(false)}
                style={{ cursor: "pointer", color: theme.textSecondary }}
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: theme.textSecondary,
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  START TIME
                </label>
                <input
                  type="text"
                  placeholder="8:00:00"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  style={commonInputStyle}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: theme.textSecondary,
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  END TIME
                </label>
                <input
                  type="text"
                  placeholder="9:00:00"
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                  style={commonInputStyle}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "12px",
                }}
              >
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    padding: "8px 16px",
                    border: `1px solid ${theme.cardBorder}`,
                    backgroundColor: theme.buttonBg,
                    color: theme.textPrimary,
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTime}
                  disabled={isUpdatingTime}
                  style={{
                    padding: "8px 20px",
                    border: "none",
                    backgroundColor: "#0284c7",
                    color: "#ffffff",
                    borderRadius: "6px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {isUpdatingTime ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: "16px",
              padding: "28px",
              width: "340px",
              textAlign: "center",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto",
              }}
            >
              <ErrorOutlineIcon
                style={{ color: "#ef4444", fontSize: "30px" }}
              />
            </div>

            <h2
              style={{
                margin: "0 0 8px 0",
                fontSize: "20px",
                color: theme.textPrimary,
              }}
            >
              Delete {deleteType === "level" ? "Level" : "Schedule"}?
            </h2>
            <p
              style={{
                color: theme.textSecondary,
                fontSize: "14px",
                margin: "0 0 24px 0",
              }}
            >
              Are you sure you want to delete this {deleteType}? This action
              cannot be undone.
            </p>

            <div
              style={{ display: "flex", justifyContent: "center", gap: "12px" }}
            >
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                style={{
                  padding: "10px 20px",
                  border: `1px solid ${theme.cardBorder}`,
                  backgroundColor: theme.buttonBg,
                  color: theme.textPrimary,
                  borderRadius: "6px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{
                  padding: "10px 24px",
                  border: "none",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  borderRadius: "6px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SCHEDULE MODAL */}
      {isAddScheduleOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: "12px",
              width: "400px",
              padding: "24px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "18px",
                  color: theme.textPrimary,
                }}
              >
                Add Training Schedule
              </h2>
              <CloseIcon
                onClick={() => setIsAddScheduleOpen(false)}
                style={{ cursor: "pointer", color: theme.textSecondary }}
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: theme.textSecondary,
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  DATE SELECTION
                </label>
                <select
                  value={selectedDayId}
                  onChange={(e) => {
                    const dayId = e.target.value;
                    const day = daysList.find((d) => d.id === parseInt(dayId));
                    setSelectedDayId(dayId);
                    setSelectedDay(day?.name || "");
                  }}
                  style={commonInputStyle}
                >
                  <option value="">Select Day</option>
                  {daysList.map((day) => (
                    <option key={day.id} value={day.id}>
                      {day.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: theme.textSecondary,
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  START TIME
                </label>
                <input
                  type="text"
                  placeholder="1:00:00"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={commonInputStyle}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: theme.textSecondary,
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  END TIME
                </label>
                <input
                  type="text"
                  placeholder="3:00:00"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={commonInputStyle}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "12px",
                }}
              >
                <button
                  onClick={() => {
                    setIsAddScheduleOpen(false);
                    setSelectedDay("");
                    setSelectedDayId("");
                    setStartTime("");
                    setEndTime("");
                  }}
                  style={{
                    padding: "8px 16px",
                    border: `1px solid ${theme.cardBorder}`,
                    backgroundColor: theme.buttonBg,
                    color: theme.textPrimary,
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSchedule}
                  disabled={isAddingSchedule}
                  style={{
                    padding: "8px 20px",
                    border: "none",
                    backgroundColor: isDark ? "#282828" : "#0f1f3d",
                    color: isDark ? "#ffffff" : "white",
                    borderRadius: "6px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {isAddingSchedule ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagementDetail;
