import "../PosSettingCss/paymenttax.css";
import { useContext, useEffect, useState } from "react";
import { Context } from "../Hooks/context";
import AddCircle from "@mui/icons-material/AddCircleOutlineTwoTone";
import DeleteIcon from "@mui/icons-material/DeleteTwoTone";
import CloudUploadIcon from "@mui/icons-material/CloudUploadTwoTone";
import CloseIcon from "@mui/icons-material/Close";
import { useSecurityCheck } from "../Hooks/SecurityCheck";
import AddPaymentPopUp from "../Components/addpaymentpopup";
import toast, { Toaster } from "react-hot-toast";
import { useGetPayment } from "../Api_Call";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";

// Demo Base64 Images to replace broken external placeholders
const DEMO_BANNER_1 =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='350' viewBox='0 0 800 350'><rect width='800' height='350' fill='%230D1B2A'/><circle cx='150' cy='175' r='100' fill='%231B263B' opacity='0.5'/><text x='400' y='160' fill='%23E0E1DD' font-family='sans-serif' font-size='32' font-weight='bold' text-anchor='middle'>Badminton Pro Training Center</text><text x='400' y='210' fill='%23778DA9' font-family='sans-serif' font-size='20' text-anchor='middle'>Special Discount - 20% OFF This Month</text></svg>";

const DEMO_BANNER_2 =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='350' viewBox='0 0 800 350'><rect width='800' height='350' fill='%231B263B'/><rect x='40' y='40' width='720' height='270' rx='15' fill='%23415A77' opacity='0.3'/><text x='400' y='160' fill='%23FFFFFF' font-family='sans-serif' font-size='34' font-weight='bold' text-anchor='middle'>HAPPY HOUR SALE !</text><text x='400' y='210' fill='%23E0E1DD' font-family='sans-serif' font-size='18' text-anchor='middle'>Get Exclusive Voucher Code Inside App</text></svg>";

const encodeBannerUrl = (url) => (url ? encodeURI(url) : url);

