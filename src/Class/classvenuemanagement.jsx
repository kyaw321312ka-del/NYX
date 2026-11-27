import { useEffect, useState, useContext } from "react";
import { useGetClassVenue } from "../ClassApi";
import "../classCss/classvenuemanagement.css";
import StadiumIcon from "@mui/icons-material/StadiumOutlined";
import { Outlet, useNavigate, useOutletContext } from "react-router-dom";
import AddIcon from "@mui/icons-material/AddOutlined";
import EditIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import DotIcon from "@mui/icons-material/FiberManualRecord";
import ClassVenueAdd from "../ClassComponent/classvenueadd";
import { useNoti } from "../Hooks/alert";
import { Context } from "../Hooks/context";

function VenueManagement() {
  const contextData = useContext(Context);
  const outletContext = useOutletContext();
  const isDark =
    outletContext?.isDark ?? contextData?.classBackColor === "#1A1C1E";

  const [venue_id, setvenue_id] = useState(null);
  const [index, setindex] = useState(0);

  // for popup box
  const [show, setshow] = useState(false);
  const [info, setinfo] = useState(null);

  const { GetVenue, Venue, GetCourts, Courts } = useGetClassVenue();
  const { Loading, openerror, openloading, opensuccess, openconfirm, close } =
    useNoti();

  const navigate = useNavigate();

  useEffect(() => {
    GetVenue();
  }, []);

  useEffect(() => {
    if (Array.isArray(Venue.data) && Venue.data.length > 0 && !venue_id) {
      setvenue_id(Venue.data[0].id);
    }
  }, [Venue.data, venue_id]);

  async function changeBox(e, item) {
    e.stopPropagation();

    if (!item.id) return;
    openloading();
    try {
      let response = await fetch(
        `${(import.meta.env.VITE_BASE_URL + "/api/venue/activecourt")}/${item.id}/${!item.court_active}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        await GetCourts(venue_id);
        opensuccess(
          "Action Successful",
          `The Court is successfully ${
            item.court_active === true ? "Closed" : "Opened"
          }`,
        );
      } else {
        openerror("Something went wrong");
      }
    } catch (err) {
      openerror("Cannot connect with server");
      console.log(err);
    }
  }

  // venue change
  async function venue_change(id) {
    setvenue_id(id);
    openloading();
    await GetCourts(id);
    close();
  }

  return (
    <div className={`venuemain ${isDark ? "dark-mode" : ""}`}>
      {show && (
        <ClassVenueAdd
          data={{
            info: info,
            setinfo: setinfo,
            setshow: setshow,
            openerror: openerror,
            openloading: openloading,
            opensuccess: opensuccess,
            GetVenue: GetVenue,
            openconfirm: openconfirm,
          }}
        />
      )}
      {Loading}
      <div className="venueheader">
        <StadiumIcon
          className="venueicon"
          style={{ fontSize: "35px", marginRight: "5px" }}
        />
        <h1 style={{ fontSize: "30px" }}>Venue Management</h1>
      </div>

      <div className="venuebody">
        <span className="venuebodyheader">
          <p>Existing Courts</p>
          <p className="view-all-btn">View All 🠢</p>
        </span>
        <div className="venuebodycourt">
          {Array.isArray(Venue.data) ? (
            Venue.data.length > 0 ? (
              Venue.data.map((item, index) => {
                const isSelected = venue_id === item.id;
                return (
                  <div
                    className={`venuecourt ${isSelected ? "selected-court" : ""}`}
                    key={index}
                    onClick={() => venue_change(item.id)}
                  >
                    {item.available ? (
                      <p className="available">
                        <DotIcon sx={{ fontSize: "9px" }} />
                        ACTIVE
                      </p>
                    ) : (
                      <p className="unavailable">
                        <DotIcon sx={{ fontSize: "9px" }} />
                        INACTIVE
                      </p>
                    )}
                    <img src={item.venue_image_url} alt={item.venue_name} />
                    <div className="venuecourttext">
                      <span className="venuecourtdetail">
                        <h3>{item.venue_name}</h3>
                        <p>
                          <b>{item.price}</b> Ks
                        </p>
                      </span>
                      <span className="venuecourtbtn">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setinfo(item);
                            setshow(true);
                          }}
                          title="Edit Venue"
                        >
                          <EditIcon className="edit-icon" />
                        </button>
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                className="addvenuecourt"
                onClick={() => {
                  setinfo(null);
                  setshow(true);
                }}
              >
                <AddIcon />
                <p>Add New Venue</p>
              </div>
            )
          ) : (
            <h3>Loading..</h3>
          )}

          <div
            className="addvenuecourt"
            onClick={() => {
              setinfo(null);
              setshow(true);
            }}
          >
            <AddIcon />
            <p>Add New Venue</p>
          </div>
        </div>
      </div>

      <div className="venuefooter">
        <div className="venuefooterheader">
          <h3>Active Courts</h3>
        </div>
        <div className="venuefootercourt">
          {Array.isArray(Courts.data) ? (
            Courts.data.length > 0 ? (
              <>
                {Courts.data.map((item, index) => {
                  return (
                    <div
                      className="court"
                      key={index}
                      onClick={() => {
                        setindex(index);
                        navigate("classcourtdetail");
                      }}
                    >
                      <span className="court1">
                        <h3>{item.court_name}</h3>
                        <label
                          className="switch"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={item.court_active}
                            onChange={(e) => changeBox(e, item)}
                          />
                          <span className="slider"></span>
                        </label>
                      </span>
                      <span className="court2">
                        <h3>Court {item.id}</h3>
                      </span>
                      <span className="court3">
                        <p>Peak Rate</p>
                        <h4>{item.hourly_price}/hr</h4>
                      </span>
                      <span className="court4">
                        <p>Bookings Today</p>
                        <h4>10</h4>
                      </span>
                    </div>
                  );
                })}
                <div
                  className="addcourt"
                  onClick={() => navigate("classaddcourt")}
                >
                  <AddIcon />
                  <p>Add New Court</p>
                </div>
              </>
            ) : (
              <div
                className="addcourt"
                onClick={() => navigate("classaddcourt")}
              >
                <AddIcon />
                <p>Add New Court</p>
              </div>
            )
          ) : (
            <h3>Loading..</h3>
          )}
        </div>
      </div>

      <div>
        <Outlet
          context={{
            Courts: Courts,
            index: index,
            venue_id: venue_id,
            GetCourts: GetCourts,
            isDark: isDark,
          }}
        />
      </div>
    </div>
  );
}

export default VenueManagement;
