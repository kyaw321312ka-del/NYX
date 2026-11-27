import React, { useState, useEffect, useContext } from "react";
import "../styles/student-table.css";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import BadgeIcon from "@mui/icons-material/Badge";
import SchoolIcon from "@mui/icons-material/School";
import ImageIcon from "@mui/icons-material/Image";
import Swal from "sweetalert2";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import deleteIcon from "../../../../assets/images/deleteicon.png";
import { Context } from "../../../../shared/hooks/AppContext";

const API_BASE = `${import.meta.env.VITE_BASE_URL}`;

const StudentsTable = () => {
  // Theme context detection
  const { classBackColor } = useContext(Context) || {};
  const isDark = classBackColor === "#1A1C1E";

  const [activeTab, setActiveTab] = useState("All");
  const [tabsList, setTabsList] = useState(["All"]);
  const [coursesData, setCoursesData] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const navigate = useNavigate();
  const location = useLocation();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Action Processing State
  const [isActionProcessing, setIsActionProcessing] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentMain, setSelectedStudentMain] = useState(null);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [activeReceiptUrl, setActiveReceiptUrl] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState(null);

  const fetchAllStudentsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/api/coursestudent/showtrainingstudentall`,
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const jsonResult = await response.json();

      if (jsonResult.success && jsonResult.data) {
        const rawData = jsonResult.data;
        setCoursesData(rawData);

        const dynamicCourses = rawData
          .map((course) => course.course_name)
          .filter(Boolean);
        setTabsList(["All", ...dynamicCourses]);

        const allStudents = rawData.reduce((acc, course) => {
          const studentsWithCourse = course.students.map((student) => ({
            ...student,
            courseName: course.course_name,
          }));
          return [...acc, ...studentsWithCourse];
        }, []);

        setFilteredStudents(allStudents);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStudentsData();
  }, [location.state]);

  useEffect(() => {
    if (coursesData.length === 0) return;

    let currentStudents = [];
    if (activeTab === "All") {
      currentStudents = coursesData.reduce((acc, course) => {
        const studentsWithCourse = course.students.map((student) => ({
          ...student,
          courseName: course.course_name,
        }));
        return [...acc, ...studentsWithCourse];
      }, []);
    } else {
      const foundCourse = coursesData.find(
        (course) =>
          (course.course_name || "").toLowerCase() === activeTab.toLowerCase(),
      );
      if (foundCourse) {
        currentStudents = foundCourse.students.map((student) => ({
          ...student,
          courseName: foundCourse.course_name,
        }));
      }
    }

    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      currentStudents = currentStudents.filter((student) => {
        const nameMatch = (student.name || "")
          .toLowerCase()
          .includes(lowerQuery);
        const phoneMatch = (student.phone || "")
          .toLowerCase()
          .includes(lowerQuery);
        const emailMatch = (student.email || "")
          .toLowerCase()
          .includes(lowerQuery);

        return nameMatch || phoneMatch || emailMatch;
      });
    }

    setFilteredStudents(currentStudents);
    setCurrentPage(1);
  }, [activeTab, searchQuery, coursesData]);

  const confirmDeleteStudent = async () => {
    setIsDeleteModalOpen(false);

    try {
      setIsActionProcessing(true);

      const studentToDelete = filteredStudents.find(
        (student) => student.id === deletingStudentId,
      );
      const studentSource = studentToDelete?.source || "mobile";

      const response = await fetch(
        `${API_BASE}/api/course/deletetrainingstudent/${deletingStudentId}/${studentSource}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (response.ok && result.success) {
        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Student deleted successfully!",
          confirmButtonColor: "#3085d6",
          timer: 2000,
          showConfirmButton: true,
        });
        await fetchAllStudentsData();
      } else {
        await Swal.fire({
          icon: "error",
          title: "Failed!",
          text: result.message || "Failed to delete student",
          confirmButtonColor: "#3085d6",
        });
      }
    } catch (err) {
      alert(`Network Error: ${err.message}`);
    } finally {
      setIsActionProcessing(false);
      setDeletingStudentId(null);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudentsPageItems = filteredStudents.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleOpenModal = async (student) => {
    setIsModalOpen(true);
    setSelectedStudentMain(student);
    setModalLoading(true);
    setModalError(null);
    setSelectedStudentDetail(null);

    const studentId = student.id;
    const studentSource = student.source || "mobile";

    try {
      const response = await fetch(
        `${API_BASE}/api/coursestudent/trainingstudentdetailfindid/${studentId}/${studentSource}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch student details from server.");
      }
      const jsonResult = await response.json();

      if (jsonResult.success && jsonResult.data) {
        setSelectedStudentDetail(jsonResult.data);
      } else {
        throw new Error("No data found for this student profile.");
      }
    } catch (err) {
      setModalError(`Network Connection Lost: ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudentMain(null);
    setSelectedStudentDetail(null);
    setModalError(null);
  };

  const handleOpenImageModal = (imageUrl) => {
    setActiveReceiptUrl(imageUrl);
    setIsImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setActiveReceiptUrl("");
  };

  return (
    <div
      className={`st-container ${isDark ? "dark-mode" : ""}`}
      style={{
        backgroundColor: isDark ? "#121212" : "#f8fafc",
        color: isDark ? "#ffffff" : "#111827",
      }}
    >
      {/* Header */}
      <div className="st-header">
        <div className="st-title-section">
          <PersonIcon
            className="st-title-icon"
            style={{ color: isDark ? "#ffffff" : "#0b1320" }}
          />
          <h1
            className="st-title-text"
            style={{
              margin: 0,
              fontSize: "30px",
              color: isDark ? "#ffffff" : "#0b1320",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            Students
          </h1>
        </div>
        <button
          className="st-add-btn"
          onClick={() => navigate("add_student")}
          style={{
            backgroundColor: isDark ? "#0284c7" : "#0f1f3d",
            color: isDark ? "#ffffff" : "white",

            cursor: "pointer",
          }}
        >
          <AddIcon style={{ fontSize: 18 }} /> Add Student
        </button>
      </div>

      {/* Main Table Card */}
      <div
        className="st-card"
        style={{
          backgroundColor: isDark ? "#1a1c1e" : "#ffffff",
          border: `1px solid ${isDark ? "#334155" : "#e5e7eb"}`,
        }}
      >
        <div className="st-toolbar">
          <div className="st-tabs">
            {tabsList.map((tab, idx) => (
              <button
                key={idx}
                className={`st-tab-btn ${activeTab === tab ? "st-tab-active" : ""}`}
                onClick={() => {
                  setActiveTab(tab);
                  setSearchQuery("");
                }}
                style={{ textTransform: "capitalize" }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="st-search-box">
            <input
              type="text"
              placeholder="Search by Name, Phone, Email..."
              className="st-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon className="st-search-icon" />
          </div>
        </div>

        {/* Table responsive section */}
        <div className="st-table-responsive">
          {loading ? (
            <div className="st-loading-container">
              <div className="st-spinner"></div>
              <p className="st-loading-text">Loading student profiles...</p>
            </div>
          ) : error ? (
            <div className="st-error-text">
              Network disconnected or server offline. Error: {error}
              <br />
              <button
                onClick={fetchAllStudentsData}
                className="st-add-btn"
                style={{ margin: "16px auto 0 auto" }}
              >
                Retry Connecting
              </button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="st-error-text" style={{ color: "#6b7280" }}>
              No students found matching your criteria.
            </div>
          ) : (
            <>
              <table
                className="st-student-table"
                style={{ borderColor: isDark ? "#2e3238" : "#e5e7eb" }}
              >
                <thead>
                  <tr>
                    <th className="st-th">NAME</th>
                    <th className="st-th">GENDER</th>
                    <th className="st-th">AGE</th>
                    <th className="st-th">PHONE</th>
                    <th className="st-th">EMAIL</th>
                    <th className="st-th st-th-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudentsPageItems.map((student, index) => (
                    <tr key={student.id || index} className="st-tr">
                      <td className="st-td st-student-name">
                        {student.name || "-"}
                      </td>
                      <td
                        className="st-td"
                        style={{ textTransform: "capitalize" }}
                      >
                        {student.gender || "-"}
                      </td>
                      <td className="st-td">{student.age || "-"}</td>
                      <td className="st-td">{student.phone || "-"}</td>
                      <td className="st-td">{student.email || "-"}</td>
                      <td className="st-td st-actions-cell">
                        <button
                          className="st-action-btn st-view-btn"
                          onClick={() => handleOpenModal(student)}
                          disabled={isActionProcessing}
                        >
                          <VisibilityIcon style={{ fontSize: 16 }} />
                        </button>
                        <button
                          className="st-action-btn st-delete-btn"
                          onClick={() => {
                            setDeletingStudentId(student.id);
                            setIsDeleteModalOpen(true);
                          }}
                          disabled={isActionProcessing}
                        >
                          <DeleteIcon style={{ fontSize: 16 }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Delete Modal */}
              {isDeleteModalOpen && (
                <div className="st-modal-overlay">
                  <div className="st-delete-modal-card">
                    <div className="st-delete-icon-wrapper">
                      <span className="alretconfirmicon">
                        <DeleteIcon className="st-delete-modal-icon" />
                      </span>
                    </div>

                    <h3 className="st-delete-title">Deleting Student?</h3>
                    <p className="st-delete-desc">
                      Are you sure you want to delete this student?
                    </p>

                    <div className="st-delete-btn-group">
                      <button
                        className="st-delete-cancel-btn"
                        onClick={() => {
                          setIsDeleteModalOpen(false);
                          setDeletingStudentId(null);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="st-delete-confirm-btn"
                        onClick={confirmDeleteStudent}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Pagination Section */}
              {totalPages > 1 && (
                <div className="st-footer">
                  <div className="st-footer-text">
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, filteredStudents.length)} of{" "}
                    {filteredStudents.length} entries
                  </div>
                  <div className="st-pagination">
                    <button
                      className="st-pag-btn st-page-arrow"
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeftIcon style={{ fontSize: 16 }} />
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        className={`st-pag-btn ${
                          currentPage === i + 1 ? "st-page-active" : ""
                        }`}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      className="st-pag-btn st-page-arrow"
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRightIcon style={{ fontSize: 16 }} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Student Profile Detail Modal */}
      {isModalOpen && selectedStudentMain && (
        <div className="st-modal-overlay" onClick={handleCloseModal}>
          <div
            className="st-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="st-modal-header">
              <h2 className="st-modal-title">Student Profile Detail</h2>
              <button className="st-modal-close-btn" onClick={handleCloseModal}>
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>

            <div className="st-modal-body">
              <div className="st-info-section-title">
                <BadgeIcon style={{ fontSize: 18 }} />
                <span>STUDENT INFORMATION</span>
              </div>

              <div className="st-info-grid">
                <div className="st-info-item">
                  <label className="st-info-label">ID</label>
                  <div className="st-info-value">
                    {selectedStudentMain.id || "-"}
                  </div>
                </div>
                <div className="st-info-item">
                  <label className="st-info-label">NAME</label>
                  <div className="st-info-value">
                    {selectedStudentMain.name || "-"}
                  </div>
                </div>
                <div className="st-info-item">
                  <label className="st-info-label">GENDER</label>
                  <div
                    className="st-info-value"
                    style={{ textTransform: "capitalize" }}
                  >
                    {selectedStudentMain.gender || "-"}
                  </div>
                </div>
                <div className="st-info-item">
                  <label className="st-info-label">AGE</label>
                  <div className="st-info-value">
                    {selectedStudentMain.age || "-"}
                  </div>
                </div>
                <div className="st-info-item">
                  <label className="st-info-label">PHONE</label>
                  <div className="st-info-value">
                    {selectedStudentMain.phone || "-"}
                  </div>
                </div>
                <div className="st-info-item">
                  <label className="st-info-label">EMAIL</label>
                  <div className="st-info-value">
                    {selectedStudentMain.email || "-"}
                  </div>
                </div>
              </div>

              <div
                className="st-info-section-title"
                style={{ marginTop: "24px" }}
              >
                <SchoolIcon style={{ fontSize: 18 }} />
                <span>COURSE TABLE</span>
              </div>

              {modalLoading ? (
                <div className="st-loading-container">
                  <div className="st-spinner"></div>
                  <p className="st-loading-text">
                    Loading course information... Please wait.
                  </p>
                </div>
              ) : modalError ? (
                <div className="st-error-text">
                  {modalError}
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginTop: "4px",
                    }}
                  >
                    Please double check your network connection.
                  </p>
                </div>
              ) : selectedStudentDetail && selectedStudentDetail.length > 0 ? (
                <div className="st-modal-table-wrapper">
                  <table className="st-modal-table">
                    <thead>
                      <tr>
                        <th className="st-mth">NO</th>
                        <th className="st-mth">COURSE NAME</th>
                        <th className="st-mth">LEVEL</th>
                        <th className="st-mth">PRICE</th>
                        <th className="st-mth">PAYMENT NAME</th>
                        <th className="st-mth">PAYMENT METHOD</th>
                        <th className="st-mth st-th-center">RECEIPT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudentDetail.map((courseItem, index) => (
                        <tr key={index}>
                          <td className="st-mtd">{index + 1}</td>
                          <td
                            className="st-mtd"
                            style={{ textTransform: "capitalize" }}
                          >
                            {courseItem.course_name || "N/A"}
                          </td>
                          <td className="st-mtd st-text-muted">
                            {courseItem.student?.scheduleData?.title_level ||
                              "Standard Level"}
                          </td>
                          <td className="st-mtd">
                            {courseItem.student?.scheduleData?.price
                              ? `${courseItem.student.scheduleData.price.toLocaleString()} Ks`
                              : "N/A"}
                          </td>
                          <td className="st-mtd">
                            {courseItem.student?.payment_name || "N/A"}
                          </td>
                          <td className="st-mtd">
                            {courseItem.student?.payment_method || "N/A"}
                          </td>
                          <td className="st-mtd st-th-center">
                            <button
                              className="st-receipt-btn"
                              onClick={() =>
                                handleOpenImageModal(
                                  courseItem.student?.payment_image_url,
                                )
                              }
                            >
                              <ImageIcon style={{ fontSize: 18 }} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="st-error-text" style={{ color: "#6b7280" }}>
                  No course information found for this student.
                </div>
              )}
            </div>

            <div className="st-modal-footer">
              <button
                className="st-modal-action-close-btn"
                onClick={handleCloseModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal Pop-up Box */}
      {isImageModalOpen && (
        <div
          className="st-modal-overlay st-img-modal-overlay"
          onClick={handleCloseImageModal}
        >
          <div
            className="st-img-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="st-img-modal-header">
              <span>Receipt Preview</span>
              <button
                className="st-img-modal-close-btn"
                onClick={handleCloseImageModal}
              >
                <CloseIcon style={{ fontSize: 18 }} />
              </button>
            </div>
            <div className="st-img-modal-body">
              {activeReceiptUrl ? (
                <img
                  src={activeReceiptUrl}
                  alt="Receipt Document"
                  className="st-popup-receipt-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/400x550?text=No+Receipt+Image";
                  }}
                />
              ) : (
                <div className="st-no-img-text">No receipt image attached.</div>
              )}
            </div>
          </div>
        </div>
      )}
      <Outlet />
    </div>
  );
};

export default StudentsTable;
