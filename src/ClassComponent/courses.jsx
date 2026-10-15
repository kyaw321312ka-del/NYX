import React, { useState, useEffect, useContext } from "react";
import AddIcon from "@mui/icons-material/Add";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { Outlet, useNavigate } from "react-router-dom";
import { Context } from "../Hooks/context"; // Context ကို Import လုပ်ခြင်း

const Courses = () => {
  // 1. Context မှ classBackColor ကို ရယူပြီး Dark Mode ဟုတ်မဟုတ် စစ်ဆေးခြင်း
  const { classBackColor } = useContext(Context);
  const isDark = classBackColor === "#1A1C1E";

  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [courseName, setCourseName] = useState("");
  const [image, setImage] = useState(null);

  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const res = await fetch(
        "http://130.94.99.9:5000/api/coursemanagement/showtraining",
      );
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.log("Fetch error:", err);
      setCourses([]);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddCourse = async () => {
    if (!courseName || !image) {
      alert("Fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("course_name", courseName);
    formData.append("main_program_image", image);

    try {
      const res = await fetch(
        "http://130.94.99.9:5000/api/coursemanagement/addcourse",
        {
          method: "POST",
          body: formData,
        },
      );

      const text = await res.text();
      try {
        JSON.parse(text);
        fetchCourses();
        setShowModal(false);
        setCourseName("");
        setImage(null);
        setShowSuccessModal(true);
      } catch (e) {
        console.log("Backend not JSON:", e);
      }
    } catch (err) {
      console.log("Add error:", err);
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
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* MAIN CONTENT AREA */}
      <main style={{ flexGrow: 1, padding: "25px", boxSizing: "border-box" }}>
        {/* HEADER SECTION */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              color: isDark ? "#ffffff" : "#0b1320",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <ListAltIcon style={{ fontSize: "2rem" }} /> Courses
          </h1>
          <button
            style={{
              backgroundColor: isDark ? "#0284c7" : "#0b1320",
              color: "#ffffff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
            }}
            onClick={() => setShowModal(true)}
          >
            <AddIcon /> Add Course
          </button>
        </header>

        {/* COURSES GRID CARD LIST */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "24px",
            padding: "16px 0",
          }}
        >
          {courses.map((c) => (
            <div
              key={c.id}
              style={{
                backgroundColor: isDark ? "#1a1c1e" : "#ffffff",
                border: `1px solid ${isDark ? "#334155" : "#e5e7eb"}`,
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              <img
                src={c.main_program_banner_image_url}
                alt={c.course_name || "Course Banner"}
                style={{
                  width: "100%",
                  height: "160px",
                  objectFit: "cover",
                  backgroundColor: isDark ? "#0f172a" : "#f3f4f6",
                  display: "block",
                }}
                onClick={() =>
                  navigate("add_courseclass", {
                    state: {
                      courseId: c.id,
                      courseName: c.course_name,
                      isDark: isDark,
                    },
                  })
                }
              />
              <div
                style={{
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  flexGrow: 1,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    fontWeight: 600,
                    color: isDark ? "#ffffff" : "#111827",
                    lineHeight: 1.4,
                    fontFamily: "'Inter', sans-serif",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {c.course_name}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: isDark ? "#94a3b8" : "#6b7280",
            }}
          >
            <p>No courses available. Click "Add Course" to create one.</p>
          </div>
        )}
      </main>

      <Outlet context={{ isDark }} />

      {/* CREATE COURSE MODAL */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              backgroundColor: isDark ? "#1a1c1e" : "#ffffff",
              color: isDark ? "#ffffff" : "#111827",
              border: `1.5px solid ${isDark ? "#334155" : "#e5e7eb"}`,
              borderRadius: "12px",
              width: "480px",
              maxWidth: "90%",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 24px",
                borderBottom: `1px solid ${isDark ? "#334155" : "#f1f5f9"}`,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "22px",
                  color: isDark ? "#ffffff" : "#1e293b",
                }}
              >
                Create New Course
              </h3>
              <CloseIcon
                style={{
                  color: isDark ? "#94a3b8" : "#cbd5e1",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setShowModal(false);
                  setImage(null); // Modal ပိတ်ရင် ပုံကို ရှင်းထုတ်ရန်
                  setCourseName(""); // Course Name ပါ ရှင်းလိုပါက ထည့်နိုင်သည်
                }}
              />
            </div>

            <div style={{ padding: "24px" }}>
              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: isDark ? "#94a3b8" : "#475569",
                    marginBottom: "6px",
                  }}
                >
                  COURSE NAME *
                </label>
                <input
                  type="text"
                  placeholder="Enter course name (e.g., Badminton Pro)"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: `1.5px solid ${isDark ? "#334155" : "#e5e7eb"}`,
                    borderRadius: "8px",
                    backgroundColor: isDark ? "#1a1c1e" : "#ffffff",
                    color: isDark ? "#ffffff" : "#111827",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: isDark ? "#94a3b8" : "#475569",
                    marginBottom: "6px",
                  }}
                >
                  CATEGORY CARD THUMBNAIL *
                </label>
                <input
                  type="file"
                  id="file-upload"
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
                <label
                  htmlFor="file-upload"
                  style={{
                    border: `1.5px solid ${isDark ? "#334155" : "#e5e7eb"}`,
                    borderRadius: "8px",
                    backgroundColor: isDark ? "#1a1c1e" : "#ffffff",
                    color: isDark ? "#ffffff" : "#111827",
                    height: "130px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    backgroundImage: image
                      ? `url(${URL.createObjectURL(image)})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                  }}
                >
                  {!image && (
                    <>
                      <PhotoCameraIcon
                        style={{
                          fontSize: "2rem",
                          color: isDark ? "#94a3b8" : "#94a3b8",
                        }}
                      />
                      <span
                        style={{
                          color: isDark ? "#94a3b8" : "#94a3b8",
                          marginTop: "8px",
                        }}
                      >
                        Upload Course Image
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                padding: "16px 24px",
                borderTop: `1px solid ${isDark ? "#334155" : "#f1f5f9"}`,
              }}
            >
              <button
                style={{
                  padding: "10px 25px",
                  border: `1.5px solid ${isDark ? "#334155" : "#e5e7eb"}`,
                  borderRadius: "8px",
                  backgroundColor: isDark ? "#1a1c1e" : "#ffffff",
                  color: isDark ? "#ffffff" : "#111827",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setShowModal(false);
                  setImage(null); // Cancel နှိပ်ရင် ပုံကို ရှင်းထုတ်ရန်
                  setCourseName("");
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: "10px 35px",
                  border: "none",
                  backgroundColor: isDark ? "#0284c7" : "#111e30",
                  color: "#fff",
                  borderRadius: "6px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
                onClick={handleAddCourse}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              border: `1px solid ${isDark ? "#334155" : "#e5e7eb"}`,
              borderRadius: "16px",
              padding: "30px",
              textAlign: "center",
              width: "320px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div
              style={{
                backgroundColor: isDark
                  ? "rgba(16, 185, 129, 0.15)"
                  : "#e0f2fe",
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px auto",
              }}
            >
              <CheckCircleOutlineIcon
                style={{ color: "#10b981", fontSize: "2rem" }}
              />
            </div>
            <h3
              style={{ color: isDark ? "#ffffff" : "#1e3a8a", margin: "6px 0" }}
            >
              Course Added to List
            </h3>
            <p
              style={{
                color: isDark ? "#94a3b8" : "#4b5563",
                fontSize: "0.9rem",
                marginBottom: "20px",
              }}
            >
              Your new course is now available
            </p>
            <button
              style={{
                backgroundColor: isDark ? "#0284c7" : "#0b1320",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "10px 20px",
                fontWeight: 600,
                cursor: "pointer",
              }}
              onClick={() => setShowSuccessModal(false)}
            >
              Great, Thank You!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
