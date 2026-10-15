import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import Nav from "./nav";
import "./App.css";
import PosOverview from "./posoverview";
import PosOrder from "./posorder";
import PosCategory from "./poscategory";
import PosProduct from "./posproduct";
import PosCustomer from "./poscustomer";
import PosInventory from "./posinventory";
import PosReport from "./posreport";
import PosSetting from "./possetting";
import AddProduct from "./posproductadd";
import PosGeneralSetting from "./PosSetting/Generalsetting";
import StaffManagement from "./PosSetting/Staffmanagement";
import PosPaymentTax from "./PosSetting/PaymentTax";
import PosApperance from "./PosSetting/Appernace";
import { Context } from "./Hooks/context";
import { useState } from "react";
import Login from "./Account/login";
import PosLogin from "./Account/poslogin";
import AcademicLogin from "./Account/academiclogin";
import PosProtectedRoute from "./Hooks/PosProtectedRoute";
import GuestRoute from "./Hooks/GuestRoute";
import ClassNav from "./Class/classnav";
import ClassOverview from "./Class/classoverview";
import ClassStudent from "./ClassComponent/classstudent";
import AddStudentForm from "./ClassComponent/addstudent";
import ClassOrder from "./Class/classorder";
import ClassMenu from "./Class/classmenu";
import ClassSetting from "./Class/classsetting";
import MobileOrder from "./Routes/mobileorder";
import LocalOrder from "./Routes/localorder";
import AddOrder from "./Routes/AddOrder";
import CourseManagement from "./ClassComponent/coursemanagement";
import BookingSchedule from "./Class/classbookingschedule";
import BookingList from "./Class/classbookinglist";
import VenueManagement from "./Class/classvenuemanagement";
import AddMenu from "./ClassComponent/Addmenu";
import ClassCourtDetail from "./ClassComponent/classcourtadd";
import ClassAddCourt from "./ClassComponent/classaddcourt";
import CreateCourseModal from "./ClassComponent/createcoursemodal";
import NextProgramDetails from "./ClassComponent/classnextprogramdetails";
import ClassCustomer from "./Class/classcustomer";
import ClassMobileBooking from "./ClassComponent/classmobilebooking";
import ClassLoaclBooking from "./ClassComponent/classlocalbooking";
import ClassProtectedRoute from "./Hooks/ClassProtectedRouted";
import ClassTrainingOverview from "./ClassComponent/classtrainingoverview";
import ClassRentalOverveiw from "./ClassComponent/classrentaloverview";
import ClassCanteenOverview from "./ClassComponent/classcanteenoverview";
import Courses from "./ClassComponent/courses";
import AddClassForm from "./ClassComponent/courseaddclass ";
import ClassWalkIn from "./ClassComponent/classwalkin";
import WalkBooking from "./ClassComponent/walkbooking";
import WalkBookingList from "./ClassComponent/walkbookinglist";
import ClassManage from "./Class/classmanage";
import ClassEnrollments from "./Class/classenrollments";
import ClassPoints from "./Class/classpoints";
import CreateTournament from "./ClassComponent/CreateTournament";
import TournamentDetails from "./ClassComponent/tournamentdetails";
import ClassBanners from "./Class/classbanners";

