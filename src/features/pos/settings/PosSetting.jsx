import { NavLink, Outlet } from "react-router-dom";
import "./styles/pos-setting.css";
import SettingsIcon from "@mui/icons-material/Settings";
import { useContext } from "react";
import { Context } from "../../../shared/hooks/AppContext";

function PosSetting() {
  const { backcolor } = useContext(Context);

  const Font_color = Boolean(backcolor == "#1A1C1E");
  console.log(Font_color);
  const FontStyle = {
    color: Font_color ? "#E1E1E1" : "#0D1B2A",
  };
  const InputStyle = {
    backgroundColor: Font_color ? "#E1E1E1" : "#0D1B2A",
  };
  return (
    <>
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
        <Outlet />
      </div>
    </>
  );
}
export default PosSetting;
