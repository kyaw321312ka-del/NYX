import { createPortal } from "react-dom";
import "../styles/class-court-add.css";
import BackIcon from "@mui/icons-material/ArrowBackIosNew";
import EditIcon from "@mui/icons-material/ModeEditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import CameraIcon from "@mui/icons-material/AddAPhotoOutlined";
import AddIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Navigate, useNavigate, useOutletContext } from "react-router-dom";
import ClockIcon from "@mui/icons-material/QueryBuilderOutlined";
import CloseIcon from "@mui/icons-material/CloseOutlined";
import { useEffect, useRef, useState, useContext } from "react";
import ClassCourtPopUp from "./ClassAddCourtPopup";
import { useNoti } from "../../../../shared/hooks/useNoti";
import ClassEquipmentPopup from "./ClassEquipmentPopup";
import RemoveIcon from "@mui/icons-material/HighlightOffOutlined";
import { Context } from "../../../../shared/hooks/AppContext";

function ClassCourtDetail({ data }) {
  const contextData = useContext(Context);
  const outletData = useOutletContext() || {};
  const {
    Courts,
    index,
    venue_id,
    GetCourts,
    isDark: outletIsDark,
  } = outletData;

  // Dark Mode စစ်ဆေးခြင်း
  const isDark = outletIsDark ?? contextData?.classBackColor === "#1A1C1E";

  const [show, setshow] = useState(false);
  const [header, setheader] = useState("");
  const [heading, setheading] = useState("");
  const [id, setid] = useState();
  const [showtime, setshowtime] = useState(false);

  // equipment popup
  const [showequipment, setshowequipment] = useState(false);
  const [info, setinfo] = useState(null);

  const start_time = useRef();
  const end_time = useRef();
  const fileref = useRef();

  const navigate = useNavigate();

  const { Loading, openerror, openloading, opensuccess, openconfirm } =
    useNoti();

  const court_id = Courts?.data?.[index]?.id || null;

  // for style gallery
  const gallery_data = Courts?.data?.[index]?.gallery || [];
  const item_count = gallery_data.length + 1;
  const col_count = item_count === 0 ? 1 : Math.ceil(Math.sqrt(item_count));

  function showPopup(id, header, heading) {
    if (header) setheader(header);
    if (heading) setheading(heading);
    if (id) setid(id);
    setshow(true);
  }

  const closetimepopup = () => {
    if (start_time.current) start_time.current.value = "";
    if (end_time.current) end_time.current.value = "";
    setshowtime(false);
  };

  // add time slot function
  async function addtime_slot(e) {
    e.preventDefault();
    if (!court_id) return;
    let timedata = {
      court_id: court_id,
      start_time: start_time.current.value,
      end_time: end_time.current.value,
    };
    openloading();
    try {
      let response = await fetch((import.meta.env.VITE_BASE_URL + "/api/venue/addcourttime"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(timedata),
      });
      if (response.ok) {
        await GetCourts(venue_id);
        opensuccess(
          "Time Added Successfully",
          "New time slot is now available in ordering",
        );
        closetimepopup();
      } else {
        openerror("something went wrong");
      }
    } catch (err) {
      console.log(err);
      openerror("Cannot connect with server");
    }
  }

  async function delete_equipment(id) {
    if (!id) return;
    let isConfirm = await openconfirm();
    if (!isConfirm) return;
    try {
      openloading();
      let response = await fetch(
        `${(import.meta.env.VITE_BASE_URL + "/api/venue/deleteequipment")}/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        await GetCourts(venue_id);
        opensuccess("success", "Item Removed from List");
        setshowequipment(false);
      } else {
        openerror("Something went wrong");
      }
    } catch (err) {
      console.log(err);
      openerror("Cannot connect with server");
    }
  }

  // delete con
  async function delete_data(id, target) {
    if (!id) return;
    let url = [
      (import.meta.env.VITE_BASE_URL + "/api/venue/deletecons"), // 0 for con
      (import.meta.env.VITE_BASE_URL + "/api/venue/deletepros"), // 1 for pro
      (import.meta.env.VITE_BASE_URL + "/api/venue/deleterule"), // 2 for rule
      (import.meta.env.VITE_BASE_URL + "/api/venue/deleteservice"), // 3 for service
      (import.meta.env.VITE_BASE_URL + "/api/venue/deletecourttimeslot"), // 4 for timeslot
    ];
    let api = url[target];
    if (!api) return;

    let isconfirm = await openconfirm();
    if (!isconfirm) return;

    openloading();
    try {
      let response = await fetch(`${api}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        opensuccess(
          "Action Successful",
          "Court data has been removed Successfully",
        );
        await GetCourts(venue_id);
      } else {
        openerror("Something went wrong");
      }
    } catch (err) {
      console.log(err);
      openerror("Cannot connect with server");
    }
  }

  // add gallery
  async function add_gallery(event) {
    let file = event.target.files[0];
    if (!file) return;

    let formData = new FormData();
    formData.append("court_id", court_id);
    formData.append("court_gallery", file);

    openloading();
    try {
      let response = await fetch((import.meta.env.VITE_BASE_URL + "/api/venue/addcourtgallery"), {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        opensuccess(
          "Action Successful",
          "New Court gallery added successfully",
        );
        await GetCourts(venue_id);
      } else {
        openerror("Something went wrong");
      }
    } catch (err) {
      openerror("Cannot connect with server");
      console.log(err);
    }
  }

  return createPortal(
    <div className={`addcourtwarper ${isDark ? "dark-mode" : ""}`}>
      {Loading}
      {show && (
        <ClassCourtPopUp
          data={{
            id: id,
            header: header,
            heading: heading,
            set_show: setshow,
            court_id: court_id,
            venue_id: venue_id,
            openerror: openerror,
            openloading: openloading,
            opensuccess: opensuccess,
            GetCourts: GetCourts,
            isDark: isDark,
          }}
        />
      )}
      <div className="courtaddmain">
        {showequipment && (
          <ClassEquipmentPopup
            data={{
              info: info,
              setshowequipment: setshowequipment,
              openerror: openerror,
              openloading: openloading,
              opensuccess: opensuccess,
              GetCourts: GetCourts,
              venue_id: venue_id,
              delete_equipment: delete_equipment,
              isDark: isDark,
            }}
          />
        )}
        <div className="courtaddbackbtn">
          <button onClick={() => navigate(-1)}>
            <BackIcon sx={{ fontSize: "10px" }} />
          </button>
        </div>
        <h1>Court Details</h1>
        <div className="addcourtbody">
          <div className="addcourtleft">
            <div className="addcourtleft1">
              <h3 className="addcourtleft1header">Court Gallery</h3>
              <div
                className="addcourtleft11"
                style={{ "--col-count": col_count }}
              >
                {Array.isArray(Courts?.data?.[index]?.gallery) ? (
                  Courts.data[index].gallery.length > 0 ? (
                    Courts.data[index].gallery.map((item, idx) => {
                      return (
                        <div className="addcourtleft111" key={idx}>
                          <img src={item.court_image_url} alt="court gallery" />
                          <button>
                            <RemoveIcon
                              sx={{
                                color: "rgb(117, 104, 78)",
                                fontSize: "20px",
                              }}
                            />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="addcourtleft111">
                      <p>no image yet</p>
                    </div>
                  )
                ) : (
                  <div className="addcourtleft111">
                    <p>Loading...</p>
                  </div>
                )}
                {/* <div
                  className="courtaddphoto"
                  onClick={() => fileref.current.click()}
                >
                  <input
                    type="file"
                    className="hiddenimgfile"
                    ref={fileref}
                    onChange={add_gallery}
                  />
                  <CameraIcon className="add-icon-svg" />
                  <h3>+ Add Photo</h3>
                </div> */}
              </div>
              <div className="addcourtleft12">
                {Array.isArray(Courts?.data) ? (
                  Courts.data?.length > 0 ? (
                    <>
                      <span>
                        <p>Court Name</p>
                        <p>{Courts.data?.[index]?.court_name}</p>
                      </span>
                      <span>
                        <p>Hourly Price</p>
                        <p>{Courts.data?.[index]?.hourly_price}</p>
                      </span>
                    </>
                  ) : (
                    <span>
                      <p>no data</p>
                    </span>
                  )
                ) : (
                  <span>
                    <p>Loading...</p>
                  </span>
                )}
              </div>
              <div className="addcourtleft13">
                <h4>About Court</h4>
                {Array.isArray(Courts?.data) ? (
                  Courts.data?.length > 0 ? (
                    <p>{Courts.data?.[index]?.about_court}</p>
                  ) : (
                    <p>no details</p>
                  )
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            </div>
            <div className="addcourtleft2">
              <div className="acl1">
                <h3>Rental Equipment</h3>
                <button
                  onClick={() => {
                    setinfo(null);
                    setshowequipment(true);
                  }}
                >
                  + Add Item
                </button>
              </div>
              <div className="acltable">
                <table>
                  <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                    <tr>
                      <th>Product Name</th>
                      <th>Price/Hr</th>
                      <th>Stock</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(Courts?.data?.[index]?.equipment) ? (
                      Courts.data[index].equipment.length > 0 ? (
                        Courts.data[index].equipment.map((item, idx) => {
                          return (
                            <tr key={idx}>
                              <td>{item.product_name}</td>
                              <td>{item.rental_price} ks</td>
                              <td>{item.qty_total}</td>
                              <td>
                                <div className="acltd">
                                  <EditIcon
                                    className="action-icon"
                                    sx={{ fontSize: "20px" }}
                                    onClick={() => {
                                      setinfo(item);
                                      setshowequipment(true);
                                    }}
                                  />
                                  <DeleteIcon
                                    className="action-icon"
                                    sx={{ fontSize: "20px" }}
                                    onClick={() => delete_equipment(item.id)}
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="4" className="empty-cell">
                            No data
                          </td>
                        </tr>
                      )
                    ) : (
                      <tr>
                        <td colSpan="4" className="empty-cell">
                          Loading...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="addcourtright">
            <div className="addcourtright1">
              <span className="acr1">
                <h3>Court Schedule</h3>
                <button onClick={() => setshowtime(true)}>
                  <AddIcon className="action-icon" sx={{ fontSize: "20px" }} />
                </button>
              </span>
              <div className="acr11">
                {Array.isArray(Courts?.data?.[index]?.time_slots) ? (
                  Courts.data[index].time_slots.length > 0 ? (
                    Courts.data[index].time_slots?.map((item, idx) => {
                      return (
                        <span className="acrchild" key={idx}>
                          <ClockIcon
                            className="add-icon-svg"
                            sx={{ fontSize: "20px" }}
                          />
                          <p>
                            {item.start_time.slice(0, 5)} -{" "}
                            {item.end_time.slice(0, 5)}
                          </p>
                          <button
                            className="acrcloseicon"
                            onClick={() => delete_data(item.id, 4)}
                          >
                            <CloseIcon sx={{ fontSize: "15px" }} />
                          </button>
                        </span>
                      );
                    })
                  ) : (
                    <span className="acrchild">
                      <p>No Time yet</p>
                    </span>
                  )
                ) : (
                  <>
                    <span className="acrchild">
                      <p>Loading...</p>
                    </span>
                    <span className="acrchild">
                      <p>Loading...</p>
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="addcourtright2">
              <div className="acr21">
                <span className="acr21header">
                  <h3>Pros</h3>
                  <button onClick={() => showPopup(1, "New Pro", "Pro")}>
                    <AddIcon
                      className="action-icon"
                      sx={{ fontSize: "17px" }}
                    />
                  </button>
                </span>
                <div className="acrchilds">
                  {Array.isArray(Courts?.data?.[index]?.pros) ? (
                    Courts.data[index].pros.length > 0 ? (
                      Courts.data[index].pros?.map((item, idx) => {
                        return (
                          <span className="acrprochild" key={idx}>
                            <h3>{item.name}</h3>
                            <button
                              style={{
                                border: "none",
                                outline: "none",
                                background: "initial",
                              }}
                              onClick={() => delete_data(item.id, 1)}
                            >
                              <CloseIcon sx={{ fontSize: "15px" }} />
                            </button>
                          </span>
                        );
                      })
                    ) : (
                      <span className="acrprochild">
                        <h3>No Data</h3>
                      </span>
                    )
                  ) : (
                    <span className="acrprochild">
                      <h3>Loading...</h3>
                    </span>
                  )}
                </div>
              </div>
              <div className="acr22">
                <span className="acr21header">
                  <h3>Cons</h3>
                  <button onClick={() => showPopup(2, "New Con", "Con")}>
                    <AddIcon
                      className="action-icon"
                      sx={{ fontSize: "17px" }}
                    />
                  </button>
                </span>
                <div className="acrchilds">
                  {Array.isArray(Courts?.data?.[index]?.cons) ? (
                    Courts.data[index].cons.length > 0 ? (
                      Courts.data[index].cons?.map((item, idx) => {
                        return (
                          <span className="acrprochild" key={idx}>
                            <h3>{item.name}</h3>
                            <CloseIcon
                              className="action-icon"
                              sx={{ fontSize: "15px" }}
                              onClick={() => delete_data(item.id, 0)}
                            />
                          </span>
                        );
                      })
                    ) : (
                      <span className="acrprochild">
                        <h3>No Data</h3>
                      </span>
                    )
                  ) : (
                    <span className="acrprochild">
                      <h3>Loading...</h3>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="addcourtright3">
              <h2 className="acr3header">
                Included Facilities and Safety Rules
              </h2>
              <div className="acr3body">
                <div className="acr3body1">
                  <span className="acr3header1">
                    <h3>ADDITIONAL SERVICES</h3>
                    <button
                      onClick={() =>
                        showPopup(3, "New Service", "Additional service")
                      }
                    >
                      <AddIcon
                        className="action-icon"
                        sx={{ fontSize: "20px" }}
                      />
                    </button>
                  </span>
                  <div className="acr31content">
                    {Array.isArray(Courts?.data?.[index]?.services) ? (
                      Courts.data[index].services.length > 0 ? (
                        Courts.data[index].services.map((item, idx) => {
                          return (
                            <span key={idx}>
                              <p>{item.name}</p>
                              <button onClick={() => delete_data(item.id, 3)}>
                                <CloseIcon sx={{ fontSize: "17px" }} />
                              </button>
                            </span>
                          );
                        })
                      ) : (
                        <span>
                          <p>No data</p>
                        </span>
                      )
                    ) : (
                      <span>
                        <p>Loading..</p>
                      </span>
                    )}
                  </div>
                </div>
                <div className="acr3body2">
                  <span className="acr3header1">
                    <h3>SAFETY RULES</h3>
                    <button
                      onClick={() => showPopup(4, "New Rule", "Title Rule")}
                    >
                      <AddIcon
                        className="action-icon"
                        sx={{ fontSize: "20px" }}
                      />
                    </button>
                  </span>
                  <div className="acr32content">
                    {Array.isArray(Courts?.data?.[index]?.rules) ? (
                      Courts.data[index].rules.length > 0 ? (
                        Courts.data[index].rules.map((item, idx) => {
                          return (
                            <div className="acr32child" key={idx}>
                              <span>
                                <h3>{item.name}</h3>
                                <p>{item.detail}</p>
                              </span>
                              <button onClick={() => delete_data(item.id, 2)}>
                                <CloseIcon />
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <div className="acr32child">
                          <span>
                            <h3>No Data</h3>
                          </span>
                        </div>
                      )
                    ) : (
                      <div className="acr32child">
                        <span>
                          <h3>Loading...</h3>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="addcourtright4">
              <button
                className="acr4btn1"
                onClick={() => {
                  opensuccess(
                    "Action Successful",
                    "Changes have been saved successfully",
                  );
                }}
              >
                Save Changes
              </button>
              <button
                className="acr4btn2"
                onClick={() => {
                  opensuccess(
                    "Action Successful",
                    "Changes have been removed successfully",
                  );
                }}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      </div>
      {showtime && (
        <div className="stwarper">
          <form className="stwbody" onSubmit={addtime_slot}>
            <button className="stwbody1" type="button" onClick={closetimepopup}>
              <CloseIcon />
            </button>
            <h3 className="stwbody2">New Time Slot</h3>
            <span className="stwbody3">
              <input type="time" ref={start_time} required />
              <input type="time" ref={end_time} required />
            </span>
            <span className="stwbody4">
              <button type="button" onClick={closetimepopup}>
                Cancel
              </button>
              <button type="submit">Create</button>
            </span>
          </form>
        </div>
      )}
    </div>,
    document.body,
  );
}

export default ClassCourtDetail;
