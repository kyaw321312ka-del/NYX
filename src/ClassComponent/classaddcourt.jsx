import { createPortal } from "react-dom";
import "./classaddcourt.css";
import BackIcon from "@mui/icons-material/ArrowBackIosNew";
import { useRef, useState, useContext } from "react";
import UploadIcon from "@mui/icons-material/CloudUploadOutlined";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useNoti } from "../Hooks/alert";
// import ClassEquipmentPopup from "./classequipmentpopup"; // Commented out as requested
import { Context } from "../Hooks/context";
import Swal from "sweetalert2";

function ClassAddCourt() {
  const contextData = useContext(Context);
  const outletContext = useOutletContext() || {};
  const {
    venue_id,
    GetCourts,
    Courts,
    index,
    isDark: parentIsDark,
  } = outletContext;

  // 🎯 Context သို့မဟုတ် Outlet မှ isDark တန်ဖိုးကို Case-Insensitive စစ်ဆေးခြင်း
  const isDark =
    parentIsDark ?? contextData?.classBackColor?.toLowerCase() === "#1a1c1e";

  // 🎯 Dynamic Light / Dark Theme Helper
  const getSwalTheme = () => ({
    background: isDark ? "#1A1C1E" : "#ffffff",
    color: isDark ? "#E1E1E1" : "#0f172a",
  });

  const [file, setfile] = useState(null);
  const [filepath, setfilepath] = useState(null);
  const [show, setshow] = useState(false);

  const court_nameref = useRef();
  const court_priceref = useRef();
  const close_timeref = useRef();
  const open_timeref = useRef();
  const about_courtref = useRef();
  const fileref = useRef();

  const proref = useRef(null);
  const conref = useRef(null);
  const serviceref = useRef(null);
  const ruletitleref = useRef(null);
  const rulebodyref = useRef(null);

  const navigate = useNavigate();
  const { Loading } = useNoti();

  function showimg(e) {
    let img = e.target.files[0];
    setfile(img);
    if (img) {
      let url = URL.createObjectURL(img);
      setfilepath(url);
    }
  }

  //add rule
  async function add_rule(rule) {
    if (!venue_id) return { ok: true };
    if (!rule.header || !rule.body) return { ok: true };

    try {
      let response = await fetch(`${import.meta.env.VITE_CLASS_ADD_RULE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          venue_id: venue_id,
          name: rule.header,
          description: rule.body,
        }),
      });
      return response;
    } catch (err) {
      console.log(err);
      return { ok: false };
    }
  }

  //add new Pro
  async function add_pro(id, pro) {
    if (!id) return { ok: true };
    if (!pro || pro == null) return { ok: true };
    try {
      let response = await fetch(`${import.meta.env.VITE_CLASS_ADD_PRO}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ court_id: id, name: pro }),
      });
      return response;
    } catch (err) {
      console.log(err);
      return { ok: false };
    }
  }

  //add new con
  async function add_con(id, con) {
    if (!id) return { ok: true };
    if (!con || con == null) return { ok: true };
    try {
      let response = await fetch(`${import.meta.env.VITE_CLASS_ADD_CON}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          court_id: id,
          name: con,
        }),
      });
      return response;
    } catch (err) {
      console.log(err);
      return { ok: false };
    }
  }

  //for service
  async function add_service(service) {
    if (!venue_id) return { ok: true };
    if (!service || service == null) return { ok: true };
    try {
      let response = await fetch(`${import.meta.env.VITE_CLASS_ADD_SERVICE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          venue_id: venue_id,
          name: service,
        }),
      });
      return response;
    } catch (err) {
      console.log(err);
      return { ok: false };
    }
  }

  //add gallery
  async function add_gallery(id) {
    if (!id) return { ok: true };
    if (!fileref.current.files[0]) return { ok: true };
    let formData = new FormData();
    formData.append("court_id", id);
    formData.append("court_gallery", fileref.current.files[0]);

    try {
      let response = await fetch(import.meta.env.VITE_CLASS_ADD_COURT_GALLERY, {
        method: "POST",
        body: formData,
      });
      return response;
    } catch (err) {
      console.log(err);
      return { ok: false };
    }
  }

  //main function
  async function add_court(e) {
    e.preventDefault();
    if (!venue_id) return;

    let court_detail = {
      venue_id: venue_id,
      court_name: court_nameref.current.value,
      hourly_price: Number(court_priceref.current.value),
      open_at: open_timeref.current.value,
      close_at: close_timeref.current.value,
      about_court: about_courtref.current.value,
      court_active: "true",
    };

    try {
      let response = await fetch(import.meta.env.VITE_CLASS_ADD_COURT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(court_detail),
      });

      if (response.ok) {
        let data = await response.json();
        let id = data.data;

        let pro = proref.current.value;
        let con = conref.current.value;
        let service = serviceref.current.value;
        let rule = {
          header: ruletitleref.current.value,
          body: rulebodyref.current.value,
        };

        let results = await Promise.all([
          add_gallery(id),
          add_con(id, con),
          add_pro(id, pro),
          add_service(service),
          add_rule(rule),
        ]);

        let issuccess = results.every((res) => res && res.ok);
        if (issuccess) {
          await Swal.fire({
            title: "Success",
            text: "Court and details are added successfully",
            icon: "success",
            confirmButtonText: "Great, Thanks!",
            confirmButtonColor: "#3b82f6",
            ...getSwalTheme(),
          });

          court_nameref.current.value = "";
          court_priceref.current.value = "";
          open_timeref.current.value = "";
          close_timeref.current.value = "";
          about_courtref.current.value = "";
          proref.current.value = "";
          conref.current.value = "";
          serviceref.current.value = "";
          ruletitleref.current.value = "";
          rulebodyref.current.value = "";
          await GetCourts(venue_id);
          navigate(-1);
        } else {
          await Swal.fire({
            title: "Error",
            text: "Something went wrong",
            icon: "error",
            confirmButtonColor: "#ef4444",
            ...getSwalTheme(),
          });
        }
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

  /* 
  async function delete_equipment(id) {
    if (!id) return;
    // ... (commented out original delete logic)
  } 
  */

  return createPortal(
    <div>
      {/* {show && (
        <ClassEquipmentPopup
          data={{
            info: null,
            setshowequipment: setshow,
            GetCourts: GetCourts,
            venue_id: venue_id,
            delete_equipment: delete_equipment,
            isDark: isDark,
          }}
        />
      )} */}
      <form
        className={`cacmain ${isDark ? "dark-mode" : ""}`}
        onSubmit={add_court}
      >
        {Loading}
        <nav className="cacnav">
          <button type="button" onClick={() => navigate(-1)}>
            <BackIcon sx={{ fontSize: "15px" }} />
          </button>
        </nav>
        <header className="cacheader">
          <h2>Create Court</h2>
        </header>
        <main className="cacbody">
          <section className="cacsection1">
            <div className="caclcontent1">
              <h3>RENTAL EQUIPMENT</h3>
              <button
                type="button"
                disabled
                style={{
                  opacity: 0.5,
                  cursor: "not-allowed",
                  backgroundColor: isDark ? "#2a2d32" : "#e2e8f0",
                  color: isDark ? "#9ca3af" : "#64748b",
                }}
              >
                + Add item
              </button>
            </div>

            {/* Table အစား တောင်းဆိုထားသော စာသားကို ထည့်သွင်းခြင်း */}
            <div
              className="caclcontent2"
              style={{ padding: "20px", textAlign: "center" }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: isDark ? "#9ca3af" : "#64748b",
                  margin: 0,
                  fontWeight: 500,
                  backgroundColor: isDark ? "#1e2023" : "#f8fafc",
                  padding: "24px",
                  borderRadius: "8px",
                  border: `1px dashed ${isDark ? "#3a3d40" : "#cbd5e1"}`,
                }}
              >
                Rental equipment items cannot be added at this moment. You can
                add them after creating the court.
              </p>
            </div>

            {/* 
              ===== Commented out original table code =====
              <div className="caclcontent2">
                <table>
                  <thead>
                    <tr>
                      <th>PRODUCT NAME</th>
                      <th>RENTAL PRICE</th>
                      <th>Qty-total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(Courts.data?.[index]?.equipment) ? (
                      Courts.data?.[index]?.equipment.length > 0 ? (
                        Courts.data?.[index]?.equipment.map((item, i) => {
                          return (
                            <tr key={i}>
                              <td>{item.product_name}</td>
                              <td>{item.rental_price} KS/Hr</td>
                              <td>{item.qty_total}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={3}>no equipment</td>
                        </tr>
                      )
                    ) : (
                      <tr>
                        <td colSpan={3}>Loading...</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            */}

            <div className="caclcontent3">
              <h3>ADVANTAGES & DISADVANTAGES</h3>
              <div className="caclcontent31">
                <span>
                  <p>Pros</p>
                  <input
                    type="text"
                    placeholder="e.g. Coaching, Locker Access"
                    ref={proref}
                  />
                </span>
                <span>
                  <p>Cons</p>
                  <input type="text" placeholder="Enter Cons" ref={conref} />
                </span>
              </div>
            </div>
            <div className="caclcontent4">
              <h3>SERVICES & RULES</h3>
              <div className="caclcontent41">
                <p>Additional Service Titles</p>
                <input
                  type="text"
                  placeholder="e.g. Coaching, Locker Access"
                  ref={serviceref}
                />
              </div>
              <div className="caclcontent42">
                <h3>Safety Rules</h3>
                <span className="caclcontent421">
                  <span>
                    <p>Title</p>
                    <input
                      type="text"
                      placeholder="Rule name"
                      ref={ruletitleref}
                    />
                  </span>
                  <span>
                    <p>Title Details</p>
                    <textarea
                      rows={2}
                      placeholder="Details"
                      ref={rulebodyref}
                    ></textarea>
                  </span>
                </span>
              </div>
            </div>
          </section>
          <section className="cacsection2">
            <div className="cacsection21">
              <h2 className="cacrheader">BASIC INFO</h2>
              <div className="cacr1">
                <span>
                  <p>Court Name</p>
                  <input
                    type="text"
                    placeholder="e.g. Center Court Alpha"
                    required
                    ref={court_nameref}
                  />
                </span>
                <span>
                  <p>Hourly Pricing</p>
                  <input
                    type="number"
                    placeholder="Enter Park rate"
                    required
                    ref={court_priceref}
                  />
                </span>
              </div>
              <div className="cacr2">
                <p>Court Photo</p>
                <div
                  className="cacrimg"
                  onClick={() => fileref.current.click()}
                >
                  <input
                    type="file"
                    required
                    className="cacrhidden"
                    ref={fileref}
                    onChange={(e) => showimg(e)}
                  />
                  {file ? (
                    <img src={filepath} alt="court image" />
                  ) : (
                    <>
                      <UploadIcon />
                      <p>
                        Drag and Drop or{" "}
                        <label htmlFor="p" style={{ color: "#0058BE" }}>
                          Browse
                        </label>
                        <br />
                        Supports JPG, PNG (Max 5MB)
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="cacr3">
                <p>About Court</p>
                <textarea
                  rows={5}
                  placeholder="Describe the court surface, surroundings, and amenities..."
                  required
                  ref={about_courtref}
                />
              </div>
              <div className="cacr4">
                <h3>OPERATING HOURS</h3>
                <p>Time Slot</p>
                <div className="cacr41">
                  <input type="time" ref={open_timeref} required />
                  <input type="time" ref={close_timeref} required />
                </div>
              </div>
            </div>
            <div className="cacr5">
              <button
                type="submit"
                style={{
                  padding: "12px 160px",
                  fontSize: "15px",
                  fontWeight: "bold",
                }}
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={{
                  background: isDark ? "#1A1C1E" : "#ffffff",
                  color: isDark ? "#E1E1E1" : "#0f172a",
                  padding: "12px 50px",
                  fontSize: "15px",
                  fontWeight: "bold",
                }}
              >
                Cancel
              </button>
            </div>
          </section>
        </main>
      </form>
    </div>,
    document.body,
  );
}

export default ClassAddCourt;
