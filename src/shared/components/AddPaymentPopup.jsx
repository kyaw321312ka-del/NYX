import { useContext, useRef, useState } from "react";
import "./add-payment-popup.css";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useSecurityCheck } from "../hooks/SecurityCheck";
import { Context } from "../hooks/AppContext";
import toast, { Toaster } from "react-hot-toast";

function AddPaymentPopUp({ data, updfun, FTS, items, setitems }) {
  const [file, setfile] = useState(null);
  const [filepath, setfilepath] = useState(null);

  const { Token } = useContext(Context);
  const { ReturnJsx, openbox } = useSecurityCheck();
  const [allow, setallow] = useState(true);

  const imgref = useRef();
  const paymentnameref = useRef();
  const adminnameref = useRef();
  const phoneref = useRef();

  //fun for previewimg
  function show_img(event) {
    let name = event.target.files[0];
    setfile(name);

    if (name) {
      let url = URL.createObjectURL(name);
      setfilepath(url);
    }
  }
  //for add payment authorization
  function ADDPAYMENT(e) {
    e.preventDefault();
    if (!file) return null;
    FTS(add_payment, data);
  }

  async function add_payment() {
    let formData = new FormData();

    if (file) {
      formData.append("payment_image", file);
    }

    formData.append("payment_method", paymentnameref.current.value);
    formData.append("payment_name", adminnameref.current.value);
    formData.append("payment_number", phoneref.current.value);

    const loading = toast.loading("Please wait");

    try {
      let response = await fetch((import.meta.env.VITE_BASE_URL + "/api/payment/addpayment"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Token}`,
        },
        body: formData,
      });
      if (response.ok) {
        await updfun();
        toast.success("successfully Added", { id: loading });
        setitems(null);
      } else {
        toast.error("something went wrong", { id: loading });
        setitems(null);
      }
    } catch (err) {
      console.log(err);
      toast.error("Cannot connect with sever", { id: loading });
    }
  }

  //deleting payment authorization
  function delete_order_confirm(id) {
    FTS(() => {
      delete_order(id);
    }, data);
    data(false);
  }
  async function delete_order(id) {
    const deleting = toast.loading("Please Wait...");
    try {
      let response = await fetch(
        `${(import.meta.env.VITE_BASE_URL + "/api/payment/deletepayment")}/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Token}`,
          },
        },
      );
      if (response.ok) {
        await updfun();
        toast.success("Successfully Deleted", { id: deleting });
        setitems(null);
      } else {
        toast.error("Failed to Delete", { id: deleting });
        setitems(null);
      }
    } catch (err) {
      toast.error("Cannot connect with sever", { id: deleting });
      console.log(err);
      setitems(null);
    }
  }

  //updating payment authorization
  function update_payment_confirm(id, e) {
    e.preventDefault();
    FTS(() => {
      (update_payment(id), data);
    });
  }

  async function update_payment(id) {
    if (!paymentnameref.current || !adminnameref.current || !phoneref.current) {
      console.log("Refs are not ready yet");
      return;
    }
    let formData = new FormData();

    if (file) {
      formData.append("payment_image", file);
    }

    formData.append("payment_method", paymentnameref.current.value);
    formData.append("payment_name", adminnameref.current.value);
    formData.append("payment_number", phoneref.current.value);

    const updating = toast.loading("Please Wait");

    try {
      let response = await fetch(
        `${(import.meta.env.VITE_BASE_URL + "/api/payment/updatepayment")}/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${Token}`,
          },
          body: formData,
        },
      );
      if (response.status == 500) {
        setitems(null);
        toast.error("Failed to Update", { id: updating });
      }
      if (response.ok) {
        await updfun();
        setitems(null);
        toast.success("Successfully Updated", { id: updating });
      } else {
        toast.error("Failed to Update", { id: updating });
        setitems(null);
      }
    } catch (err) {
      console.log(err);
      toast.error("Cannot connect with sever", { id: updating });
    } finally {
      setitems(null);
    }
  }

  return (
    <div className="addpaymentmain">
      <form
        className="addpaymentwarper"
        onSubmit={
          items
            ? (e) => update_payment_confirm(items.id, e)
            : (e) => ADDPAYMENT(e)
        }
      >
        <div className="ap1">
          <h3>Payment Method Details</h3>
          <button
            onClick={() => {
              data(false);
              setitems(null);
            }}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="ap2">
          <p>Payment name</p>
          <input
            type="text"
            required
            ref={paymentnameref}
            defaultValue={items ? items.payment_method : ""}
            readOnly={allow && items}
          />
        </div>
        <div className="ap2">
          <p>Admin Name</p>
          <input
            type="text"
            required
            ref={adminnameref}
            defaultValue={items ? items.payment_name : ""}
            readOnly={allow && items}
          />
        </div>
        <div className="ap2">
          <p>Admin Phone</p>
          <input
            type="tel"
            required
            ref={phoneref}
            defaultValue={items ? items.payment_number : ""}
            readOnly={allow && items}
          />
        </div>
        <div className="ap5">
          <p>Payment Image Upload</p>
          <div onClick={() => imgref.current.click()}>
            <input
              type="file"
              className="hiddenfile"
              onChange={show_img}
              required={allow}
              ref={imgref}
              disabled={allow && items}
              style={{ zIndex: -1 }}
            />
            {file ? (
              <img src={filepath} />
            ) : items ? (
              <img src={items.payment_image_url} />
            ) : (
              <>
                <UploadFileIcon />
                <p>Upload</p>
              </>
            )}
          </div>
        </div>
        {items ? (
          <div className="ap7">
            <button
              className="ap71"
              type="button"
              onClick={() => delete_order_confirm(items.id)}
            >
              Delete
            </button>
            <button
              className="ap72"
              onClick={() => setallow(!allow)}
              type="button"
            >
              Edit
            </button>
            <button className="ap73" disabled={allow}>
              Update
            </button>
          </div>
        ) : (
          <div className="ap6">
            <button type="button" onClick={() => data(false)}>
              cancel
            </button>
            <button style={{ background: "#1b263b", color: "white" }}>
              Create
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
export default AddPaymentPopUp;
