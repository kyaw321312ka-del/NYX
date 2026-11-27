import { useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../Hooks/context";
import { useNoti } from "../Hooks/alert";

function AcademicLogin() {
  const navigate = useNavigate();

  const { setisClassLogin, setislogin } = useContext(Context);
  const { Loading, openerror, openloading , close } = useNoti();

  const emailref = useRef();
  const passwordref = useRef();
  const validemail = useRef();
  const validpassword = useRef();

  async function adminLogin(e) {
    e.preventDefault();
    let data = {
      email: emailref.current.value,
      password: passwordref.current.value,
    };
    openloading("100%");
    try {
      let response = await fetch((import.meta.env.VITE_BASE_URL + "/api/auth/adminlogin"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        let data = await response.json();
        close();
        if (data.token == "User not found") {
          validemail.current.style.visibility = "visible";
          emailref.current.style.border = "1px solid red";
          emailref.current.style.color = "red";
          emailref.current.focus();
          setTimeout(() => {
            validemail.current.style.visibility = "hidden";
            emailref.current.style.border = "1px solid black";
            emailref.current.style.color = "#0d1b2a";
          }, 10000);
        } else if (data.token == "Incorrect Password") {
          validpassword.current.style.visibility = "visible";
          passwordref.current.style.border = "1px solid red";
          passwordref.current.style.color = "red";
          passwordref.current.focus();
          passwordref.current.select();
          setTimeout(() => {
            validpassword.current.style.visibility = "hidden";
            passwordref.current.style.border = "1px solid black";
            passwordref.current.style.color = "initial";
          }, 10000);
        } else if (data.token) {
          localStorage.removeItem("islogin");
          localStorage.setItem("adminPassword", passwordref.current.value);
          setislogin(false);
          localStorage.setItem("isClassLogin", "true");
          setisClassLogin(true);
          navigate("/class", { replace: true });
        }
      } else {
        openerror("something went wrong");
      }
    } catch (error) {
      openerror("Cannot connect with sever");
      console.log(error);
    }
  }

  return (
    <form className="posloginwarper" onSubmit={adminLogin}>
      {Loading}
      <span>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Enter your email"
          required
          ref={emailref}
        />
        <p className="faillogin" ref={validemail}>
          *invalid username
        </p>
      </span>

      <span>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Enter your password"
          required
          ref={passwordref}
        />
        <p className="faillogin" ref={validpassword}>
          *invalid password
        </p>
      </span>

      <button>Login</button>
    </form>
  );
}
export default AcademicLogin;
