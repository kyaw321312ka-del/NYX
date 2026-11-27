import "./alert.css";
import { useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import CheckIcon from "@mui/icons-material/CheckCircleOutlined";
import WarningIcon from "@mui/icons-material/WarningAmberOutlined";
import deleteIcon from "../../assets/images/deleteicon.png";

export const useNoti = () => {
  const [wait, setwait] = useState(false);
  const [loading, setloading] = useState(false);
  const [success, setsuccess] = useState(false);
  const [error, seterror] = useState(false);
  const [confirmbox, setconfirmbox] = useState(false);
  const [width, setwidth] = useState("calc(100% - 230px)");

  const [errortext, seterrortext] = useState("something went wrong");
  const [successtext, setsuccesstext] = useState({
    header: "Item Added to List",
    body: "Your Item is now Avaliable for Ordering",
  });
  const [deletetext, setdeletetext] = useState({
    header: "Delete this item",
    body: "Are you sure to delete this item",
  });

  const funref = useRef(null);

  const close = () => {
    setwait(false);
    setloading(false);
    setsuccess(false);
    seterror(false);
    setconfirmbox(false);
  };

  const openloading = (divwidth) => {
    if (divwidth) {
      setwidth(divwidth);
    }
    setwait(true);
    setconfirmbox(false);
    setloading(true);
    setsuccess(false);
    seterror(false);
  };

  const opensuccess = (header, body) => {
    if (header) setsuccesstext((prev) => ({ ...prev, header }));
    if (body) setsuccesstext((prev) => ({ ...prev, body }));
    setwait(true);
    setconfirmbox(false);
    setloading(false);
    setsuccess(true);
    seterror(false);
  };

  const openerror = (error) => {
    if (error) seterrortext(error);
    setwait(true);
    setconfirmbox(false);
    setloading(false);
    setsuccess(false);
    seterror(true);
  };

  const openconfirm = (header, body) => {
    if (header) setdeletetext((prev) => ({ ...prev, header }));
    if (body) setdeletetext((prev) => ({ ...prev, body }));
    setwait(true);
    setloading(false);
    seterror(false);
    setsuccess(false);
    setconfirmbox(true);

    return new Promise((reslove) => {
      funref.current = reslove;
    });
  };

  const isconfirm = (bool) => {
    if (funref.current) {
      funref.current(bool);
      close();
    }
  };

  const Loading =
    wait &&
    createPortal(
      <div className="alretwarper" style={{ width: width }}>
        {loading && (
          <div className="alretmain">
            <p>Please wait</p>
            <div className="loading-spinner"></div>
          </div>
        )}
        {success && (
          <div className="alretsuccess">
            <CheckIcon className="alretcheckicon" />
            <h2>{successtext.header}</h2>
            <p>{successtext.body}</p>
            <button onClick={close}>Great,Thank!</button>
          </div>
        )}
        {error && (
          <div className="alreterror">
            <WarningIcon className="warningicon" />
            <h3>Error</h3>
            <p>{errortext}</p>
            <button onClick={close}>Understand</button>
          </div>
        )}
        {confirmbox && (
          <div className="alretconfirm">
            <span className="alretconfirmicon">
              <img src={deleteIcon} />
            </span>
            <span className="alretconfirmtext">
              <h3>{deletetext.header}</h3>
              <p>{deletetext.body}?</p>
            </span>
            <span className="alretconfirmbtn">
              <button onClick={() => isconfirm(false)}>cancel</button>
              <button
                onClick={() => {
                  isconfirm(true);
                }}
              >
                Delete
              </button>
            </span>
          </div>
        )}
      </div>,
      document.body,
    );
  return {
    Loading,
    openloading,
    opensuccess,
    openerror,
    openconfirm,
    close,
  };
};
