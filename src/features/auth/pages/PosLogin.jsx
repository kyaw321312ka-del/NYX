import { useContext, useRef } from "react";
import "../styles/login.css";
import { Context } from "../../../shared/hooks/AppContext";
import { useNavigate } from "react-router-dom";
import { loginWithCredentials } from "../services/authApi";
function PosLogin() {
  const navigate = useNavigate();

  const { setislogin, setisClassLogin } = useContext(Context);
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
    try {
      let response = await loginWithCredentials(data);
      if (response.ok) {
        let data = await response.json();
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
          localStorage.removeItem("isClassLogin");
          localStorage.setItem("adminPassword", passwordref.current.value);
          setisClassLogin(false);
          localStorage.setItem("islogin", "true");
          setislogin(true);
          navigate("/", { replace: true });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <form className="posloginwarper" onSubmit={adminLogin}>
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
        {/* <p className="forgot">Forgot Password ?</p> */}
      </span>

      <button>Login</button>
    </form>
  );
}
export default PosLogin;