function App() {
  const [childData, SetchildData] = useState({});

  // POS အတွက် Theme State များ သီးသန့်ခွဲခြင်း
  const [color, setPosNavColor] = useState(
    localStorage.getItem("pos_navcolor") || "#0D1B2A",
  );
  const [backcolor, setPosBackColor] = useState(
    localStorage.getItem("pos_background") || "#F0F0F0",
  );

  // Class အတွက် Theme State များ သီးသန့်ခွဲခြင်း
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
    <>
      <Context.Provider
        value={{
          // POS Theme
          color,
          setPosNavColor,
          backcolor,
          setPosBackColor,
          // Class Theme
          classNavColor,
          setClassNavColor,
          classBackColor,
          setClassBackColor,

          Length: Length,
          setLength: setLength,
          childdata: childData,
          setchilddata: SetchildData,
          islogin: islogin,
          setislogin: setislogin,
          isClassLogin: isClassLogin,
          setisClassLogin: setisClassLogin,
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <PosProtectedRoute>
                  <Nav />
                </PosProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/posoverview" replace />} />
              <Route path="posoverview" element={<PosOverview />} />
              <Route path="posorder" element={<PosOrder />}>
                <Route index element={<Navigate to="mobileorder" replace />} />
                <Route path="mobileorder" element={<MobileOrder />} />
                <Route path="localorder" element={<LocalOrder />} />
                <Route path="posaddorder" element={<AddOrder />} />
              </Route>
              <Route path="poscategory" element={<PosCategory />} />
              <Route path="posproduct" element={<PosProduct />}>
                <Route path="posaddproduct" element={<AddProduct />} />
              </Route>
              <Route path="poscustomer" element={<PosCustomer />} />
              <Route path="posinventory" element={<PosInventory />} />
              <Route path="posreport" element={<PosReport />} />
              <Route path="possetting" element={<PosSetting />}>
                <Route
                  index
                  element={<Navigate to="generalsetting" replace />}
                />
                <Route path="generalsetting" element={<PosGeneralSetting />} />
                <Route path="staffmanagement" element={<StaffManagement />} />
                <Route path="paymenttax" element={<PosPaymentTax />} />
                <Route path="apperance" element={<PosApperance />} />
              </Route>
            </Route>

            <Route
              path="/class"
              element={
                <ClassProtectedRoute>
                  <ClassNav />
                </ClassProtectedRoute>
              }
            >
              <Route index element={<Navigate to="classoverview" replace />} />
              <Route path="classoverview" element={<ClassOverview />}>
                <Route
                  index
                  element={<Navigate to="classtrainingoverview" />}
                />
                <Route
                  path="classtrainingoverview"
                  element={<ClassTrainingOverview />}
                />
                <Route
                  path="classrentaloverview"
                  element={<ClassRentalOverveiw />}
                />
                <Route
                  path="classcanteenoverview"
                  element={<ClassCanteenOverview />}
                />
              </Route>
              <Route path="classcourses" element={<Courses />}>
                <Route path="add_courseclass" element={<AddClassForm />} />
              </Route>
              <Route
                path="classcoursemanagement"
                element={<CourseManagement />}
              >
                <Route
                  path="classcoursemanagementnewcourt1"
                  element={<CreateCourseModal />}
                />
                <Route
                  path="classcoursemanagementnewcourt2"
                  element={<NextProgramDetails />}
                />
              </Route>
              <Route path="classstudent" element={<ClassStudent />}>
                <Route path="add_student" element={<AddStudentForm />} />
              </Route>
              <Route
                path="classbookingschedule"
                element={<BookingSchedule />}
              />
              <Route path="classbookinglist" element={<BookingList />}>
                <Route
                  index
                  element={<Navigate to="classmobilebooking" replace />}
                />
                <Route
                  path="classmobilebooking"
                  element={<ClassMobileBooking />}
                />
                <Route
                  path="classlocalbooking"
                  element={<ClassLoaclBooking />}
                />
              </Route>
              <Route path="classvenuemanagement" element={<VenueManagement />}>
                <Route path="classcourtdetail" element={<ClassCourtDetail />} />
                <Route path="classaddcourt" element={<ClassAddCourt />} />
              </Route>

              <Route path="classwalk-in" element={<ClassWalkIn />} />
              <Route path="booking-list" element={<WalkBookingList />} />
              <Route path="walkbooking" element={<WalkBooking />} />

              <Route path="classmember" element={<ClassCustomer />} />
              <Route path="classorder" element={<ClassOrder />}>
                <Route path="classorderaddmenu" element={<AddMenu />} />
              </Route>
              <Route path="classmenu" element={<ClassMenu />} />
              {/*  <Route path="classmanage" element={<ClassManage />}>
                <Route path="create" element={<CreateTournament />} />
                <Route path="edit/:id" element={<TournamentDetails />} />
              </Route>

              <Route path="classenrollments" element={<ClassEnrollments />} />
              <Route path="classpoints" element={<ClassPoints />} />
              <Route path="classbanners" element={<ClassBanners />} />*/}
              <Route path="classsetting" element={<ClassSetting />}>
                <Route
                  index
                  element={<Navigate to="generalsetting" replace />}
                />
                <Route path="generalsetting" element={<PosGeneralSetting />} />
                <Route path="staffmanagement" element={<StaffManagement />} />
                <Route path="paymenttax" element={<PosPaymentTax />} />
                <Route path="apperance" element={<PosApperance />} />
              </Route>
            </Route>

            <Route path="login" element={<Login />}>
              <Route index element={<Navigate to="poslogin" replace />} />
              <Route
                path="poslogin"
                element={
                  <GuestRoute loginType="pos">
                    <PosLogin />
                  </GuestRoute>
                }
              />
              <Route
                path="academiclogin"
                element={
                  <GuestRoute loginType="class">
                    <AcademicLogin />
                  </GuestRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </Context.Provider>
    </>
  );
}
export default App;
