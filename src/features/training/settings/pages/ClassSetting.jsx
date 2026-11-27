import { NavLink, Outlet, useLocation } from "react-router-dom";
import "../../../pos/settings/styles/pos-setting.css";
import SettingsIcon from "@mui/icons-material/Settings";
import { useContext } from "react";
import { Context } from "../../../../shared/hooks/AppContext";

function ClassSetting() {
  const ContextData = useContext(Context);
  const location = useLocation();

  // Route URL ပေါ်မူတည်၍ classBackColor သို့မဟုတ် posBackColor ကို Dynamic ယူခြင်း
  const isClass = location.pathname.includes("/class");
  const windowbackcolor = isClass
    ? ContextData?.classBackColor
    : ContextData?.backColor;

  const Font_color = Boolean(windowbackcolor === "#1A1C1E");

  const FontStyle = {
    color: Font_color ? "#E1E1E1" : "#0D1B2A",
  };

  return (
    <div className="possettingcontainer">
      <h2 className="possettingheader" style={FontStyle}>
        <SettingsIcon style={{ fontSize: "35px" }} /> Setting
      </h2>

      <div className={Font_color ? "possettingnav1" : "possettingnav"}>
        <NavLink to="generalsetting">General Setting</NavLink>
        <NavLink to="staffmanagement">Staff Management</NavLink>
        <NavLink to="paymenttax">Payment and Tax</NavLink>
        <NavLink to="apperance">Appearance</NavLink>
      </div>

      <div className="possettingcontent">
        <Outlet />
      </div>
    </div>
  );
}

export default ClassSetting;
