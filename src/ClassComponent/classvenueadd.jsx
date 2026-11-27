import CloseIcon from "@mui/icons-material/Close";
import UploadIcon from "@mui/icons-material/FileUploadOutlined";
import "./classvenueadd.css";
import { useRef, useState, useContext } from "react";
import { createPortal } from "react-dom";
import { Context } from "../Hooks/context";
import Swal from "sweetalert2";

function ClassVenueAdd({ data }) {
  const contextData = useContext(Context);

  const { info, setinfo, setshow, GetVenue, isDark: parentIsDark } = data;

  // Venue Management သို့မဟုတ် Context မှ isDark တန်ဖိုးကို Case-Insensitive စစ်ဆေးခြင်း
  const isDark =
    parentIsDark ?? contextData?.classBackColor?.toLowerCase() === "#1a1c1e";

  // 🎯 Dynamic Light / Dark Theme Helper
  const getSwalTheme = () => ({
    background: isDark ? "#1A1C1E" : "#ffffff",
    color: isDark ? "#E1E1E1" : "#0f172a",
  });

  const [file, setfile] = useState(null);
  const [filepath, setfilepath] = useState(null);
  const [allow, setallow] = useState(true);

  const fileref = useRef();
  const nameref = useRef();
  const priceref = useRef();
  const checkboxref = useRef();

  const close = () => {
    setinfo(null);
    setshow(false);
  };

  function showimg(e) {
    let img = e.target.files[0];
    setfile(img);
    if (img) {
      let url = URL.createObjectURL(img);
      setfilepath(url);
    }
  }

  // delete function
  async function delete_venue() {
    let id = info?.id;
    if (!id) return;

    // ၁။ Delete confirm မပြမီ အရှေ့က Venue Details modal ကို ပိတ်မည်
    close();

    const result = await Swal.fire({
      title: "Delete Venue?",
      text: "Are you sure to delete this venue?",
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
      let response = await fetch(
        `${(import.meta.env.VITE_BASE_URL + "/api/venue/deletevenue")}/${id}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        await GetVenue();
        await Swal.fire({
          title: "Venue Deleted",
          text: "This venue is permanently removed from list",
          icon: "success",
          confirmButtonText: "Great, Thank!",
          confirmButtonColor: "#3b82f6",
          ...getSwalTheme(),
        });
      } else {
        await Swal.fire({
          title: "Error",
          text: "Something went wrong",
          icon: "error",
          confirmButtonColor: "#ef4444",
          ...getSwalTheme(),
        });
      }
    } catch (err) {
      console.log(err);
      await Swal.fire({
        title: "Error",
        text: "Cannot connect with server",
        icon: "error",
        confirmButtonColor: "#ef4444",
        ...getSwalTheme(),
      });
    }
  }

  // add_venue
  async function add_venue(e) {
    e.preventDefault();
    let formData = new FormData();
    formData.append("venue_image", fileref.current.files[0]);
    formData.append("name", nameref.current.value);
    formData.append("price", priceref.current.value);
    formData.append("available", checkboxref.current.checked);

    try {
      let response = await fetch((import.meta.env.VITE_BASE_URL + "/api/venue/addvenue"), {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setfile(null);
        setfilepath(null);
        nameref.current.value = "";
        priceref.current.value = "";
        setshow(false);
        await GetVenue();

        await Swal.fire({
          title: "Venue Added Successfully",
          text: "Your new venue is now available",
          icon: "success",
          confirmButtonText: "Great, Thank!",
          confirmButtonColor: "#3b82f6",
          ...getSwalTheme(),
        });
      } else {
        await Swal.fire({
          title: "Error",
          text: "Something went wrong",
          icon: "error",
          confirmButtonColor: "#ef4444",
          ...getSwalTheme(),
        });
      }
    } catch (err) {
      console.log(err);
      await Swal.fire({
        title: "Error",
        text: "Cannot connect with server",
        icon: "error",
        confirmButtonColor: "#ef4444",
        ...getSwalTheme(),
      });
    }
  }

  // update venue
  async function update_venue(e) {
    let id = info?.id;
    if (!id) return;

    e.preventDefault();
    let formData = new FormData();
    if (fileref.current.files[0]) {
      formData.append("venue_image", fileref.current.files[0]);
    }
    formData.append("venue_name", nameref.current.value);
    formData.append("price", priceref.current.value);
    formData.append("available", checkboxref.current.checked);

    try {
      let response = await fetch(
        `${(import.meta.env.VITE_BASE_URL + "/api/venue/updatevenue")}/${id}`,
        {
          method: "PUT",
          body: formData,
        },
      );

      if (response.ok) {
        await GetVenue();
        setshow(false);

        await Swal.fire({
          title: "Action Successful",
          text: "Venue Update Successfully",
          icon: "success",
          confirmButtonText: "Great, Thank!",
          confirmButtonColor: "#3b82f6",
          ...getSwalTheme(),
        });
      } else {
        await Swal.fire({
          title: "Error",
          text: "Something went wrong",
          icon: "error",
          confirmButtonColor: "#ef4444",
          ...getSwalTheme(),
        });
      }
    } catch (err) {
      console.log(err);
      await Swal.fire({
        title: "Error",
        text: "Cannot connect with server",
        icon: "error",
        confirmButtonColor: "#ef4444",
        ...getSwalTheme(),
      });
    }
  }

  return createPortal(
    <div className={`cvawarper ${isDark ? "dark-mode" : ""}`}>
      <form className="cvamain" onSubmit={info ? update_venue : add_venue}>
        <div className="cvabody1">
          <h3>{info ? "Venue Details" : "New Details"}</h3>
          <button type="button" onClick={close} className="close-btn">
            <CloseIcon />
          </button>
        </div>
        <div className="cvabody2">
          <p>Venue Name</p>
          <input
            type="text"
            defaultValue={info ? info.venue_name : ""}
            readOnly={allow && info}
            required
            ref={nameref}
          />
        </div>
        <div className="cvabody2">
          <p>Price</p>
          <input
            type="number"
            defaultValue={info ? info.price : ""}
            readOnly={allow && info}
            required
            ref={priceref}
          />
        </div>
        <div className="cvabody3">
          <p>Venue Photo</p>
          <div className="cvabody31" onClick={() => fileref.current.click()}>
            <input
              type="file"
              className="venuehidden"
              ref={fileref}
              onChange={showimg}
              required={!info}
              disabled={allow && info}
            />

            {file ? (
              <img src={filepath} alt="venue image" className="venueimgurl" />
            ) : info ? (
              <img
                src={info.venue_image_url}
                alt="venue"
                className="venueimgurl"
              />
            ) : (
              <>
                <UploadIcon className="upload-icon" />
                <p>Upload</p>
              </>
            )}
          </div>
        </div>
        <label htmlFor="input" className="cvabody4">
          <input
            type="checkbox"
            ref={checkboxref}
            defaultChecked={info ? info.available : false}
            disabled={allow && info}
          />{" "}
          Available
        </label>
        {info ? (
          <div className="cvabody5">
            <button type="button" onClick={delete_venue}>
              Delete
            </button>
            <button
              type="button"
              onClick={() => {
                setallow(!allow);
              }}
            >
              Edit
            </button>
            <button disabled={info && allow}>Update</button>
          </div>
        ) : (
          <div className="cvabody6">
            <button type="button" onClick={close}>
              Cancel
            </button>
            <button type="submit">Create</button>
          </div>
        )}
      </form>
    </div>,
    document.body,
  );
}

export default ClassVenueAdd;
