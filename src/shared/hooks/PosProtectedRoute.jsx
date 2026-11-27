import { Children, useContext, useState } from "react";
import { Context } from "./AppContext";
import { useLocation, Navigate } from "react-router-dom";

const PosProtectedRoute = ({ children }) => {
  const location = useLocation();
  const ContextData = useContext(Context);
  const { Token, Length, islogin } = ContextData;

  if (!islogin) {
    return <Navigate to="/login/poslogin" replace />;
  }
  if (Length <= 0 && location.pathname !== "/possetting/paymenttax") {
    return <Navigate to="/possetting/paymenttax" replace />;
  }
  return children;
};
export default PosProtectedRoute;
