import BookingIcon from "@mui/icons-material/EventAvailable";
import LockIcon from "@mui/icons-material/LockOutlineRounded";
import "../classCss/classbookingschedule.css";
import { useGetClassVenue } from "../ClassApi";
import { useEffect, useState, useContext } from "react";
import { useNoti } from "../Hooks/alert";
import Defaultimg from "../images/defaultimg.png";
import CloseIcon from "@mui/icons-material/CloseOutlined";
import { useGetClassBookingSchedule } from "../ClassApi/classbookingscheduleapi";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router-dom";
import ClassCreateBooking from "../ClassComponent/classcreatenewbook";
import { Context } from "../Hooks/context"; // Context ကို import ခေါ်ယူခြင်း

function BookingSchedule() {
  const { classBackColor } = useContext(Context);
  const isDark = classBackColor === "#1A1C1E";

  const [active, setactive] = useState();

  const navigate = useNavigate();

  const { GetVenue, Venue, Courts, GetCourts } = useGetClassVenue();
  const { GetRemainBooking, remainbooking } = useGetClassBookingSchedule();
  const { Loading, openloading, openerror, opensuccess, close } = useNoti();

  //for side show
  const [show, setshow] = useState(false);
  const [info, setinfo] = useState(null);
  const [mix_data, setmix_data] = useState(null);

  //for date picker
  const [date, setdate] = useState(new Date());

  //for create booking
  const [showCreate, setshowCreate] = useState(false);
  const [venue_name, setvenue_name] = useState(null);
  const [targettime, settargettime] = useState(null);
  const [targettimeid, settargettimeid] = useState(null);

  useEffect(() => {
    GetVenue();
  }, []);

  useEffect(() => {
    if (!info) return;
    let datetosend = format_change(date);

    (async () => {
      openloading();
      await GetRemainBooking(info?.id, datetosend);
      close();
    })();
  }, [date, info?.id]);

  useEffect(() => {
    console.log("data change lo a lote lote");
    if (!info) return console.log("first return");
    if (Array.isArray(info.time_slots) && info.time_slots.length > 0) {
      if (Array.isArray(remainbooking.data) && remainbooking.data.length > 0) {
        let updateremain = remainbooking.data.map((item, index) => {
          return { ...item, available: true };
        });
        console.log(updateremain);
        const filterd = info.time_slots.filter(
          (obj2) => !remainbooking.data.some((obj1) => obj1.id === obj2.id),
        );
        let updateremain1 = filterd.map((item, index) => {
          return { ...item, available: false };
        });
        const result = [...updateremain, ...updateremain1];
        setmix_data(result);
        console.log(result);
      } else {
        console.log("third return");
        setmix_data([]);
      }
    } else {
      console.log("second return");
      setmix_data([]);
    }
  }, [info, remainbooking.data, date]);

  useEffect(() => {
    if (Venue?.data?.length > 0 && !active) {
      console.log(Venue.data[0]?.id);
      setvenue_name(Venue.data[0]?.venue_name);
      setactive(Venue.data[0]?.id);
    }
  }, [Venue.data]);

  async function changecourt(id) {
    if (!id) return;
    openloading();
    await Promise.all([
      GetCourts(id),
      new Promise((reslove) => setTimeout(reslove, 300)),
    ]);
    setactive(id);
    close();
  }

  //show side bar
  async function show_sidebar(item) {
    setshow(true);
    console.log(item);
    setinfo(item);
    let datetosend = format_change(date);
    await GetRemainBooking(item.id, datetosend);
  }

  //function to change date format
  function format_change(date) {
    let a = date.toLocaleDateString();
    let dateformatting = new Date(a);
    const year = dateformatting.getFullYear();
    const month = dateformatting.getMonth() + 1;
    const day = dateformatting.getDate();
    let formattedDate = `${year}-${month}-${day}`;
    console.log("last one", formattedDate);
    return formattedDate;
  }

  //functions for date picker
  const format_date = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const lastday = () => {
    const prev = new Date(date);
    prev.setDate(prev.getDate() - 1);
    setdate(prev);
  };

  const nextday = () => {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    setdate(next);
  };

  //add booking
  function add_new_booking(item) {
    settargettimeid(item.id);
    settargettime(
      `${item.start_time.slice(0, 5)}-${item.end_time.slice(0, 5)}`,
    );
    setshowCreate(true);
  }

  return (
    <div
      className={`cbsmain ${isDark ? "dark-mode" : ""}`}
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: classBackColor || (isDark ? "#121212" : "#f8fafc"),
        color: isDark ? "#ffffff" : "#111827",
        transition: "all 0.2s ease",
      }}
    >
      {showCreate && (
        <ClassCreateBooking
          data={{
            venue_name: venue_name,
            info: info,
            date: format_change(date),
            remainbooking: remainbooking,
            targettime: targettime,
            settargettime: settargettime,
            targettimeid: targettimeid,
            settargettimeid: settargettimeid,
            Courts: Courts,
            venue_id: active,
            setshowCreate: setshowCreate,
            GetRemainBooking,
            isDark: isDark,
          }}
        />
      )}
      {Loading}
      <header className="cbsheader">
        <BookingIcon style={{ fontSize: "35px", marginRight: "5px" }} />
        <h2 style={{ fontSize: "30px" }}>Booking Schedule</h2>
      </header>
      <main className="cbslayout">
        <div className="cbsbody1">
          <div className="cbstitle">
            {Array.isArray(Venue.data) ? (
              Venue.data.length > 0 ? (
                Venue.data.map((item, index) => {
                  return (
                    <h3
                      key={index}
                      onClick={() => {
                        setvenue_name(item.venue_name);
                        changecourt(item.id);
                      }}
                      className={item.id == active ? "activevenue" : ""}
                    >
                      {item.venue_name}
                    </h3>
                  );
                })
              ) : (
                <h3>no venue</h3>
              )
            ) : (
              <h3>Loading...</h3>
            )}
          </div>
          <hr style={{ margin: "10px 1px", opacity: 0.2 }} />
          <div className="cbsbody">
            {Array.isArray(Courts.data) ? (
              Courts.data.length > 0 ? (
                Courts.data.map((item, index) => {
                  return (
                    <div
                      className="cbscontent"
                      key={index}
                      onClick={() => show_sidebar(item)}
                    >
                      <span className="cbscontenttext">
                        <h4>COURT {item.id}</h4>
                      </span>
                      <div className="cbscontentimg">
                        {Array.isArray(item.gallery) &&
                        item.gallery.length > 0 ? (
                          <img
                            src={item.gallery[0].court_image_url}
                            alt="court image"
                          />
                        ) : (
                          <img src={Defaultimg} alt="default court" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No data</p>
              )
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
        {show && (
          <aside className="cbsside">
            <span className="cbssideheader">
              <h3>Court {info?.id} Schedule</h3>
              <button onClick={() => setshow(false)}>
                <CloseIcon sx={{ fontSize: "20px" }} />
              </button>
            </span>
            <div className="datepicker">
              <button onClick={lastday} className="dpbtn">
                <ArrowBackIcon sx={{ fontSize: 14 }} />
              </button>
              <div className="dpdiv">
                {isToday(date) && <span className="dbtoday">TODAY</span>}
                <h4 className="dbtoday2">{format_date(date)}</h4>
              </div>
              <button onClick={nextday} className="dpbtn">
                <ArrowForwardIcon sx={{ fontSize: 14 }} />
              </button>
            </div>
            <div className="cbssidebody">
              {Array.isArray(mix_data) ? (
                mix_data.length > 0 ? (
                  mix_data.map((item, index) => {
                    return (
                      <span
                        key={index}
                        className={
                          item.available == true ? "ordernow" : "unorder"
                        }
                      >
                        <h4>
                          {item.start_time.slice(0, 5)} -{" "}
                          {item.end_time.slice(0, 5)}
                        </h4>
                        {item.available ? (
                          <button
                            className="ordernowbtn"
                            onClick={() => add_new_booking(item)}
                          >
                            BOOK NOW
                          </button>
                        ) : (
                          <button className="lock">
                            <LockIcon
                              sx={{ fontSize: "20px", color: "#E30613" }}
                            />
                          </button>
                        )}
                      </span>
                    );
                  })
                ) : (
                  <span className="ordernow">
                    <h4>no data</h4>
                  </span>
                )
              ) : (
                <span className="ordernow">
                  <h4>Loading...</h4>
                </span>
              )}
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}

export default BookingSchedule;
