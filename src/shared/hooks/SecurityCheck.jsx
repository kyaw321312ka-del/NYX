import Security from "../../assets/images/security.png";
import { useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { createPortal } from "react-dom";
import "./security-check.css";

export function useSecurityCheck() {
  const [show, setshow] = useState(false);
  const [fun, setfun] = useState(null);
  const [fun1, setfun1] = useState(null);
  const [wrong, setwrong] = useState(false);

  const passwordref = useRef();

  const getStoredAdminPassword = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("adminPassword")?.trim() ?? "";
  };

  const openbox = (callBackfun, Fun) => {
    console.log("set show is true");
    setfun(() => callBackfun);
    if (Fun) setfun1(() => Fun);
    setshow(true);
  };

  const closebox = () => {
    setshow(false);
    passwordref.current.value = "";
  };

  function handlechange(e) {
    e.preventDefault();
    const enteredPassword = passwordref.current?.value ?? "";
    const storedPassword = getStoredAdminPassword();

    if (enteredPassword && enteredPassword === storedPassword) {
      if (typeof fun === "function") {
        fun(e);
      }
      closebox();
      if (typeof fun1 === "function") {
        fun1(false);
      }
    } else {
      setwrong(true);
      passwordref.current.value = "";
      setTimeout(() => {
        setwrong(false);
      }, 6000);
    }
  }

  const ReturnJsx = show
    ? createPortal(
        <div className="securitywarpermain" style={{ zIndex: 1000 }}>
          <form className="securitywarper" onSubmit={handlechange}>
            <button className="secybutton" onClick={closebox} type="button">
              <CloseIcon />
            </button>
            <img src={Security} alt="pngphoto" className="secyimg" />
            <h1 className="secyheader">Security Check</h1>
            <p className="secyp">
              Confirm it's you to authorize this <br />
              high-level administrative action.
            </p>
            <h3 className="secyh3">Admin Password</h3>
            <input
              className="secyinput"
              type="password"
              placeholder="Enter Admin Password"
              ref={passwordref}
              required
            />
            {wrong && <p className="wrongpassword">Wrong Password,Try Again</p>}
            <span className="secybtn">
              <button type="button" onClick={() => closebox()}>
                cancel
              </button>
              <button style={{ background: "#0D1B2A", color: "white" }}>
                Confirm
              </button>
            </span>
          </form>
        </div>,
        document.body,
      )
    : null;
  return { ReturnJsx, openbox };
}
