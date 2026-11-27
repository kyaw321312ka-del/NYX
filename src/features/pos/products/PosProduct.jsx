import "./styles/pos-product.css";
import ProductIcon from "@mui/icons-material/Inventory2Outlined";
import SearchIcon from "@mui/icons-material/SearchSharp";
import AddIcon from "@mui/icons-material/AddCircleOutlineSharp";
import { useContext, useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useFetcher, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Context } from "../../../shared/hooks/AppContext";
import LoadingProduct from "../../../shared/components/LoadingProduct";
import { useGetCategory, useGetProducts } from "../services";

function PosProduct() {
  const [fliterdata, setfliterdata] = useState();
  const [text, settext] = useState();
  const [info, setinfo] = useState(null);

  const nagivate = useNavigate();
  const { backcolor } = useContext(Context);

  const Font_color = Boolean(backcolor == "#1A1C1E");
  const FontStyle = {
    color: Font_color ? "#E1E1E1" : "#0D1B2A",
  };
  const InputStyle = {
    backgroundColor: Font_color ? "#E1E1E1" : "#0D1B2A",
  };

  const { Products, GetProducts } = useGetProducts();

  useEffect(() => {
    GetProducts();
  }, []);

  useEffect(() => {
    setfliterdata(Products.data);
  }, [Products.data]);

  function searchHandler(e) {
    let textvalue = e.target.value;
    settext(textvalue);
    if (textvalue === "") {
      setfliterdata(Products.data);
    } else {
      if (Array.isArray(Products.data) && Products.data.length > 0) {
        let result = Products.data.filter((item) => {
          return item.productName
            .toLowerCase()
            .trim()
            .includes(textvalue.toLowerCase());
        });
        setfliterdata(result);
      }
    }
  }
  function handleupdate(data) {
    setinfo(data);
    nagivate("posaddproduct");
  }

  return (
    <>
      <div className="posproductmain">
        {/* ✨ Product Top Header Panel */}
        <div className="productheader" style={{ marginBottom: "20px" }}>
          <h1 style={FontStyle}>
            <ProductIcon
              style={{
                fontSize: "24px",
                color: Font_color ? "#ffffff" : "#0F172A",
              }}
            />
            Products
          </h1>

          <div className="productheader-right">
            {/* Search Box */}
            <div
              className="productsearch"
              style={{
                backgroundColor: Font_color ? "#334155" : "#F8FAFC",
                border: `1px solid ${Font_color ? "#475569" : "#E2E8F0"}`,
              }}
            >
              <input
                type="search"
                placeholder="Search products..."
                value={text}
                onChange={searchHandler}
                style={{ color: Font_color ? "#F8FAFC" : "#0F172A" }}
              />
              <SearchIcon style={{ color: "#94A3B8" }} />
            </div>

            {/* Add Product Button */}
            <button
              onClick={() => nagivate("posaddproduct")}
              className="addproductbtn"
              style={{
                backgroundColor: Font_color ? "#F8FAFC" : "#0F172A",
                color: Font_color ? "#0F172A" : "#F8FAFC",
              }}
            >
              <AddIcon /> Add Product
            </button>
          </div>
        </div>

        {/* 📦 Product Grid Body */}
        <div className="productbody">
          {Array.isArray(fliterdata) ? (
            fliterdata.length > 0 ? (
              fliterdata.map((item, index) => {
                const isAvailable = item.status === "isAvailable";
                return (
                  <div
                    key={index}
                    className="singleproduct"
                    style={{
                      backgroundColor: Font_color ? "#1E293B" : "#FFFFFF",
                      border: `1px solid ${Font_color ? "#334155" : "#E2E8F0"}`,
                    }}
                    onClick={() => handleupdate(item)}
                  >
                    <div className="productimgcontainer">
                      <img src={item.images} alt={item.productName} />
                    </div>

                    <div
                      className="pos-card-text"
                      style={{ color: Font_color ? "#F8FAFC" : "#0F172A" }}
                    >
                      {/* အပေါ်ပိုင်း: Title နှင့် Price ကို စုထားသည် */}
                      <div className="pos-card-info">
                        <h3>{item.productName}</h3>
                        <h4>{item.price?.toLocaleString()} MMK</h4>
                      </div>

                      {/* အောက်ပိုင်း: Badge ကို သီးသန့်ထုတ်ပြီး unique class ပေးသည် */}
                      <div className="pos-badge-container">
                        <span
                          className={`pos-status-tag ${isAvailable ? "pos-tag-available" : "pos-tag-out"}`}
                        >
                          {isAvailable ? "Available" : "Out of Stock"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                className="noproduct-box"
                style={{
                  color: "#94A3B8",
                  border: `1px solid ${Font_color ? "#334155" : "#E2E8F0"}`,
                }}
              >
                <p>No products found</p>
              </div>
            )
          ) : (
            [...Array(15)].map((_, index) => <LoadingProduct key={index} />)
          )}
        </div>
        <Outlet context={{ info, setinfo, GetProducts }} />
      </div>
    </>
  );
}
export default PosProduct;
