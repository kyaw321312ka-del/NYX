import { useRef } from "react";
import "./classaddcourtpopup.css";
import CloseIcon from "@mui/icons-material/CloseOutlined";

function ClassCourtPopUp({ data }) {
  const {
    id,
    header,
    heading,
    set_show,
    court_id,
    venue_id,
    openerror,
    openloading,
    opensuccess,
    GetCourts,
    isDark, // Parent ကနေ ပို့လိုက်တဲ့ isDark ကို ရယူခြင်း
  } = data;

  const dataref = useRef();
  const disref = useRef();

  async function class_court_add(e) {
    e.preventDefault();
    const url = {
      1: (import.meta.env.VITE_BASE_URL + "/api/venue/addpros"),
      2: (import.meta.env.VITE_BASE_URL + "/api/venue/addcons"),
      3: (import.meta.env.VITE_BASE_URL + "/api/venue/addservice"),
      4: (import.meta.env.VITE_BASE_URL + "/api/venue/addrule"),
    };

    let text = {};
    if (id == 1) {
      text.header = "New Pro Added to List";
      text.body = "Your new Pro has been shown";
    } else if (id == 2) {
      text.header = "New Con Added to List";
      text.body = "Your new Con has been shown";
    } else if (id == 3) {
      text.header = "New Service Added to List";
      text.body = "Your new service has been shown";
    } else if (id == 4) {
      text.header = "New Rule Added to List";
      text.body = "Your new rule has been shown";
    }
    if (!url[id]) return;

    const senddata = {
      venue_id: venue_id,
      court_id: court_id,
      name: dataref.current.value,
    };
    if (id == 4) senddata.description = disref.current.value;
    if (id === 1) senddata.detail = "testing";

    openloading();
    try {
      const response = await fetch(url[id], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(senddata),
      });

      if (response.ok) {
        GetCourts(venue_id);
        opensuccess(text.header, text.body);
        set_show(false);
      } else {
        openerror("Something went wrong");
        set_show(false);
      }
    } catch (error) {
      openerror("Cannot connect with server");
      console.error(error);
      set_show(false);
    }
  }

  return (
    <div className={`cupwarper ${isDark ? "dark-mode" : ""}`}>
      <form
        className="cupmain"
        onSubmit={class_court_add}
        style={{ minHeight: id == 4 ? "280px" : "210px" }}
      >
        <span className="cupcontent1">
          <h2>{header}</h2>
          <button onClick={() => set_show(false)} type="button">
            <CloseIcon sx={{ fontSize: "20px" }} />
          </button>
        </span>
        <span className="cupcontent2">
          <p>{heading}</p>
          <input type="text" ref={dataref} required />
        </span>
        {id == 4 && (
          <span className="cupcontent4">
            <p>Description</p>
            <textarea rows={2} ref={disref} />
          </span>
        )}
        <span className="cupcontent3">
          <button onClick={() => set_show(false)} type="button">
            Cancel
          </button>
          <button type="submit">Create</button>
        </span>
      </form>
    </div>
  );
}

export default ClassCourtPopUp;
