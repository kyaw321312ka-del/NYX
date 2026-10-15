import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SaveIcon from "@mui/icons-material/Save";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import TextField from "@mui/material/TextField";
import Defaultimg from "../images/defaultimg.png";
import { Context } from "../Hooks/context";
import { useGetClassVenue } from "../ClassApi";
import { useNoti } from "../Hooks/alert";
import Switch from "@mui/material/Switch";
import "./classwalkin.css";

const WALK_IN_COURTS_URL = "http://130.94.99.9:5000/api/walk_in/court_list";
const CREATE_WALK_IN_URL = "http://130.94.99.9:5000/api/walk_in";
const UPDATE_WALK_IN_URL = "http://130.94.99.9:5000/api/walk_in";

const firstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null) ?? "";

const normalizeWalkInConfigs = (response) => {
  const records = Array.isArray(response)
    ? response
    : response?.data || response?.results || response?.result || [];

  const courts = records.flatMap((item) =>
    Array.isArray(item?.courts) ? item.courts : [item],
  );

  if (!Array.isArray(courts)) return {};

  return courts.reduce((configs, item) => {
    const courtId = firstValue(
      item.court_id,
      item.courtId,
      item.court?.id,
      item.court?.court_id,
    );

    if (!courtId) return configs;

    configs[courtId] = {
      ...item,
      walkInId: firstValue(
        item.walk_in_id,
        item.Walk_In_id,
        item.walkInId,
        item.id,
      ),
      price: firstValue(
        item.price,
        item.walk_in_price,
        item.daily_amount_price,
        item.daily_amount,
        item.rate,
      ),
      players: firstValue(
        item.players,
        item.capacity,
        item.max_players,
        item.max_player_capacity,
      ),
      openTime: firstValue(
        item.openTime,
        item.open_at,
        item.open_time,
        item.opening_time,
      ),
      closeTime: firstValue(
        item.closeTime,
        item.close_at,
        item.close_time,
        item.closing_time,
      ),
      currentPlayers: firstValue(
        item.currentPlayers,
        item.current_players,
        item.booked_count,
        item.booked_players,
        0,
      ),
      isActive: firstValue(item.isActive, item.is_active, item.active, true),
      courtImages: item.court_images,
    };

    return configs;
  }, {});
};

