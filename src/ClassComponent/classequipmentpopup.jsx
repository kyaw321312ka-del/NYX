import CloseIcon from "@mui/icons-material/CloseOutlined";
import "./classequipmentpopup.css";
import { useRef, useState } from "react";

function ClassEquipmentPopup({ data }) {
  const [allow, setallow] = useState(true);

  const {
    info,
    setshowequipment,
    openloading,
    openerror,
    opensuccess,
    GetCourts,
    venue_id,
    delete_equipment,
    isDark, // Parent ကနေ ပို့လိုက်တဲ့ isDark ကို ရယူခြင်း
  } = data;

  const nameref = useRef();
  const priceref = useRef();
  const qtyref = useRef();

  // add equipment
  async function add_equipment(e) {
    e.preventDefault();
    if (!venue_id) return;
    let equipment = {
      venue_id: venue_id,
      product_name: nameref.current.value,
      rental_price: priceref.current.value,
      qty_total: qtyref.current.value,
    };
    openloading();
    try {
      let response = await fetch(import.meta.env.VITE_CLASS_ADD_EQUIPMENT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(equipment),
      });
      if (response.ok) {
        await GetCourts(venue_id);
        opensuccess(
          "New Equipment Added",
          "Your new equipment is now available",
        );

        setshowequipment(false);
      } else {
        openerror("Something went wrong");
      }
    } catch (err) {
      openerror("Cannot connect with server");
      console.log(err);
    }
  }

  async function edit_equipment(e) {
    e.preventDefault();
    if (!venue_id || !info?.id) return;
    const equipment = {
      venue_id,
      product_name: nameref.current.value,
      rental_price: priceref.current.value,
      qty_total: qtyref.current.value,
    };
    openloading();
    try {
      const editUrl = import.meta.env.VITE_CLASS_EDIT_EQUIPMENT.replace(
        ":equipmentId",
        encodeURIComponent(info.id),
      );
      const response = await fetch(editUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(equipment),
      });
      if (response.ok) {
        await GetCourts(venue_id);
        opensuccess("Equipment Updated", "Equipment details were updated");
        setshowequipment(false);
      } else {
        openerror("Something went wrong");
      }
    } catch (err) {
      openerror("Cannot connect with server");
      console.log(err);
    }
  }

  return (
    <div className={`cepwarper ${isDark ? "dark-mode" : ""}`}>
      <form
        className="cepmain"
        onSubmit={info ? edit_equipment : add_equipment}
      >
        <button
          className="cepbody1"
          type="button"
          onClick={() => setshowequipment(false)}
        >
          <CloseIcon />
        </button>
        <h3 className="cepbody2">
          {info ? "Edit Equipment" : "New Equipment"}
        </h3>
        <span className="cepbody3">
          <p>Product Name</p>
          <input
            type="text"
            required
            defaultValue={info ? info.product_name : ""}
            ref={nameref}
            readOnly={info && allow}
          />
        </span>
        <span className="cepbody3">
          <p>Rental Price</p>
          <input
            type="number"
            required
            defaultValue={info ? info.rental_price : ""}
            ref={priceref}
            readOnly={info && allow}
          />
        </span>
        <span className="cepbody3">
          <p>Qty_total</p>
          <input
            type="number"
            required
            defaultValue={info ? info.qty_total : ""}
            ref={qtyref}
            readOnly={info && allow}
          />
        </span>
        {info ? (
          <span className="cepbody4">
            <button type="button" onClick={() => delete_equipment(info.id)}>
              Delete
            </button>
            <button type="button" onClick={() => setallow(!allow)}>
              Edit
            </button>
            <button type="submit" disabled={allow}>Update</button>
          </span>
        ) : (
          <span className="cepbody5">
            <button type="button" onClick={() => setshowequipment(false)}>
              Cancel
            </button>
            <button type="submit">Create</button>
          </span>
        )}
      </form>
    </div>
  );
}

export default ClassEquipmentPopup;
