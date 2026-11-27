import { useContext } from "react";
import { Context } from "./AppContext";
import { Navigate } from "react-router-dom";

const GuestRoute = ({ children, loginType }) => {
  const ContextData = useContext(Context);
  const { islogin, isClassLogin } = ContextData;

  if (loginType === "pos" && islogin) {
    return <Navigate to="/posoverview" replace />;
  }

  if (loginType === "class" && isClassLogin) {
    return <Navigate to="/class" replace />;
  }

  return children;
};

export default GuestRoute;
