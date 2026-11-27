import { useState } from "react";
import { Context } from "../../shared/hooks/AppContext";

function AppProviders({ children }) {
  const [childData, SetchildData] = useState({});
  const [color, setPosNavColor] = useState(
    localStorage.getItem("pos_navcolor") || "#0D1B2A",
  );
  const [backcolor, setPosBackColor] = useState(
    localStorage.getItem("pos_background") || "#F0F0F0",
  );
  const [classNavColor, setClassNavColor] = useState(
    localStorage.getItem("class_navcolor") || "#0D1B2A",
  );
  const [classBackColor, setClassBackColor] = useState(
    localStorage.getItem("class_background") || "#F0F0F0",
  );
  const [Length, setLength] = useState(1);
  const [islogin, setislogin] = useState(
    localStorage.getItem("islogin") === "true",
  );
  const [isClassLogin, setisClassLogin] = useState(
    localStorage.getItem("isClassLogin") === "true",
  );

  return (
    <Context.Provider
      value={{
        color,
        setPosNavColor,
        backcolor,
        setPosBackColor,
        classNavColor,
        setClassNavColor,
        classBackColor,
        setClassBackColor,
        Length,
        setLength,
        childdata: childData,
        setchilddata: SetchildData,
        islogin,
        setislogin,
        isClassLogin,
        setisClassLogin,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export default AppProviders;
