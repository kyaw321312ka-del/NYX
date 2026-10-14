import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../classCss/classnav.css";
import Logo from "../images/logo.png";
import LogoutIcon from "@mui/icons-material/Logout";
import { useContext, useState } from "react";
import { Context } from "../Hooks/context";
import ArrowRight from "@mui/icons-material/KeyboardArrowRight";
import ArrowDown from "@mui/icons-material/KeyboardArrowDown";

function ClassNav() {
  const [show1, setshow1] = useState(false); //for training
  const [show2, setshow2] = useState(false); //for renatal
  const [show3, setshow3] = useState(false); //for canteen
  const { setisClassLogin } = useContext(Context);

  const nagivate = useNavigate();

  function handleTraining() {
    setshow1(!show1);
    setshow2(false);
    setshow3(false);
  }

  function handleRental() {
    setshow2(!show2);
    setshow1(false);
    setshow3(false);
  }

  function handleCanteen() {
    setshow3(!show3);
    setshow1(false);
    setshow2(false);
  }

  return (
    <>
      <div className="classnavcontainer">
        <div className="classnav">
          <div className="classnavheader">
            <img src={Logo} alt="Logo" />
            <h1>Service</h1>
          </div>

          <div className="classbutton">
            <NavLink to="classoverview">Overview</NavLink>

            <div className="training">
              <button
                className="dropdownbutton"
                onClick={handleTraining}
                style={{
                  background: show1 ? "#f0f0f071" : "initial",
                  color: show1 ? "#0D1B2A" : "white",
                }}
              >
                Training
                <span className="dropdownarrow">
                  {!show1 ? <ArrowRight /> : <ArrowDown />}
                </span>
              </button>

              {show1 && (
                <span className="dropdownwarper">
                  <NavLink className="dropdownlist" to="classcourses">
                    Courses
                  </NavLink>
                  <NavLink className="dropdownlist" to="classcoursemanagement">
                    Course Management
                  </NavLink>
                  <NavLink className="dropdownlist" to="classstudent">
                    students
                  </NavLink>
                </span>
              )}
            </div>

            <div className="training">
              <button
                className="dropdownbutton"
                onClick={handleRental}
                style={{
                  background: show2 ? "#f0f0f071" : "initial",
                  color: show2 ? "#0D1B2A" : "white",
                }}
              >
                RENTAL
                <span className="dropdownarrow">
                  {!show2 ? <ArrowRight /> : <ArrowDown />}
                </span>
              </button>

              {show2 && (
                <span className="dropdownwarper">
                  <NavLink className="dropdownlist" to="classbookingschedule">
                    BOOKING SCHEDULE
                  </NavLink>
                  <NavLink className="dropdownlist" to="classbookinglist">
                    BOOKING LIST
                  </NavLink>
                  <NavLink className="dropdownlist" to="classvenuemanagement">
                    Venue MANAGEMENT
                  </NavLink>
                  <NavLink className="dropdownlist" to="classmember">
                    CUSTOMERS
                  </NavLink>
                  <NavLink className="dropdownlist" to="walkin">
                    Walk-In
                  </NavLink>
                </span>
              )}
            </div>

            <div className="training">
              <button
                className="dropdownbutton"
                onClick={handleCanteen}
                style={{
                  background: show3 ? "#f0f0f071" : "initial",
                  color: show3 ? "#0D1B2A" : "white",
                }}
              >
                Canteen
                <span className="dropdownarrow">
                  {!show3 ? <ArrowRight /> : <ArrowDown />}
                </span>
              </button>

              {show3 && (
                <span className="dropdownwarper">
                  <NavLink className="dropdownlist" to="classorder">
                    order
                  </NavLink>
                  <NavLink className="dropdownlist" to="classmenu">
                    MENUS
                  </NavLink>
                </span>
              )}
            </div>

            <NavLink to="classsetting">Setting</NavLink>

            <button
              className="logoutbutton"
              onClick={() => {
                setisClassLogin(false);
                localStorage.removeItem("isClassLogin");
                nagivate("/login/academiclogin", { replace: true });
              }}
            >
              <LogoutIcon />
              LOGOUT
            </button>
          </div>
        </div>
        <div className="classdashboard">
          <Outlet />
        </div>
      </div>
    </>
  );
}
export default ClassNav;
