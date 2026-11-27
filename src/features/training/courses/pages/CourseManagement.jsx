import React, { useState, useEffect, useContext } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import CourseManagementDetail from "./CourseManagementDetail";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LayersIcon from "@mui/icons-material/Layers";
import { Context } from "../../../../shared/hooks/AppContext"; // Context Import

const CourseManagement = () => {
  // 1. Context မှ classBackColor ကို ရယူပြီး True Dark Mode စစ်ဆေးခြင်း
  const { classBackColor } = useContext(Context);
  const isDark = classBackColor === "#1A1C1E";

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState({
    id: null,
    course_name: "",
    main_program_banner_image_url: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Confirm Modal States
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    courseId: null,
    courseName: "",
  });

  // Success Confirmation Popup States
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const fetchCourses = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/coursemanagement/showtraining`,
      );

      const data = await res.json();
      console.log("GET DATA:", data);

      setCourses(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.log("Fetch error:", err);
      setCourses([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle back to list
  const handleBackToList = () => {
    setShowDetail(false);
    setSelectedCourseId(null);
  };

  // Handle course details
  const handleCourseDetails = (courseId) => {
    console.log("View details for course:", courseId);
    setSelectedCourseId(courseId);
    setShowDetail(true);
  };

  // Handle edit click - open modal with course data
  const handleEditClick = (course) => {
    setSelectedCourse({
      id: course.id,
      course_name: course.course_name,
      main_program_banner_image_url: course.main_program_banner_image_url,
    });
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  // Handle update submit with FormData
  const handleUpdateSubmit = async () => {
    if (!selectedCourse.id) {
      alert("Invalid course");
      return;
    }

    setIsUpdating(true);
    const formData = new FormData();

    if (selectedCourse.course_name) {
      formData.append("course_name", selectedCourse.course_name);
    }

    if (selectedImage) {
      formData.append("main_program_image", selectedImage);
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/coursemanagement/updatecourse/${selectedCourse.id}`,
        {
          method: "PUT",
          body: formData,
        },
      );

      const result = await response.json();
      console.log("Update response:", result);

      if (response.ok && result.success) {
        setIsModalOpen(false);
        fetchCourses();

        setSuccessModal({
          isOpen: true,
          title: "Course Updated Successfully",
          message: "Your changes are now available",
        });

        setSelectedCourse({
          id: null,
          course_name: "",
          main_program_banner_image_url: "",
        });
        setSelectedImage(null);
      } else {
        alert(result.message || "Action failed. Could not update the course.");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Server communication error. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTrigger = (id, name) => {
    setDeleteConfirm({
      isOpen: true,
      courseId: id,
      courseName: name,
    });
  };

  const handleConfirmDelete = async () => {
    const id = deleteConfirm.courseId;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/course/deletetraining/${id}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        setCourses(
          courses.filter((course) => (course.id || course._id) !== id),
        );
        setDeleteConfirm({ isOpen: false, courseId: null, courseName: "" });

        setSuccessModal({
          isOpen: true,
          title: "Course Deleted",
          message: "Your course has been removed from the list",
        });
      } else {
        alert("Action failed. Could not delete the course.");
      }
    } catch (err) {
      alert("Server communication error.");
    }
  };

  // If showing detail, render the detail component
  if (showDetail) {
    return (
      <div>
        <CourseManagementDetail
          courseId={selectedCourseId}
          onBack={handleBackToList}
        />
      </div>
    );
  }

  if (loading)
    return (
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: isDark ? "#121212" : "#f8fafc",
          color: isDark ? "#ffffff" : "#111827",
          padding: "40px",
          textAlign: "center",
        }}
      >
        Loading courses...
      </div>
    );

  if (error)
    return (
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: isDark ? "#121212" : "#f8fafc",
          color: "#ef4444",
          padding: "40px",
          textAlign: "center",
        }}
      >
        Error: {error}
      </div>
    );

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
      <div style={{ flexGrow: 1, padding: "25px", boxSizing: "border-box" }}>
        {/* HEADER SECTION */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "30px",
          }}
        >
          <LayersIcon
            style={{
              fontSize: "40px",
              color: isDark ? "#ffffff" : "#111827",
            }}
          />
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              margin: 0,
              color: isDark ? "#ffffff" : "#111827",
            }}
          >
            Course Management
          </h1>
        </div>

        {/* COURSE GRID CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {courses && courses.length > 0 ? (
            courses.map((course, index) => {
              const courseId = course.id || course._id || index;
              return (
                <div
                  key={courseId}
                  style={{
                    backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
                    border: `1px solid ${isDark ? "#333333" : "#e5e7eb"}`,
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: isDark
                      ? "0 4px 12px rgba(0,0,0,0.5)"
                      : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s ease",
                  }}
                >
                  <img
                    src={course.main_program_banner_image_url}
                    alt={course.course_name}
                    style={{
                      width: "100%",
                      height: "160px",
                      objectFit: "cover",
                      backgroundColor: isDark ? "#121212" : "#f3f4f6",
                    }}
                  />
                  <div
                    style={{
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      flexGrow: 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "16px",
                          fontWeight: 700,
                          color: isDark ? "#ffffff" : "#111827",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "180px",
                        }}
                      >
                        {course.course_name || "No Title"}
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >
                        <EditIcon
                          onClick={() => handleEditClick(course)}
                          style={{
                            cursor: "pointer",
                            color: isDark ? "#a1a1aa" : "#4b5563",
                            fontSize: "20px",
                          }}
                        />
                        <DeleteIcon
                          onClick={() =>
                            handleDeleteTrigger(courseId, course.course_name)
                          }
                          style={{
                            cursor: "pointer",
                            color: "#ef4444",
                            fontSize: "20px",
                          }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleCourseDetails(courseId)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: `1px solid ${isDark ? "#333333" : "#cbd5e1"}`,
                        borderRadius: "6px",
                        backgroundColor: isDark ? "#282828" : "#0f1f3d",
                        color: isDark ? "#ffffff" : "white",
                        fontWeight: 700,
                        fontSize: "12px",
                        cursor: "pointer",
                        letterSpacing: "0.5px",
                        marginTop: "auto",
                      }}
                    >
                      COURSE DETAILS
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p
              style={{
                textAlign: "center",
                width: "100%",
                color: isDark ? "#a1a1aa" : "#6b7280",
              }}
            >
              No courses available.
            </p>
          )}
        </div>
      </div>

      {/* EDIT FORM MODAL */}
      {isModalOpen && (
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
              backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
              border: `1px solid ${isDark ? "#333333" : "#e5e7eb"}`,
              borderRadius: "12px",
              width: "480px",
              maxWidth: "90%",
              overflow: "hidden",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 24px",
                borderBottom: `1px solid ${isDark ? "#2e2e2e" : "#f1f5f9"}`,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  color: isDark ? "#ffffff" : "#111827",
                }}
              >
                Edit Course
              </h2>
              <CloseIcon
                onClick={() => setIsModalOpen(false)}
                style={{
                  cursor: "pointer",
                  color: isDark ? "#a1a1aa" : "#6b7280",
                }}
              />
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "6px",
                    color: isDark ? "#a1a1aa" : "#374151",
                  }}
                >
                  Course Name
                </label>
                <input
                  type="text"
                  value={selectedCourse.course_name || ""}
                  onChange={(e) =>
                    setSelectedCourse({
                      ...selectedCourse,
                      course_name: e.target.value,
                    })
                  }
                  placeholder="Enter course name"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: `1px solid ${isDark ? "#333333" : "#cbd5e1"}`,
                    backgroundColor: isDark ? "#121212" : "#ffffff",
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
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "6px",
                    color: isDark ? "#a1a1aa" : "#374151",
                  }}
                >
                  Course Image
                </label>
                {selectedCourse.main_program_banner_image_url &&
                  !selectedImage && (
                    <div style={{ marginBottom: "10px" }}>
                      <img
                        src={selectedCourse.main_program_banner_image_url}
                        alt="Current"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: `1px solid ${isDark ? "#333333" : "#e5e7eb"}`,
                        }}
                      />
                      <p
                        style={{
                          fontSize: "12px",
                          color: isDark ? "#a1a1aa" : "#666",
                          marginTop: "4px",
                        }}
                      >
                        Current Image
                      </p>
                    </div>
                  )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files[0])}
                  style={{ color: isDark ? "#a1a1aa" : "#111827" }}
                />
                {selectedImage && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#0284c7",
                      marginTop: "5px",
                    }}
                  >
                    New image selected: {selectedImage.name}
                  </p>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={isUpdating}
                  style={{
                    padding: "10px 20px",
                    border: `1px solid ${isDark ? "#333333" : "#cbd5e1"}`,
                    backgroundColor: isDark ? "#282828" : "#ffffff",
                    color: isDark ? "#ffffff" : "#374151",
                    borderRadius: "6px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSubmit}
                  disabled={isUpdating}
                  style={{
                    padding: "10px 24px",
                    border: "none",
                    backgroundColor: "#0284c7",
                    color: "#ffffff",
                    borderRadius: "6px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {isUpdating ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm.isOpen && (
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
              backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
              border: `1px solid ${isDark ? "#333333" : "#e5e7eb"}`,
              borderRadius: "16px",
              padding: "28px",
              width: "360px",
              textAlign: "center",
              position: "relative",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            }}
          >
            <CloseIcon
              onClick={() =>
                setDeleteConfirm({
                  isOpen: false,
                  courseId: null,
                  courseName: "",
                })
              }
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                cursor: "pointer",
                color: isDark ? "#a1a1aa" : "#6b7280",
              }}
            />

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
                color: isDark ? "#ffffff" : "#111827",
              }}
            >
              Delete Course?
            </h2>
            <p
              style={{
                color: isDark ? "#a1a1aa" : "#6b7280",
                fontSize: "14px",
                margin: "0 0 24px 0",
                lineHeight: 1.4,
              }}
            >
              Are you sure you want to delete{" "}
              <strong style={{ color: isDark ? "#ffffff" : "#111827" }}>
                "{deleteConfirm.courseName}"
              </strong>
              ? This action cannot be undone.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              <button
                onClick={() =>
                  setDeleteConfirm({
                    isOpen: false,
                    courseId: null,
                    courseName: "",
                  })
                }
                style={{
                  padding: "10px 20px",
                  border: `1px solid ${isDark ? "#333333" : "#cbd5e1"}`,
                  backgroundColor: isDark ? "#282828" : "#ffffff",
                  color: isDark ? "#ffffff" : "#374151",
                  borderRadius: "6px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
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

      {/* SUCCESS CONFIRMATION MODAL */}
      {successModal.isOpen && (
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
              backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
              border: `1px solid ${isDark ? "#333333" : "#e5e7eb"}`,
              borderRadius: "16px",
              padding: "30px",
              textAlign: "center",
              width: "320px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px auto",
              }}
            >
              <CheckCircleOutlineOutlinedIcon
                style={{ color: "#0284c7", fontSize: "30px" }}
              />
            </div>
            <h2
              style={{
                color: isDark ? "#ffffff" : "#111827",
                margin: "6px 0",
                fontSize: "18px",
              }}
            >
              {successModal.title}
            </h2>
            <p
              style={{
                color: isDark ? "#a1a1aa" : "#4b5563",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              {successModal.message}
            </p>
            <button
              onClick={() =>
                setSuccessModal({ ...successModal, isOpen: false })
              }
              style={{
                backgroundColor: "#0284c7",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "10px 20px",
                fontWeight: 600,
                cursor: "pointer",
                width: "100%",
              }}
            >
              Great, Thank!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
