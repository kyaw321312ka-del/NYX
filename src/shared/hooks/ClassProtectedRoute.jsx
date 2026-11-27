import { Children, useContext, useState } from "react";
import { Context } from "./AppContext";
import { useLocation, Navigate } from "react-router-dom";

const ClassProtectedRoute = ({ children }) => {
  const location = useLocation();
  const ContextData = useContext(Context);
  const { Token, Length, islogin, isClassLogin } = ContextData;

  if (!isClassLogin) {
    return <Navigate to="/login/academiclogin" replace />;
  }

  if (Length <= 0 && location.pathname !== "class/classsetting/paymenttax") {
    return <Navigate to="class/classsetting/paymenttax" replace />;
  }
  return children;
};
export default ClassProtectedRoute;
