import { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/general-setting.css";
import ShopLogo from "../../../../assets/images/shoplogo.png";
import { Context } from "../../../../shared/hooks/AppContext";
import toast, { Toaster } from "react-hot-toast";
import { useGetGeneralSetting } from "../../services";

function PosGeneralSetting() {
  const [file, setfile] = useState(null);
  const [filepath, setfilepath] = useState(null);

  // useGetGeneralSetting မှ Data ယူခြင်း
  const { General = {}, GetGenerals } = useGetGeneralSetting();

  // Dark Mode Dynamic Style ယူရန်
  const ContextData = useContext(Context) || {};
  const location = useLocation();

  // Class Path စစ်ခြင်း
  const isClass = location.pathname.includes("/class");

  const backcolor = isClass
    ? ContextData?.classBackColor
    : ContextData?.backcolor;

  const isDark = Boolean(backcolor === "#1A1C1E");

  // Dynamic Styles
  const ContainerStyle = {
    backgroundColor: isDark ? "#1E2227" : "#f0f0f0",
    borderColor: isDark ? "#3A3F47" : "#000000",
  };

  const FontStyle = {
    color: isDark ? "#E1E1E1" : "#0D1B2A",
  };

  const InputStyle = {
    backgroundColor: isDark ? "#25282C" : "#FFFFFF",
    color: isDark ? "#FFFFFF" : "#000000",
    border: isDark ? "1px solid #444" : "1px solid #ccc",
  };

  useEffect(() => {
    if (typeof GetGenerals === "function") {
      GetGenerals();
    }
  }, []);

  const nameref = useRef();
  const contactref = useRef();
  const addressref = useRef();
  const linkref = useRef();
  const fileref = useRef();

  // ⚠️ Crash မဖြစ်အောင် Optional Chaining (?. ) ဖြင့် စစ်ဆေးထားပါသည်
  const hasData = Array.isArray(General?.data) && General.data.length > 0;

  const shop_info = hasData
    ? {
        key: 1,
        url: General.data[0]?.logo_image_url || ShopLogo,
        name: General.data[0]?.shop_name || "",
        phNo: General.data[0]?.contact_info || "",
        address: General.data[0]?.address || "",
        social_link: General.data[0]?.social_link || "",
      }
    : {
        key: 2,
        url: ShopLogo,
        name: "Loading...",
        phNo: "Loading...",
        address: "Loading...",
        social_link: "Loading...",
      };

  async function update_general(e) {
    e.preventDefault();
    if (hasData) {
      let fromdata = new FormData();
      fromdata.append("id", General.data[0].id);
      fromdata.append("shop_name", nameref.current.value);
      fromdata.append("contact_info", contactref.current.value);
      fromdata.append("address", addressref.current.value);
      fromdata.append("social_link", linkref.current.value);

      if (fileref.current?.files?.[0]) {
        fromdata.append("logo", fileref.current.files[0]);
      }

      let data = {
        id: General.data[0].id,
        shop_name: nameref.current.value,
        contact_info: contactref.current.value,
        address: addressref.current.value,
        social_link: linkref.current.value,
      };

      if (
        data.shop_name === General.data[0].shop_name &&
        data.contact_info === General.data[0].contact_info &&
        data.address === General.data[0].address &&
        data.social_link === General.data[0].social_link &&
        !fileref.current?.files?.[0]
      ) {
        return;
      }

      const updating = toast.loading("Saving Changes...");
      try {
        let response = await fetch((import.meta.env.VITE_BASE_URL + "/api/generalsetting/updategeneral"), {
          method: "PUT",
          body: fromdata,
        });
        if (response.ok) {
          if (typeof GetGenerals === "function") await GetGenerals();
          toast.success("Successfully changed", { id: updating });
        } else {
          toast.error("failed", { id: updating });
        }
      } catch (error) {
        console.log(error);
        toast.error("failed", { id: updating });
      }
    }
  }

  function cancelFun() {
    if (nameref.current) nameref.current.value = shop_info.name;
    if (contactref.current) contactref.current.value = shop_info.phNo;
    if (addressref.current) addressref.current.value = shop_info.address;
    if (linkref.current) linkref.current.value = shop_info.social_link;
    setfile(null);
    setfilepath(null);
  }

  function show_img(event) {
    let img = event.target.files?.[0];
    setfile(img);
    if (img) {
      let url = URL.createObjectURL(img);
      setfilepath(url);
    }
  }

  return (
    <form
      className="posgeneralsettingmain"
      style={ContainerStyle}
      key={shop_info.key}
      onSubmit={update_general}
    >
      <Toaster />
      <div className="posgeneralsettingbody1">
        <div className="zoom_img">
          <img src={filepath || shop_info.url} alt="Shop Logo" />
        </div>
        <label className="changelogo">
          Change Logo
          <input
            type="file"
            ref={fileref}
            onChange={show_img}
            style={{ display: "none" }}
          />
        </label>
      </div>

      <div className="posgeneralsettingbody2">
        <label style={FontStyle}>Shop Name</label>
        <input
          type="text"
          defaultValue={shop_info.name}
          ref={nameref}
          style={InputStyle}
          required
        />
      </div>

      <div className="posgeneralsettingbody2">
        <label style={FontStyle}>Contact Info</label>
        <input
          type="text"
          defaultValue={shop_info.phNo}
          ref={contactref}
          style={InputStyle}
          required
        />
      </div>

      <div className="posgeneralsettingbody2">
        <label style={FontStyle}>Address</label>
        <input
          type="text"
          defaultValue={shop_info.address}
          ref={addressref}
          style={InputStyle}
          required
        />
      </div>

      <div className="posgeneralsettingbody2">
        <label style={FontStyle}>Social Link</label>
        <input
          type="text"
          defaultValue={shop_info.social_link}
          ref={linkref}
          style={InputStyle}
          required
        />
      </div>

      <div className="posgeneralsettingbody2button">
        <button
          type="button"
          onClick={cancelFun}
          style={{
            backgroundColor: isDark ? "#3A3F47" : "#f0f0f0",
            color: isDark ? "#FFFFFF" : "#0d1b2a",
          }}
        >
          Cancel
        </button>
        <button type="submit">Save Changes</button>
      </div>
    </form>
  );
}

export default PosGeneralSetting;
