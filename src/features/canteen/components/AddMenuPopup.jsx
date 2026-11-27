import "../styles/add-menu-popup.css";
import { createPortal } from "react-dom";
import CloseIcon from "@mui/icons-material/Close";
import UploadIcon from "@mui/icons-material/CloudUploadOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import UpdateIcon from "@mui/icons-material/CheckCircleOutlined";
import { useEffect, useRef, useState, useContext } from "react";
import Swal from "sweetalert2";
import { Context } from "../../../shared/hooks/AppContext";

function AddMenuPopUp({ data }) {
  const { classBackColor } = useContext(Context);

  // 🎯 1. isDark ကို စစ်ဆေးခြင်း (Case-Insensitive)
  const isDark = classBackColor?.toLowerCase() === "#1a1c1e";

  // 🎯 2. Dynamic Theme Generator Function for SweetAlert2
  const getSwalTheme = () => ({
    background: isDark ? "#1A1C1E" : "#ffffff",
    color: isDark ? "#E1E1E1" : "#0f172a",
  });

  const [file, setfile] = useState(null);
  const [filepath, setfilepath] = useState(null);
  const [allow, setallow] = useState(true); // true = Readonly / Disabled
  const [check, setcheck] = useState(false);

  const imgref = useRef();
  const nameref = useRef();
  const priceref = useRef();
  const categoryref = useRef();

  const { setshow, info, setinfo, updateFun, openloading } = data;

  useEffect(() => {
    if (info) {
      setcheck(info.available === "true" || info.available === true);
    } else {
      setcheck(false);
    }
  }, [info]);

  const imgpreview = (event) => {
    let selectedFile = event.target.files[0];
    setfile(selectedFile);

    if (selectedFile) {
      let url = URL.createObjectURL(selectedFile);
      setfilepath(url);
    }
  };

  // 1. Add Menu Function
  async function add_menu(e) {
    e.preventDefault();
    let formData = new FormData();

    if (file) {
      formData.append("image", file);
    } else {
      await Swal.fire({
        title: "Image Required",
        text: "Please select a product image",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
        ...getSwalTheme(),
      });
      return;
    }

    formData.append("price", priceref.current.value);
    formData.append("name", nameref.current.value);
    formData.append("available", check);
    formData.append("category_name", categoryref.current.value);

    //if (openloading) openloading();

    try {
      let response = await fetch((import.meta.env.VITE_BASE_URL + "/api/menus/addmenu"), {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        await updateFun();
        close();

        Swal.close(); // 👈 "Please wait" loading ကို အရင် ပိတ်လိုက်ပါ

        await Swal.fire({
          title: "Action Successful",
          text: "Menu added to list successfully!",
          icon: "success",
          confirmButtonText: "Great, Thank!",
          confirmButtonColor: "#3b82f6",
          ...getSwalTheme(),
        });
      } else {
        Swal.close(); // 👈 Error မပြမီ Loading ပိတ်ရန်
        await Swal.fire({
          title: "Failed",
          text: "Error occurred while adding new menu",
          icon: "error",
          confirmButtonColor: "#ef4444",
          ...getSwalTheme(),
        });
      }
    } catch (err) {
      console.error(err);
      Swal.close(); // 👈 Error မပြမီ Loading ပိတ်ရန်
      await Swal.fire({
        title: "Error",
        text: "Cannot connect with server",
        icon: "error",
        confirmButtonColor: "#ef4444",
        ...getSwalTheme(),
      });
    }
  }

  // 2. Update Menu Function
  async function update_menu(e) {
    e.preventDefault();
    let id = info?.id;
    if (!id) return;

    let formData = new FormData();
    if (file) {
      formData.append("image", file);
    }
    formData.append("price", priceref.current.value);
    formData.append("name", nameref.current.value);
    formData.append("available", check);
    formData.append("category_name", categoryref.current.value);

    //   if (openloading) openloading();

    try {
      let response = await fetch(
        `${(import.meta.env.VITE_BASE_URL + "/api/menus/updatemenu")}/${id}`,
        {
          method: "PUT",
          body: formData,
        },
      );

      if (response.ok) {
        await updateFun();
        close();

        Swal.close(); // 👈 "Please wait" loading ကို အရင် ပိတ်လိုက်ပါ

        await Swal.fire({
          title: "Menu Updated Successfully",
          text: "Your changes have been saved.",
          icon: "success",
          confirmButtonText: "Great, Thank!",
          confirmButtonColor: "#3b82f6",
          ...getSwalTheme(),
        });
      } else {
        Swal.close(); // 👈 Error မပြမီ Loading ပိတ်ရန်
        await Swal.fire({
          title: "Failed",
          text: "Error occurred while updating menu",
          icon: "error",
          confirmButtonColor: "#ef4444",
          ...getSwalTheme(),
        });
      }
    } catch (err) {
      console.error(err);
      Swal.close(); // 👈 Error မပြမီ Loading ပိတ်ရန်
      await Swal.fire({
        title: "Error",
        text: "Cannot connect with server",
        icon: "error",
        confirmButtonColor: "#ef4444",
        ...getSwalTheme(),
      });
    }
  }

  // 3. Delete Menu Function
  async function delete_menu() {
    let id = info?.id;
    if (!id) return;

    const result = await Swal.fire({
      title: "Deleting Menu?",
      text: "Are you sure you want to delete this menu item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      ...getSwalTheme(),
    });

    if (!result.isConfirmed) return;

    //if (openloading) openloading();

    try {
      let response = await fetch(
        `${(import.meta.env.VITE_BASE_URL + "/api/menus/deletemenu")}/${id}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        await updateFun();
        close();

        Swal.close(); // 👈 "Please wait" loading ကို အရင် ပိတ်လိုက်ပါ

        await Swal.fire({
          title: "Action Successful",
          text: "Menu deleted successfully from list",
          icon: "success",
          confirmButtonText: "Great, Thank!",
          confirmButtonColor: "#3b82f6",
          ...getSwalTheme(),
        });
      } else {
        Swal.close(); // 👈 Error မပြမီ Loading ပိတ်ရန်
        await Swal.fire({
          title: "Failed",
          text: "Error occurred while deleting menu",
          icon: "error",
          confirmButtonColor: "#ef4444",
          ...getSwalTheme(),
        });
      }
    } catch (err) {
      console.error(err);
      Swal.close(); // 👈 Error မပြမီ Loading ပိတ်ရန်
      await Swal.fire({
        title: "Error",
        text: "Cannot connect with server",
        icon: "error",
        confirmButtonColor: "#ef4444",
        ...getSwalTheme(),
      });
    }
  }

  function close() {
    setshow(false);
    setinfo(null);
    setallow(true);
  }

  const change = (event) => {
    setcheck(event.target.checked);
  };

  return createPortal(
    <div className={`addmenupopupwarper ${isDark ? "dark-mode" : ""}`}>
      <div className="addmenu-backdrop" onClick={close} />

      <form className="addmenumain" onSubmit={info ? update_menu : add_menu}>
        {/* Header */}
        <div className="addmenu-modal-header">
          <h2 className="addmenuheader">
            {info ? "Menu Details" : "Create New Menu"}
          </h2>
          <button
            className="addmenuclose"
            type="button"
            onClick={close}
            aria-label="Close"
          >
            <CloseIcon sx={{ fontSize: "20px" }} />
          </button>
        </div>

        {/* Modal Form Content */}
        <div className="addmenu-modal-content">
          {/* Row 1: Name & Category */}
          <div className="addmenubody">
            <span className="form-field">
              <label>Menu Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Cheese Burger"
                defaultValue={info ? info.name : ""}
                disabled={Boolean(info && allow)}
                ref={nameref}
              />
            </span>

            <span className="form-field">
              <label>Category</label>
              <select
                defaultValue={
                  info ? info.category_name?.toLowerCase() || "snack" : "snack"
                }
                disabled={Boolean(info && allow)}
                ref={categoryref}
              >
                <option value="meal">Meal</option>
                <option value="snack">Snack</option>
                <option value="drink">Drink</option>
              </select>
            </span>
          </div>

          {/* Row 2: Price, Available Status & Product Image */}
          <div className="addmenubody1">
            <div className="addmenubody11">
              <span className="form-field">
                <label>Price (Ks)</label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  defaultValue={info ? info.price : ""}
                  disabled={Boolean(info && allow)}
                  ref={priceref}
                />
              </span>

              <label className="addmenucheckbox">
                <input
                  type="checkbox"
                  checked={check}
                  disabled={Boolean(info && allow)}
                  onChange={change}
                />
                <span>Available for Order</span>
              </label>
            </div>

            <div className="addmenubody12">
              <label>Product Image</label>
              <div
                className={`addmenupreimg ${info && allow ? "disabled-img" : ""}`}
                onClick={() => {
                  if (!info || !allow) imgref.current?.click();
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  ref={imgref}
                  className="addmenuhidden"
                  onChange={imgpreview}
                  required={!info}
                  disabled={Boolean(info && allow)}
                />
                {filepath ? (
                  <img src={filepath} alt="Preview" />
                ) : info?.image_url ? (
                  <img src={info.image_url} alt={info.name} />
                ) : (
                  <div className="upload-placeholder">
                    <UploadIcon className="upload-icon" />
                    <span>Upload Image</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        {info ? (
          <div className="addmenuupdate">
            {/* Delete Button */}
            <button
              type="button"
              className="btn-modal-delete"
              onClick={delete_menu}
            >
              <DeleteIcon sx={{ fontSize: "18px" }} />
              Delete
            </button>

            {/* Edit Toggle Button */}
            <button
              type="button"
              className={`btn-modal-edit ${!allow ? "active-editing" : ""}`}
              onClick={() => setallow(!allow)}
            >
              <EditIcon sx={{ fontSize: "18px" }} />
              {!allow ? "Editing..." : "Edit"}
            </button>

            {/* Submit / Update Button */}
            <button
              type="submit"
              className="btn-modal-save"
              disabled={Boolean(info && allow)}
            >
              <UpdateIcon sx={{ fontSize: "18px" }} />
              Update
            </button>
          </div>
        ) : (
          <div className="addmenuadd">
            <button type="button" className="btn-modal-cancel" onClick={close}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-modal-submit"
              style={{ backgroundColor: isDark ? "#3b82f6" : "#0D1B2A" }}
            >
              Create Menu
            </button>
          </div>
        )}
      </form>
    </div>,
    document.body,
  );
}

export default AddMenuPopUp;