function Classwalkin() {
  const { classBackColor } = useContext(Context);
  const isDark = classBackColor === "#1A1C1E";
  const navigate = useNavigate();
  const { Loading, openloading, opensuccess, openerror, close } = useNoti();
  const { GetVenue, Venue, Courts, GetCourts } = useGetClassVenue();

  const [active, setactive] = useState(null);
  const [walkInConfigs, setWalkInConfigs] = useState({});
  const [modalType, setModalType] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);

  const [formData, setFormData] = useState({
    price: "",
    players: "",
    openTime: "",
    closeTime: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    GetVenue();
  }, []);

  useEffect(() => {
    const getWalkInCourts = async () => {
      try {
        const response = await fetch(WALK_IN_COURTS_URL);
        if (!response.ok) return;

        const data = await response.json();
        setWalkInConfigs(normalizeWalkInConfigs(data));
      } catch (error) {
        console.error("Failed to load walk-in court data", error);
      }
    };

    getWalkInCourts();
  }, []);

  useEffect(() => {
    if (Venue?.data?.length > 0 && !active) {
      setactive(Venue.data[0]?.id);
      GetCourts(Venue.data[0]?.id);
    }
  }, [Venue.data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreate = (court) => {
    setSelectedCourt(court);
    setModalType("create");
    setFormData({
      price: "",
      players: "",
      openTime: "08:00",
      closeTime: "22:00",
    });
    setErrors({});
  };

  const handleEdit = (court) => {
    setSelectedCourt(court);
    setModalType("edit");
    setFormData({
      price: walkInConfigs[court.id]?.price || "",
      players: walkInConfigs[court.id]?.players || "",
      openTime: walkInConfigs[court.id]?.openTime || "",
      closeTime: walkInConfigs[court.id]?.closeTime || "",
    });
    setErrors({});
  };

  const saveWalkIn = async () => {
    const courtName = selectedCourt?.court_name || "";
    const payload = {
      court_name: courtName,
      daily_price: Number(formData.price),
      capacity: Number(formData.players),
      open_at: formData.openTime,
      close_at: formData.closeTime,
    };

    if (
      !courtName ||
      !formData.price ||
      !formData.players ||
      !formData.openTime ||
      !formData.closeTime
    ) {
      openerror("Please complete all walk-in setup fields");
      return;
    }

    if (modalType === "edit") {
      const walkInId =
        walkInConfigs[selectedCourt?.id]?.walk_in_id ||
        walkInConfigs[selectedCourt?.id]?.walkInId ||
        walkInConfigs[selectedCourt?.id]?.Walk_In_id ||
        selectedCourt?.walk_in_id;

      if (!walkInId) {
        openerror("The selected court is missing its walk_in_id.");
        return;
      }

      try {
        openloading();
        const response = await fetch(`${UPDATE_WALK_IN_URL}/${walkInId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            daily_price: payload.daily_price,
            capacity: payload.capacity,
            open_at: payload.open_at,
            close_at: payload.close_at,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update walk-in setup");
        }

        setWalkInConfigs((currentConfigs) => ({
          ...currentConfigs,
          [selectedCourt.id]: {
            ...currentConfigs[selectedCourt.id],
            ...formData,
            price: formData.price,
            players: formData.players,
            openTime: formData.openTime,
            closeTime: formData.closeTime,
            isActive: true,
          },
        }));
        setModalType(null);
        close();
        opensuccess(
          "Walk-in Updated",
          "The walk-in setup was updated successfully",
        );
      } catch (error) {
        close();
        openerror(error.message);
      }
      return;
    }

    try {
      openloading();
      const response = await fetch(CREATE_WALK_IN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create walk-in setup");
      }

      const createdWalkIn = await response.json().catch(() => ({}));

      setWalkInConfigs((currentConfigs) => ({
        ...currentConfigs,
        [selectedCourt.id]: {
          ...payload,
          walkInId: firstValue(
            createdWalkIn.walk_in_id,
            createdWalkIn.Walk_In_id,
            createdWalkIn.walkInId,
            createdWalkIn.id,
            createdWalkIn.data?.walk_in_id,
            createdWalkIn.data?.Walk_In_id,
            createdWalkIn.data?.id,
            createdWalkIn.result?.walk_in_id,
            createdWalkIn.result?.Walk_In_id,
            createdWalkIn.result?.id,
          ),
          price: formData.price,
          players: formData.players,
          openTime: formData.openTime,
          closeTime: formData.closeTime,
          currentPlayers: 0,
          isActive: true,
          court_name: courtName,
        },
      }));
      setModalType(null);
      close();
      opensuccess(
        "Walk-in Created",
        "The walk-in setup was created successfully",
      );
    } catch (error) {
      close();
      openerror(error.message);
    }
  };

  const deleteWalkIn = () => {
    const newConfigs = { ...walkInConfigs };
    delete newConfigs[selectedCourt.id];
    setWalkInConfigs(newConfigs);
    setModalType(null);
  };

  return (
    <div
      className={`cbsmain ${isDark ? "dark-mode" : ""}`}
      style={{
        backgroundColor: classBackColor || (isDark ? "#121212" : "#f4f5f7"),
      }}
    >
      {Loading}

      {/* Modal Dialog */}
      {(modalType === "create" || modalType === "edit") && (
        <div className="modal-overlay">
          <div className="walkin-modal">
            <div className="modal-header">
              <div className="modal-title">
                {modalType === "edit" && (
                  <EditOutlinedIcon style={{ fontSize: 22 }} />
                )}
                <h3>
                  {modalType === "create"
                    ? "Create Walk-in Setup"
                    : "Edit Walk-in Setup"}
                </h3>
              </div>
              <CloseIcon
                className="close-btn"
                onClick={() => setModalType(null)}
              />
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Court Name</label>
                <input
                  type="text"
                  disabled
                  value={
                    selectedCourt?.court_name ||
                    walkInConfigs[selectedCourt?.id]?.court_name ||
                    ""
                  }
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label>Daily Amount Price (per Day)</label>
                <div className="input-with-unit">
                  <input
                    type="text"
                    placeholder="e.g. 5000"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                  <span className="unit">Ks</span>
                </div>
              </div>

              <div className="form-group">
                <label>Max Player Capacity</label>
                <input
                  type="text"
                  placeholder="e.g. 10"
                  value={formData.players}
                  onChange={(e) =>
                    setFormData({ ...formData, players: e.target.value })
                  }
                />
              </div>
              {/* Open Time & Close Time (Side-by-Side Flex Box) */}
              <div className="time-grid">
                <div className="form-field flex-1">
                  <label className="field-label">Open Time</label>
                  <TextField
                    className="custom-time-input"
                    fullWidth
                    type="time"
                    name="openTime"
                    value={formData.openTime}
                    onChange={handleChange}
                    error={Boolean(errors.openTime)}
                    helperText={errors.openTime}
                    inputProps={{
                      step: 300,
                    }}
                  />
                </div>

                <div className="form-field flex-1">
                  <label className="field-label">Close Time</label>
                  <TextField
                    className="custom-time-input"
                    fullWidth
                    type="time"
                    name="closeTime"
                    value={formData.closeTime}
                    onChange={handleChange}
                    error={Boolean(errors.closeTime)}
                    helperText={errors.closeTime}
                    inputProps={{
                      step: 300,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {modalType === "edit" && (
                <button className="btn-delete" onClick={deleteWalkIn}>
                  <DeleteOutlineIcon style={{ fontSize: 18 }} /> Delete
                </button>
              )}
              <button className="btn-cancel" onClick={() => setModalType(null)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={saveWalkIn}>
                {modalType === "edit" && (
                  <SaveIcon style={{ fontSize: 18, marginRight: 6 }} />
                )}
                {modalType === "create" ? "Create Walk-in" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Header */}
      <header className="page-header">
        <div className="header-title">
          <SportsTennisIcon style={{ fontSize: 32 }} />
          <h2>Walk-In Setup</h2>
        </div>
        <button
          className="btn-booking-list"
          onClick={() => navigate("/class/booking-list")}
        >
          <ReceiptLongIcon style={{ fontSize: 18 }} /> Booking List
        </button>
      </header>

      <main className="walkin-content">
        {/* Category / Venue Tabs */}
        <div className="category-tabs">
          {Venue.data?.map((item) => (
            <button
              key={item.id}
              className={`tab-btn ${item.id === active ? "active" : ""}`}
              onClick={() => {
                setactive(item.id);
                GetCourts(item.id);
              }}
            >
              {item.venue_name}
            </button>
          ))}
        </div>

        {/* Court Cards Grid */}
        <div className="court-grid">
          {Courts.data?.map((court) => {
            const config = walkInConfigs[court.id];
            const hasWalkInSetup = Boolean(
              config?.price &&
              config?.players &&
              config?.openTime &&
              config?.closeTime,
            );
            const isFull =
              hasWalkInSetup &&
              config.players &&
              config.currentPlayers >= parseInt(config.players, 10);

            if (!config) {
              return (
                <div className="court-card default-card" key={court.id}>
                  <div className="card-top">
                    <span className="court-name">
                      <SportsTennisIcon className="court-icon" /> Court{" "}
                      {court.id}
                    </span>
                    <Switch disabled checked={false} size="small" />
                  </div>
                  <div className="card-img-container">
                    {Array.isArray(court.gallery) &&
                    court.gallery.length > 0 ? (
                      <img
                        src={court.gallery[0].court_image_url}
                        alt="court image"
                      />
                    ) : (
                      <img src={Defaultimg} alt="default court" />
                    )}
                  </div>
                  <button
                    className="btn-walkin-create"
                    onClick={() => handleCreate(court)}
                  >
                    Create
                  </button>
                </div>
              );
            }

            return (
              <div
                className={`court-card active-card ${
                  !config.isActive ? "disabled-card" : ""
                }`}
                key={court.id}
              >
                <div className="card-top">
                  <span className="court-name">
                    <SportsTennisIcon className="court-icon" />{" "}
                    {court.court_name}
                  </span>
                  <div className="card-top-controls">
                    <EditOutlinedIcon
                      className="edit-icon"
                      onClick={() => handleEdit(court)}
                    />
                    {/* <Switch
                      checked={config.isActive}
                      onChange={() => toggleStatus(court.id)}
                      color="primary"
                    /> */}
                  </div>
                </div>

                <div className="badge-row">
                  <span
                    className={`status-pill ${
                      isFull ? "pill-full" : "pill-active"
                    }`}
                  >
                    ● {isFull ? "Fully Booked" : "Walk-in Active"}
                  </span>
                </div>

                <div className="card-img-container">
                  {Array.isArray(config.courtImages) &&
                  config.courtImages.length > 0 ? (
                    <img src={config.courtImages[0]} alt="court image" />
                  ) : Array.isArray(court.gallery) &&
                    court.gallery.length > 0 ? (
                    <img
                      src={court.gallery[0].court_image_url}
                      alt="court image"
                    />
                  ) : (
                    <img src={Defaultimg} alt="default court" />
                  )}
                </div>

                <div className="card-info-box">
                  <div className="info-row">
                    <div className="info-col">
                      <span className="info-label">Rate</span>
                      <span className="info-value">
                        {config.price || "-"} Ks /per day
                      </span>
                    </div>
                    <div className="info-col">
                      <span className="info-label">Hours</span>
                      <span className="info-value">
                        {config.openTime || "-"} - {config.closeTime || "-"}
                      </span>
                    </div>
                  </div>
                  <div className="info-status">
                    <span className="info-label">Status</span>
                    <span
                      className={`info-value ${
                        isFull ? "text-red" : "text-dark"
                      }`}
                    >
                      Capacity: {config.currentPlayers}/{config.players || "-"}{" "}
                      Players {isFull ? "(Full)" : ""}
                    </span>
                  </div>
                </div>

                <div className="card-bottom">
                  {hasWalkInSetup ? (
                    <button
                      className="btn-booking-link"
                      disabled={!config.isActive || isFull}
                      onClick={() =>
                        navigate("/class/walkbooking", {
                          state: {
                            venueName: Venue.data?.find(
                              (venue) => venue.id === active,
                            )?.venue_name,
                            venueId: active,
                            court,
                            walkInConfig: config,
                          },
                        })
                      }
                    >
                      Booking →
                    </button>
                  ) : (
                    <button
                      className="btn-walkin-create"
                      onClick={() => handleCreate(court)}
                    >
                      Create
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default Classwalkin;
