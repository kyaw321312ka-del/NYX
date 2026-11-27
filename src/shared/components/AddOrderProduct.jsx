import "./add-order-product.css";
import CloseIcon from "@mui/icons-material/CloseOutlined";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import { useEffect, useState } from "react";
import PLO from "./PLO";
import { useGetCategory, useGetProducts } from "../../features/pos/services";

function AddorderProduct({ data }) {
  const [fliterdata, setfliterdata] = useState();
  const [text, settext] = useState();
  const [category, setcategory] = useState("All");
  const [state, setstate] = useState({});

  const { Categories, GetCategories } = useGetCategory();
  const { Products, GetProducts } = useGetProducts();
  const { fun1, fun2, amount } = data;

  useEffect(() => {
    GetCategories();
    GetProducts();
  }, []);

  var purifiedData;
  if (Array.isArray(Products.data) && Products.data.length > 0) {
    purifiedData = Products.data.filter((item) => {
      return item.total_stock > 0;
    });
  }

  useEffect(() => {
    if (Array.isArray(purifiedData)) {
      let result = purifiedData;
      if (category !== "All") {
        result = purifiedData.filter((item) => {
          return item.category == category;
        });
      }
      if (text && text.trim() != "") {
        result = result.filter((item) => {
          return item.productName
            .toLowerCase()
            .includes(text.toLowerCase().trim());
        });
      }
      setfliterdata(result);
    }
  }, [Products.data, text, category]);

  function searchHandler(e) {
    let textvalue = e.target.value;
    settext(textvalue);
  }

  // add order to the table
  function add_order(item) {
    fun1((prev) => [...prev, item]);
  }

  //function to clickable once
  function click_once(id) {
    // setstate((prev) => {
    //   let newbtn = prev, [id] || false;
    //   if (prev[0]) return prev;
    //   return { ...prev, [id]: true };
    // });
    setstate((prev) => ({ ...prev, [id]: true }));
  }

  return (
    <div className="addorderproductmain">
      <button className="Aptcloseicon" onClick={() => fun2(false)}>
        <CloseIcon />
      </button>
      <div className="Adpheader">
        <h2>Select Product Items</h2>
        <span>
          <input
            type="search"
            placeholder="Search..."
            onChange={searchHandler}
          />
          <SearchIcon sx={{ color: "white" }} />
        </span>
      </div>
      <div className="Adpcategories">
        {Array.isArray(Categories.data) && Categories.data.length > 0 ? (
          <>
            <p
              onClick={() => setcategory("All")}
              className={category == "All" ? "active" : ""}
            >
              All
            </p>
            {Categories.data.map((item, index) => {
              return (
                <p
                  key={index}
                  onClick={() => setcategory(item.name)}
                  className={category == item.name ? "active" : ""}
                >
                  {item.name}
                </p>
              );
            })}
          </>
        ) : (
          [...Array(5)].map((_, index) => {
            return <p className="loadingp"></p>;
          })
        )}
      </div>
      <div className="Adpproduct">
        {Array.isArray(purifiedData) && purifiedData.length > 0 ? (
          Array.isArray(fliterdata) && fliterdata.length > 0 ? (
            fliterdata.map((item, index) => {
              return (
                <div className="Adpsingleproduct" key={index}>
                  <img src={item.images} alt={item.productName} />
                  <span>
                    <p style={{ textAlign: "left" }}>{item.productName}</p>
                    <p>{item.price}ks</p>
                  </span>
                  <button
                    disabled={state[item.id]}
                    onClick={() => {
                      add_order(item);
                      click_once(item.id);
                    }}
                  >
                    + Add Order
                  </button>
                </div>
              );
            })
          ) : (
            <h1
              style={{
                fontWeight: "lighter",
                textWrap: "nowrap",
                gridColumn: "1 / -1",
                justifySelf: "center",
              }}
            >
              No Result Found....
            </h1>
          )
        ) : (
          <PLO />
        )}
      </div>
      <div className="Adpfooter">
        <span style={{ borderRight: "1px solid gray", padding: "2px 2em" }}>
          <h5>Total Amount</h5>
          <h3>{amount}-ks</h3>
        </span>
        <button onClick={() => fun2(false)}>Confirm Order</button>
      </div>
    </div>
  );
}
export default AddorderProduct;
