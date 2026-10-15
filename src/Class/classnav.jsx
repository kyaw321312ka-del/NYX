import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../classCss/classnav.css";
import Logo from "../images/logo.png";
import LogoutIcon from "@mui/icons-material/Logout";
import { useContext, useState } from "react";
import { Context } from "../Hooks/context";
import ArrowRight from "@mui/icons-material/KeyboardArrowRight";
import ArrowDown from "@mui/icons-material/KeyboardArrowDown";

function ClassNav() {
  const [show1, setshow1] = useState(false);
  const [show2, setshow2] = useState(false);
  const [show3, setshow3] = useState(false);
  const [show4, setshow4] = useState(false);

  // Context မှ classNavColor နှင့် classBackColor ကို ရယူခြင်း
  const { classNavColor, classBackColor, setisClassLogin } =
    useContext(Context);
  const nagivate = useNavigate();

  const isDark = classBackColor === "#1A1C1E";
  function handleTraining() {
    setshow1(!show1);
    setshow2(false);
    setshow3(false);
    setshow4(false);
  }

  function handleRental() {
    setshow2(!show2);
    setshow1(false);
    setshow3(false);
    setshow4(false);
  }

  function handleCanteen() {
    setshow3(!show3);
    setshow1(false);
    setshow2(false);
    setshow4(false);
  }

  function handleTourament() {
    setshow4(!show4);
    setshow1(false);
    setshow2(false);
    setshow3(false);
  }

  return (
    <>
      <div className="classnavcontainer">
        {/* Class Sidebar သည် classNavColor ကို သုံးမည် */}
        <div className="classnav" style={{ background: classNavColor }}>
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
                  <NavLink className="dropdownlist" to="classwalk-in">
                    WALK-IN
                  </NavLink>
                  <NavLink className="dropdownlist" to="classmember">
                    CUSTOMERS
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

            {/*
 <div className="training">
              <button
                className="dropdownbutton"
                onClick={handleTourament}
                style={{
                  background: show4 ? "#f0f0f071" : "initial",
                  color: show4 ? "#0D1B2A" : "white",
                }}
              >
                Tournament
                <span className="dropdownarrow">
                  {!show4 ? <ArrowRight /> : <ArrowDown />}
                </span>
              </button>

              {show4 && (
                <span className="dropdownwarper">
                  <NavLink className="dropdownlist" to="classmanage">
                    Manage
                  </NavLink>
                  <NavLink className="dropdownlist" to="classenrollments">
                    Enrollments
                  </NavLink>
                  <NavLink className="dropdownlist" to="classpoints">
                    Points & Ranks
                  </NavLink>
                  <NavLink className="dropdownlist" to="classbanners">
                    Banners
                  </NavLink>
                </span>
              )}
            </div>

           */}
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

        {/* Dashboard သည် classBackColor အတိုင်း သီးခြား ပြောင်းမည် */}
        <div className="classdashboard" style={{ background: classBackColor }}>
          <Outlet />
        </div>
      </div>
    </>
  );
}
export default ClassNav;
