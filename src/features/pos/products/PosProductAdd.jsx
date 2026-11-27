import "./styles/product-add.css";
import ProductIcon from "@mui/icons-material/Inventory2Outlined";
import SearchIcon from "@mui/icons-material/SearchSharp";
import AddIcon from "@mui/icons-material/AddCircleOutlineSharp";
import { useContext, useEffect, useRef, useState } from "react";
import {
  NavLink,
  Outlet,
  useFetcher,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import uploader from "@zwehtetpaing55/uploader";
import { Context } from "../../../shared/hooks/AppContext";
import UploadIcon from "@mui/icons-material/UploadFile";
import { useGetCategory, useGetProducts } from "../services";
import { useNoti } from "../../../shared/hooks/useNoti";

function AddProduct() {
  const { info, setinfo, GetProducts } = useOutletContext();
  const [allowupdate, setallowupdate] = useState(info ? true : false);
  const [file, setfile] = useState(null);
  const [filepath, setfilepath] = useState(null);

  // Context မှ backcolor ရယူပြီး Dark Mode စစ်ဆေးခြင်း
  const { backcolor } = useContext(Context);
  const isDarkMode = Boolean(backcolor === "#1A1C1E");

  const navigate = useNavigate();

  const { Categories, GetCategories, Tags, GetTags } = useGetCategory();
  const { Products } = useGetProducts();
  const { Loading, openconfirm, openerror, openloading, opensuccess, close } =
    useNoti();

  useEffect(() => {
    GetCategories();
    GetTags();
  }, []);

  const nameref = useRef();
  const brandref = useRef();
  const maderef = useRef();
  const typeref = useRef();
  const stockref = useRef();
  const descriptionref = useRef();
  const categoryref = useRef();
  const costref = useRef();
  const colorref = useRef();
  const weightref = useRef();
  const ratingref = useRef();
  const imageref = useRef();
  const tagref = useRef();
  const priceref = useRef();
  const sizeref = useRef();
  const wranartref = useRef();
  const dateref = useRef();
  const checkref = useRef();

  async function AddProduct(e) {
    e.preventDefault();
    openloading();
    try {
      console.log(ratingref.current.value);
      console.log("item Uploaded");
      let formdata = new FormData();
      formdata.append("productName", nameref.current.value);
      formdata.append("brand", brandref.current.value);
      formdata.append("made", maderef.current.value);
      formdata.append("type", typeref.current.value);
      formdata.append("stock", stockref.current.value);
      formdata.append("description", descriptionref.current.value);
      formdata.append("category", categoryref.current.value);
      formdata.append("cost", costref.current.value);
      formdata.append("tags", tagref.current.value);
      formdata.append("color", colorref.current.value);
      formdata.append("weight", weightref.current.value);
      formdata.append("rating", ratingref.current.value);
      formdata.append("price", priceref.current.value);
      formdata.append("size", sizeref.current.value);
      formdata.append("warranty", wranartref.current.value);
      formdata.append("date", dateref.current.value);
      formdata.append("image", imageref.current.files[0]);

      let reponse = await fetch((import.meta.env.VITE_BASE_URL + "/api/product/addproduct"), {
        method: "POST",
        body: formdata,
      });

      if (reponse.ok) {
        opensuccess("Action Successfully", "New Product Added Successfully");
        GetProducts();
        nameref.current.value = "";
        brandref.current.value = "";
        maderef.current.value = "";
        typeref.current.value = "";
        stockref.current.value = "";
        descriptionref.current.value = "";
        categoryref.current.value = "";
        costref.current.value = "";
        colorref.current.value = "";
        weightref.current.value = "";
        ratingref.current.value = "";
        priceref.current.value = "";
        sizeref.current.value = "";
        wranartref.current.value = "";
        dateref.current.value = "";
        imageref.current.value = "";
        setfile(null);
        setfilepath(null);
      } else {
        openerror("Something went Wrong");
        setfile(null);
        setfilepath(null);
      }
    } catch (err) {
      console.log(err);
      openerror("Cannot connect with sever");
    }
  }

  async function deleteProduct(id) {
    let isconfirm = await openconfirm();
    if (!isconfirm) return;

    openloading();
    try {
      let reponse = await fetch(
        `${(import.meta.env.VITE_BASE_URL + "/api/deleteproducts/deleteproduct")}/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (reponse.ok) {
        await GetProducts();
        close();
        navigate(-1);
      } else {
        openerror("Something went worng");
      }
    } catch (err) {
      console.log(err);
      openerror("Cannot connect with sever");
    }
  }

  async function updateProduct(e) {
    try {
      e.preventDefault();
      let formdata = new FormData();
      formdata.append("id", info.id);
      formdata.append("productName", nameref.current.value);
      formdata.append("brand", brandref.current.value);
      formdata.append("made", maderef.current.value);
      formdata.append("type", typeref.current.value);
      formdata.append("stock", stockref.current.value);
      formdata.append("description", descriptionref.current.value);
      formdata.append("category", categoryref.current.value);
      formdata.append("cost", costref.current.value);
      formdata.append("tags", tagref.current.value);
      formdata.append("color", colorref.current.value);
      formdata.append("weight", weightref.current.value);
      formdata.append("rating", ratingref.current.value);
      formdata.append("price", priceref.current.value);
      formdata.append("size", sizeref.current.value);
      formdata.append("warranty", wranartref.current.value);
      formdata.append("date", dateref.current.value);

      if (imageref.current.files[0]) {
        formdata.append("image", imageref.current.files[0]);
      }
      openloading();
      let reponse = await fetch((import.meta.env.VITE_BASE_URL + "/api/updateshowproduct/updateproduct"), {
        method: "PUT",
        body: formdata,
      });
      if (reponse.ok) {
        await GetProducts();
        close();
        setallowupdate(true);
        setinfo(null);
        navigate(-1);
        setfile(null);
        setfilepath(null);
      } else {
        GetProducts();
        setallowupdate(true);
        setinfo(null);

        setfile(null);
        setfilepath(null);
        openerror("Something went worng");
      }
    } catch (err) {
      console.log(err);
      openerror("Cannot connect with sever");
    }
  }

  //function to show imgpreview
  const imgpreview = (event) => {
    let name = event.target.files[0];
    setfile(name);

    if (name) {
      let url = URL.createObjectURL(name);
      setfilepath(url);
    }
  };

  return (
    <>
      <form
        onSubmit={info ? updateProduct : AddProduct}
        className={`addproductform ${isDarkMode ? "dark-mode" : ""}`}
      >
        {Loading}
        <div className="posadditemcontainer">
          {/* Header Section */}
          <div className="additemheader">
            <h2 className="categoryupload3">
              {info ? "Product Details" : "New Product"}
            </h2>
            <button
              onClick={() => {
                navigate(-1);
                setallowupdate(false);
                setinfo(null);
              }}
              type="button"
              className="close-top-btn"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Core Content Layout */}
          <div className="pos-detail-layout">
            {/* 📸 Left Section: Image Card */}
            <div className="pos-detail-left-card">
              <label className="section-title-label">Product Media</label>
              <div
                className="categoryupload9"
                onClick={() => !allowupdate && imageref.current.click()}
                style={{ cursor: allowupdate ? "default" : "pointer" }}
              >
                <input
                  type="file"
                  ref={imageref}
                  required={!info}
                  onChange={imgpreview}
                  disabled={allowupdate}
                  style={{ display: "none" }}
                />
                {file ? (
                  <img src={filepath} alt="Preview" />
                ) : info ? (
                  <img src={info.images} alt="Product" />
                ) : (
                  <div className="upload91">
                    <span>
                      <UploadIcon
                        style={{ fontSize: "32px", color: "#4F46E5" }}
                      />
                      <p>Click to Upload</p>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 📝 Right Section: Form Input Grid Card */}
            <div className="pos-detail-right-card">
              <div className="pos-input-grid">
                {/* Row 1 */}
                <div className="input-field-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    ref={nameref}
                    required
                    defaultValue={info ? info.productName : ""}
                    readOnly={allowupdate}
                  />
                </div>
                <div className="input-field-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    ref={brandref}
                    required
                    defaultValue={info ? info.brand : ""}
                    readOnly={allowupdate}
                  />
                </div>

                {/* Row 2 */}
                <div className="input-field-group">
                  <label>Category</label>
                  <select
                    ref={categoryref}
                    required
                    defaultValue={info ? info.category : ""}
                    disabled={allowupdate}
                  >
                    {Array.isArray(Categories.data) &&
                    Categories.data.length > 0 ? (
                      Categories.data.map((item, index) => (
                        <option key={index} value={item.name}>
                          {item.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading...</option>
                    )}
                  </select>
                </div>
                <div className="input-field-group">
                  <label>Tags</label>
                  <select
                    ref={tagref}
                    required
                    defaultValue={info ? info.tag : ""}
                    disabled={allowupdate}
                  >
                    {Array.isArray(Tags.data) && Tags.data.length > 0 ? (
                      Tags.data.map((item, index) => (
                        <option key={index} value={item.name}>
                          {item.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading...</option>
                    )}
                  </select>
                </div>

                {/* Row 3 */}
                <div className="input-field-group">
                  <label>Price (MMK)</label>
                  <input
                    type="number"
                    ref={priceref}
                    required
                    readOnly={allowupdate}
                    defaultValue={info ? info.price : ""}
                  />
                </div>
                <div className="input-field-group">
                  <label>Cost (MMK)</label>
                  <input
                    type="number"
                    ref={costref}
                    required
                    readOnly={allowupdate}
                    defaultValue={info ? info.cost : ""}
                  />
                </div>

                {/* Row 4 */}
                <div className="input-field-group">
                  <label>Stock Qty</label>
                  <input
                    type="number"
                    ref={stockref}
                    required
                    readOnly={allowupdate}
                    defaultValue={info ? info.total_stock : ""}
                  />
                </div>
                <div className="input-field-group">
                  <label>Type</label>
                  <input
                    type="text"
                    ref={typeref}
                    required
                    readOnly={allowupdate}
                    defaultValue={info ? info.types : ""}
                  />
                </div>

                {/* Row 5 */}
                <div className="input-field-group">
                  <label>Made In</label>
                  <input
                    type="text"
                    ref={maderef}
                    required
                    defaultValue={info ? info.made : ""}
                    readOnly={allowupdate}
                  />
                </div>
                <div className="input-field-group">
                  <label>Color</label>
                  <input
                    type="text"
                    ref={colorref}
                    required
                    readOnly={allowupdate}
                    defaultValue={info ? info.colors : ""}
                  />
                </div>

                {/* Row 6 */}
                <div className="input-field-group">
                  <label>Size</label>
                  <input
                    type="number"
                    ref={sizeref}
                    required
                    readOnly={allowupdate}
                    defaultValue={info ? info.sizes : ""}
                  />
                </div>
                <div className="input-field-group">
                  <label>Weight</label>
                  <input
                    type="text"
                    ref={weightref}
                    required
                    readOnly={allowupdate}
                    defaultValue={info ? info.weights : ""}
                  />
                </div>

                {/* Row 7 */}
                <div className="input-field-group">
                  <label>Warranty</label>
                  <input
                    type="text"
                    ref={wranartref}
                    required
                    readOnly={allowupdate}
                    defaultValue={info ? info.warranty : ""}
                  />
                </div>
                <div className="input-field-group">
                  <label>Date</label>
                  <input
                    type="date"
                    ref={dateref}
                    required
                    readOnly={allowupdate}
                    defaultValue={info ? info.date : ""}
                  />
                </div>

                {/* Row 8 */}
                <div className="input-field-group">
                  <label>Rating</label>
                  <input
                    type="text"
                    ref={ratingref}
                    required
                    readOnly={allowupdate}
                    defaultValue={info ? info.rating : ""}
                  />
                </div>
                <div className="input-field-group">
                  <label>Description</label>
                  <textarea
                    className="textarea"
                    rows="2"
                    ref={descriptionref}
                    required
                    readOnly={allowupdate}
                    defaultValue={info ? info.description : ""}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer Buttons */}
          {info ? (
            <div className="categoryupload132">
              <button
                type="button"
                className="up132btn1"
                onClick={() => deleteProduct(info.id)}
              >
                Delete Product
              </button>
              <div>
                <button
                  type="button"
                  className="up132btn2"
                  onClick={() => setallowupdate(false)}
                >
                  Edit Details
                </button>
                <button disabled={allowupdate} className="up132btn3">
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="categoryupload13">
              <button
                type="button"
                className="categoryupload15"
                onClick={() => {
                  navigate(-1);
                  setinfo(null);
                }}
              >
                Cancel
              </button>
              <button className="categoryupload14">Create Product</button>
            </div>
          )}
        </div>
      </form>
    </>
  );
}

export default AddProduct;
