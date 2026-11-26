import React, { useEffect, useState, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import ViewCarouselOutlinedIcon from "@mui/icons-material/ViewCarouselOutlined"; // TOTAL BANNERS အတွက် Icon သစ်
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"; // ACTIVE ON APP အတွက် Icon သစ်
import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { Context } from "../Hooks/context";
import "../classCss/classbanners.css";

function ClassBannners() {
  const contextData = useContext(Context);
  const outletContext = useOutletContext() || {};
  const { isDark: parentIsDark } = outletContext;

  const isDark =
    parentIsDark ?? contextData?.classBackColor?.toLowerCase() === "#1a1c1e";

  const [banners, setBanners] = useState([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [newImage, setNewImage] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState("");
  const [isActiveImmediately, setIsActiveImmediately] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const totalBanners = banners.length;

  useEffect(() => {
    const loadTournamentBanners = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/tournament/banner/showbanner`,
          {
            headers: contextData?.Token
              ? { Authorization: `Bearer ${contextData.Token}` }
              : undefined,
          },
        );

        if (!response.ok) {
          throw new Error(`Tournament banner fetch failed (${response.status})`);
        }

        const responseData = await response.json();
        const bannerData = responseData.result || responseData.data || responseData;
        const bannerList = Array.isArray(bannerData)
          ? bannerData
          : bannerData
            ? [bannerData]
            : [];

        const loadedBanners = bannerList
          .map((banner, index) => ({
            id: banner.id || banner.banner_id || `BNR-${index + 1}`,
            imageUrl:
              banner.banner_image_url ||
              banner.image_url ||
              banner.banner_image ||
              banner.image_path ||
              banner.url,
            isActive: banner.isActive ?? banner.is_active ?? true,
          }))
          .filter((banner) => banner.imageUrl);

        setBanners(loadedBanners);
      } catch (error) {
        console.error("Load tournament banners error:", error);
      }
    };

    loadTournamentBanners();
  }, [contextData?.Token]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setNewImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddBanner = async (e) => {
    e.preventDefault();
    if (!newImage || isUploading) return;

    const formData = new FormData();
    formData.append("banner_image", newImage);
    setIsUploading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/tournament/banner/addbanner`,
        {
          method: "POST",
          headers: contextData?.Token
            ? { Authorization: `Bearer ${contextData.Token}` }
            : undefined,
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`Tournament banner upload failed (${response.status})`);
      }

      const responseData = await response.json().catch(() => ({}));
      const banner = responseData.result || responseData.data || responseData;
      const imageUrl =
        banner.banner_image_url ||
        banner.image_url ||
        banner.banner_image ||
        banner.image_path ||
        banner.url ||
        newImagePreview;

      setBanners((current) => [
        {
          id: banner.id || banner.banner_id || `BNR-${Date.now()}`,
          imageUrl,
          isActive: isActiveImmediately,
        },
        ...current,
      ]);
      closeAddModal();
    } catch (error) {
      console.error("Create tournament banner error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewImage(null);
    setNewImagePreview("");
    setIsActiveImmediately(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/tournament/banner/deletebanner/${deleteTargetId}`,
        {
          method: "DELETE",
          headers: contextData?.Token
            ? { Authorization: `Bearer ${contextData.Token}` }
            : undefined,
        },
      );

      if (!response.ok) {
        throw new Error(`Tournament banner delete failed (${response.status})`);
      }

      setBanners((prev) => prev.filter((banner) => banner.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (error) {
      console.error("Delete tournament banner error:", error);
    }
  };

  return (
    <div className={`tb-container ${isDark ? "dark-mode" : ""}`}>
      {/* HEADER */}
      <div className="tb-topbar">
        <div className="tb-header">
          <div className="tb-icon-box">
            <CollectionsOutlinedIcon
              sx={{
                fontSize: "2.3rem",
                color: isDark ? "#ffffff" : "#0d1b2a",
              }}
            />
          </div>
          <div>
            <h2 className="tb-title">Tournament Banners</h2>
            <p className="tb-subtitle">
              Manage hero banner sliders and promotional images.
            </p>
          </div>
        </div>

        <button className="tb-btn-add" onClick={() => setIsAddModalOpen(true)}>
          <AddIcon style={{ fontSize: "18px" }} />
          Add New Banner
        </button>
      </div>

      {/* STATS & INFO BAR (UPDATED ICONS) */}
      <div className="tb-stats-bar">
        {/* Total Banners */}
        <div className="tb-stat-box">
          <div className="tb-stat-icon-wrapper total">
            <ViewCarouselOutlinedIcon className="tb-stat-icon-svg" />
          </div>
          <div>
            <span className="tb-stat-label">TOTAL BANNERS</span>
            <span className="tb-stat-value">{totalBanners}</span>
          </div>
        </div>

        <div className="tb-stat-divider" />

        {/* Active On App */}
        {/* <div className="tb-stat-box">
          <div className="tb-stat-icon-wrapper active">
            <span className="tb-pulse-ring"></span>
            <CheckCircleOutlineIcon className="tb-stat-icon-svg active" />
          </div>
          <div>
            <span className="tb-stat-label">ACTIVE ON APP</span>
            <span className="tb-stat-value">{activeBanners}</span>
          </div>
        </div> */}

        <div className="tb-info-box">
          <InfoOutlinedIcon className="tb-info-icon" />
          <span>
            Recommended Format: 16:9 Aspect Ratio (1920 × 1080px or 1280 ×
            720px)
          </span>
        </div>
      </div>

      {/* BANNERS GRID */}
      <div className="tb-grid">
        {banners.map((item) => (
          <div key={item.id} className="tb-card">
            <div className="tb-card-img-wrapper">
              <img src={item.imageUrl} alt="Banner" className="tb-card-img" />
              {/* <span
                className={`tb-badge ${item.isActive ? "active" : "inactive"}`}
              >
                <span className="tb-badge-dot" />
                {item.isActive ? "Active" : "Inactive"}
              </span> */}
            </div>

            <div className="tb-card-footer">
              <label className="tb-checkbox-label">
                {/* <input
                  type="checkbox"
                  checked={item.isActive}
                  onChange={() => handleToggleActive(item.id)}
                  className="tb-checkbox"
                />
                <span className="tb-checkbox-text">Active immediately</span> */}
              </label>

              <div className="tb-card-actions">
                <button
                  className="tb-action-btn"
                  title="View Banner"
                  onClick={() => setPreviewImage(item.imageUrl)}
                >
                  <VisibilityOutlinedIcon style={{ fontSize: "18px" }} />
                </button>
                <button
                  className="tb-action-btn delete"
                  title="Delete Banner"
                  onClick={() => setDeleteTargetId(item.id)}
                >
                  <DeleteOutlineOutlinedIcon style={{ fontSize: "18px" }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODALS */}
      {isAddModalOpen && (
        <div className="tb-modal-overlay">
          <div className="tb-modal-card">
            <div className="tb-modal-header">
              <div>
                <h3>Add New Mobile Banner</h3>
                <p>Create a promotional hero banner for the mobile app</p>
              </div>
              <button className="tb-modal-close" onClick={closeAddModal}>
                <CloseIcon style={{ fontSize: "20px" }} />
              </button>
            </div>

            <div className="tb-modal-body">
              <label className="tb-upload-label">
                Banner Image (16:9 Recommended)
              </label>

              <div className="tb-dropzone">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="tb-file-input"
                  id="banner-file"
                />
                <label htmlFor="banner-file" className="tb-dropzone-content">
                  {newImagePreview ? (
                    <img
                      src={newImagePreview}
                      alt="Preview"
                      className="tb-upload-preview"
                    />
                  ) : (
                    <>
                      <div className="tb-upload-icon-circle">
                        <CloudUploadOutlinedIcon
                          style={{ fontSize: "22px", color: "#2563eb" }}
                        />
                      </div>
                      <span className="tb-upload-title">
                        Click to upload banner image
                      </span>
                      <span className="tb-upload-subtitle">
                        PNG, JPG or WebP up to 5MB (1920 × 1080px)
                      </span>
                    </>
                  )}
                </label>
              </div>

              <div className="tb-status-section">
                {/* <span className="tb-upload-label">Status on App</span>
                <label className="tb-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isActiveImmediately}
                    onChange={(e) => setIsActiveImmediately(e.target.checked)}
                    className="tb-checkbox"
                  />
                  <span className="tb-checkbox-text">Active immediately</span>
                </label> */}
              </div>
            </div>

            <div className="tb-modal-footer">
              <button className="tb-btn-cancel" onClick={closeAddModal}>
                Cancel
              </button>
              <button
                className="tb-btn-upload"
                disabled={!newImagePreview || isUploading}
                onClick={handleAddBanner}
              >
                <CloudUploadOutlinedIcon style={{ fontSize: "18px" }} />
                {isUploading ? "Uploading..." : "Upload Banner"}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="tb-modal-overlay" onClick={() => setPreviewImage(null)}>
          <div className="tb-preview-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="tb-modal-close preview-close"
              onClick={() => setPreviewImage(null)}
            >
              <CloseIcon style={{ fontSize: "20px" }} />
            </button>
            <img
              src={previewImage}
              alt="Banner Large Preview"
              className="tb-full-preview-img"
            />
          </div>
        </div>
      )}

      {deleteTargetId && (
        <div className="tb-modal-overlay">
          <div className="tb-delete-card">
            <h3>Delete Banner?</h3>
            <p>
              Are you sure you want to delete this banner? This action cannot be
              undone.
            </p>
            <div className="tb-modal-footer">
              <button
                className="tb-btn-cancel"
                onClick={() => setDeleteTargetId(null)}
              >
                Cancel
              </button>
              <button className="tb-btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassBannners;