function PosPaymentTax() {
  const [show, setshow] = useState(false);
  const [items, setitems] = useState(null);

  // Announcement Modal & Image State
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [announcements, setAnnouncements] = useState([
    { id: 1, url: DEMO_BANNER_1 },
    { id: 2, url: DEMO_BANNER_2 },
  ]);

  const { Payment, GetPayment } = useGetPayment();
  const { ReturnJsx, openbox } = useSecurityCheck();

  const ContextData = useContext(Context);
  const location = useLocation();

  const isClass = location.pathname.includes("/class");

  const backcolor = isClass
    ? ContextData.classBackColor
    : ContextData.backcolor;

  const Font_Color = Boolean(backcolor === "#1A1C1E");

  const FontStyle = {
    color: Font_Color ? "#E1E1E1" : "#0D1B2A",
  };

  // SweetAlert Theme Helper based on Dark/Light mode
  const getSwalTheme = () => {
    return {
      background: Font_Color ? "#25282C" : "#FFFFFF",
      color: Font_Color ? "#FFFFFF" : "#0D1B2A",
    };
  };

  useEffect(() => {
    GetPayment();

    const loadAnnouncements = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/banner/showbanner`,
          {
            headers: ContextData.Token
              ? { Authorization: `Bearer ${ContextData.Token}` }
              : undefined,
          },
        );

        if (!response.ok) {
          throw new Error(`Banner fetch failed (${response.status})`);
        }

        const responseData = await response.json();
        const banners = responseData.result || responseData.data || responseData;
        const bannerList = Array.isArray(banners) ? banners : [banners];
        const loadedAnnouncements = bannerList
          .map((banner, index) => ({
            id: banner.id || banner.banner_id || index,
            url: encodeBannerUrl(
              banner.banner_image_url ||
                banner.image_url ||
                banner.banner_image ||
                banner.image_path ||
                banner.url,
            ),
          }))
          .filter((banner) => banner.url);

        setAnnouncements(loadedAnnouncements);
      } catch (error) {
        console.error("Load announcements error:", error);
      }
    };

    loadAnnouncements();
  }, []);

  // Image Selection Handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // SweetAlert Delete Announcement Action
  async function handleDeleteAnnouncement(id) {
    if (!id) return;

    const result = await Swal.fire({
      title: "Delete Announcement?",
      text: "Are you sure you want to remove this banner announcement?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      ...getSwalTheme(),
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/banner/deletebanner/${id}`,
        {
          method: "DELETE",
          headers: ContextData.Token
            ? { Authorization: `Bearer ${ContextData.Token}` }
            : undefined,
        },
      );

      if (!response.ok) {
        throw new Error(`Banner delete failed (${response.status})`);
      }

      setAnnouncements((prev) => prev.filter((item) => item.id !== id));

      await Swal.fire({
        title: "Action Successful",
        text: "Announcement deleted successfully from list",
        icon: "success",
        confirmButtonText: "Great, Thanks!",
        confirmButtonColor: "#3b82f6",
        ...getSwalTheme(),
      });
    } catch (error) {
      console.error("Delete announcement error:", error);
      await Swal.fire({
        title: "Delete Failed",
        text: "Could not delete the announcement",
        icon: "error",
        confirmButtonText: "Close",
        confirmButtonColor: "#ef4444",
        ...getSwalTheme(),
      });
    }
  }

  // Add New Announcement Handler
  const handleCreateAnnouncement = async () => {
    if (!selectedImage) {
      toast.error("Please upload an announcement banner picture");
      return;
    }

    const formData = new FormData();
    formData.append("banner_image", selectedImage);
    const loading = toast.loading("Uploading announcement...");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/banner/addbanner`,
        {
          method: "POST",
          headers: ContextData.Token
            ? { Authorization: `Bearer ${ContextData.Token}` }
            : undefined,
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`Banner upload failed (${response.status})`);
      }

      const responseData = await response.json().catch(() => ({}));
      const banner = responseData.result || responseData.data || responseData;
      const bannerUrl =
        banner.banner_image_url ||
        banner.image_url ||
        banner.image_path ||
        banner.url ||
        imagePreview;

      setAnnouncements((current) => [
        { id: banner.id || Date.now(), url: encodeBannerUrl(bannerUrl) },
        ...current,
      ]);
      setShowAnnouncementModal(false);
      setSelectedImage(null);
      setImagePreview(null);
      toast.success("New announcement added successfully!", { id: loading });
    } catch (error) {
      console.error("Create announcement error:", error);
      toast.error("Could not create announcement", { id: loading });
    }
  };

  return (
    <div
      className={`pospaymentwarper ${Font_Color ? "dark-theme" : "light-theme"}`}
    >
      <Toaster />
      {ReturnJsx}

      {/* Announcement Banners Section */}
      <div className="announcement-section">
        <div className="announcement-header">
          <div>
            <h3 style={FontStyle}>Announcement Banners</h3>
            <p
              className="sub-title-text"
              style={{ color: Font_Color ? "#AAA" : "#666" }}
            >
              Banners shown at top of the mobile home page
            </p>
          </div>
          <button
            className="create-announcement-btn"
            onClick={() => setShowAnnouncementModal(true)}
          >
            + Create Announcement
          </button>
        </div>

        <div className="announcement-list">
          {announcements.map((item) => (
            <div className="announcement-card" key={item.id}>
              <img src={item.url} alt="Mobile App Announcement Banner" />
              <button
                className="delete-announcement-btn"
                title="Delete Announcement"
                onClick={() => handleDeleteAnnouncement(item.id)}
              >
                <DeleteIcon style={{ fontSize: "18px" }} />
              </button>
            </div>
          ))}

          {announcements.length === 0 && (
            <div
              className="empty-announcement-box"
              style={{ color: Font_Color ? "#888" : "#999" }}
            >
              No active announcements. Click "Create Announcement" to add.
            </div>
          )}
        </div>
      </div>

      <h3 className="pospaymentmethod" style={FontStyle}>
        Payment Method
      </h3>
      <div className="pospaymentbody">
        {Array.isArray(Payment?.result) && Payment.result.length > 0 ? (
          Payment.result.map((item, index) => {
            return (
              <div
                className="poscurrency"
                key={index}
                onClick={() => {
                  setitems(item);
                  setshow(true);
                }}
              >
                <span className="poscurrecytext">
                  <p>{item.payment_method}</p>
                  <p>{item.payment_name}</p>
                  <p>{item.payment_number}</p>
                </span>
                <img src={item.payment_image_url} alt="paymentlogo" />
              </div>
            );
          })
        ) : (
          <div className="poscurrency">loading....</div>
        )}

        <div className="paymentaddbtn" onClick={() => setshow(true)}>
          <AddCircle style={{ width: "40px", height: "40px" }} />
          <p>Add Payment Method</p>
        </div>
      </div>

      <div className="pospaymentbutton">
        <button className="btn-cancel">Cancel</button>
        <button className="btn-save">Save Changes</button>
      </div>

      {show && (
        <AddPaymentPopUp
          data={setshow}
          updfun={GetPayment}
          FTS={openbox}
          items={items}
          setitems={setitems}
        />
      )}

      {/* Styled Modal Box for Adding Announcement (Dark/Light Responsive) */}
      {showAnnouncementModal && (
        <div className="announcement-modal-overlay">
          <div
            className={`announcement-modal ${Font_Color ? "dark-modal" : "light-modal"}`}
          >
            <div className="modal-header">
              <h3>Add New Announcement</h3>
              <button
                className="close-icon-btn"
                onClick={() => {
                  setShowAnnouncementModal(false);
                  setImagePreview(null);
                }}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="modal-body">
              <label className="upload-dropzone">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
                {imagePreview ? (
                  <div className="preview-container">
                    <img src={imagePreview} alt="Selected Banner" />
                    <span className="change-img-text">
                      Click to change image
                    </span>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <CloudUploadIcon
                      style={{ fontSize: 44, color: "#3b82f6" }}
                    />
                    <p className="upload-title">Choose Photo / Banner</p>
                    <p className="upload-subtitle">
                      PNG, JPG or WEBP (Recommended 800x350)
                    </p>
                  </div>
                )}
              </label>
            </div>

            <div className="modal-actions">
              <button
                className="modal-cancel-btn"
                onClick={() => {
                  setShowAnnouncementModal(false);
                  setImagePreview(null);
                }}
              >
                Cancel
              </button>
              <button
                className="modal-create-btn"
                onClick={handleCreateAnnouncement}
              >
                Create Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PosPaymentTax;
