import "./cssFolder/poscategory.css";
import CategoryIcon from "@mui/icons-material/CategoryOutlined";
import AddIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import TagIcon from "@mui/icons-material/Inventory2Outlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { useContext, useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import { Context } from "./Hooks/context";
import Loading from "./Components/Loading";
import LoaingTag from "./Components/loadingTag";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import BrandPopUp from "./Components/brandaddpopup";
import UploadIcon from "@mui/icons-material/UploadFile";
import { useGetCategory } from "./Api_Call";
import { useNoti } from "./Hooks/alert";

function PosCategory() {
  const [show, setshow] = useState(false);
  const [show1, setshow1] = useState(false);
  const [show2, setshow2] = useState(false);
  const [alert1, setalert1] = useState(false);
  const [selecttoDel, setselecttoDel] = useState(null); //for category update
  const [allow, setallow] = useState(selecttoDel ? true : false); //for category update
  const [editdata, seteditdata] = useState(null); //for tagsupdate
  const [isallow, setisallow] = useState(editdata ? true : false); //for tagsupdate
  const [file, setfile] = useState(null);
  const [filepath, setfilepath] = useState(null);

  let Categoryname = useRef();
  let CategoryImage = useRef();
  let Tagsref = useRef();

  const { Categories, GetCategories, Tags, GetTags } = useGetCategory();
  const { backcolor, Token } = useContext(Context);
  const {
    Loading: categoryloading,
    openconfirm,
    openerror,
    openloading,
    opensuccess,
    close,
  } = useNoti();

  // 🌓 Dark Mode State Boolean စစ်ဆေးခြင်း
  const isDarkMode = Boolean(backcolor === "#1A1C1E");

  useEffect(() => {
    GetCategories();
    GetTags();
  }, []);

  async function addCategory(e) {
    e.preventDefault();
    let formdata = new FormData();
    formdata.append("image", CategoryImage.current.files[0]);
    formdata.append("name", Categoryname.current.value);
    openloading();
    try {
      let reponse = await fetch((import.meta.env.VITE_BASE_URL + "/api/categories/addCategories"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Token}`,
        },
        body: formdata,
      });
      if (reponse.ok) {
        setTimeout(async () => {
          await GetCategories();
        }, 500);
        setshow(false);
        opensuccess("Action Successful", "New Category added successfully");
      } else {
        openerror("Something went worng");
        setshow(false);
      }
    } catch (err) {
      console.log(err);
      openerror("Cannot connect with sever");
    }
  }
  async function AddTags(e) {
    e.preventDefault();
    let data = { name: Tagsref.current.value };
    openloading();
    try {
      let reponse = await fetch((import.meta.env.VITE_BASE_URL + "/api/tags/addtag"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (reponse.ok) {
        GetTags();
        opensuccess("Action Successful", "New Tag added successfully");
        setshow1(false);
      } else {
        openerror("Something went wrong");
        setshow1(false);
      }
    } catch (err) {
      console.log(err);
      openerror("Cannot connect with sever");
    }
  }

  function handleEdit(item) {
    setshow1(true);
    seteditdata(item);
    setisallow(true);
  }

  function editCategory(item) {
    setshow(true);
    setselecttoDel(item);
  }

  async function handleUpdateCategory(e) {
    e.preventDefault();
    let formdata = new FormData();
    formdata.append("id", selecttoDel.id);
    if (Categoryname.current.value != selecttoDel.name) {
      formdata.append("name", Categoryname.current.value);
    }

    if (CategoryImage.current.files[0]) {
      formdata.append("image", CategoryImage.current.files[0]);
    }

    if (
      Categoryname.current.value == selecttoDel.name &&
      !CategoryImage.current.files[0]
    ) {
      setshow(false);
      setallow(false);
      setselecttoDel(null);
      return;
    }
    openloading();
    try {
      let reponse = await fetch((import.meta.env.VITE_BASE_URL + "/api/updateCat/updatecategory"), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${Token}`,
        },
        body: formdata,
      });

      if (reponse.ok) {
        GetCategories();
        opensuccess("Action Successful", "Category updated successfully");
        setselecttoDel(null);
        setallow(false);
        setshow(false);
      } else {
        openerror("Something went wrong");
        setselecttoDel(null);
        setshow(false);
        setallow(false);
      }
    } catch (err) {
      console.log(err);
      openerror("Cannot connect with sever");
      setselecttoDel(null);
      setallow(false);
      setshow(false);
    }
  }

  async function handleUpdateTags(e) {
    e.preventDefault();
    let name = Tagsref.current.value;
    let id = editdata.id;

    if (name == editdata.name) {
      setshow1(false);
      seteditdata(null);
      setisallow(false);
      return;
    }
    openloading();
    try {
      let response = await fetch((import.meta.env.VITE_BASE_URL + "/api/updateTag/updatetag"), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${Token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, name }),
      });
      if (response.ok) {
        GetTags();
        setshow1(false);
        seteditdata(null);
        setisallow(false);
        setfile(null);
        opensuccess("Action Successful", "Tags updated successfully");
      } else {
        setshow1(false);
        seteditdata(null);
        setisallow(false);
        toast.error("Failed to update Tags");
        setfile(null);
        openerror("Something went wrong");
      }
    } catch (err) {
      console.log(err);
      openerror("Cannot connect with sever");
    }
  }

  async function handleDeleteTags() {
    let tagsName = editdata.name;

    let isconfirm = await openconfirm();

    if (!isconfirm) return;

    const tagdelete = toast.loading("Deleting Tags...");
    try {
      let reponse = await fetch(
        `${(import.meta.env.VITE_BASE_URL + "/api/deletetag/deletetag/")}${tagsName}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        },
      );
      if (reponse.ok) {
        opensuccess("Action Successful", "Tags deleted successfully");
        GetTags();
        setshow1(false);
        seteditdata(null);
        setisallow(false);
        setfile(null);
      } else {
        setshow1(false);
        seteditdata(null);
        setisallow(false);
        openerror("Something went wrong");
        setfile(null);
      }
    } catch (err) {
      console.log(err);
      setshow1(false);
      seteditdata(null);
      setisallow(false);
      openerror("Cannot connect with sever");
    }
  }

  async function handleDeleteCategory() {
    let data = selecttoDel.name;
    let isconfirm = await openconfirm();

    if (!isconfirm) return;
    openloading();

    try {
      let reponse = await fetch(
        `${(import.meta.env.VITE_BASE_URL + "/api/deletecat/deletecategory/")}${data}`,
        {
          method: "DELETE",
        },
      );
      if (reponse.ok) {
        await GetCategories();
        setshow(false);
        setselecttoDel(null);
        opensuccess("Action Successful", "Category deleted successfully");
        setfile(null);
      } else {
        setshow(false);
        setselecttoDel(null);
        openerror("Something went wrong");
        setfile(null);
      }
    } catch (err) {
      console.log(err);
      setshow(false);
      setselecttoDel(null);
      openerror("Cannot connect with sever");
    }
  }

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
      <Toaster />
      {categoryloading}
      {/* 📦 Container မှာ Theme dynamically ချိတ်ပေးထားပါတယ် */}
      <div
        className={`poscategorymain ${isDarkMode ? "dark-theme" : "light-theme"}`}
      >
        {/* Category Header */}
        <div className="Poscategoryheader">
          <h1>
            <CategoryIcon />
            Category
          </h1>
          <button
            onClick={() => {
              setshow(true);
              setselecttoDel(null);
              setallow(false);
            }}
          >
            <AddIcon />
            Add Category
          </button>
        </div>

        {/* Category Items List */}
        <div className="poscategorybody">
          {Array.isArray(Categories.data) ? (
            Categories.data.length > 0 ? (
              Categories.data.map((item, index) => {
                return (
                  <div
                    key={index}
                    onClick={() => editCategory(item)}
                    className="singlecategory"
                  >
                    <img src={item.image_url} alt="image" />
                    <p>{item.name}</p>
                  </div>
                );
              })
            ) : (
              <div
                className="singlecategory state-empty-row"
                onClick={() => setshow(true)}
              >
                <p>No Category Yet</p>
              </div>
            )
          ) : (
            [...Array(7)].map((_, index) => <Loading key={index} />)
          )}
        </div>

        <hr className="category-hr-divider" />

        {/* Tags Header */}
        <div className="poscategorybody2">
          <h1>
            <TagIcon style={{ fontSize: "35px" }} />
            Tags
          </h1>
          <button
            onClick={() => {
              seteditdata(null);
              setshow(false);
              setshow1(true);
              setisallow(false);
            }}
          >
            <AddIcon />
            Add Tags
          </button>
        </div>

        {/* Tags Items List */}
        <div className="poscategoryfooter">
          {Array.isArray(Tags.data) ? (
            Tags.data.length > 0 ? (
              Tags.data.map((item, index) => {
                return (
                  <h3 key={index} onClick={() => handleEdit(item)}>
                    {item.name}
                  </h3>
                );
              })
            ) : (
              <h3 className="tag-empty-warning" onClick={() => setshow1(true)}>
                There is no tags
              </h3>
            )
          ) : (
            [...Array(4)].map((_, index) => <LoaingTag key={index} />)
          )}
        </div>

        {/* __________________________ POPUP DIALOGS MODALS __________________________ */}

        {/* Category Details/Create Popup Box */}
        {show && (
          <div className="showwarper">
            <form
              className="categorypopup"
              onSubmit={selecttoDel ? handleUpdateCategory : addCategory}
            >
              <div className="popup-top-bar">
                <h1 className="categorypopupheader">
                  {selecttoDel ? "Category Details" : "New Category"}
                </h1>
                <button
                  type="button"
                  className="categorycloseIcon"
                  onClick={() => {
                    setshow(false);
                    setallow(false);
                    setselecttoDel(null);
                    setfile(null);
                    setfilepath(null);
                  }}
                >
                  <CloseIcon />
                </button>
              </div>

              <p className="field-title-label">Category Name</p>
              <input
                type="text"
                className="category-text-field"
                defaultValue={selecttoDel ? selecttoDel.name : ""}
                readOnly={selecttoDel && !allow}
                required={!selecttoDel}
                ref={Categoryname}
                key={selecttoDel ? 2 : ""}
                placeholder="Enter category name"
              />

              <div
                className="categoryimgwarper"
                onClick={() =>
                  (!selecttoDel || allow) && CategoryImage.current.click()
                }
              >
                <input
                  type="file"
                  className="categoryimgupload"
                  ref={CategoryImage}
                  disabled={selecttoDel && !allow}
                  required={!selecttoDel}
                  onChange={imgpreview}
                  accept="image/*"
                />
                {file ? (
                  <img src={filepath} alt="preview" />
                ) : selecttoDel ? (
                  <img src={selecttoDel.image_url} alt="category" />
                ) : (
                  <>
                    <UploadIcon />
                    <p style={{ margin: 0, fontSize: "12px" }}>Photo</p>
                  </>
                )}
              </div>

              {selecttoDel ? (
                <div className="categoryupdate">
                  <button
                    onClick={handleDeleteCategory}
                    type="button"
                    className="btn-delete-action"
                  >
                    Delete
                  </button>

                  <div>
                    <button
                      className="btn-edit-action"
                      onClick={() => {
                        setallow(true);
                        setTimeout(() => Categoryname.current.focus(), 50);
                      }}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      disabled={selecttoDel && !allow}
                      className="btn-submit-action"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ) : (
                <div className="categorycreatebtn">
                  <button type="submit" className="btn-sub">
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setshow(false);
                      setfile(null);
                      setfilepath(null);
                    }}
                    type="button"
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Tags Details/Create Popup Box */}
        {show1 && (
          <div className="show1warper">
            <div className="tagpopup">
              <div className="tagheader">
                <h2>{editdata ? "Update Tags" : "New Tags"}</h2>
                <button
                  className="tagcloseIcon"
                  type="button"
                  onClick={() => {
                    setshow1(false);
                    seteditdata(null);
                    setisallow(false);
                  }}
                >
                  <CloseIcon />
                </button>
              </div>
              <p className="field-title-label">Tag name</p>
              <form onSubmit={editdata ? handleUpdateTags : AddTags}>
                <input
                  type="text"
                  className="taginput"
                  ref={Tagsref}
                  required
                  defaultValue={editdata ? editdata.name : ""}
                  key={editdata ? 3 : ""}
                  readOnly={isallow}
                  placeholder="Enter tag name"
                />

                {editdata ? (
                  <div className="tagupdatebtn">
                    <button
                      onClick={handleDeleteTags}
                      type="button"
                      className="btn-delete-action"
                    >
                      Delete
                    </button>
                    <div>
                      <button
                        className="btn-edit-action"
                        onClick={() => {
                          setisallow(false);
                          setTimeout(() => Tagsref.current.focus(), 50);
                        }}
                        type="button"
                      >
                        Edit
                      </button>
                      <button disabled={isallow} className="btn-submit-action">
                        Update
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="tagbutton">
                    <button type="submit" className="btn-submit-action">
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setshow1(false)}
                      className="btn-cancel-action"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {show2 && <BrandPopUp data={{ setshow2: setshow2 }} />}
      </div>
    </>
  );
}
export default PosCategory;
