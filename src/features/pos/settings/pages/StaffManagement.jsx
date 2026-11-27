import { useContext, useEffect, useRef, useState } from "react";
import "../styles/staff-management.css";
import { Context } from "../../../../shared/hooks/AppContext";
import CloseIcon from "@mui/icons-material/Close";
import toast, { Toaster } from "react-hot-toast";
import TableLoading from "../../../../shared/components/TableLoading";
import CustomerLoading from "../../../../shared/components/LoadingCustomer";
import { useSecurityCheck } from "../../../../shared/hooks/SecurityCheck";
import { useGetStaff } from "../../services";
import { useLocation } from "react-router-dom";

function StaffManagement() {
  const nameref = useRef();
  const emailref = useRef();
  const passwordref = useRef();
  const roleref = useRef();

  const [show, setshow] = useState(false);
  const { Staff, GetStaff } = useGetStaff();
  const { ReturnJsx, openbox } = useSecurityCheck();

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

  const ButtonStyle = {
    color: Font_Color && "#0D1B2A",
    background: Font_Color ? "white" : "#0D1B2A",
  };

  useEffect(() => {
    GetStaff();
  }, []);

  function confirmAddpassword(e) {
    e.preventDefault();
    openbox(Add_Staff, setshow);
  }

  async function Add_Staff() {
    let data = {
      name: nameref.current.value,
      email: emailref.current.value,
      password: passwordref.current.value,
      role: roleref.current.value,
    };
    const adding = toast.loading("Adding New Staff");
    try {
      let response = await fetch((import.meta.env.VITE_BASE_URL + "/api/setting/newstaff"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        await GetStaff();
        toast.success("Successfully Adding", { id: adding });
        setshow(false);
      } else {
        toast.error("failed Adding", { id: adding });
      }
    } catch (err) {
      console.log(err);
      toast.error("failed Adding", { id: adding });
    }
  }

  function confirmDeletestaff(id) {
    openbox(() => delete_staff(id));
  }

  async function delete_staff(id) {
    const deleting = toast.loading("Please Wait");
    try {
      let response = await fetch(`${(import.meta.env.VITE_BASE_URL + "/api/setting/deletestaff")}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        await GetStaff();
        toast.success("successfully deleted", { id: deleting });
      } else {
        toast.error("Failed to deleted");
      }
    } catch (err) {
      toast.error("Cannot connect with sever", { id: deleting });
      console.log(err);
    }
  }

  return (
    <div className="staffmanagementmain">
      {ReturnJsx}
      <Toaster />
      <div className="SMB1">
        <h3 style={FontStyle}>Staff Management</h3>
        <button
          style={{
            color: Font_Color ? "#0D1B2A" : "white",
            background: Font_Color ? "white" : "#0D1B2A",
          }}
          onClick={() => setshow(true)}
        >
          + Add New Staff
        </button>
      </div>
      <div className="stafftablecontainer">
        <table className="stafftable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(Staff.data) && Staff.data.length > 0
              ? Staff.data.map((staff) => (
                  <tr key={staff.id}>
                    <td>{staff.id}</td>
                    <td>{staff.name}</td>
                    <td>{staff.email}</td>
                    <td>{staff.role_name}</td>
                    <td style={{ color: "#16F90E" }}>{staff.status}</td>
                    <td>
                      {/* <button style={{background:'#16f90ea6'}}>Edit</button> */}
                      <button
                        style={{ background: "#D12C2C" }}
                        onClick={() => confirmDeletestaff(staff.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              : [...Array(5)].map((_, index) => (
                  <CustomerLoading times={6} key={index} />
                ))}
          </tbody>
        </table>
      </div>
      <div className="SMF">
        <h3 className="SMB2" style={FontStyle}>
          Role & Permission Overview
        </h3>
        <div
          className="SMB3"
          style={{ background: backcolor ? "#E1E1E1" : "#0d1b2a4d" }}
        >
          <ul>
            <li className="taskheader">Admin</li>
            <li>All Access Granted</li>
            <li>Management staff & roles</li>
            <li>Edit store settings</li>
            <li>View Detailed Reports</li>
            <li>Delete/Refund Transactions</li>
          </ul>
          <ul>
            <li className="taskheader">Manager</li>
            <li>View sales Analytics</li>
            <li>Manage inventory</li>
            <li>Update order status</li>
            <li>View customer data</li>
            <li>Restricion</li>
          </ul>
          <ul>
            <li className="taskheader">Cashier</li>
            <li>View Sales Analytics</li>
            <li>Manage inventory</li>
            <li>Update order status</li>
            <li>View customer data</li>
            <li>Restricion</li>
          </ul>
        </div>

        {show && (
          <div className="newstaffwarper">
            <form className="newstaff" onSubmit={confirmAddpassword}>
              <div className="newstaffbody1">
                <h3>New Staff</h3>
                <button onClick={() => setshow(false)}>
                  <CloseIcon />
                </button>
              </div>
              <div className="newstaffbody2">
                <p>Name</p>
                <input type="text" required ref={nameref} />
              </div>
              <div className="newstaffbody2">
                <p>Email</p>
                <input type="email" required ref={emailref} />
              </div>
              <div className="newstaffbody2">
                <p>Password</p>
                <input type="password" required ref={passwordref} />
              </div>
              <div className="newstaffbody5">
                <p>Role</p>
                <select name="role" id="role" ref={roleref}>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                </select>
              </div>
              <div className="newstaffbody6">
                <button style={{ background: "#0D1B2A", color: "white" }}>
                  Create
                </button>
                <button onClick={() => setshow(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
export default StaffManagement;
