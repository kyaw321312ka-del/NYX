import "../styles/pos-appearance.css";
import myanmarFlag from "../../../../assets/images/myanmar.png";
import englandFlag from "../../../../assets/images/england.png";
import chinaFlag from "../../../../assets/images/china.png";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { Context } from "../../../../shared/hooks/AppContext";

function PosApperance() {
  const ContextData = useContext(Context);
  const location = useLocation();

  const isClass = location.pathname.includes("/class");

  const color = isClass ? ContextData.classNavColor : ContextData.posNavColor;
  const setcolor = isClass
    ? ContextData.setClassNavColor
    : ContextData.setPosNavColor;
  const backcolor = isClass
    ? ContextData.classBackColor
    : ContextData.backcolor;
  const setbackcolor = isClass
    ? ContextData.setClassBackColor
    : ContextData.setPosBackColor;

  const Font_Color = Boolean(backcolor === "#1A1C1E");
  const FontStyle = {
    color: Font_Color ? "#E1E1E1" : "#0D1B2A",
  };

  let styledata = [
    { text: "Midnight Blue", value: "#0D1B2A" },
    { text: "Dark Green", value: "#142B65" },
    { text: "Clover Green", value: "#2FA236" },
    { text: "Bold Orange", value: "#F76915" },
    { text: "Dark Cyan", value: "#008B8B" },
    { text: "Midnight Navy", value: "#2C3E50" },
  ];

  function handlestyle(style) {
    const storageKey = isClass ? "class_navcolor" : "pos_navcolor";
    localStorage.setItem(storageKey, style);
    setcolor(style);
  }

  function handlebackground(style) {
    const storageKey = isClass ? "class_background" : "pos_background";
    localStorage.setItem(storageKey, style);
    setbackcolor(style);
  }

  return (
    <div
      className="posapperancecontainer"
      style={{
        border: Font_Color ? "1px solid white" : "1px solid black",
        backgroundColor: backcolor,
      }}
    >
      <h2 className="posregionalsetting" style={FontStyle}>
        Regional Setting
      </h2>
      <div className="posapperancesection">
        <div className="apperancebody1">
          <p className="posprimarycolor" style={FontStyle}>
            General regional primary color
          </p>

          {styledata.map((item, index) => {
            return (
              <div className="apperancechild" key={index}>
                <div
                  className="forcolor"
                  style={{ background: item.value }}
                ></div>
                <span>
                  <p style={{ color: Font_Color ? "black" : "#0D1B2A" }}>
                    {item.text}
                  </p>
                  <input
                    type="radio"
                    name="navcolor"
                    value={item.value}
                    checked={item.value === color}
                    onChange={() => {
                      handlestyle(item.value);
                    }}
                  />
                </span>
              </div>
            );
          })}
        </div>

        <div className="apperancebody2">
          <h4 className="apperancetheme" style={FontStyle}>
            Theme
          </h4>
          <div className="lightanddark">
            <p style={{ color: Font_Color ? "black" : "#0D1B2A" }}>Light</p>
            <input
              type="radio"
              name="theme"
              checked={"#F0F0F0" === backcolor}
              onChange={() => {
                handlebackground("#F0F0F0");
              }}
            />
          </div>
          <div className="lightanddark">
            <p style={{ color: Font_Color ? "black" : "#0D1B2A" }}>Dark</p>
            <input
              type="radio"
              name="theme"
              checked={"#1A1C1E" === backcolor}
              onChange={() => {
                handlebackground("#1A1C1E");
              }}
            />
          </div>

          <h4 className="apperancelangauge" style={FontStyle}>
            Languages
          </h4>
          <div className="lightanddark">
            <img src={myanmarFlag} alt="Myanmar Flag" />
            <input type="radio" name="language" />
          </div>
          <div className="lightanddark">
            <img src={englandFlag} alt="England Flag" />
            <input type="radio" name="language" />
          </div>
          <div className="lightanddark">
            <img src={chinaFlag} alt="China Flag" />
            <input type="radio" name="language" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PosApperance;
